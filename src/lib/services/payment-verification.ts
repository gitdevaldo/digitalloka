import { createSupabaseAdminClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export function verifySignature(payload: string, signature: string | null): boolean {
  const secret = process.env.PAYMENT_WEBHOOK_SECRET || '';
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function processWebhook(payload: Record<string, unknown>) {
  const admin = createSupabaseAdminClient();
  const idempotencyKey = String(payload.idempotency_key || '');
  if (!idempotencyKey) throw new Error('Missing idempotency_key');

  const { data: existing } = await admin
    .from('payment_events')
    .select('id')
    .eq('idempotency_key', idempotencyKey)
    .limit(1);

  if (existing && existing.length > 0) {
    return { processed: false, duplicate: true, message: 'Duplicate payment event ignored' };
  }

  const provider = String(payload.provider || 'manual');

  await admin.from('payment_events').insert({
    provider,
    event_id: String(payload.event_id || ''),
    idempotency_key: idempotencyKey,
    status: 'received',
    payload,
  });

  const orderId = Number(payload.order_id);
  if (!orderId) throw new Error('Invalid order_id');

  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single();
  if (!order) throw new Error('Order not found');

  const status = String(payload.status || 'pending');

  if (status === 'paid') {
    await admin.from('transactions').upsert({
      order_id: order.id,
      provider,
      provider_ref: String(payload.provider_ref || ''),
      idempotency_key: idempotencyKey,
      status: 'paid',
      amount: Number(payload.amount || order.total_amount),
      currency: String(payload.currency || order.currency),
      paid_at: new Date().toISOString(),
      verified_at: new Date().toISOString(),
      payload,
    });

    await admin.from('orders').update({ status: 'paid', payment_status: 'paid' }).eq('id', order.id);

    const { data: items } = await admin.from('order_items').select('id, product_id').eq('order_id', order.id);
    if (items) {
      for (const item of items) {
        const { data: existing } = await admin
          .from('entitlements')
          .select('id')
          .eq('order_item_id', item.id)
          .eq('user_id', order.user_id)
          .limit(1);

        if (!existing || existing.length === 0) {
          await admin.from('entitlements').insert({
            user_id: order.user_id,
            product_id: item.product_id,
            order_item_id: item.id,
            status: 'active',
            starts_at: new Date().toISOString(),
            meta: { source_order_id: order.id },
          });
        }
      }
    }

    await admin.from('payment_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('idempotency_key', idempotencyKey);

    return { processed: true, duplicate: false, order_id: order.id, status: 'paid' };
  }

  return { processed: true, duplicate: false, order_id: order.id, status };
}
