import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId, getUserDropletIds } from '@/lib/services/supabase-auth';
import { listDroplets } from '@/lib/services/digitalocean';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const supabase = await createSupabaseServerClient();
    const dropletIds = await getUserDropletIds(supabase, userId);
    const droplets = await listDroplets(dropletIds);
    return NextResponse.json({ data: droplets });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Failed to load droplets' }, { status: 500 });
  }
}
