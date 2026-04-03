import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, category:product_categories(*), prices:product_prices(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.from('products').insert({
    name: body.name,
    slug: body.slug,
    product_type: body.product_type || 'digital',
    short_description: body.short_description,
    description: body.description,
    status: body.status || 'available',
    is_visible: body.is_visible ?? true,
    tags: body.tags || [],
    badges: body.badges || [],
    faq_items: body.faq_items || [],
    featured: body.featured || [],
    meta: body.meta || {},
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ data }, { status: 201 });
}
