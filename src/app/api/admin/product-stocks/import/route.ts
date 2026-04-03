import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { product_id, headers, rows, set_as_default_headers } = body;

  if (!product_id || !headers || !rows) {
    return NextResponse.json({ error: 'product_id, headers, and rows are required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();
  const normalizedHeaders = (headers as string[]).map((h: string) => h.trim()).filter(Boolean);

  if (normalizedHeaders.length === 0) {
    return NextResponse.json({ error: 'Headers cannot be empty' }, { status: 422 });
  }

  const lines = (rows as string).split(/\r?\n/).filter((l: string) => l.trim());
  let inserted = 0;
  let skippedDuplicates = 0;
  const invalidRows: { line: number; reasons: string[] }[] = [];

  const parsedRows: { index: number; credentialData: Record<string, string>; credentialHash: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split('|').map((p: string) => p.trim());
    if (parts.length !== normalizedHeaders.length) {
      invalidRows.push({ line: i + 1, reasons: [`Expected ${normalizedHeaders.length} values, got ${parts.length}`] });
      continue;
    }

    const credentialData: Record<string, string> = {};
    normalizedHeaders.forEach((h: string, idx: number) => { credentialData[h] = parts[idx]; });

    const sorted = Object.keys(credentialData).sort().reduce((acc: Record<string, string>, key) => {
      acc[key] = credentialData[key];
      return acc;
    }, {});
    const credentialHash = await hashCredentials(sorted);
    parsedRows.push({ index: i, credentialData, credentialHash });
  }

  if (parsedRows.length > 0) {
    const allHashes = parsedRows.map(r => r.credentialHash);
    const { data: existingItems } = await admin
      .from('product_stock_items')
      .select('credential_hash')
      .eq('product_id', Number(product_id))
      .in('credential_hash', allHashes);

    const existingHashes = new Set((existingItems || []).map((e: { credential_hash: string }) => e.credential_hash));
    const seenHashes = new Set<string>();

    const toInsert: { product_id: number; credential_data: Record<string, string>; credential_hash: string; status: string; meta: object }[] = [];

    for (const row of parsedRows) {
      if (existingHashes.has(row.credentialHash) || seenHashes.has(row.credentialHash)) {
        skippedDuplicates++;
        invalidRows.push({ line: row.index + 1, reasons: ['Duplicate credential already exists in stock.'] });
      } else {
        seenHashes.add(row.credentialHash);
        toInsert.push({
          product_id: Number(product_id),
          credential_data: row.credentialData,
          credential_hash: row.credentialHash,
          status: 'unsold',
          meta: { imported_by: userId, source: 'product-stock-submenu' },
        });
      }
    }

    if (toInsert.length > 0) {
      const { error } = await admin.from('product_stock_items').insert(toInsert);
      if (error) {
        invalidRows.push({ line: 0, reasons: [sanitizeDbError(error.message)] });
      } else {
        inserted = toInsert.length;
      }
    }
  }

  if (set_as_default_headers !== false) {
    const { data: product } = await admin
      .from('products')
      .select('meta')
      .eq('id', Number(product_id))
      .single();

    const meta = (product?.meta as Record<string, unknown>) || {};
    meta.stock_headers = normalizedHeaders;
    await admin.from('products').update({ meta }).eq('id', Number(product_id));
  }

  return NextResponse.json({
    success: true,
    product_id: Number(product_id),
    inserted,
    skipped_duplicates: skippedDuplicates,
    invalid_count: invalidRows.length,
    invalid_rows: invalidRows,
    headers: normalizedHeaders,
  }, { status: 201 });
}

async function hashCredentials(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
