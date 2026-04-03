import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listOrders } from '@/lib/services/orders';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sp = request.nextUrl.searchParams;
  const filters: Record<string, string> = {};
  if (sp.get('status')) filters.status = sp.get('status')!;
  if (sp.get('user_id')) filters.user_id = sp.get('user_id')!;

  try {
    const result = await listOrders(filters);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to load orders' }, { status: 500 });
  }
}
