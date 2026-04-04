import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  const validRoles = ['user', 'admin'];
  if (body.role && validRoles.includes(body.role)) updates.role = body.role;
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from('users').update(updates).eq('id', id).select().single();
  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'user.update_access',
    target_type: 'user',
    target_id: id,
    actor_user_id: userId,
    actor_role: 'admin',
    changes: updates,
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log user.access_update:', err);
  });

  return apiSuccess(data);
});
