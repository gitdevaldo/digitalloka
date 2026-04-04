import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseRequestBody } from '@/lib/validation';
import { cartCheckoutSchema } from '@/lib/validation/schemas';
import { createInvoice } from '@/lib/services/mayar';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, retryAfterMs } = await checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
  if (!allowed) return rateLimitResponse(retryAfterMs);

  try {
    const parsed = await parseRequestBody(request, cartCheckoutSchema);
    if (!parsed.success) return parsed.response;

    const { items, customer_name, customer_email, customer_mobile } = parsed.data;

    const supabase = await createSupabaseServerClient();

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, slug, price_amount, price_currency')
      .in('id', productIds)
      .eq('is_visible', true);

    if (prodErr || !products || products.length === 0) {
      return NextResponse.json({ error: 'Products not found' }, { status: 422 });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    let currency = 'IDR';
    const orderItems: { product_id: number; item_name: string; quantity: number; unit_price: number; line_total: number; meta: Record<string, string | number> }[] = [];
    const mayarItems: { quantity: number; rate: number; description: string }[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) continue;
      if (!product.price_amount || product.price_amount <= 0) continue;

      const qty = item.quantity ?? 1;
      const lineTotal = product.price_amount * qty;
      subtotal += lineTotal;
      currency = product.price_currency || 'IDR';

      const itemMeta: Record<string, string | number> = { product_slug: product.slug };
      if (item.selected_stock_id) itemMeta.selected_stock_id = item.selected_stock_id;
      if (item.selected_region) itemMeta.selected_region = item.selected_region;
      if (item.selected_image) itemMeta.selected_image = item.selected_image;

      orderItems.push({
        product_id: product.id,
        item_name: product.name,
        quantity: qty,
        unit_price: product.price_amount,
        line_total: lineTotal,
        meta: itemMeta,
      });

      mayarItems.push({
        quantity: qty,
        rate: product.price_amount,
        description: product.name,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: 'No valid items in cart' }, { status: 422 });
    }

    const orderNumber = generateOrderNumber();

    const { data: orderId, error: rpcError } = await supabase.rpc('create_checkout_order_atomic', {
      p_user_id: userId,
      p_order_number: orderNumber,
      p_currency: currency,
      p_subtotal: subtotal,
      p_total: subtotal,
      p_meta: {},
      p_items: orderItems,
      p_provider: 'mayar',
    });

    if (rpcError) throw rpcError;

    const baseUrl = getAppBaseUrl();
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    let mayarResponse;
    try {
      mayarResponse = await createInvoice({
        name: customer_name || 'Customer',
        email: customer_email || '',
        mobile: customer_mobile || '',
        description: `Order ${orderNumber}`,
        redirectUrl: `${baseUrl}/checkout/success?order=${orderNumber}`,
        expiredAt,
        items: mayarItems,
        extraData: {
          order_id: String(orderId),
          order_number: orderNumber,
          user_id: userId,
        },
      });
    } catch (invoiceErr) {
      console.error('[cart-checkout] Mayar invoice creation failed:', invoiceErr);
      const admin = createSupabaseAdminClient();
      await admin.from('orders').update({
        status: 'cancelled',
        meta: { cancel_reason: 'payment_gateway_error' },
      }).eq('id', orderId);
      return NextResponse.json({ error: 'Payment gateway error. Please try again.' }, { status: 502 });
    }

    const admin = createSupabaseAdminClient();
    await admin.from('orders').update({
      meta: {
        mayar_invoice_id: mayarResponse.data.id,
        mayar_transaction_id: mayarResponse.data.transactionId,
        payment_link: mayarResponse.data.link,
      },
    }).eq('id', orderId);

    return NextResponse.json({
      data: {
        order_id: orderId,
        order_number: orderNumber,
        total: subtotal,
        currency,
        payment_link: mayarResponse.data.link,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[cart-checkout] Error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 422 });
  }
}
