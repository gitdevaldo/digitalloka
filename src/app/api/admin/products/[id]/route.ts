import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.slug !== undefined) updates.slug = body.slug;
  if (body.status !== undefined) updates.status = body.status;
  if (body.is_visible !== undefined) updates.is_visible = body.is_visible;
  if (body.short_description !== undefined) updates.short_description = body.short_description;
  if (body.description !== undefined) updates.description = body.description;
  if (body.featured !== undefined) updates.featured = body.featured;
  if (body.faq_items !== undefined) updates.faq_items = body.faq_items;
  if (body.meta !== undefined) updates.meta = body.meta;

  const { data, error } = await admin.from('products').update(updates).eq('id', Number(id)).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ data });
}
