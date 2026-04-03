import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });

  const types = (data || []).map((row) => ({
    id: row.id,
    type: row.type_key,
    label: row.label,
    description: row.description || '',
    is_active: row.is_active,
    fields: row.fields || [],
  }));

  return NextResponse.json({ data: types });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (!body.type || !body.label) {
    return NextResponse.json({ error: 'type and label are required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('product_types')
    .insert({
      type_key: body.type,
      label: body.label,
      description: body.description || '',
      is_active: body.is_active ?? true,
      fields: body.fields || [],
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return NextResponse.json({ error: 'Product type already exists' }, { status: 422 });
    }
    return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  }

  return NextResponse.json({
    data: {
      id: data.id,
      type: data.type_key,
      label: data.label,
      description: data.description || '',
      is_active: data.is_active,
      fields: data.fields || [],
    },
  }, { status: 201 });
}
