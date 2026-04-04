import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

const ALLOWED_ACTIONS = ['view_details', 'download_assets', 'renew', 'revoke'];

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const body = await request.json();
  if (!ALLOWED_ACTIONS.includes(body.action)) {
    return apiError('Invalid action', 422);
  }

  return apiSuccess({ queued: true, action: body.action, product_id: (await params).id });
});
