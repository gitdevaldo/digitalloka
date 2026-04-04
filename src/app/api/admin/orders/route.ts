import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listOrders } from '@/lib/services/orders';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const sp = request.nextUrl.searchParams;
  const filters: Record<string, string> = {};
  if (sp.get('status')) filters.status = sp.get('status')!;
  if (sp.get('user_id')) filters.user_id = sp.get('user_id')!;

  const mode = (sp.get('mode') === 'offset' ? 'offset' : 'cursor') as 'cursor' | 'offset';
  const cursor = mode === 'cursor' ? (sp.get('cursor') || null) : null;
  const page = Math.max(1, Math.min(1000, parseInt(sp.get('page') || '1', 10) || 1));
  const perPage = Math.max(1, Math.min(100, parseInt(sp.get('per_page') || '30', 10) || 30));

  try {
    const result = await listOrders(filters, page, perPage, cursor, mode);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid cursor format') {
      return apiError('Invalid cursor', 400);
    }
    return apiError('Failed to load orders', 500);
  }
});
