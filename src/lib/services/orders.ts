import { createSupabaseAdminClient } from '@/lib/supabase/server';

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['fulfilled', 'cancelled'],
  fulfilled: [],
  cancelled: [],
};

export async function listUserOrders(userId: string, page = 1, perPage = 20) {
  const admin = createSupabaseAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await admin
    .from('orders')
    .select('*, items:order_items(*, product:products(id, name, slug)), transactions(*)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0, page, per_page: perPage };
}

export async function listOrders(filters: Record<string, string>, page = 1, perPage = 30) {
  const admin = createSupabaseAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = admin
    .from('orders')
    .select('*, user:users(id, email, role), items:order_items(*, product:products(id, name, slug))', { count: 'exact' });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.user_id) query = query.eq('user_id', filters.user_id);

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0, page, per_page: perPage };
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
    await ensureEntitlementsForPaidOrder(orderId, order.user_id);
  }

  return await getOrderById(orderId);
}

export async function createCheckoutOrder(userId: string, payload: { product_id: number; quantity?: number; affiliate_code?: string }) {
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('*')
    .eq('id', payload.product_id)
    .eq('is_visible', true)
    .single();

  if (!product) throw new Error('Product not found');
  if (!product.price_amount || product.price_amount <= 0) throw new Error('No pricing available for product');

  const quantity = Math.min(Math.max(payload.quantity || 1, 1), 50);
  const lineTotal = product.price_amount * quantity;
  const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 12).toUpperCase();

  const { data: order, error: orderError } = await admin.from('orders').insert({
    user_id: userId,
    order_number: orderNumber,
    status: 'pending',
    payment_status: 'pending',
    subtotal_amount: lineTotal,
    total_amount: lineTotal,
    currency: product.price_currency,
    meta: { affiliate_code: payload.affiliate_code || null },
  }).select().single();

  if (orderError) throw new Error(orderError.message);

  await admin.from('order_items').insert({
    order_id: order.id,
    product_id: product.id,
    item_name: product.name,
    quantity,
    unit_price: product.price_amount,
    line_total: lineTotal,
    meta: { product_slug: product.slug },
  });

  await admin.from('transactions').insert({
    order_id: order.id,
    provider: 'manual',
    status: 'pending',
    amount: lineTotal,
    currency: product.price_currency,
  });

  return await getOrderById(order.id);
}

async function ensureEntitlementsForPaidOrder(orderId: number, userId: string) {
  const admin = createSupabaseAdminClient();
  const { data: items } = await admin.from('order_items').select('id, product_id').eq('order_id', orderId);
  if (!items) return;

  for (const item of items) {
    const { data: existing } = await admin
      .from('entitlements')
      .select('id')
      .eq('order_item_id', item.id)
      .eq('user_id', userId)
      .limit(1);

    if (existing && existing.length > 0) continue;

    await admin.from('entitlements').insert({
      user_id: userId,
      product_id: item.product_id,
      order_item_id: item.id,
      status: 'active',
      starts_at: new Date().toISOString(),
      meta: { source_order_id: orderId },
    });
  }
}
