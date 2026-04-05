import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId, getUserDropletIds } from '@/lib/services/supabase-auth';
import { listDroplets } from '@/lib/services/digitalocean';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  try {
    const supabase = await createSupabaseServerClient();
    const dropletIds = await getUserDropletIds(supabase, userId);
    const droplets = await listDroplets(dropletIds);
    return NextResponse.json({ data: droplets });
  } catch (err) {
    console.error('[droplets] Failed to load droplets:', err);
    return apiError('Failed to load droplets', 500);
  }
});
