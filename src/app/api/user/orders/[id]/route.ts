import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const orderId = parseInt(params.id, 10);
  if (!orderId || isNaN(orderId)) return apiError('Invalid order ID', 400);

  const supabase = await createSupabaseServerClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(id, name, slug, product_type)), transactions(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !order) return apiError('Order not found', 404);

  return NextResponse.json({ data: order });
});
