import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { canAccessDroplet } from '@/lib/services/admin-access';
import { getDroplet } from '@/lib/services/digitalocean';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const dropletId = Number(id);
  const supabase = await createSupabaseServerClient();
  if (!await canAccessDroplet(supabase, userId, dropletId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const droplet = await getDroplet(dropletId);
    return NextResponse.json({ data: droplet });
  } catch {
    return NextResponse.json({ error: 'Droplet not found' }, { status: 404 });
  }
}
