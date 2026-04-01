import { createSupabaseAdmin, createSupabaseServer } from '@/lib/supabase/server';
import { checkRateLimit, getRateLimitConfig } from '@/lib/rate-limit';
import { getClientIp, getPublicOrigin, isSameOrigin } from '@/lib/security';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type LoginErrorKind = 'input' | 'access' | 'limit' | 'service';

function buildErrorResponse(
  error: string,
  kind: LoginErrorKind,
  status: number
) {
  return NextResponse.json({ error, kind }, { status });
}

function mapSupabaseAuthError(code?: string) {
  switch (code) {
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
    case 'request_timeout':
      return {
        error: 'Too many attempts right now. Please wait a bit and try again.',
        kind: 'limit' as const,
        status: 429,
      };

    case 'email_address_invalid':
    case 'validation_failed':
    case 'bad_json':
      return {
        error: 'Please enter a valid email address.',
        kind: 'input' as const,
        status: 400,
      };

    case 'email_address_not_authorized':
    case 'email_provider_disabled':
    case 'otp_disabled':
      return {
        error: 'Email sign-in is not available right now. Please contact administrator.',
        kind: 'service' as const,
        status: 503,
      };

    case 'signup_disabled':
    case 'user_not_found':
    case 'invalid_credentials':
      return {
        error: 'This account is not ready for sign-in. Please contact administrator.',
        kind: 'access' as const,
        status: 403,
      };

    default:
      return {
        error: 'Unable to send sign-in link right now. Please try again.',
        kind: 'service' as const,
        status: 500,
      };
  }
}

export async function POST(request: Request) {
  try {
    if (!isSameOrigin(request)) {
      return buildErrorResponse('Request origin is not allowed.', 'access', 403);
    }

    const clientIp = getClientIp(request);
    const ipRate = checkRateLimit(`auth-login:${clientIp}`, 'user');
    if (!ipRate.allowed) {
      return buildErrorResponse(
        'Too many attempts right now. Please wait a bit and try again.',
        'limit',
        429
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return buildErrorResponse(
        'Please enter a valid email address.',
        'input',
        400
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const admin = createSupabaseAdmin();
    const { data: allowedUser, error: userLookupError } = await admin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userLookupError) {
      console.error('User lookup error:', userLookupError);
      return buildErrorResponse(
        'Unable to process sign-in right now. Please try again.',
        'service',
        500
      );
    }

    if (!allowedUser) {
      return buildErrorResponse(
        'This email is not enabled for this panel. Please contact administrator.',
        'access',
        403
      );
    }

    const supabase = await createSupabaseServer();
    const publicOrigin = getPublicOrigin(request);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${publicOrigin}/auth/callback`,
      },
    });

    if (error) {
      const mapped = mapSupabaseAuthError(error.code);
      console.error('Auth error:', { code: error.code, message: error.message });
      return buildErrorResponse(mapped.error, mapped.kind, mapped.status);
    }

    const userLimit = getRateLimitConfig('user');
    return NextResponse.json(
      { success: true },
      {
        headers: {
          'X-RateLimit-Limit': String(userLimit.maxRequests),
          'X-RateLimit-Remaining': String(Math.max(0, ipRate.remaining)),
          'X-RateLimit-Reset': String(ipRate.resetAt),
        },
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return buildErrorResponse(
      'Unexpected error while signing in. Please try again.',
      'service',
      500
    );
  }
}
