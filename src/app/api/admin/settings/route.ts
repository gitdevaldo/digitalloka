import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listGroupedSettings, upsertGroupSettings } from '@/lib/services/site-settings';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { settingsUpdateSchema } from '@/lib/validation/schemas';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  try {
    const settings = await listGroupedSettings();
    return NextResponse.json({ settings });
  } catch (err) {
    console.error('[admin/settings] Failed to load settings:', err);
    return apiError('Failed to load settings', 500);
  }
});

export const PUT = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const parsed = await parseRequestBody(request, settingsUpdateSchema);
  if (!parsed.success) return parsed.response;

  const { group, values } = parsed.data;

  try {
    const result = await upsertGroupSettings(group, values as Record<string, unknown>, userId);

    await logAudit({
      action: 'setting.update',
      target_type: 'setting',
      target_id: group,
      actor_user_id: userId,
      actor_role: 'admin',
      changes: { group, values },
    }).catch((err: unknown) => {
      console.error('[audit-log] Failed to log settings.update:', err);
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error('[admin/settings] Update failed:', err);
    return apiError('Update failed', 422);
  }
});
