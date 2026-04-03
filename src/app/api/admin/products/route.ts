import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('products')
    .select('*, category:product_categories(*)')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const categoryIds: number[] = [];

  if (Array.isArray(body.category_ids)) {
    for (const id of body.category_ids) {
      if (id) categoryIds.push(Number(id));
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

  const { data, error } = await admin.from('products').insert({
    name: body.name,
    slug: body.slug,
    product_type: body.product_type || 'digital',
    short_description: body.short_description,
    description: body.description,
    status: body.status || 'available',
    is_visible: body.catalog_visibility !== 'hidden',
    tags: body.tags || [],
    badges: body.badges || [],
    faq_items: body.faq_items || [],
    featured: body.featured || [],
    meta: body.meta || {},
    category_id: categoryId,
    price_amount: body.price_amount ? Number(body.price_amount) : 0,
    price_currency: body.price_currency || 'USD',
    price_billing_period: body.price_billing_period || 'one-time',
  }).select().single();

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });

  return NextResponse.json({ data }, { status: 201 });
}
