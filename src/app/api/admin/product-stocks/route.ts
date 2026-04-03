import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createSupabaseAdminClient();
  const url = new URL(request.url);
  const productId = url.searchParams.get('product_id');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('q')?.toLowerCase();

  let query = admin
    .from('product_stock_items')
    .select('*, product:products(id, name, slug, product_type)')
    .order('id', { ascending: false })
    .limit(100);

  if (productId) query = query.eq('product_id', Number(productId));
  if (status && ['unsold', 'sold'].includes(status)) query = query.eq('status', status);

  const { data, error } = await query;

  if (error) {
    if (error.message.includes('product_stock_items')) {
      return NextResponse.json({ data: [], _table_missing: true });
    }
    return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });
  }

  let results = data || [];
  if (search) {
    results = results.filter((item) => {
      const cred = JSON.stringify(item.credential_data || {}).toLowerCase();
      return cred.includes(search);
    });
  }

  return NextResponse.json({ data: results.slice(0, 50) });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (!body.product_id || !body.credential_data || typeof body.credential_data !== 'object') {
    return NextResponse.json({ error: 'product_id and credential_data (object) are required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();
  const credentialData = body.credential_data;
  const credentialHash = await hashCredentials(credentialData);

  const { data: existing } = await admin
    .from('product_stock_items')
    .select('id')
    .eq('product_id', Number(body.product_id))
    .eq('credential_hash', credentialHash)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Duplicate stock credentials for this product' }, { status: 422 });
  }

  const { data, error } = await admin
    .from('product_stock_items')
    .insert({
      product_id: Number(body.product_id),
      credential_data: credentialData,
      credential_hash: credentialHash,
      status: 'unsold',
    })
    .select('*, product:products(id, name, slug, product_type)')
    .single();

  if (error) return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 422 });
  return NextResponse.json({ item: data }, { status: 201 });
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
