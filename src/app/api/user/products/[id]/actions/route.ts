import { NextRequest } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { parseRequestBody } from '@/lib/validation';
import { productActionSchema } from '@/lib/validation/schemas';

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const { id } = await params;
  const parsed = await parseRequestBody(request, productActionSchema);
  if (!parsed.success) return parsed.response;

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

  return apiSuccess({ queued: true, action: parsed.data.action, product_id: id });
});
