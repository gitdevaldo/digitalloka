import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listSizes } from '@/lib/services/digitalocean';
import { syncDigitalOceanProviderData } from '@/lib/services/sync-provider-data';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const { data: vpsProducts } = await admin
    .from('products')
    .select('id, name, meta')
    .eq('product_type', 'vps_droplet')
    .eq('status', 'active');

  if (!vpsProducts || vpsProducts.length === 0) {
    return NextResponse.json({ message: 'No active VPS products found', synced: 0 });
  }

  const results: { product_id: number; product_name: string; provider: string; synced: number; created: number; updated: number; availability_changes: number }[] = [];

  for (const product of vpsProducts) {
    const provider = 'DigitalOcean';

    try {
      const sizes = await listSizes();

      const { data: existingStock } = await admin
        .from('product_stock_items')
        .select('id, credential_data, status, is_unlimited')
        .eq('product_id', product.id);

      const existingBySlug = new Map(
        (existingStock || []).map(s => {
          const cred = s.credential_data as Record<string, unknown>;
          return [cred.slug as string, s];
        })
      );

      let synced = 0;
      let created = 0;
      let updated = 0;
      let availabilityChanges = 0;

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
          const oldCred = existing.credential_data as Record<string, unknown>;
          const wasAvailable = oldCred.available as boolean;

          await admin.from('product_stock_items')
            .update({ credential_data: credentialData })
            .eq('id', existing.id);

          if (wasAvailable !== size.available) {
            availabilityChanges++;
            console.log(`[cron/sync-sizes] Size ${size.slug} availability changed: ${wasAvailable} → ${size.available} (product ${product.id})`);
          }
          updated++;
        } else {
          const encoder = new TextEncoder();
          const buffer = encoder.encode(JSON.stringify({ slug: size.slug }));
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

          await admin.from('product_stock_items').insert({
            product_id: product.id,
            credential_data: credentialData,
            credential_hash: hash,
            status: 'disabled',
            is_unlimited: true,
            meta: { type: 'do_size', provider: 'DigitalOcean', synced_at: new Date().toISOString(), source: 'cron' },
          });
          created++;
        }
        synced++;
      }

      results.push({
        product_id: product.id,
        product_name: product.name,
        provider,
        synced,
        created,
        updated,
        availability_changes: availabilityChanges,
      });

      console.log(`[cron/sync-sizes] Product ${product.id} (${product.name}): ${synced} sizes synced, ${created} new, ${updated} updated, ${availabilityChanges} availability changes`);
    } catch (err) {
      console.error(`[cron/sync-sizes] Error syncing product ${product.id}:`, err);
      results.push({ product_id: product.id, product_name: product.name, provider, synced: 0, created: 0, updated: 0, availability_changes: 0 });
    }
  }

  let providerDataResult = null;
  try {
    providerDataResult = await syncDigitalOceanProviderData();
    console.log(`[cron/sync-sizes] Provider data synced: ${providerDataResult.regions.synced} regions, ${providerDataResult.images.synced} images`);
  } catch (err) {
    console.error('[cron/sync-sizes] Provider data sync failed:', err);
  }

  return NextResponse.json({
    message: 'Sync complete',
    timestamp: new Date().toISOString(),
    products_processed: results.length,
    results,
    provider_data: providerDataResult,
  });
}
