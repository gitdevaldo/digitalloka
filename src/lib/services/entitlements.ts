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
    .select('*, product:products(id, name, slug, status)', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0, page, per_page: perPage };
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
