import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ data: [] });
  }

  const admin = createSupabaseAdminClient();

  const { data: wishlistRows } = await admin
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);

  if (!wishlistRows || wishlistRows.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const productIds = wishlistRows.map(r => r.product_id);

  const { data: products, error } = await admin
    .from('products')
    .select('id, name, slug, short_description, price_amount, price_currency, price_billing_period, status, thumb_color, icon_emoji, category:product_categories(name, slug)')
    .in('id', productIds)
    .eq('is_visible', true);

  if (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: products || [] });
}
