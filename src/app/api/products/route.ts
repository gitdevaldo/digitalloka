import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
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
    return NextResponse.json(result);
  } catch {
    return apiError('Failed to load products', 500);
  }
});
