import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { updateEntitlementStatus } from '@/lib/services/entitlements';

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  const validStatuses = ['pending', 'active', 'expired', 'revoked'];
  if (!body.status || !validStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 422 });
  }

  try {
    await updateEntitlementStatus(Number(id), body.status, body.reason);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Update failed';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
