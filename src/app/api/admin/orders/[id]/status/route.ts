import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { updateOrderStatus } from '@/lib/services/orders';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();
  if (!body.status) return apiError('status is required', 422);

  try {
    const order = await updateOrderStatus(Number(id), body.status);

    await logAudit({
      action: 'order.update_status',
      target_type: 'order',
      target_id: id,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { status: body.status },
    }).catch(() => {});

    return apiSuccess(order);
  } catch {
    return apiError('Update failed', 422);
  }
});
