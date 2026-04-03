import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

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
  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const categoryIds: number[] = [];

  if (Array.isArray(body.category_ids)) {
    for (const cid of body.category_ids) {
      if (cid) categoryIds.push(Number(cid));
    }
  } else if (body.category_id) {
    categoryIds.push(Number(body.category_id));
  }

  if (Array.isArray(body.category_names)) {
    for (const catName of body.category_names) {
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
  } else if (body.category_name?.trim()) {
    const slug = body.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const { data: existing } = await admin.from('product_categories').select('id').eq('slug', slug).single();
    if (existing) {
      categoryIds.push(existing.id);
    } else {
      const { data: created } = await admin.from('product_categories').insert({ name: body.category_name.trim(), slug }).select('id').single();
      if (created) categoryIds.push(created.id);
    }
  }

  const categoryId = categoryIds.length > 0 ? categoryIds[0] : null;

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.product_type !== undefined) updates.product_type = body.product_type;
  if (body.status !== undefined) updates.status = body.status;
  if (body.catalog_visibility !== undefined) {
    updates.is_visible = body.catalog_visibility !== 'hidden';
  }
  if (body.short_description !== undefined) updates.short_description = body.short_description;
  if (body.description !== undefined) updates.description = body.description;
  if (body.featured !== undefined) updates.featured = body.featured;
  if (body.faq_items !== undefined) updates.faq_items = body.faq_items;
  if (body.meta !== undefined) updates.meta = body.meta;
  if (categoryId !== null) updates.category_id = categoryId;
  if (body.price_amount !== undefined) updates.price_amount = Number(body.price_amount);
  if (body.price_currency !== undefined) updates.price_currency = body.price_currency;
  if (body.price_billing_period !== undefined) updates.price_billing_period = body.price_billing_period;

  const { data, error } = await admin.from('products').update(updates).eq('id', Number(id)).select().single();
  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });

  return NextResponse.json({ data });
}
