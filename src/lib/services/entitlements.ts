import type { TypedSupabaseClient } from '@/lib/supabase/database.types';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function createEntitlementsForOrder(orderId: number, userId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.rpc('create_entitlements_for_order', {
    p_order_id: orderId,
    p_user_id: userId,
  });
  if (error) throw new Error(error.message);
}

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['active', 'revoked'],
  active: ['expired', 'revoked'],
  expired: ['active', 'revoked'],
  revoked: [],
};

export async function listUserEntitlements(supabase: TypedSupabaseClient, userId: string, page = 1, perPage = 20) {
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const { data, count, error } = await supabase
    .from('entitlements')
    .select('*, product:products(id, name, slug, status, product_type)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const admin = createSupabaseAdminClient();
  const entries = data || [];

  const stockItemIds: number[] = [];
  const fallbackProductIds: number[] = [];

  for (const ent of entries) {
    const meta = (ent.meta as Record<string, unknown>) || {};
    const stockItemId = meta.stock_item_id as number | undefined;
    if (stockItemId) {
      stockItemIds.push(stockItemId);
    } else {
      fallbackProductIds.push(ent.product_id);
    }
  }

  const stockItemMap: Record<number, unknown> = {};
  if (stockItemIds.length > 0) {
    const { data: stockItems } = await admin
      .from('product_stock_items')
      .select('id, credential_data')
      .in('id', stockItemIds);

    for (const item of stockItems || []) {
      if (item.credential_data) {
        stockItemMap[item.id] = item.credential_data;
      }
    }
  }

  const fallbackMap: Record<number, unknown> = {};
  if (fallbackProductIds.length > 0) {
    const uniqueProductIds = [...new Set(fallbackProductIds)];
    const { data: fallbackItems } = await admin
      .from('product_stock_items')
      .select('product_id, credential_data, sold_at')
      .in('product_id', uniqueProductIds)
      .eq('sold_user_id', userId)
      .not('credential_data', 'is', null)
      .order('sold_at', { ascending: false });

    for (const item of fallbackItems || []) {
      if (!fallbackMap[item.product_id] && item.credential_data) {
        fallbackMap[item.product_id] = item.credential_data;
      }
    }
  }

  const enriched = entries.map((ent) => {
    const meta = (ent.meta as Record<string, unknown>) || {};
    const stockItemId = meta.stock_item_id as number | undefined;

    if (stockItemId && stockItemMap[stockItemId]) {
      return { ...ent, credential_data: stockItemMap[stockItemId] };
    }

    if (!stockItemId && fallbackMap[ent.product_id]) {
      return { ...ent, credential_data: fallbackMap[ent.product_id] };
    }

    return ent;
  });

  return { data: enriched, total: count || 0, page, per_page: perPage };
}

export async function updateEntitlementStatus(entitlementId: number, newStatus: string, reason?: string) {
  const admin = createSupabaseAdminClient();
  const { data: ent } = await admin.from('entitlements').select('*').eq('id', entitlementId).single();
  if (!ent) throw new Error('Entitlement not found');

  const allowed = ALLOWED_TRANSITIONS[ent.status] || [];
  if (!allowed.includes(newStatus)) throw new Error('Invalid entitlement status transition');

  const updates: Record<string, unknown> = { status: newStatus };
  if (newStatus === 'revoked') {
    updates.revoked_at = new Date().toISOString();
    updates.revocation_reason = reason || null;
  }
  if (newStatus === 'expired' && !ent.expires_at) {
    updates.expires_at = new Date().toISOString();
  }

  const { error } = await admin.from('entitlements').update(updates).eq('id', entitlementId);
  if (error) throw new Error(error.message);
}
