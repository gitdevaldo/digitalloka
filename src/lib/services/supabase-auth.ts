import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type { TypedSupabaseClient } from '@/lib/supabase/database.types';

export async function getSessionUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function startMagicLinkLogin(email: string, nextPath?: string, mode: 'user' | 'admin' = 'user') {
  const supabase = await createSupabaseServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = (appUrl && appUrl.startsWith('https://'))
    ? appUrl
    : process.env.REPLIT_DEV_DOMAIN
      ? `https://${process.env.REPLIT_DEV_DOMAIN}`
      : 'http://localhost:5000';
  const params = new URLSearchParams({ mode });
  if (nextPath?.startsWith('/')) params.set('next', nextPath);
  const redirectTo = `${baseUrl}/auth/callback?${params.toString()}`;

  const cookieStore = await cookies();
  const redirectTarget = (nextPath?.startsWith('/')) ? nextPath : (mode === 'admin' ? '/admin' : '/dashboard');
  cookieStore.set('auth-redirect', redirectTarget, {
    path: '/',
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
  });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo, shouldCreateUser: false },
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function isAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  const admin = createSupabaseAdminClient();
  const { data } = await admin.from('users').select('role, is_active').eq('id', userId).single();
  if (!data || !data.is_active) return false;
  return data.role === 'admin';
}

export async function getUserDropletIds(supabase: TypedSupabaseClient, userId: string): Promise<number[]> {
  if (!userId) return [];
  const { data } = await supabase.from('users').select('droplet_ids').eq('id', userId).single();
  if (!data?.droplet_ids) return [];
  const ids = Array.isArray(data.droplet_ids) ? data.droplet_ids : [];
  return ids.map(Number).filter(Boolean);
}
