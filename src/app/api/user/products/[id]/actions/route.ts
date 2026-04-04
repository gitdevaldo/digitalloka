import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';

const ALLOWED_ACTIONS = ['view_details', 'download_assets', 'renew', 'revoke'];

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { id } = await params;
  const body = await request.json();
  if (!ALLOWED_ACTIONS.includes(body.action)) {
    return apiError('Invalid action', 422);
  }

  const admin = createSupabaseAdminClient();
  const { data: entitlement } = await admin
    .from('entitlements')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', Number(id))
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  if (!entitlement) {
    return apiError('You do not have access to this product', 403);
  }

  return apiSuccess({ queued: true, action: body.action, product_id: id });
});
