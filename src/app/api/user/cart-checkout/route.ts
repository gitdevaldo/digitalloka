import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { generateOrderNumber } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseRequestBody } from '@/lib/validation';
import { cartCheckoutSchema } from '@/lib/validation/schemas';
import { createInvoice } from '@/lib/services/mayar';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

function getAppBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && appUrl.startsWith('https://')) return appUrl;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

interface CheckoutVpsConfig {
  provider: string;
  region: string;
  regionName: string;
  sizeSlug: string;
  stockId: number;
  vcpus: number;
  memory: number;
  disk: number;
  transfer: number;
  priceMonthly: number;
  os?: string;
  osName?: string;
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { allowed, retryAfterMs } = await checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
  if (!allowed) return rateLimitResponse(retryAfterMs);

  try {
    const parsed = await parseRequestBody(request, cartCheckoutSchema);
    if (!parsed.success) return parsed.response;

    const { items, customer_name, customer_email, customer_mobile } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('id, name, slug, price_amount, price_currency, product_type')
      .in('id', productIds)
      .eq('is_visible', true);

    if (prodErr || !products || products.length === 0) {
      return apiError('Products not found', 422);
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    const stockLookups = items
      .filter(i => i.selected_stock_id || i.vps_config?.stockId)
      .map(i => ({
        stockId: (i.selected_stock_id || i.vps_config?.stockId) as number,
        productId: i.product_id,
      }))
      .filter(s => s.stockId);

    const stockIds = stockLookups.map(s => s.stockId);
    const stockPriceMap = new Map<string, number>();
    if (stockIds.length > 0) {
      const { data: stockItems } = await admin
        .from('product_stock_items')
        .select('id, product_id, credential_data, meta')
        .in('id', stockIds);

      if (stockItems) {
        for (const s of stockItems) {
          const cred = (s.credential_data || {}) as Record<string, unknown>;
          const meta = (s.meta || {}) as Record<string, unknown>;
          const costPrice = (cred.price_monthly as number) || 0;
          const sellingPrice = meta.selling_price !== undefined ? Number(meta.selling_price) : costPrice;
          stockPriceMap.set(`${s.product_id}_${s.id}`, sellingPrice);
        }
      }
    }

    let subtotal = 0;
    let currency = 'IDR';
    const orderItems: { product_id: number; item_name: string; quantity: number; unit_price: number; line_total: number; meta: Record<string, string | number> }[] = [];
    const mayarItems: { quantity: number; rate: number; description: string }[] = [];

    for (const item of items) {
      const product = productMap.get(item.product_id);
      if (!product) continue;

      const vpsConfig = item.vps_config as CheckoutVpsConfig | undefined;
      const stockId = item.selected_stock_id || vpsConfig?.stockId;

      let unitPrice = product.price_amount || 0;
      if (stockId) {
        const stockKey = `${product.id}_${stockId}`;
        if (stockPriceMap.has(stockKey)) {
          unitPrice = stockPriceMap.get(stockKey)!;
        } else {
          return apiError(`Invalid stock item for product ${product.name}`, 422);
        }
      }

      if (!unitPrice || unitPrice <= 0) continue;

      const qty = item.quantity ?? 1;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;
      currency = product.price_currency || 'IDR';

      const itemMeta: Record<string, string | number> = { product_slug: product.slug };
      if (stockId) itemMeta.selected_stock_id = stockId;
      if (item.selected_region || vpsConfig?.region) itemMeta.selected_region = item.selected_region || vpsConfig?.region || '';
      if (item.selected_image || vpsConfig?.os) itemMeta.selected_image = item.selected_image || vpsConfig?.os || '';
      if (vpsConfig) {
        itemMeta.vps_size = vpsConfig.sizeSlug;
        itemMeta.vps_region = vpsConfig.region;
        itemMeta.vps_region_name = vpsConfig.regionName;
        if (vpsConfig.os) itemMeta.vps_os = vpsConfig.os;
        if (vpsConfig.osName) itemMeta.vps_os_name = vpsConfig.osName;
      }

      const itemName = vpsConfig
        ? `${product.name} (${vpsConfig.vcpus}vCPU / ${vpsConfig.memory >= 1024 ? `${vpsConfig.memory / 1024}GB` : `${vpsConfig.memory}MB`} RAM / ${vpsConfig.disk}GB SSD)`
        : product.name;

      orderItems.push({
        product_id: product.id,
        item_name: itemName,
        quantity: qty,
        unit_price: unitPrice,
        line_total: lineTotal,
        meta: itemMeta,
      });

      mayarItems.push({
        quantity: qty,
        rate: unitPrice,
        description: itemName,
      });
    }

    if (orderItems.length === 0) {
      return apiError('No valid items in cart', 422);
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
      await admin.from('orders').update({
        status: 'cancelled',
        meta: { cancel_reason: 'payment_gateway_error' },
      }).eq('id', orderId);
      return apiError('Payment gateway error. Please try again.', 502);
    }

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
    return apiError('Checkout failed', 422);
  }
});
