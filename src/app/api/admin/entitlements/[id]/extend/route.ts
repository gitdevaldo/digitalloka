import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { entitlementExtendSchema } from '@/lib/validation/schemas';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const parsed = await parseRequestBody(request, entitlementExtendSchema);
  if (!parsed.success) return parsed.response;

  const days = parsed.data.days ?? 30;

  const admin = createSupabaseAdminClient();

  const { data: entitlement, error: fetchError } = await admin
    .from('entitlements')
    .select('expires_at')
    .eq('id', Number(id))
    .single();

  if (fetchError || !entitlement) {
    return apiError('Entitlement not found', 404);
  }

  const currentExpiry = entitlement.expires_at ? new Date(entitlement.expires_at) : new Date();
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from('entitlements')
    .update({ expires_at: newExpiry.toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'entitlement.extend',
    target_type: 'entitlement',
    target_id: id,
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { days, new_expires_at: newExpiry.toISOString() },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log entitlement.extend:', err);
  });

  return apiSuccess(data);
});
