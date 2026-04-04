import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const ids: number[] = body.ids;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, short_description, price_amount, price_currency, price_billing_period, product_type, status, category:product_categories(name, slug)')
      .in('id', ids)
      .eq('is_visible', true);

    if (error) {
      return NextResponse.json({ data: [], error: sanitizeDbError(error.message) }, { status: 500 });
    }

    return NextResponse.json({ data: data || [] });
  } catch {
    return NextResponse.json({ data: [] }, { status: 400 });
  }
});
