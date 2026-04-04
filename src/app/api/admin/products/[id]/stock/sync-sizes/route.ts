import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listSizes } from '@/lib/services/digitalocean';
import { syncDigitalOceanProviderData } from '@/lib/services/sync-provider-data';
import { apiError, apiJson } from '@/lib/api-response';
import { withErrorHandler } from '@/lib/api-handler';
import { syncSizesUpdateSchema, manualSizeCreateSchema } from '@/lib/validation/schemas';

export const POST = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const productId = Number(id);
  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, product_type')
    .eq('id', productId)
    .single();

  if (!product || product.product_type !== 'vps_droplet') {
    return apiError('Product not found or not a VPS droplet type', 422);
  }

  const sizes = await listSizes();

  const { data: existingStock } = await admin
    .from('product_stock_items')
    .select('id, credential_data, status, is_unlimited, meta')
    .eq('product_id', productId);

  const existingBySlug = new Map(
    (existingStock || []).map(s => {
      const cred = s.credential_data as Record<string, unknown>;
      return [cred.slug as string, s];
    })
  );

  let synced = 0;
  let created = 0;
  let updated = 0;

  for (const size of sizes) {
    const existing = existingBySlug.get(size.slug);
    const credentialData = {
      slug: size.slug,
      description: size.description,
      memory: size.memory,
      vcpus: size.vcpus,
      disk: size.disk,
      transfer: size.transfer,
      price_monthly: size.price_monthly,
      price_hourly: size.price_hourly,
      available: size.available,
      regions: size.regions,
      disk_info: size.disk_info || [],
    };

    if (existing) {
      const existingMeta = (existing.meta as Record<string, unknown>) || {};
      await admin.from('product_stock_items')
        .update({ credential_data: credentialData, meta: { ...existingMeta, provider: 'DigitalOcean', synced_at: new Date().toISOString() } })
        .eq('id', existing.id);
      updated++;
    } else {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(JSON.stringify({ slug: size.slug }));
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

      await admin.from('product_stock_items').insert({
        product_id: productId,
        credential_data: credentialData,
        credential_hash: hash,
        status: 'disabled',
        is_unlimited: true,
        meta: { type: 'do_size', provider: 'DigitalOcean', synced_at: new Date().toISOString() },
      });
      created++;
    }
    synced++;
  }

  let providerDataResult = null;
  try {
    providerDataResult = await syncDigitalOceanProviderData();
    console.log(`[sync-sizes] Provider data synced: ${providerDataResult.regions.synced} regions, ${providerDataResult.images.synced} images`);
  } catch (err) {
    console.error('[sync-sizes] Provider data sync failed:', err);
  }

  return apiJson({
    synced, created, updated, total_sizes: sizes.length,
    provider_data: providerDataResult,
  });
});

export const PATCH = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const productId = Number(id);
  const body = await request.json();
  const parsed = syncSizesUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues.map(i => i.message).join(', '), 422);
  }
  const { stock_item_id, status, selling_price } = parsed.data;

  const admin = createSupabaseAdminClient();

  const { data: stock } = await admin
    .from('product_stock_items')
    .select('id, product_id, status, meta')
    .eq('id', stock_item_id)
    .eq('product_id', productId)
    .single();

  if (!stock) {
    return apiError('Stock item not found', 404);
  }

  const updates: Record<string, unknown> = {};

  if (status && ['enabled', 'disabled'].includes(status)) {
    if (stock.status === 'sold') {
      return apiError('Cannot change status of sold stock item', 422);
    }
    updates.status = status;
  }

  if (selling_price !== undefined) {
    const existingMeta = (stock.meta as Record<string, unknown>) || {};
    updates.meta = { ...existingMeta, selling_price: selling_price };
  }

  if (Object.keys(updates).length === 0) {
    return apiError('No valid updates provided', 422);
  }

  const { error } = await admin.from('product_stock_items')
    .update(updates)
    .eq('id', stock_item_id);

  if (error) return apiError(error.message, 500);

  return apiJson({ updated: true, stock_item_id, updates });
});

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const productId = Number(id);
  const body = await request.json();
  const parsed = manualSizeCreateSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues.map(i => i.message).join(', '), 422);
  }

  const { provider, slug, vcpus, memory, disk } = parsed.data;

  const admin = createSupabaseAdminClient();

  const CREDENTIAL_KEYS = ['slug', 'vcpus', 'memory', 'disk', 'transfer'];
  const credentialData: Record<string, unknown> = {
    slug,
    description: `${slug} (${provider})`,
    vcpus: Number(vcpus),
    memory: Number(memory),
    disk: Number(disk),
    transfer: parsed.data.transfer,
    price_monthly: parsed.data.price_monthly,
    price_hourly: Number((parsed.data.price_monthly / 730).toFixed(5)),
    available: true,
    regions: parsed.data.regions,
  };

  const meta: Record<string, unknown> = {
    type: 'manual_size',
    provider,
    selling_price: parsed.data.selling_price ?? parsed.data.price_monthly,
    added_by: userId,
    added_at: new Date().toISOString(),
  };

  for (const [key, value] of Object.entries(body)) {
    if (['selling_price', 'price_monthly', 'regions'].includes(key)) continue;
    if (CREDENTIAL_KEYS.includes(key)) continue;
    if (key === 'provider') continue;
    if (value !== undefined && value !== null && value !== '') {
      meta[key] = value;
    }
  }

  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify({ slug, provider }));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: existing } = await admin
    .from('product_stock_items')
    .select('id')
    .eq('product_id', productId)
    .eq('credential_hash', hash)
    .single();

  if (existing) {
    return apiError('Size with this slug and provider already exists', 409);
  }

  const { error } = await admin.from('product_stock_items').insert({
    product_id: productId,
    credential_data: credentialData as import('@/lib/supabase/database.types').Json,
    credential_hash: hash,
    status: 'disabled',
    is_unlimited: true,
    meta: meta as import('@/lib/supabase/database.types').Json,
  });

  if (error) return apiError(error.message, 500);

  return apiJson({ created: true, slug, provider });
});
