import { createSupabaseServer } from '@/lib/supabase/server';
import { getPublicOrigin, getSafeRedirectPath } from '@/lib/security';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const nextPath = getSafeRedirectPath(searchParams.get('next'), '/dashboard');
  const publicOrigin = getPublicOrigin(request);

  const supabase = await createSupabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      return NextResponse.redirect(`${publicOrigin}${nextPath}`);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as
        | 'email'
        | 'recovery'
        | 'invite'
        | 'email_change'
        | 'magiclink'
        | 'signup',
    });

    if (!error) {
      return NextResponse.redirect(`${publicOrigin}${nextPath}`);
    }
  }

  // Auth failed - redirect to login with error
  return NextResponse.redirect(`${publicOrigin}/?error=auth_failed`);
}
