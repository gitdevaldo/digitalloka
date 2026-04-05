import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import { parseRequestBody } from '@/lib/validation';
import { providerDataCreateSchema, providerDataUpdateSchema } from '@/lib/validation/schemas';

export async function GET(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const provider = request.nextUrl.searchParams.get('provider');
  const resourceType = request.nextUrl.searchParams.get('type');

  const admin = createSupabaseAdminClient();

  let query = admin
    .from('vps_provider_data')
    .select('id, slug, name, provider, resource_type, available, data, synced_at')
    .order('provider', { ascending: true })
    .order('resource_type', { ascending: true })
    .order('name', { ascending: true });

  if (provider) {
    query = query.eq('provider', provider);
  }
  if (resourceType) {
    query = query.eq('resource_type', resourceType);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = await parseRequestBody(request, providerDataCreateSchema);
  if (!parsed.success) return parsed.response;

  const { provider, resource_type, slug, name, available, data } = parsed.data;

  const admin = createSupabaseAdminClient();

  const { data: existing } = await admin
    .from('vps_provider_data')
    .select('id')
    .eq('provider', provider)
    .eq('resource_type', resource_type)
    .eq('slug', slug)
    .single();

  if (existing) {
    return NextResponse.json({ error: `Entry "${slug}" already exists for ${provider} (${resource_type})` }, { status: 409 });
  }

  const { data: created, error } = await admin
    .from('vps_provider_data')
    .insert({
      provider,
      resource_type,
      slug,
      name,
      available,
      data: (data || {}) as import('@/lib/supabase/database.types').Json,
      synced_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data: created });
}

export async function DELETE(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = request.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 422 });

  const admin = createSupabaseAdminClient();

  const { error } = await admin
    .from('vps_provider_data')
    .delete()
    .eq('id', Number(id));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ deleted: true });
}

export async function PUT(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = await parseRequestBody(request, providerDataUpdateSchema);
  if (!parsed.success) return parsed.response;

  const admin = createSupabaseAdminClient();

  const updates: Record<string, unknown> = {};
  if (parsed.data.name !== undefined) updates.name = parsed.data.name;
  if (parsed.data.slug !== undefined) updates.slug = parsed.data.slug;
  if (parsed.data.available !== undefined) updates.available = parsed.data.available;

  const { data, error } = await admin
    .from('vps_provider_data')
    .update(updates)
    .eq('id', parsed.data.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data });
}
