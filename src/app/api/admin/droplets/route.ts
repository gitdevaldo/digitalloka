import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { listDroplets } from '@/lib/services/digitalocean';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';

const PAGE_SIZE = 50;

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number(sp.get('page') || '1'));

  const admin = createSupabaseAdminClient();

  const { count: totalUsers } = await admin
    .from('users')
    .select('id', { count: 'exact', head: true })
    .not('droplet_ids', 'is', null);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id, email, droplet_ids')
    .not('droplet_ids', 'is', null)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (usersError) return apiError(sanitizeDbError(usersError.message), 500);

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
    return apiJson({ data: [], droplets: [], page, total_pages: Math.ceil((totalUsers || 0) / PAGE_SIZE), has_more: false });
  }

  try {
    const rawDroplets = await listDroplets(dropletIds);

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
        updated_at: droplet.created_at || null,
      };
    });

    const totalPages = Math.ceil((totalUsers || 0) / PAGE_SIZE);
    return apiJson({ data: mapped, droplets: mapped, page, total_pages: totalPages, has_more: page < totalPages });
  } catch (err) {
    console.error('[admin/droplets] Failed to load droplets:', err);
    return apiError('Failed to load droplets', 502);
  }
});
