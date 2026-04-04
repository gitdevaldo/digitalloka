import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { fulfillOrder } from '@/lib/services/fulfillment';
import { sendOrderConfirmationEmail } from '@/lib/services/email';
import crypto from 'crypto';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const webhookSecret = process.env.MAYAR_WEBHOOK_TOKEN;
  if (!webhookSecret) return false;
  if (!signatureHeader) return false;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get('x-callback-signature')
      || request.headers.get('x-webhook-signature')
      || request.headers.get('x-mayar-signature');

    const isSandbox = process.env.MAYAR_SANDBOX === 'true';
    const isProduction = process.env.NODE_ENV === 'production';
    if (isSandbox && isProduction) {
      console.error('[mayar-webhook] MAYAR_SANDBOX=true is not allowed in production');
      return apiError('Sandbox mode is not allowed in production', 403);
    }
    if (!isSandbox && !verifyWebhookSignature(rawBody, signature)) {
      console.error('[mayar-webhook] Invalid signature');
      return apiError('Invalid signature', 401);
    }

    const payload = JSON.parse(rawBody);

    const event = payload.event;
    if (event !== 'payment.received') {
      return NextResponse.json({ received: true, skipped: true, event });
    }

    const data = payload.data || {};
    const mayarTransactionId = data.id || '';
    const status = data.status || '';
    const amount = Number(data.amount || 0);
    const paymentMethod = data.paymentMethod || '';
    const customerEmail = data.email || '';
    const customerName = data.name || '';

    const extraData = data.extraData || {};
    const orderId = Number(extraData.order_id || 0);
    const orderNumber = extraData.order_number || '';

    if (!orderId || !mayarTransactionId) {
      return apiError('Missing order_id or transaction id', 400);
    }

    const admin = createSupabaseAdminClient();

    const idempotencyKey = `mayar_${mayarTransactionId}`;

    const { data: existingEvent } = await admin.from('payment_events')
      .select('id, status')
      .eq('idempotency_key', idempotencyKey)
      .single();

    if (existingEvent) {
      if (existingEvent.status === 'processed') {
        return NextResponse.json({ processed: false, duplicate: true, message: 'Already processed' });
      }
    } else {
      const { error: insertError } = await admin.from('payment_events').insert({
        provider: 'mayar',
        event_id: mayarTransactionId,
        idempotency_key: idempotencyKey,
        status: 'received',
        payload,
      });

      if (insertError && insertError.code !== '23505') {
        throw new Error(insertError.message);
      }
    }

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single();
    if (!order) {
      return apiError('Order not found', 404);
    }

    if (order.order_number !== orderNumber) {
      return apiError('Order mismatch', 400);
    }

    const isPaid = status === 'paid' || status === 'settled' || status === 'SUCCESS';
    if (isPaid) {
      const { error: rpcError } = await admin.rpc('process_payment_atomic', {
        p_order_id: order.id,
        p_user_id: order.user_id,
        p_provider: 'mayar',
        p_provider_ref: mayarTransactionId,
        p_idempotency_key: idempotencyKey,
        p_amount: amount || order.total_amount,
        p_currency: order.currency || 'IDR',
        p_payload: {
          mayar_transaction_id: mayarTransactionId,
          payment_method: paymentMethod,
          customer_email: customerEmail,
          customer_name: customerName,
          raw_event: event,
        },
      });

      if (rpcError) throw new Error(rpcError.message);

      await admin.from('payment_events')
        .update({ status: 'processed', processed_at: new Date().toISOString() })
        .eq('idempotency_key', idempotencyKey);

      await admin.from('orders').update({
        meta: {
          ...((order.meta as Record<string, unknown>) || {}),
          mayar_payment_method: paymentMethod,
          mayar_paid_at: new Date().toISOString(),
        },
      }).eq('id', orderId);

      let fulfillmentResults: { success: boolean; product_type: string; product_id: number; details: Record<string, unknown>; error?: string }[] = [];
      try {
        fulfillmentResults = await fulfillOrder(orderId, order.user_id);
        console.log('[mayar-webhook] Fulfillment results:', JSON.stringify(fulfillmentResults));
      } catch (fulfillErr) {
        console.error('[mayar-webhook] Fulfillment error (non-blocking):', fulfillErr);
      }

      try {
        await sendOrderConfirmationEmail({
          orderId,
          userId: order.user_id,
          fulfillmentResults,
        });
        console.log('[mayar-webhook] Order confirmation email sent for order:', orderId);
      } catch (emailErr) {
        console.error('[mayar-webhook] Email error (non-blocking):', emailErr);
      }

      return NextResponse.json({ processed: true, order_id: orderId, status: 'paid' });
    }

    return NextResponse.json({ processed: true, order_id: orderId, status });
  } catch (err) {
    console.error('[mayar-webhook] Error:', err);
    return apiError('Webhook processing failed', 422);
  }
});
