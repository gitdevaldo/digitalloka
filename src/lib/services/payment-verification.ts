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

  const provider = String(payload.provider || 'manual');

  const { error: insertError } = await admin.from('payment_events').insert({
    provider,
    event_id: String(payload.event_id || ''),
    idempotency_key: idempotencyKey,
    status: 'received',
    payload,
  });

  if (insertError) {
    if (insertError.code === '23505') {
      return { processed: false, duplicate: true, message: 'Duplicate payment event ignored' };
    }
    throw new Error(insertError.message);
  }

  const orderId = Number(payload.order_id);
  if (!orderId) throw new Error('Invalid order_id');

  const { data: order } = await admin.from('orders').select('*').eq('id', orderId).single();
  if (!order) throw new Error('Order not found');

  const status = String(payload.status || 'pending');

  if (status === 'paid') {
    const { error: rpcError } = await admin.rpc('process_payment_atomic', {
      p_order_id: order.id,
      p_user_id: order.user_id,
      p_provider: provider,
      p_provider_ref: String(payload.provider_ref || ''),
      p_idempotency_key: idempotencyKey,
      p_amount: Number(payload.amount || order.total_amount),
      p_currency: String(payload.currency || order.currency),
      p_payload: payload,
    });

    if (rpcError) throw new Error(rpcError.message);

    return { processed: true, duplicate: false, order_id: order.id, status: 'paid' };
  }

  return { processed: true, duplicate: false, order_id: order.id, status };
}
