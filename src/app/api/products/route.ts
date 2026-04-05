import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listProducts, type ProductFilters } from '@/lib/services/catalog';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  try {
    const sp = request.nextUrl.searchParams;
    const filters: ProductFilters = {
      category: sp.get('category') || undefined,
      type: sp.get('type') || undefined,
      availability: sp.get('availability') || undefined,
      search: sp.get('search') || undefined,
      sort: sp.get('sort') || undefined,
      page: sp.has('page') ? Number(sp.get('page')) : undefined,
      per_page: sp.has('per_page') ? Number(sp.get('per_page')) : undefined,
      max_price: sp.has('max_price') ? Number(sp.get('max_price')) : undefined,
      rating_min: sp.has('rating_min') ? Number(sp.get('rating_min')) : undefined,
      tags: sp.get('tags') || undefined,
      badges: sp.get('badges') || undefined,
    };

    const supabase = await createSupabaseServerClient();
    const result = await listProducts(supabase, filters);

    const productIds = result.data.map((p: { id: number }) => p.id);
    let stockMap: Record<number, number> | null = null;

    if (productIds.length > 0) {
      const admin = createSupabaseAdminClient();
      const { data: stockRows, error: stockError } = await admin
        .from('product_stock_items')
        .select('product_id')
        .in('product_id', productIds)
        .eq('status', 'enabled')
        .is('sold_at', null);

      if (!stockError && stockRows) {
        stockMap = {};
        for (const row of stockRows) {
          const pid = row.product_id as number;
          stockMap[pid] = (stockMap[pid] || 0) + 1;
        }
      }
    }

    const enrichedData = result.data.map((p: { id: number; product_type?: string }) => ({
      ...p,
      available_stock: p.product_type === 'vps_droplet' || stockMap === null ? null : (stockMap[p.id] ?? 0),
    }));

    const response = NextResponse.json({ ...result, data: enrichedData });
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return response;
  } catch (err) {
    console.error('[products] Failed to load products:', err);
    return apiError('Failed to load products', 500);
  }
});
