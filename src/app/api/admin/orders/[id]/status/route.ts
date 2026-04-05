import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { updateOrderStatus } from '@/lib/services/orders';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { orderStatusUpdateSchema } from '@/lib/validation/schemas';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const parsed = await parseRequestBody(request, orderStatusUpdateSchema);
  if (!parsed.success) return parsed.response;

  try {
    const order = await updateOrderStatus(Number(id), parsed.data.status);

    await logAudit({
      action: 'order.update_status',
      target_type: 'order',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { status: parsed.data.status },
    }).catch((err: unknown) => {
      console.error('[audit-log] Failed to log order.status_change:', err);
    });

    return apiSuccess(order);
  } catch (err) {
    console.error('[admin/orders] Status update failed:', err);
    return apiError('Update failed', 422);
  }
});
