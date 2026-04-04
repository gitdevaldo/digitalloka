import { NextRequest, NextResponse } from 'next/server';
import { startMagicLinkLogin } from '@/lib/services/supabase-auth';
import { parseRequestBody } from '@/lib/validation';
import { loginSchema } from '@/lib/validation/schemas';
import { withErrorHandler } from '@/lib/api-handler';
import { apiError } from '@/lib/api-response';

export const POST = withErrorHandler(async (request: NextRequest) => {
  try {
    const parsed = await parseRequestBody(request, loginSchema);
    if (!parsed.success) return parsed.response;

    const { email, next, mode } = parsed.data;

    const result = await startMagicLinkLogin(email, next, mode === 'admin' ? 'admin' : 'user');
    return NextResponse.json(result);
  } catch {
    return apiError('Unable to send magic link', 400);
  }
});
