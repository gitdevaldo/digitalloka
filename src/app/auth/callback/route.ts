import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabase/server';

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

function hashFragmentHtml(mode: string, next: string) {
  const fallback = mode === 'admin' ? '/admin' : '/dashboard';
  const redirectTarget = next && next.startsWith('/') ? next : fallback;
  return new NextResponse(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DigitalLoka - Sign In Callback</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      background: #FFFDF5;
      color: #1E293B;
    }
    .status {
      border: 2px solid #1E293B;
      box-shadow: 6px 6px 0 #1E293B;
      border-radius: 16px;
      padding: 18px 20px;
      background: #fff;
      max-width: 520px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="status" id="status">Completing sign in...</div>
  <script>
    (async function handleCallback() {
      const statusEl = document.getElementById('status');
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const expiresIn = Number(hashParams.get('expires_in') || '3600');
      const redirectTarget = ${JSON.stringify(redirectTarget)};

      if (!accessToken) {
        statusEl.textContent = 'Sign-in callback is missing token information. Please request a new magic link.';
        return;
      }

      try {
        const response = await fetch('/api/auth/session', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: Number.isFinite(expiresIn) ? expiresIn : 3600,
          }),
        });
        if (!response.ok) throw new Error('Unable to persist session cookie');
      } catch (error) {
        statusEl.textContent = 'Sign in failed while saving session. Please request a new magic link.';
        return;
      }

      statusEl.textContent = 'Sign in complete. Redirecting...';
      window.location.replace(redirectTarget);
    })();
  </script>
</body>
</html>`, {
    headers: { 'Content-Type': 'text/html' },
  });
}

function getOrigin(request: NextRequest): string {
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const proto = request.headers.get('x-forwarded-proto') || 'https';
  if (host) return `${proto}://${host}`;
  if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
  return 'http://localhost:5000';
}

function getRedirectTarget(request: NextRequest): string {
  const cookieRedirect = request.cookies.get('auth-redirect')?.value;
  if (cookieRedirect && cookieRedirect.startsWith('/')) return cookieRedirect;

  const url = new URL(request.url);
  const next = url.searchParams.get('next');
  if (next && next.startsWith('/')) return next;

  const mode = url.searchParams.get('mode') || 'user';
  return mode === 'admin' ? '/admin' : '/dashboard';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const origin = getOrigin(request);
  const code = requestUrl.searchParams.get('code');
  const redirectTarget = getRedirectTarget(request);

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await syncUserToTable(user.id, user.email ?? '');
      }
      const response = NextResponse.redirect(new URL(redirectTarget, origin));
      response.cookies.delete('auth-redirect');
      return response;
    }

    return NextResponse.redirect(new URL('/login?error=auth_failed', origin));
  }

  const mode = requestUrl.searchParams.get('mode') || 'user';
  const next = requestUrl.searchParams.get('next') || '';
  return hashFragmentHtml(mode, next);
}
