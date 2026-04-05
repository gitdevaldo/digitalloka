import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async (_request: NextRequest, { params }: { params: { id: string } }) => {
  const userId = await getSessionUserId();
  if (!userId) return apiError('Unauthorized', 401);

  const entitlementId = parseInt(params.id, 10);
  if (!entitlementId || isNaN(entitlementId)) return apiError('Invalid ID', 400);

  const supabase = await createSupabaseServerClient();

  const { data: entitlement, error } = await supabase
    .from('entitlements')
    .select('*, product:products(id, name, slug, status, product_type)')
    .eq('id', entitlementId)
    .eq('user_id', userId)
    .single();

  if (error || !entitlement) return apiError('Product not found', 404);

  const admin = createSupabaseAdminClient();
  const meta = (entitlement.meta as Record<string, unknown>) || {};
  const stockItemId = meta.stock_item_id as number | undefined;

  let credentialData = null;

  if (stockItemId) {
    const { data: stockItem } = await admin
      .from('product_stock_items')
      .select('credential_data, product_id')
      .eq('id', stockItemId)
      .eq('product_id', entitlement.product_id)
      .single();

    if (stockItem?.credential_data) {
      credentialData = stockItem.credential_data;
    }
  }

  if (!credentialData) {
    const { data: stockByOrder } = await admin
      .from('product_stock_items')
      .select('id, credential_data')
      .eq('product_id', entitlement.product_id)
      .eq('sold_user_id', userId)
      .not('credential_data', 'is', null)
      .order('sold_at', { ascending: false })
      .limit(1);

    if (stockByOrder && stockByOrder.length > 0) {
      credentialData = stockByOrder[0].credential_data;
    }
  }

  return NextResponse.json({
    data: {
      ...entitlement,
      credential_data: credentialData,
    },
  });
});
