import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError, apiJson } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_stock_items')
    .select('*')
    .eq('product_id', Number(id))
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    if (error.message.includes('product_stock_items')) {
      return apiJson({ data: [], _table_missing: true });
    }
    return apiError(sanitizeDbError(error.message), 500);
  }
  return apiSuccess(data || []);
});

export const POST = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();

  if (!body.headers || !body.rows) {
    return apiError('headers and rows are required', 422);
  }

  const admin = createSupabaseAdminClient();
  const headers: string[] = body.headers;
  const lines = (body.rows as string).split(/\r?\n/).filter((l: string) => l.trim());
  let inserted = 0;

  for (const line of lines) {
    const parts = line.split('|').map((p: string) => p.trim());
    if (parts.length !== headers.length) continue;

    const credentialData: Record<string, string> = {};
    headers.forEach((h: string, i: number) => { credentialData[h] = parts[i]; });

    const sorted = Object.keys(credentialData).sort().reduce((acc: Record<string, string>, key) => {
      acc[key] = credentialData[key];
      return acc;
    }, {});
    const credentialHash = await hashCredentials(sorted);

    const { error } = await admin.from('product_stock_items').insert({
      product_id: Number(id),
      credential_data: credentialData,
      credential_hash: credentialHash,
      status: 'enabled',
    });

    if (!error) inserted++;
  }

  await logAudit({
    action: 'product_stock.bulk_add',
    target_type: 'product',
    target_id: id,
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { inserted, total_lines: lines.length },
  }).catch(() => {});

  return apiJson({ inserted, total_lines: lines.length });
});

async function hashCredentials(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
