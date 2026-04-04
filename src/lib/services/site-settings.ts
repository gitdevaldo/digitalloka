import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function listGroupedSettings(): Promise<Record<string, Record<string, unknown>>> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('site_settings')
    .select('setting_key, setting_value')
    .order('setting_key');

  if (error) throw new Error(error.message);

  const grouped: Record<string, Record<string, unknown>> = {};
  for (const row of data || []) {
    const group = row.setting_key;
    const val = row.setting_value as Record<string, unknown> | null;
    grouped[group] = val || {};
  }
  return grouped;
}

export async function upsertGroupSettings(
  group: string,
  values: Record<string, unknown>,
  updatedBy?: string
) {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from('site_settings')
    .upsert(
      {
        setting_key: group,
        setting_group: group,
        setting_value: values,
        updated_by: updatedBy,
      },
      { onConflict: 'setting_key' }
    )
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getGroupSettings(group: string): Promise<Record<string, unknown>> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', group)
    .single();

  if (!data?.setting_value) return {};
  return data.setting_value as Record<string, unknown>;
}
