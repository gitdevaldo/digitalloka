import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson, apiSuccess } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { productStockCreateSchema } from '@/lib/validation/schemas';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const admin = createSupabaseAdminClient();
  const url = new URL(request.url);
  const productId = url.searchParams.get('product_id');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('q')?.toLowerCase();

  let query = admin
    .from('product_stock_items')
    .select('*, product:products(id, name, slug, product_type)')
    .order('id', { ascending: false });

  if (productId) query = query.eq('product_id', Number(productId));
  if (status && ['unsold', 'sold', 'enabled', 'disabled'].includes(status)) query = query.eq('status', status);

  if (search) {
    const escaped = search.replace(/[%_\\]/g, '\\$&');
    query = query.or(`credential_data->>slug.ilike.%${escaped}%,credential_data->>description.ilike.%${escaped}%`);
  }

  query = query.limit(50);

  const { data, error } = await query;

  if (error) {
    if (error.message.includes('product_stock_items')) {
      return apiJson({ data: [], _table_missing: true });
    }
    return apiError(sanitizeDbError(error.message), 500);
  }

  return apiJson({ data: data || [] });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const parsed = await parseRequestBody(request, productStockCreateSchema);
  if (!parsed.success) return parsed.response;

  const admin = createSupabaseAdminClient();
  const credentialData = parsed.data.credential_data as Record<string, unknown>;
  const credentialHash = await hashCredentials(credentialData);

  const { data: existing } = await admin
    .from('product_stock_items')
    .select('id')
    .eq('product_id', parsed.data.product_id)
    .eq('credential_hash', credentialHash)
    .limit(1);

  if (existing && existing.length > 0) {
    return apiError('Duplicate stock credentials for this product', 422);
  }

  const { data, error } = await admin
    .from('product_stock_items')
    .insert({
      product_id: parsed.data.product_id,
      credential_data: credentialData as import('@/lib/supabase/database.types').Json,
      credential_hash: credentialHash,
      status: 'enabled',
      created_at: new Date().toISOString(),
    })
    .select('*, product:products(id, name, slug, product_type)')
    .single();

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'product_stock.create',
    target_type: 'product_stock',
    target_id: String(data.id),
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { product_id: parsed.data.product_id },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log product_stock.create:', err);
  });

  return apiJson({ item: data }, 201);
});

async function hashCredentials(data: Record<string, unknown>): Promise<string> {
  const sorted = Object.keys(data).sort().reduce((acc: Record<string, unknown>, key) => {
    acc[key] = data[key];
    return acc;
  }, {});
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(sorted));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
