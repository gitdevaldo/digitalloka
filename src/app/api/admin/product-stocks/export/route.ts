import { NextRequest } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError, apiJson } from '@/lib/api-response';

export const GET = withErrorHandler(async (request: NextRequest) => {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return apiError('Forbidden', 403);

  const url = new URL(request.url);
  const productId = url.searchParams.get('product_id');
  if (!productId) return apiError('product_id is required', 422);

  const admin = createSupabaseAdminClient();

  const { data: product } = await admin
    .from('products')
    .select('id, name, meta')
    .eq('id', Number(productId))
    .single();

  if (!product) return apiError('Product not found', 404);

  const { data: items } = await admin
    .from('product_stock_items')
    .select('credential_data')
    .eq('product_id', product.id)
    .order('id', { ascending: true });

  const stockItems = items || [];
  const meta = (product.meta as Record<string, unknown>) || {};
  let headers = (meta.stock_headers as string[]) || [];

  if (headers.length === 0 && stockItems.length > 0) {
    const first = stockItems[0].credential_data as Record<string, unknown>;
    headers = Object.keys(first || {});
  }

  const rows = stockItems.map((item) => {
    const data = (item.credential_data as Record<string, string>) || {};
    return headers.map((h) => data[h] || '').join('|');
  });

  return apiJson({
    product_id: product.id,
    product_name: product.name,
    headers,
    header_line: headers.join('|'),
    rows,
    rows_text: rows.join('\n'),
  });
});
