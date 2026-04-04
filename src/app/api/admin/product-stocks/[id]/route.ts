import { NextRequest, NextResponse } from 'next/server';
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
    .select('*, product:products(id, name, slug, product_type)')
    .eq('id', Number(id))
    .single();

  if (error || !data) return apiError('Stock not found', 404);
  return apiSuccess(data);
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

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.credential_data && typeof body.credential_data === 'object') {
    updates.credential_data = body.credential_data;
    updates.credential_hash = await hashCredentials(body.credential_data);

    const { data: dup } = await admin
      .from('product_stock_items')
      .select('id')
      .eq('credential_hash', updates.credential_hash as string)
      .neq('id', Number(id))
      .limit(1);

    if (dup && dup.length > 0) {
      return apiError('Duplicate stock credentials for this product', 422);
    }
  }
  if (body.status) updates.status = body.status;
  if (body.meta && typeof body.meta === 'object') updates.meta = body.meta;
  if (body.is_unlimited !== undefined) updates.is_unlimited = body.is_unlimited;

  if (Object.keys(updates).length === 0) {
    return apiError('No valid fields to update', 422);
  }

  const { data, error } = await admin
    .from('product_stock_items')
    .update(updates)
    .eq('id', Number(id))
    .select('*, product:products(id, name, slug, product_type)')
    .single();

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'product_stock.update',
    target_type: 'product_stock',
    target_id: id,
    actor_user_id: userId,
    actor_role: 'admin',
    changes: updates,
  }).catch(() => {});

  return apiJson({ item: data });
});

export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('product_stock_items')
    .delete()
    .eq('id', Number(id));

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'product_stock.delete',
    target_type: 'product_stock',
    target_id: id,
    actor_user_id: userId,
    actor_role: 'admin',
  }).catch(() => {});

  return NextResponse.json({ deleted: true });
});
