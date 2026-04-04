import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createCheckoutOrder } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseRequestBody } from '@/lib/validation';
import { checkoutSchema } from '@/lib/validation/schemas';
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

    const orderItems = (order as Record<string, unknown>).items as Array<{ item_name: string; quantity: number; unit_price: number }> | undefined;
    const mayarItems = (orderItems || []).map(item => ({
      quantity: item.quantity,
      rate: item.unit_price,
      description: item.item_name,
    }));

    if (mayarItems.length === 0) {
      mayarItems.push({
        quantity: quantity || 1,
        rate: (order as Record<string, unknown>).total_amount as number || 0,
        description: `Order ${(order as Record<string, unknown>).order_number}`,
      });
    }

    const mayarResponse = await createInvoice({
      name: 'Customer',
      email: '',
      mobile: '',
      description: `Order ${(order as Record<string, unknown>).order_number}`,
      redirectUrl: `${baseUrl}/checkout/success?order=${(order as Record<string, unknown>).order_number}`,
      expiredAt,
      items: mayarItems,
      extraData: {
        order_id: String((order as Record<string, unknown>).id),
        order_number: String((order as Record<string, unknown>).order_number),
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
    }).eq('id', (order as Record<string, unknown>).id);

    return NextResponse.json({
      data: {
        ...order as Record<string, unknown>,
        payment_link: mayarResponse.data.link,
      },
    }, { status: 201 });
  } catch (err) {
    console.error('[checkout] Error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 422 });
  }
}
