import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  try {
    const admin = createSupabaseAdminClient();

    const { data: stockItems, error } = await admin
      .from('product_stock_items')
      .select('id, product_id, credential_data, sold_at, sold_order_item_id, status, meta, product:products(id, name, slug, status, product_type)')
      .eq('sold_user_id', userId)
      .order('sold_at', { ascending: false });

    if (error) throw new Error(error.message);

    const items = (stockItems || []).map((item) => ({
      id: item.id,
      product_id: item.product_id,
      product: item.product,
      credential_data: item.credential_data,
      sold_at: item.sold_at,
      status: item.status === 'sold' ? 'active' : item.status,
      meta: item.meta,
    }));

    return NextResponse.json({ data: items, total: items.length });
  } catch (err) {
    console.error('[user/products] Failed to load products:', err);
    return apiError('Failed to load products', 500);
  }
});
