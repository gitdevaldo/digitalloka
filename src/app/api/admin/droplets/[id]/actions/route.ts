import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { performAction } from '@/lib/services/digitalocean';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const dropletId = Number(id);
  if (!dropletId || dropletId <= 0) {
    return NextResponse.json({ error: 'Invalid droplet ID' }, { status: 400 });
  }

  const body = await request.json();
  const validActions = ['power_on', 'power_off', 'reboot', 'shutdown', 'power_cycle'];
  if (!body.type || !validActions.includes(body.type)) {
    return NextResponse.json({ error: 'Invalid action type' }, { status: 422 });
  }

  try {
    const action = await performAction(dropletId, body.type);
    return NextResponse.json({ action }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Action failed' }, { status: 502 });
  }
}
