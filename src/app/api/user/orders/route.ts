import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { listUserOrders } from '@/lib/services/orders';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const sp = request.nextUrl.searchParams;
  const mode = (sp.get('mode') === 'offset' ? 'offset' : 'cursor') as 'cursor' | 'offset';
  const cursor = mode === 'cursor' ? (sp.get('cursor') || null) : null;
  const page = Math.max(1, Math.min(1000, parseInt(sp.get('page') || '1', 10) || 1));
  const perPage = Math.max(1, Math.min(100, parseInt(sp.get('per_page') || '20', 10) || 20));

  try {
    const supabase = await createSupabaseServerClient();
    const result = await listUserOrders(supabase, userId, page, perPage, cursor, mode);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid cursor format') {
      return apiError('Invalid cursor', 400);
    }
    return apiError('Failed to load orders', 500);
  }
});
