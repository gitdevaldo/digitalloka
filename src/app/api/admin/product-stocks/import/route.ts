import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import type { Json } from '@/lib/supabase/database.types';
import { parseRequestBody } from '@/lib/validation';
import { stockImportSchema } from '@/lib/validation/schemas';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';
import { logAudit } from '@/lib/services/audit-log';

export const POST = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const parsed = await parseRequestBody(request, stockImportSchema);
  if (!parsed.success) return parsed.response;

  const { product_id, headers, rows, set_as_default_headers } = parsed.data;

  const admin = createSupabaseAdminClient();
  const normalizedHeaders = headers.map((h: string) => h.trim()).filter(Boolean);

  if (normalizedHeaders.length === 0) {
    return apiError('Headers cannot be empty', 422);
  }

  const lines = rows.split(/\r?\n/).filter((l: string) => l.trim());
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

    const toInsert: { product_id: number; credential_data: Json; credential_hash: string; status: string; meta: Json }[] = [];

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
          status: 'enabled',
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
      .eq('id', product_id)
      .single();

    const meta = (product?.meta as Record<string, unknown>) || {};
    meta.stock_headers = normalizedHeaders;
    await admin.from('products').update({ meta: meta as Json }).eq('id', product_id);
  }

  await logAudit({
    action: 'product_stock.import',
    target_type: 'product_stock',
    target_id: String(product_id),
    actor_user_id: userId,
    actor_role: 'admin',
    changes: { inserted, skipped_duplicates: skippedDuplicates, total_lines: lines.length },
  }).catch((err: unknown) => {
    console.error('[audit-log] Failed to log product_stock.import:', err);
  });

  return apiJson({
    success: true,
    product_id,
    inserted,
    skipped_duplicates: skippedDuplicates,
    invalid_count: invalidRows.length,
    invalid_rows: invalidRows,
    headers: normalizedHeaders,
  }, 201);
});

async function hashCredentials(data: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(JSON.stringify(data));
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
