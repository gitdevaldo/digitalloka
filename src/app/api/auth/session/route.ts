import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { sanitizeDbError } from '@/lib/error-sanitizer';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const GET = withErrorHandler(async () => {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({ authenticated: true, user: { id: user.id, email: user.email } });
});


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

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { access_token, refresh_token } = body;

    if (!access_token) {
      return apiError('Missing access_token', 400);
    }

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.setSession({
      access_token,
      refresh_token: refresh_token || '',
    });

    if (error) {
      return apiError(sanitizeDbError(error.message), 401);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await syncUserToTable(user.id, user.email ?? '');
    }

    return NextResponse.json({ success: true });
  } catch {
    return apiError('Invalid request', 400);
  }
});
