import type { TypedSupabaseClient } from '@/lib/supabase/database.types';

export async function canAccessDroplet(supabase: TypedSupabaseClient, userId: string, dropletId: number): Promise<boolean> {
  if (!userId || dropletId <= 0) return false;
  const { data } = await supabase.from('users').select('droplet_ids').eq('id', userId).single();
  if (!data?.droplet_ids) return false;
  const ids: number[] = Array.isArray(data.droplet_ids) ? data.droplet_ids.map(Number) : [];
  return ids.includes(dropletId);
}

export async function listAssignedDropletIds(supabase: TypedSupabaseClient, userId: string): Promise<number[]> {
  if (!userId) return [];
  const { data } = await supabase.from('users').select('droplet_ids').eq('id', userId).single();
  if (!data?.droplet_ids) return [];
  return Array.isArray(data.droplet_ids) ? data.droplet_ids.map(Number).filter(Boolean) : [];
}
