import { updateSession } from '@/lib/supabase/middleware';
import { applyRateLimit } from '@/lib/rate-limit';
import { NextResponse, type NextRequest } from 'next/server';

const RATE_LIMITS = {
  auth: { windowMs: 60_000, maxRequests: 5 },
  webhook: { windowMs: 60_000, maxRequests: 30 },
} as const;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/api/auth/login') {
    const limited = applyRateLimit(request, 'auth', RATE_LIMITS.auth);
    if (limited) return limited;
  }

  if (pathname.startsWith('/api/payments/webhook')) {
    const limited = applyRateLimit(request, 'webhook', RATE_LIMITS.webhook);
    if (limited) return limited;
  }

  const code = request.nextUrl.searchParams.get('code');
  if (code && !pathname.startsWith('/auth/callback')) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/callback',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/auth/:path*',
    '/api/payments/:path*',
  ],
};
