import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();
  const updates: Record<string, unknown> = {};

  const validRoles = ['user', 'admin', 'super-admin'];
  if (body.role && validRoles.includes(body.role)) updates.role = body.role;
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from('users').update(updates).eq('id', id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 422 });
  return NextResponse.json({ data });
}
