import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listGroupedSettings, upsertSetting } from '@/lib/services/site-settings';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  try {
    const settings = await listGroupedSettings();
    return NextResponse.json({ settings });
  } catch {
    return apiError('Failed to load settings', 500);
  }
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const body = await request.json();
  if (!body.group || !body.key) return apiError('group and key are required', 422);

  try {
    const result = await upsertSetting(body.group, body.key, body.value, userId);

    await logAudit({
      action: 'setting.update',
      target_type: 'setting',
      target_id: `${body.group}.${body.key}`,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { group: body.group, key: body.key, value: body.value },
    }).catch(() => {});

    return apiSuccess(result);
  } catch {
    return apiError('Update failed', 422);
  }
});
