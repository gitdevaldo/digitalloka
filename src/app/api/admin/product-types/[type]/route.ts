import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const PUT = withErrorHandler(async (request: NextRequest, { params }: { params: Promise<{ type: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { type } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.label !== undefined) updates.label = body.label;
  if (body.description !== undefined) updates.description = body.description;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.fields !== undefined) updates.fields = body.fields;

  const { data, error } = await admin
    .from('product_types')
    .update(updates)
    .eq('type_key', type)
    .select()
    .single();

  if (error) return apiError(sanitizeDbError(error.message), 422);
  if (!data) return apiError('Product type not found', 404);

  await logAudit({
    action: 'product_type.update',
    target_type: 'product_type',
    target_id: type,
    actor_user_id: userId,
    actor_role: 'admin',
    changes: updates,
  }).catch(() => {});

  return NextResponse.json({
    data: {
      id: data.id,
      type: data.type_key,
      label: data.label,
      description: data.description || '',
      is_active: data.is_active,
      fields: data.fields || [],
    },
  });
});

export const DELETE = withErrorHandler(async (_request: NextRequest, { params }: { params: Promise<{ type: string }> }) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const { type } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('product_types')
    .delete()
    .eq('type_key', type);

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'product_type.delete',
    target_type: 'product_type',
    target_id: type,
    actor_user_id: userId,
    actor_role: 'admin',
  }).catch(() => {});

  return NextResponse.json({ deleted: true });
});
