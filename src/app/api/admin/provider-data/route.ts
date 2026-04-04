import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const provider = request.nextUrl.searchParams.get('provider');
  const resourceType = request.nextUrl.searchParams.get('type');

  if (!provider) {
    return NextResponse.json({ error: 'provider is required' }, { status: 422 });
  }

  const admin = createSupabaseAdminClient();

  let query = admin
    .from('vps_provider_data')
    .select('slug, name, available, data')
    .eq('provider', provider)
    .order('name', { ascending: true });

  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}
