import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const ids: number[] = body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('products')
      .select('id, name, slug, short_description, price_amount, price_currency, price_billing_period, status, icon_emoji, category:product_categories(name, slug)')
      .in('id', ids)
      .eq('is_visible', true);

    if (error) {
      return NextResponse.json({ data: [], error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [] }, { status: 400 });
  }
}
