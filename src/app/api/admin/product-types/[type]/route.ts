import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { type } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();
  const settingKey = `product_type.${type}`;

  const { data: existing } = await admin
    .from('site_settings')
    .select('id, setting_value')
    .eq('setting_key', settingKey)
    .single();

  if (!existing) return NextResponse.json({ error: 'Product type not found' }, { status: 404 });

  const current = (existing.setting_value as Record<string, unknown>) || {};
  const updated = {
    ...current,
    label: body.label ?? current.label,
    description: body.description ?? current.description,
    is_active: body.is_active ?? current.is_active,
    schema: body.fields ? { fields: body.fields } : current.schema,
  };

  const { error } = await admin
    .from('site_settings')
    .update({ setting_value: updated, updated_by: userId })
    .eq('id', existing.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({
    data: {
      type,
      label: updated.label,
      description: updated.description,
      is_active: updated.is_active,
      fields: (updated.schema as Record<string, unknown>)?.fields || [],
    },
  });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { type } = await params;
  const admin = createSupabaseAdminClient();
  const settingKey = `product_type.${type}`;

  const { error } = await admin
    .from('site_settings')
    .delete()
    .eq('setting_key', settingKey);

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ deleted: true });
}
