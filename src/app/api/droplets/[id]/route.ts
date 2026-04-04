import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { canAccessDroplet } from '@/lib/services/admin-access';
import { getDroplet } from '@/lib/services/digitalocean';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { id } = await params;
  const dropletId = Number(id);
  const supabase = await createSupabaseServerClient();
  if (!await canAccessDroplet(supabase, userId, dropletId)) {
    return apiError('Forbidden', 403);
  }

  try {
    const droplet = await getDroplet(dropletId);
    return apiSuccess(droplet);
  } catch {
    return apiError('Droplet not found', 404);
  }
});
