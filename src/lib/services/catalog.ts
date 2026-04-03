import { createSupabaseAdminClient } from '@/lib/supabase/server';

export interface ProductFilters {
  category?: string;
  type?: string;
  availability?: string;
  search?: string;
  rating_min?: number;
  tags?: string;
  badges?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  per_page?: number;
}

export async function listProducts(filters: ProductFilters) {
  const admin = createSupabaseAdminClient();
  const perPage = filters.per_page || 12;
  const page = filters.page || 1;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = admin
    .from('products')
    .select('*, category:product_categories(*)', { count: 'exact' })
    .eq('is_visible', true);

  if (filters.search) {
    query = query.or(`name.ilike.%${filters.search}%,short_description.ilike.%${filters.search}%`);
  }
  if (filters.type) query = query.eq('product_type', filters.type);
  if (filters.availability) query = query.eq('status', filters.availability);
  if (filters.category) query = query.eq('category_slug', filters.category);
  if (filters.max_price !== undefined && Number.isFinite(filters.max_price)) {
    query = query.lte('price', filters.max_price);
  }
  if (filters.rating_min !== undefined && filters.rating_min > 0) {
    query = query.gte('rating', filters.rating_min);
  }
  if (filters.tags) {
    const tagList = filters.tags.split(',').map(t => t.trim());
    query = query.overlaps('tags', tagList);
  }
  if (filters.badges) {
    const badgeList = filters.badges.split(',').map(b => b.trim());
    query = query.overlaps('badges', badgeList);
  }

  const sortMap: Record<string, [string, { ascending: boolean }]> = {
    newest: ['created_at', { ascending: false }],
    price_asc: ['name', { ascending: true }],
    price_desc: ['name', { ascending: false }],
    rating: ['rating', { ascending: false }],
  };
  const [col, opts] = sortMap[filters.sort || ''] || ['name', { ascending: true }];
  query = query.order(col, opts).range(from, to);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    data: data || [],
    total: count || 0,
    page,
    per_page: perPage,
    last_page: Math.ceil((count || 0) / perPage),
  };
}

export async function getProductBySlug(slug: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('slug', slug)
    .eq('is_visible', true)
    .single();

  if (error) return null;
  return data;
}
