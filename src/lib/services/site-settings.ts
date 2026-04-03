import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function listGroupedSettings() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('site_settings')
    .select('*')
    .order('setting_group')
    .order('setting_key');

  if (error) throw new Error(error.message);

  const grouped: Record<string, unknown[]> = {};
  for (const row of data || []) {
    const g = row.setting_group || 'default';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(row);
  }
  return grouped;
}

export async function upsertSetting(group: string, key: string, value: unknown, updatedBy?: string) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('site_settings')
    .upsert(
      { setting_key: key, setting_group: group, setting_value: value, updated_by: updatedBy },
      { onConflict: 'setting_key' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
