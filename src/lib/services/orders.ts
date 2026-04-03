import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { createEntitlementsForOrder } from '@/lib/services/entitlements';

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

export function generateOrderNumber(): string {
  return 'ORD-' + crypto.randomUUID().replace(/-/g, '').substring(0, 12).toUpperCase();
}

export async function listUserOrders(supabase: SupabaseClient, userId: string, page = 1, perPage = 20, cursor?: string | null, mode: 'cursor' | 'offset' = 'cursor') {
  const { applyCursorFilter, applyCursorPagination } = await import('@/lib/cursor-pagination');

  const useCursorMode = mode === 'cursor';

  let query = supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(id, name, slug)), transactions(*)', { count: useCursorMode ? undefined : 'exact' })
    .eq('user_id', userId);

  if (cursor) {
    query = applyCursorFilter(query, cursor);
  }

  if (useCursorMode) {
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(perPage + 1);
    if (error) throw new Error(error.message);

    const result = applyCursorPagination(data || [], perPage);
    return { ...result, page, per_page: perPage, total: null };
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0, page, per_page: perPage, next_cursor: null, has_more: false };
}

export async function listOrders(filters: Record<string, string>, page = 1, perPage = 30, cursor?: string | null, mode: 'cursor' | 'offset' = 'cursor') {
  const { applyCursorFilter, applyCursorPagination } = await import('@/lib/cursor-pagination');
  const admin = createSupabaseAdminClient();

  const useCursorMode = mode === 'cursor';

  let query = admin
    .from('orders')
    .select('*, user:users(id, email, role), items:order_items(*, product:products(id, name, slug))', { count: useCursorMode ? undefined : 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);

  if (cursor) {
    query = applyCursorFilter(query, cursor);
  }

  if (useCursorMode) {
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(perPage + 1);
    if (error) throw new Error(error.message);

    const result = applyCursorPagination(data || [], perPage);
    return { ...result, page, per_page: perPage, total: null };
  }

  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0, page, per_page: perPage, next_cursor: null, has_more: false };
}

export async function getOrderById(orderId: number) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('orders')
    .select('*, user:users(id, email, role, is_active), items:order_items(*, product:products(id, name, slug)), transactions(*)')
    .eq('id', orderId)
    .single();

  if (error) return null;
  return data;
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
  const admin = createSupabaseAdminClient();
  const order = await getOrderById(orderId);
  if (!order) throw new Error('Order not found');

  const allowed = ALLOWED_STATUS_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) throw new Error('Invalid order status transition');

  const updates: Record<string, unknown> = { status: newStatus };

  if (newStatus === 'paid') {
    const { data: txn } = await admin
      .from('transactions')
      .select('id')
      .eq('order_id', orderId)
      .eq('status', 'paid')
      .limit(1)
      .single();

    if (!txn) throw new Error('Paid transition requires verified payment transaction');
    updates.payment_status = 'paid';
  }

  const { error } = await admin.from('orders').update(updates).eq('id', orderId);
  if (error) throw new Error(error.message);

  if (newStatus === 'paid') {
    await createEntitlementsForOrder(orderId, order.user_id);
  }

  return await getOrderById(orderId);
}

export async function createCheckoutOrder(supabase: SupabaseClient, userId: string, payload: { product_id: number; quantity?: number; affiliate_code?: string }) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', payload.product_id)
    .eq('is_visible', true)
    .single();

  if (!product) throw new Error('Product not found');
  if (!product.price_amount || product.price_amount <= 0) throw new Error('No pricing available for product');

  const quantity = Math.min(Math.max(payload.quantity || 1, 1), 50);
  const lineTotal = product.price_amount * quantity;
  const orderNumber = generateOrderNumber();

  const items = [
    {
      product_id: product.id,
      item_name: product.name,
      quantity,
      unit_price: product.price_amount,
      line_total: lineTotal,
      meta: { product_slug: product.slug },
    },
  ];

  const { data: orderId, error: rpcError } = await supabase.rpc('create_checkout_order_atomic', {
    p_user_id: userId,
    p_order_number: orderNumber,
    p_currency: product.price_currency,
    p_subtotal: lineTotal,
    p_total: lineTotal,
    p_meta: { affiliate_code: payload.affiliate_code || null },
    p_items: items,
    p_provider: 'manual',
  });

  if (rpcError) throw new Error(rpcError.message);

  return await getOrderById(orderId);
}
