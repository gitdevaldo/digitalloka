import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import type { Json } from '@/lib/supabase/database.types';
import { parseRequestBody } from '@/lib/validation';
import { productCreateSchema } from '@/lib/validation/schemas';
import { withErrorHandler } from '@/lib/api-handler';
import { apiSuccess, apiError } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, category:product_categories(*)')
    .order('created_at', { ascending: false });

  if (error) return apiError(sanitizeDbError(error.message), 500);
  return apiSuccess(data || []);
});

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const parsed = await parseRequestBody(request, productCreateSchema);
  if (!parsed.success) return parsed.response;

  const data = parsed.data;
  const admin = createSupabaseAdminClient();

  const categoryIds: number[] = [];

  if (Array.isArray(data.category_ids)) {
    for (const id of data.category_ids) {
      if (id) categoryIds.push(id);
    }
  } else if (data.category_id) {
    categoryIds.push(data.category_id);
  }

  if (Array.isArray(data.category_names)) {
    for (const catName of data.category_names) {
      if (!catName?.trim()) continue;
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const { data: existing } = await admin.from('product_categories').select('id').eq('slug', slug).single();
      if (existing) {
        categoryIds.push(existing.id);
      } else {
        const { data: created } = await admin.from('product_categories').insert({ name: catName.trim(), slug }).select('id').single();
        if (created) categoryIds.push(created.id);
      }
    }
  } else if (data.category_name?.trim()) {
    const slug = data.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: existing } = await admin.from('product_categories').select('id').eq('slug', slug).single();
    if (existing) {
      categoryIds.push(existing.id);
    } else {
      const { data: created } = await admin.from('product_categories').insert({ name: data.category_name.trim(), slug }).select('id').single();
      if (created) categoryIds.push(created.id);
    }
  }

  const categoryId = categoryIds.length > 0 ? categoryIds[0] : null;

  const { data: product, error } = await admin.from('products').insert({
    name: data.name,
    slug: data.slug,
    product_type: data.product_type,
    short_description: data.short_description,
    description: data.description,
    status: data.status,
    is_visible: data.catalog_visibility !== 'hidden',
    tags: data.tags,
    badges: data.badges,
    faq_items: data.faq_items as Json,
    featured: data.featured as Json,
    meta: data.meta as Json,
    category_id: categoryId,
    price_amount: data.price_amount,
    price_currency: data.price_currency,
    price_billing_period: data.price_billing_period,
  }).select().single();

  if (error) return apiError(sanitizeDbError(error.message), 422);

  await logAudit({
    action: 'product.create',
    target_type: 'product',
    target_id: String(product.id),
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { name: data.name, slug: data.slug, product_type: data.product_type },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log product.create:', err);
  });

  return apiSuccess(product, 201);
});
