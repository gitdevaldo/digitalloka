import { createSupabaseServer } from './supabase/server';
import { redirect } from 'next/navigation';
import type { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  droplet_ids: number[];
}

export async function getSession(): Promise<Session | null> {
  const supabase = await createSupabaseServer();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return null;
  }

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session || session.user.id !== user.id) {
    return null;
  }
  
  return session;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  
  if (!session?.user) {
    return null;
  }

  const supabase = await createSupabaseServer();
  const { data: userData, error } = await supabase
    .from('users')
    .select('id, email, droplet_ids')
    .eq('id', session.user.id)
    .single();

  if (error || !userData) {
    return null;
  }

  return userData as User;
}

export async function requireAuth(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect('/');
  }
  return user;
}

export async function validateDropletAccess(userId: string, dropletId: number): Promise<boolean> {
  const supabase = await createSupabaseServer();
  
  const { data, error } = await supabase
    .from('users')
    .select('droplet_ids')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.droplet_ids?.includes(dropletId) ?? false;
}
