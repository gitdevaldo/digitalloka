import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { performAction } from '@/lib/services/digitalocean';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { dropletActionSchema } from '@/lib/validation/schemas';

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const dropletId = Number(id);
  if (!dropletId || dropletId <= 0) {
    return apiError('Invalid droplet ID', 400);
  }

  const parsed = await parseRequestBody(request, dropletActionSchema);
  if (!parsed.success) return parsed.response;

  try {
    const action = await performAction(dropletId, parsed.data.type);

    await logAudit({
      action: 'droplet.action',
      target_type: 'droplet',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { action_type: parsed.data.type },
    }).catch((err: unknown) => {
      console.error('[audit-log] Failed to log droplet.action:', err);
    });

    return NextResponse.json({ action }, { status: 201 });
  } catch (err) {
    console.error('[admin/droplets/actions] Action failed:', err);
    return apiError('Action failed', 502);
  }
});
