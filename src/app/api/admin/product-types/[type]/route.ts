import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { type } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.fields !== undefined) updates.fields = body.fields;

  const { data, error } = await admin
    .from('product_types')
    .update(updates)
    .eq('type_key', type)
    .select()
    .single();

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  if (!data) return NextResponse.json({ error: 'Product type not found' }, { status: 404 });

  return NextResponse.json({
    data: {
      id: data.id,
      type: data.type_key,
      label: data.label,
      description: data.description || '',
      is_active: data.is_active,
      fields: data.fields || [],
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { type } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('product_types')
    .delete()
    .eq('type_key', type);

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  return NextResponse.json({ deleted: true });
}
