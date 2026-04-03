import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createCheckoutOrder } from '@/lib/services/orders';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    if (!body.product_id) return NextResponse.json({ error: 'product_id is required' }, { status: 422 });

    const order = await createCheckoutOrder(userId, {
      product_id: Number(body.product_id),
      quantity: body.quantity ? Number(body.quantity) : undefined,
      affiliate_code: body.affiliate_code,
    });

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
