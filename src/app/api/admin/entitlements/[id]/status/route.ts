import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { updateEntitlementStatus } from '@/lib/services/entitlements';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { entitlementStatusUpdateSchema } from '@/lib/validation/schemas';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const parsed = await parseRequestBody(request, entitlementStatusUpdateSchema);
  if (!parsed.success) return parsed.response;

  try {
    await updateEntitlementStatus(Number(id), parsed.data.status, parsed.data.reason);

    await logAudit({
      action: 'entitlement.update_status',
      target_type: 'entitlement',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { status: parsed.data.status, reason: parsed.data.reason },
    }).catch((err: unknown) => {
      console.error('[audit-log] Failed to log entitlement.status_change:', err);
    });

    return apiJson({ success: true });
  } catch (err) {
    console.error('[admin/entitlements] Status update failed:', err);
    return apiError('Update failed', 422);
  }
});
