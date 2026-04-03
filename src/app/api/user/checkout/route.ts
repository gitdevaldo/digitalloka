import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createCheckoutOrder } from '@/lib/services/orders';
import { checkRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { parseRequestBody } from '@/lib/validation';
import { checkoutSchema } from '@/lib/validation/schemas';

const CHECKOUT_LIMIT = { windowMs: 60_000, maxRequests: 10 };

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { allowed, retryAfterMs } = checkRateLimit(`checkout:user:${userId}`, CHECKOUT_LIMIT);
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

    return NextResponse.json({ data: order }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Checkout failed' }, { status: 422 });
  }
}
