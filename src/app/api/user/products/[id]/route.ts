import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const stockItemId = parseInt(params.id, 10);
  if (!stockItemId || isNaN(stockItemId)) return apiError('Invalid ID', 400);

  const admin = createSupabaseAdminClient();

  const { data: stockItem, error } = await admin
    .from('product_stock_items')
    .select('id, product_id, credential_data, sold_at, sold_order_item_id, status, meta, product:products(id, name, slug, status, product_type)')
    .eq('id', stockItemId)
    .eq('sold_user_id', userId)
    .single();

  if (error || !stockItem) return apiError('Product not found', 404);

  return NextResponse.json({
    data: {
      id: stockItem.id,
      product_id: stockItem.product_id,
      product: stockItem.product,
      credential_data: stockItem.credential_data,
      sold_at: stockItem.sold_at,
      status: stockItem.status === 'sold' ? 'active' : stockItem.status,
      meta: stockItem.meta,
    },
  });
});
