import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listGroupedSettings, upsertGroupSettings } from '@/lib/services/site-settings';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
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
  const { group, values } = body as { group: string; values: Record<string, unknown> };

  if (!group || !values || typeof values !== 'object') {
    return apiError('group and values object are required', 422);
  }

  try {
    const result = await upsertGroupSettings(group, values, userId);

    await logAudit({
      action: 'setting.update',
      target_type: 'setting',
      target_id: group,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { group, values },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: result });
  } catch {
    return apiError('Update failed', 422);
  }
});
