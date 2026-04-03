import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (!body.name?.trim()) {
    return NextResponse.json({ error: 'Category name is required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await admin
    .from('product_categories')
    .insert({ name: body.name.trim(), slug })
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      const existing = await admin.from('product_categories').select('*').eq('slug', slug).single();
      if (existing.data) return NextResponse.json({ data: existing.data });
    }
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
