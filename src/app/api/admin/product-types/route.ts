import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

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

  return NextResponse.json({ data: types });
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const body = await request.json();
  if (!body.type || !body.label) {
    return apiError('type and label are required', 422);
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('product_types')
    .insert({
      type_key: body.type,
      label: body.label,
      description: body.description || '',
      is_active: body.is_active ?? true,
      fields: body.fields || [],
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
    changes: { type: body.type, label: body.label },
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
  }, { status: 201 });
});
