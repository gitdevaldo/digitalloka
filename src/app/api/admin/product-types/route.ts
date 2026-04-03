import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.from('product_types').insert({
    type_key: body.type_key,
    label: body.label,
    description: body.description || null,
    is_active: body.is_active ?? true,
    fields: body.fields || [],
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ data }, { status: 201 });
}
