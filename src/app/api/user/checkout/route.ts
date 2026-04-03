import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createCheckoutOrder } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, retryAfterMs } = checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
  if (!allowed) return rateLimitResponse(retryAfterMs);

  try {
    const body = await request.json();
    if (!body.product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 422 });

    const order = await createCheckoutOrder(userId, {
      product_id: Number(body.product_id),
      quantity: body.quantity ? Number(body.quantity) : undefined,
      affiliate_code: body.affiliate_code,
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 422 });
  }
}
