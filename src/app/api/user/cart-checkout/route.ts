import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, retryAfterMs } = checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
  if (!allowed) return rateLimitResponse(retryAfterMs);

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

    const productMap = new Map(products.map((p: { id: number; name: string; slug: string; price_amount: number; price_currency: string }) => [p.id, p]));

    let subtotal = 0;
    let currency = 'USD';
    const orderItems: { product_id: number; item_name: string; quantity: number; unit_price: number; line_total: number; meta: object }[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id) as { id: number; name: string; slug: string; price_amount: number; price_currency: string } | undefined;
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

    const orderNumber = generateOrderNumber();

    const { data: orderId, error: rpcError } = await admin.rpc('create_checkout_order_atomic', {
      p_user_id: userId,
      p_order_number: orderNumber,
      p_currency: currency,
      p_subtotal: subtotal,
      p_total: subtotal,
      p_meta: {},
      p_items: orderItems,
      p_provider: 'manual',
    });

    if (rpcError) throw rpcError;

    return NextResponse.json({ data: { order_id: orderId, order_number: orderNumber, total: subtotal, currency } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 422 });
  }
}
