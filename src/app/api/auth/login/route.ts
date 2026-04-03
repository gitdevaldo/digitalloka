import { NextRequest, NextResponse } from 'next/server';
import { startMagicLinkLogin } from '@/lib/services/supabase-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, next, mode } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 422 });
    }

    const result = await startMagicLinkLogin(email, next, mode === 'admin' ? 'admin' : 'user');
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unable to send magic link';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
