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
    .select('*')
    .eq('product_id', Number(id))
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    if (error.message.includes('product_stock_items')) {
      return NextResponse.json({ data: [], _table_missing: true });
    }
    return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 500 });
  }
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  if (!body.headers || !body.rows) {
    return NextResponse.json({ error: 'headers and rows are required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();
  const headers: string[] = body.headers;
  const lines = (body.rows as string).split(/\r?\n/).filter((l: string) => l.trim());
  let inserted = 0;

  for (const line of lines) {
    const parts = line.split('|').map((p: string) => p.trim());
    if (parts.length !== headers.length) continue;

    const credentialData: Record<string, string> = {};
    headers.forEach((h: string, i: number) => { credentialData[h] = parts[i]; });

    const sorted = Object.keys(credentialData).sort().reduce((acc: Record<string, string>, key) => {
      acc[key] = credentialData[key];
      return acc;
    }, {});
    const credentialHash = await hashCredentials(sorted);

    const { error } = await admin.from('product_stock_items').insert({
      product_id: Number(id),
      credential_data: credentialData,
      credential_hash: credentialHash,
      status: 'unsold',
    });

    if (!error) inserted++;
  }

  return NextResponse.json({ inserted, total_lines: lines.length });
}

async function hashCredentials(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
