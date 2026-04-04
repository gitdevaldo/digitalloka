import { NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listDroplets } from '@/lib/services/digitalocean';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();

  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id, email, droplet_ids');

  if (usersError) return NextResponse.json({ error: sanitizeDbError(usersError.message) }, { status: 500 });

  const ownersByDropletId: Record<number, { id: string; email: string }> = {};
  for (const user of (users || [])) {
    const ids = Array.isArray(user.droplet_ids) ? user.droplet_ids : [];
    for (const rawId of ids) {
      const numericId = Number(rawId);
      if (numericId > 0) {
        ownersByDropletId[numericId] = { id: user.id, email: user.email };
      }
    }
  }

  const dropletIds = Object.keys(ownersByDropletId).map(Number);
  if (dropletIds.length === 0) {
    return NextResponse.json({ droplets: [] });
  }

  try {
    const rawDroplets = await listDroplets(dropletIds);

    const ownerUserIds = [...new Set(Object.values(ownersByDropletId).map(o => o.id))];
    const { data: entitlements } = await admin
      .from('entitlements')
      .select('id, user_id')
      .in('user_id', ownerUserIds)
      .eq('status', 'active');

    const entitlementByUserId: Record<string, number> = {};
    for (const ent of (entitlements || [])) {
      if (!entitlementByUserId[ent.user_id]) {
        entitlementByUserId[ent.user_id] = ent.id;
      }
    }

    const mapped = rawDroplets.map((droplet) => {
      const owner = ownersByDropletId[droplet.id] || { id: null, email: null };
      const v4 = droplet.networks?.v4 || [];

      return {
        id: droplet.id,
        name: droplet.name || `droplet-${droplet.id}`,
        region: droplet.region?.slug || null,
        size: droplet.size?.slug || null,
        status: droplet.status || 'unknown',
        ip_address: v4[0]?.ip_address || null,
        owner_user_id: owner.id,
        owner_email: owner.email,
        entitlement_id: owner.id ? entitlementByUserId[owner.id] || null : null,
        updated_at: droplet.created_at || null,
      };
    });

    return NextResponse.json({ droplets: mapped });
  } catch {
    return NextResponse.json({ error: 'Failed to load droplets' }, { status: 502 });
  }
}
