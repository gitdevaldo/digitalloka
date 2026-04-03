import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const url = new URL(request.url);
  const filterUserId = url.searchParams.get('user_id');
  const filterStatus = url.searchParams.get('status');
  const page = Math.max(1, Number(url.searchParams.get('page') || '1'));
  const perPage = 30;
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = admin
    .from('entitlements')
    .select('*, product:products(id, name, slug), user:users(id, email)', { count: 'exact' });

  if (filterUserId) query = query.eq('user_id', filterUserId);
  if (filterStatus) query = query.eq('status', filterStatus);

  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });

  return NextResponse.json({
    data: data || [],
    total: count || 0,
    current_page: page,
    per_page: perPage,
    last_page: Math.ceil((count || 0) / perPage),
  });
}
