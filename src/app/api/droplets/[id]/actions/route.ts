import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { canAccessDroplet } from '@/lib/services/admin-access';
import { performAction } from '@/lib/services/digitalocean';

const ALLOWED_ACTIONS = ['power_on', 'power_off', 'shutdown', 'reboot', 'power_cycle'];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const dropletId = Number(id);
  if (!await canAccessDroplet(userId, dropletId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const actionType = body.type;

  if (!ALLOWED_ACTIONS.includes(actionType)) {
    return NextResponse.json({ error: `Invalid action. Allowed: ${ALLOWED_ACTIONS.join(', ')}` }, { status: 422 });
  }

  try {
    const action = await performAction(dropletId, actionType);
    return NextResponse.json({ data: action });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Action failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
