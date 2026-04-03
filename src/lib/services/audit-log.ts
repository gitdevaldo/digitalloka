import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function logAudit(params: {
  action: string;
  target_type: string;
  target_id?: string;
  actor_user_id?: string;
  actor_role?: string;
  changes?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}) {
  const admin = createSupabaseAdminClient();
  await admin.from('audit_logs').insert({
    actor_user_id: params.actor_user_id || null,
    actor_role: params.actor_role || null,
    action: params.action,
    target_type: params.target_type,
    target_id: params.target_id || null,
    changes: params.changes || null,
    ip_address: params.ip_address || null,
    user_agent: params.user_agent || null,
  });
}

export async function listAuditLogs(filters: Record<string, string>, page = 1, perPage = 50) {
  const admin = createSupabaseAdminClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = admin.from('audit_logs').select('*', { count: 'exact' });

  const escapeIlike = (v: string) => v.replace(/[%_\\]/g, '\\$&');
  if (filters.actor) query = query.ilike('actor_user_id', `%${escapeIlike(filters.actor)}%`);
  if (filters.action) query = query.ilike('action', `%${escapeIlike(filters.action)}%`);
  if (filters.target_type) query = query.eq('target_type', filters.target_type);
  if (filters.target_id) query = query.ilike('target_id', `%${escapeIlike(filters.target_id)}%`);
  if (filters.date_from) query = query.gte('created_at', filters.date_from);
  if (filters.date_to) query = query.lte('created_at', filters.date_to);

  const { data, count, error } = await query.order('created_at', { ascending: false }).range(from, to);
  if (error) throw new Error(error.message);

  const mapped = (data || []).map((row: Record<string, unknown>) => {
    const changes = (row.changes as Record<string, unknown>) || {};
    const actionStr = String(row.action || '').toLowerCase();
    let result = 'ok';
    if (changes.error || actionStr.includes('fail')) result = 'fail';
    else if (changes.warning) result = 'warn';

    return {
      ...row,
      actor: row.actor_user_id || 'system',
      result,
    };
  });

  return { data: mapped, total: count || 0, page, per_page: perPage };
}
