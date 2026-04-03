import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const items: { product_id: number; quantity: number }[] = body.items;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 422 });
    }

    const admin = createSupabaseAdminClient();

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodErr } = await admin
      .from('products')
      .select('id, name, slug, price_amount, price_currency')
      .in('id', productIds)
      .eq('is_visible', true);

    if (prodErr || !products || products.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 422 });
    }

    const productMap = new Map(products.map(p => [p.id, p]));

    let subtotal = 0;
    let currency = 'USD';
    const orderItems: { product_id: number; item_name: string; quantity: number; unit_price: number; line_total: number; meta: object }[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) continue;
      if (!product.price_amount || product.price_amount <= 0) continue;

      const qty = Math.min(Math.max(item.quantity || 1, 1), 50);
      const lineTotal = product.price_amount * qty;
      subtotal += lineTotal;
      currency = product.price_currency || 'USD';

      orderItems.push({
        product_id: product.id,
        item_name: product.name,
        quantity: qty,
        unit_price: product.price_amount,
        line_total: lineTotal,
        meta: { product_slug: product.slug },
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 422 });
    }

    const orderNumber = 'ORD-' + Math.random().toString(36).substring(2, 12).toUpperCase();

    const { data: order, error: orderError } = await admin.from('orders').insert({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_status: 'pending',
      subtotal_amount: subtotal,
      total_amount: subtotal,
      currency,
      meta: {},
    }).select().single();

    if (orderError) throw new Error(orderError.message);

    for (const oi of orderItems) {
      await admin.from('order_items').insert({ order_id: order.id, ...oi });
    }

    await admin.from('transactions').insert({
      order_id: order.id,
      provider: 'manual',
      status: 'pending',
      amount: subtotal,
      currency,
    });

    return NextResponse.json({ data: { order_number: orderNumber, total: subtotal, currency } }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
