import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const orderId = parseInt(params.id, 10);
  if (!orderId || isNaN(orderId)) return apiError('Invalid order ID', 400);

  const supabase = await createSupabaseServerClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, items:order_items(*, product:products(id, name, slug, product_type)), transactions(*)')
    .eq('id', orderId)
    .eq('user_id', userId)
    .single();

  if (error || !order) return apiError('Order not found', 404);

  const admin = createSupabaseAdminClient();

  const { data: entitlements } = await admin
    .from('entitlements')
    .select('id, product_id, status, starts_at, expires_at, meta')
    .eq('order_id', orderId)
    .eq('user_id', userId);

  const orderProductIds = new Set((order.items || []).map((item: { product_id: number }) => item.product_id));

  const enrichedEntitlements = await Promise.all((entitlements || []).map(async (ent) => {
    if (!orderProductIds.has(ent.product_id)) {
      return { ...ent, credential_data: null, credential_headers: null };
    }

    const meta = (ent.meta as Record<string, unknown>) || {};
    const stockItemId = meta.stock_item_id as number | undefined;

    let credentialData = null;
    let credentialHeaders: string[] | null = null;

    if (stockItemId) {
      const { data: stockItem } = await admin
        .from('product_stock_items')
        .select('credential_data, credential_headers, product_id')
        .eq('id', stockItemId)
        .eq('product_id', ent.product_id)
        .single();

      if (stockItem) {
        credentialData = stockItem.credential_data;
        credentialHeaders = (stockItem.credential_headers as string[]) || null;
      }
    }

    return {
      ...ent,
      credential_data: credentialData,
      credential_headers: credentialHeaders,
    };
  }));

  return NextResponse.json({
    data: {
      ...order,
      entitlements: enrichedEntitlements,
    },
  });
});
