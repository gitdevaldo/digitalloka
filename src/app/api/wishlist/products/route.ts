import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';

export const GET = withErrorHandler(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: [] });
  }

  const { data: wishlistRows } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);

  if (!wishlistRows || wishlistRows.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const productIds = wishlistRows.map(r => r.product_id);

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, slug, short_description, price_amount, price_currency, price_billing_period, status, category:product_categories(name, slug)')
    .in('id', productIds)
    .eq('is_visible', true);

  if (error) {
    return NextResponse.json({ data: [], error: sanitizeDbError(error.message) }, { status: 500 });
  }

  return NextResponse.json({ data: products || [] });
});
