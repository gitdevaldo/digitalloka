import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { listUserOrders } from '@/lib/services/orders';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = request.nextUrl.searchParams;
  const mode = (sp.get('mode') === 'offset' ? 'offset' : 'cursor') as 'cursor' | 'offset';
  const cursor = mode === 'cursor' ? (sp.get('cursor') || null) : null;
  const page = Math.max(1, Math.min(1000, parseInt(sp.get('page') || '1', 10) || 1));
  const perPage = Math.max(1, Math.min(100, parseInt(sp.get('per_page') || '20', 10) || 20));

  try {
    const result = await listUserOrders(userId, page, perPage, cursor, mode);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid cursor format') {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
