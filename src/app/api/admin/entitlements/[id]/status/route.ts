import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { updateEntitlementStatus } from '@/lib/services/entitlements';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();

  const validStatuses = ['pending', 'active', 'expired', 'revoked'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return apiError('Invalid status', 422);
  }

  try {
    await updateEntitlementStatus(Number(id), body.status, body.reason);

    await logAudit({
      action: 'entitlement.update_status',
      target_type: 'entitlement',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { status: body.status, reason: body.reason },
    }).catch(() => {});

    return apiJson({ success: true });
  } catch {
    return apiError('Update failed', 422);
  }
});
