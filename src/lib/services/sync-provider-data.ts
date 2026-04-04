import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listRegions, listDistributionImages } from '@/lib/services/digitalocean';

interface SyncResult {
  regions: { synced: number; created: number; updated: number; deactivated: number };
  images: { synced: number; created: number; updated: number; deactivated: number };
  errors: string[];
}

export async function syncDigitalOceanProviderData(): Promise<SyncResult> {
  const admin = createSupabaseAdminClient();
  const provider = 'DigitalOcean';

  const result: SyncResult = {
    regions: { synced: 0, created: 0, updated: 0, deactivated: 0 },
    images: { synced: 0, created: 0, updated: 0, deactivated: 0 },
    errors: [],
  };

  const [doRegions, doImages] = await Promise.all([
    listRegions(),
    listDistributionImages(),
  ]);

  const { data: existingRegions, error: regFetchErr } = await admin
    .from('vps_provider_data')
    .select('id, slug')
    .eq('provider', provider)
    .eq('resource_type', 'region');

  if (regFetchErr) {
    result.errors.push(`Failed to fetch existing regions: ${regFetchErr.message}`);
    return result;
  }

  const existingRegionMap = new Map(
    (existingRegions || []).map(r => [r.slug, r.id])
  );

  const syncedRegionSlugs = new Set<string>();

  for (const region of doRegions) {
    syncedRegionSlugs.add(region.slug);
    const existingId = existingRegionMap.get(region.slug);
    const row = {
      provider,
      resource_type: 'region' as const,
      slug: region.slug,
      name: region.name,
      available: region.available,
      data: {
        features: region.features,
        sizes: region.sizes,
      },
      synced_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await admin.from('vps_provider_data')
        .update(row)
        .eq('id', existingId);
      if (error) {
        result.errors.push(`Region update ${region.slug}: ${error.message}`);
      } else {
        result.regions.updated++;
      }
    } else {
      const { error } = await admin.from('vps_provider_data').insert(row);
      if (error) {
        result.errors.push(`Region insert ${region.slug}: ${error.message}`);
      } else {
        result.regions.created++;
      }
    }
    result.regions.synced++;
  }

  for (const [slug, id] of existingRegionMap) {
    if (!syncedRegionSlugs.has(slug)) {
      const { error } = await admin.from('vps_provider_data')
        .update({ available: false, synced_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        result.errors.push(`Region deactivate ${slug}: ${error.message}`);
      } else {
        result.regions.deactivated++;
      }
    }
  }

  const { data: existingImages, error: imgFetchErr } = await admin
    .from('vps_provider_data')
    .select('id, slug')
    .eq('provider', provider)
    .eq('resource_type', 'image');

  if (imgFetchErr) {
    result.errors.push(`Failed to fetch existing images: ${imgFetchErr.message}`);
    return result;
  }

  const existingImageMap = new Map(
    (existingImages || []).map(i => [i.slug, i.id])
  );

  const syncedImageSlugs = new Set<string>();

  for (const image of doImages) {
    if (!image.slug) continue;
    syncedImageSlugs.add(image.slug);

    const existingId = existingImageMap.get(image.slug);
    const row = {
      provider,
      resource_type: 'image' as const,
      slug: image.slug,
      name: `${image.distribution} ${image.name}`,
      available: image.status === 'available',
      data: {
        id: image.id,
        distribution: image.distribution,
        type: image.type,
        public: image.public,
        regions: image.regions,
        min_disk_size: image.min_disk_size,
        size_gigabytes: image.size_gigabytes,
        description: image.description || '',
        tags: image.tags || [],
      },
      synced_at: new Date().toISOString(),
    };

    if (existingId) {
      const { error } = await admin.from('vps_provider_data')
        .update(row)
        .eq('id', existingId);
      if (error) {
        result.errors.push(`Image update ${image.slug}: ${error.message}`);
      } else {
        result.images.updated++;
      }
    } else {
      const { error } = await admin.from('vps_provider_data').insert(row);
      if (error) {
        result.errors.push(`Image insert ${image.slug}: ${error.message}`);
      } else {
        result.images.created++;
      }
    }
    result.images.synced++;
  }

  for (const [slug, id] of existingImageMap) {
    if (!syncedImageSlugs.has(slug)) {
      const { error } = await admin.from('vps_provider_data')
        .update({ available: false, synced_at: new Date().toISOString() })
        .eq('id', id);
      if (error) {
        result.errors.push(`Image deactivate ${slug}: ${error.message}`);
      } else {
        result.images.deactivated++;
      }
    }
  }

  return result;
}
