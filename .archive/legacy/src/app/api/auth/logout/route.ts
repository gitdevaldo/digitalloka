import { createSupabaseServer } from '@/lib/supabase/server';
import { isSameOrigin } from '@/lib/security';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Request origin is not allowed.' }, { status: 403 });
  }

  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  return NextResponse.json({ success: true });
}
