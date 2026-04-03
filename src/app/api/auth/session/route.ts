import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
}

async function syncUserToTable(userId: string, email: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('users').select('id').eq('id', userId).single();
  if (!data) {
    await admin.from('users').insert({
      id: userId,
      email,
      role: 'user',
      is_active: true,
      droplet_ids: [],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;

    if (!access_token) {
      return NextResponse.json({ error: 'Missing access_token' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error) {
      return NextResponse.json({ error: sanitizeDbError(error.message) }, { status: 401 });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await syncUserToTable(user.id, user.email ?? '');
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
