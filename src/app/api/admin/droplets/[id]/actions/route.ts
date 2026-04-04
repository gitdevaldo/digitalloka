import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { performAction } from '@/lib/services/digitalocean';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const dropletId = Number(id);
  if (!dropletId || dropletId <= 0) {
    return apiError('Invalid droplet ID', 400);
  }

  const body = await request.json();
  const validActions = ['power_on', 'power_off', 'reboot', 'shutdown', 'power_cycle'];
  if (!body.type || !validActions.includes(body.type)) {
    return apiError('Invalid action type', 422);
  }

  try {
    const action = await performAction(dropletId, body.type);

    await logAudit({
      action: 'droplet.action',
      target_type: 'droplet',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { action_type: body.type },
    }).catch(() => {});

    return NextResponse.json({ action }, { status: 201 });
  } catch {
    return apiError('Action failed', 502);
  }
});
