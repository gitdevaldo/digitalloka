import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';
import { parseRequestBody } from '@/lib/validation';
import { productTypeCreateSchema } from '@/lib/validation/schemas';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return apiError(sanitizeDbError(error.message), 500);

  const types = (data || []).map((row) => ({
    id: row.id,
    type: row.type_key,
    label: row.label,
    description: row.description || '',
    is_active: row.is_active,
    fields: row.fields || [],
  }));

  return apiJson({ data: types });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const parsed = await parseRequestBody(request, productTypeCreateSchema);
  if (!parsed.success) return parsed.response;

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('product_types')
    .insert({
      type_key: parsed.data.type,
      label: parsed.data.label,
      description: parsed.data.description,
      is_active: parsed.data.is_active,
      fields: parsed.data.fields as import('@/lib/supabase/database.types').Json,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return apiError('Product type already exists', 422);
    }
    return apiError(sanitizeDbError(error.message), 422);
  }

  await logAudit({
    action: 'product_type.create',
    target_type: 'product_type',
    target_id: String(data.id),
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { type: parsed.data.type, label: parsed.data.label },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log product_type.create:', err);
  });

  return apiJson({
    data: {
      id: data.id,
      type: data.type_key,
      label: data.label,
      description: data.description || '',
      is_active: data.is_active,
      fields: data.fields || [],
    },
  }, 201);
});
