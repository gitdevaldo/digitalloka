import { NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { canAccessDroplet } from '@/lib/services/admin-access';
import { performAction } from '@/lib/services/digitalocean';
import { parseRequestBody } from '@/lib/validation';
import { dropletActionSchema } from '@/lib/validation/schemas';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { id } = await params;
  const dropletId = Number(id);
  const supabase = await createSupabaseServerClient();
  if (!await canAccessDroplet(supabase, userId, dropletId)) {
    return apiError('Forbidden', 403);
  }

  const parsed = await parseRequestBody(request, dropletActionSchema);
  if (!parsed.success) return parsed.response;

  const { type: actionType } = parsed.data;

  try {
    const action = await performAction(dropletId, actionType);
    return apiSuccess(action);
  } catch (err) {
    console.error('[droplets/actions] Action failed:', err);
    return apiError('Action failed', 500);
  }
});
