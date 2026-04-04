import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const orderNumber = request.nextUrl.searchParams.get('order');
  if (!orderNumber) {
    return NextResponse.json({ error: 'Missing order number' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({
      data: { order_number: orderNumber, status: 'unknown', payment_status: 'unknown' },
    });
  }

  const { data: order } = await supabase
    .from('orders')
    .select('order_number, status, payment_status, total_amount, currency')
    .eq('order_number', orderNumber)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({
      data: { order_number: orderNumber, status: 'unknown', payment_status: 'unknown' },
    });
  }

  return NextResponse.json({ data: order });
}
