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

  try {
    const result = await listAuditLogs(filters);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to load audit logs' }, { status: 500 });
  }
}
