import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [] });
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ items: [], error: sanitizeDbError(error.message) }, { status: 500 });
  }

  return NextResponse.json({ items: data.map((r: { product_id: number }) => r.product_id) });
}

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { product_id } = body;
  if (!product_id || typeof product_id !== 'number') {
    return NextResponse.json({ error: 'product_id must be a number' }, { status: 400 });
  }

  const { data: existing, error: fetchError } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', product_id)
    .maybeSingle();

  if (fetchError) {
    return NextResponse.json({ error: sanitizeDbError(fetchError.message) }, { status: 500 });
  }

  if (existing) {
    const { error: deleteError } = await supabase.from('wishlists').delete().eq('id', existing.id);
    if (deleteError) {
      return NextResponse.json({ error: sanitizeDbError(deleteError.message) }, { status: 500 });
    }
    return NextResponse.json({ action: 'removed' });
  } else {
    const { error: insertError } = await supabase.from('wishlists').insert({ user_id: user.id, product_id });
    if (insertError) {
      return NextResponse.json({ error: sanitizeDbError(insertError.message) }, { status: 500 });
    }
    return NextResponse.json({ action: 'added' });
  }
}
