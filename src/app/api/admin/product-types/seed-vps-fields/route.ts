import { NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

const VPS_STOCK_FIELDS = [
  {
    key: 'provider',
    label: 'VPS Provider',
    type: 'select',
    required: true,
    scope: 'stock',
    options: ['DigitalOcean', 'AWS', 'Google Cloud', 'Azure', 'Linode', 'Vultr', 'Hetzner', 'Other'],
    help_text: 'Cloud provider for this VPS size',
  },
  {
    key: 'slug',
    label: 'Size Slug',
    type: 'text',
    required: true,
    scope: 'stock',
    help_text: 'e.g. s-1vcpu-1gb, t3.micro, cx11',
  },
  {
    key: 'vcpus',
    label: 'vCPUs',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'memory',
    label: 'Memory (MB)',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'disk',
    label: 'Disk (GB)',
    type: 'number',
    required: true,
    scope: 'stock',
  },
  {
    key: 'transfer',
    label: 'Transfer (TB)',
    type: 'number',
    required: false,
    scope: 'stock',
  },
  {
    key: 'region',
    label: 'Region / Datacenter',
    type: 'select',
    required: false,
    scope: 'stock',
    options: [],
    options_source: 'provider_data',
    provider_data_type: 'region',
    depends_on: 'provider',
    help_text: 'Datacenter location. Options load from synced provider data, or add manually in product type settings.',
  },
  {
    key: 'os',
    label: 'Operating System',
    type: 'select',
    required: false,
    scope: 'stock',
    options: [],
    options_source: 'provider_data',
    provider_data_type: 'image',
    depends_on: 'provider',
    help_text: 'OS image. Options load from synced provider data, or add manually in product type settings.',
  },
];

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from('product_types')
    .select('id, fields')
    .eq('type_key', 'vps_droplet')
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'vps_droplet product type not found' }, { status: 404 });
  }

  const existingFields = (existing.fields as Array<{ key: string; scope?: string }>) || [];
  const existingProductFields = existingFields.filter(f => f.scope === 'product' || !f.scope);
  const existingStockKeys = new Set(existingFields.filter(f => f.scope === 'stock').map(f => f.key));

  const newStockFields = VPS_STOCK_FIELDS.filter(f => !existingStockKeys.has(f.key));

  let updatedStockFields;
  if (existingStockKeys.size === 0) {
    updatedStockFields = VPS_STOCK_FIELDS;
  } else {
    const currentStockFields = existingFields.filter(f => f.scope === 'stock');
    updatedStockFields = [...currentStockFields, ...newStockFields];
  }

  const mergedFields = [...existingProductFields, ...updatedStockFields];

  const { error } = await admin
    .from('product_types')
    .update({ fields: mergedFields })
    .eq('type_key', 'vps_droplet');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    seeded: true,
    total_fields: mergedFields.length,
    stock_fields: updatedStockFields.length,
    product_fields: existingProductFields.length,
    new_fields_added: newStockFields.length,
  });
}
