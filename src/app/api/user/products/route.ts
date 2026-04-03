import { NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { listUserEntitlements } from '@/lib/services/entitlements';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const result = await listUserEntitlements(userId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Failed to load products' }, { status: 500 });
  }
}
