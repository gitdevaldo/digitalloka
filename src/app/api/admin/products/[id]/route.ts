import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { parseRequestBody } from '@/lib/validation';
import { productUpdateSchema } from '@/lib/validation/schemas';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin
    .from('products')
    .select('*, category:product_categories(*)')
    .eq('id', Number(id))
    .single();

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const parsed = await parseRequestBody(request, productUpdateSchema);
  if (!parsed.success) return parsed.response;

  const validatedBody = parsed.data;
  const admin = createSupabaseAdminClient();

  const categoryIds: number[] = [];

  if (Array.isArray(validatedBody.category_ids)) {
    for (const cid of validatedBody.category_ids) {
      if (cid) categoryIds.push(cid);
    }
  } else if (validatedBody.category_id) {
    categoryIds.push(validatedBody.category_id);
  }

  if (Array.isArray(validatedBody.category_names)) {
    for (const catName of validatedBody.category_names) {
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
  } else if (validatedBody.category_name?.trim()) {
    const slug = validatedBody.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: existing } = await admin.from('product_categories').select('id').eq('slug', slug).single();
    if (existing) {
      categoryIds.push(existing.id);
    } else {
      const { data: created } = await admin.from('product_categories').insert({ name: validatedBody.category_name.trim(), slug }).select('id').single();
      if (created) categoryIds.push(created.id);
    }
  }

  const categoryId = categoryIds.length > 0 ? categoryIds[0] : null;

  const updates: Record<string, unknown> = {};
  if (validatedBody.name !== undefined) updates.name = validatedBody.name;
  if (validatedBody.slug !== undefined) updates.slug = validatedBody.slug;
  if (validatedBody.product_type !== undefined) updates.product_type = validatedBody.product_type;
  if (validatedBody.status !== undefined) updates.status = validatedBody.status;
  if (validatedBody.catalog_visibility !== undefined) {
    updates.is_visible = validatedBody.catalog_visibility !== 'hidden';
  }
  if (validatedBody.short_description !== undefined) updates.short_description = validatedBody.short_description;
  if (validatedBody.description !== undefined) updates.description = validatedBody.description;
  if (validatedBody.featured !== undefined) updates.featured = validatedBody.featured;
  if (validatedBody.faq_items !== undefined) updates.faq_items = validatedBody.faq_items;
  if (validatedBody.meta !== undefined) updates.meta = validatedBody.meta;
  if (categoryId !== null) updates.category_id = categoryId;
  if (validatedBody.price_amount !== undefined) updates.price_amount = validatedBody.price_amount;
  if (validatedBody.price_currency !== undefined) updates.price_currency = validatedBody.price_currency;
  if (validatedBody.price_billing_period !== undefined) updates.price_billing_period = validatedBody.price_billing_period;

  const { data, error } = await admin.from('products').update(updates).eq('id', Number(id)).select().single();
  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });

  return NextResponse.json({ data });
}
