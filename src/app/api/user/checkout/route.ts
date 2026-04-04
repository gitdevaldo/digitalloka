import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createCheckoutOrder } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseRequestBody } from '@/lib/validation';
import { checkoutSchema } from '@/lib/validation/schemas';
import { createInvoice } from '@/lib/services/mayar';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

function getAppBaseUrl(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl && appUrl.startsWith('https://')) return appUrl;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { allowed, retryAfterMs } = await checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
  if (!allowed) return rateLimitResponse(retryAfterMs);

  try {
    const parsed = await parseRequestBody(request, checkoutSchema);
    if (!parsed.success) return parsed.response;

    const { product_id, quantity, affiliate_code } = parsed.data;

    const supabase = await createSupabaseServerClient();
    const order = await createCheckoutOrder(supabase, userId, {
      product_id,
      quantity,
      affiliate_code,
    });

    if (!order) throw new Error('Order creation failed');

    const baseUrl = getAppBaseUrl();
    const expiredAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const orderItems = order.items as Array<{ item_name: string; quantity: number; unit_price: number }> | undefined;
    const mayarItems = (orderItems || []).map(item => ({
      quantity: item.quantity,
      rate: item.unit_price,
      description: item.item_name,
    }));

    if (mayarItems.length === 0) {
      mayarItems.push({
        quantity: quantity || 1,
        rate: order.total_amount || 0,
        description: `Order ${order.order_number}`,
      });
    }

    const mayarResponse = await createInvoice({
      name: 'Customer',
      email: '',
      mobile: '',
      description: `Order ${order.order_number}`,
      redirectUrl: `${baseUrl}/checkout/success?order=${order.order_number}`,
      expiredAt,
      items: mayarItems,
      extraData: {
        order_id: String(order.id),
        order_number: String(order.order_number),
        user_id: userId,
        affiliate_code: affiliate_code || '',
      },
    });

    const admin = createSupabaseAdminClient();
    await admin.from('orders').update({
      meta: {
        mayar_invoice_id: mayarResponse.data.id,
        mayar_transaction_id: mayarResponse.data.transactionId,
        payment_link: mayarResponse.data.link,
        affiliate_code: affiliate_code || null,
      },
    }).eq('id', order.id);

    return apiSuccess({
      ...order,
      payment_link: mayarResponse.data.link,
    }, 201);
  } catch (err) {
    console.error('[checkout] Error:', err);
    return apiError('Checkout failed', 422);
  }
});
