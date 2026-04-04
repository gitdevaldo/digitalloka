import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const GET = withErrorHandler(async () => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('product_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) return apiError(sanitizeDbError(error.message), 500);
  return apiSuccess(data || []);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const body = await request.json();
  if (!body.name?.trim()) {
    return apiError('Category name is required', 422);
  }

  const admin = createSupabaseAdminClient();
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await admin
    .from('product_categories')
    .insert({ name: body.name.trim(), slug })
    .select()
    .single();

  if (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      const existing = await admin.from('product_categories').select('*').eq('slug', slug).single();
      if (existing.data) return apiSuccess(existing.data);
    }
    return apiError(sanitizeDbError(error.message), 422);
  }

  await logAudit({
    action: 'category.create',
    target_type: 'category',
    target_id: String(data.id),
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { name: body.name.trim(), slug },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log category.create:', err);
  });

  return apiSuccess(data, 201);
});
