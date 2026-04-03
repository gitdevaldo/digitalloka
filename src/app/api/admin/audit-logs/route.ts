import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listAuditLogs } from '@/lib/services/audit-log';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sp = request.nextUrl.searchParams;
  const filters: Record<string, string> = {};
  for (const key of ['actor', 'action', 'target_type', 'target_id', 'date_from', 'date_to']) {
    const val = sp.get(key);
    if (val) filters[key] = val;
  }

  const mode = (sp.get('mode') === 'offset' ? 'offset' : 'cursor') as 'cursor' | 'offset';
  const cursor = mode === 'cursor' ? (sp.get('cursor') || null) : null;
  const page = Math.max(1, Math.min(1000, parseInt(sp.get('page') || '1', 10) || 1));
  const perPage = Math.max(1, Math.min(100, parseInt(sp.get('per_page') || '50', 10) || 50));

  try {
    const result = await listAuditLogs(filters, page, perPage, cursor, mode);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === 'Invalid cursor format') {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}
