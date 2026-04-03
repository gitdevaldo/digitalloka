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
    .from('product_stock_items')
    .select('*, product:products(id, name, slug, product_type)')
    .eq('id', Number(id))
    .single();

  if (error || !data) return NextResponse.json({ error: 'Stock not found' }, { status: 404 });
  return NextResponse.json({ data });
}

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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
      return NextResponse.json({ error: 'Duplicate stock credentials for this product' }, { status: 422 });
    }
  }
  if (body.status) updates.status = body.status;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 });
  }

  const { data, error } = await admin
    .from('product_stock_items')
    .update(updates)
    .eq('id', Number(id))
    .select('*, product:products(id, name, slug, product_type)')
    .single();

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  return NextResponse.json({ item: data });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('product_stock_items')
    .delete()
    .eq('id', Number(id));

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  return NextResponse.json({ deleted: true });
}
