import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { listUserEntitlements } from '@/lib/services/entitlements';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  try {
    const supabase = await createSupabaseServerClient();
    const result = await listUserEntitlements(supabase, userId);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[user/products] Failed to load products:', err);
    return apiError('Failed to load products', 500);
  }
});
