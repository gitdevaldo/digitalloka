import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('site_settings')
    .select('*')
    .eq('setting_group', 'product_type')
    .order('setting_key');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const types = (data || []).map((row) => {
    const typeKey = (row.setting_key as string).replace('product_type.', '');
    const val = row.setting_value as Record<string, unknown> || {};
    return {
      type: typeKey,
      label: val.label || typeKey,
      description: val.description || '',
      is_active: val.is_active !== false,
      fields: (val.schema as Record<string, unknown>)?.fields || [],
    };
  });

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
  const settingKey = `product_type.${body.type}`;

  const { data: existing } = await admin
    .from('site_settings')
    .select('id')
    .eq('setting_key', settingKey)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Product type already exists' }, { status: 422 });
  }

  const settingValue = {
    label: body.label,
    description: body.description || '',
    is_active: body.is_active ?? true,
    schema: { fields: body.fields || [] },
  };

  const { error } = await admin.from('site_settings').insert({
    setting_group: 'product_type',
    setting_key: settingKey,
    setting_value: settingValue,
    updated_by: userId,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({
    data: {
      type: body.type,
      label: settingValue.label,
      description: settingValue.description,
      is_active: settingValue.is_active,
      fields: settingValue.schema.fields,
    },
  }, { status: 201 });
}
