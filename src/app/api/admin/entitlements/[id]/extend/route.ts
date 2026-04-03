import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const days = Number(body.days || 30);

  const admin = createSupabaseAdminClient();

  const { data: entitlement, error: fetchError } = await admin
    .from('entitlements')
    .select('expires_at')
    .eq('id', Number(id))
    .single();

  if (fetchError || !entitlement) {
    return NextResponse.json({ error: 'Entitlement not found' }, { status: 404 });
  }

  const currentExpiry = entitlement.expires_at ? new Date(entitlement.expires_at) : new Date();
  const baseDate = currentExpiry > new Date() ? currentExpiry : new Date();
  const newExpiry = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await admin
    .from('entitlements')
    .update({ expires_at: newExpiry.toISOString() })
    .eq('id', Number(id))
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ data });
}
