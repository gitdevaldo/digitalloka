import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';
import { canAccessDroplet } from '@/lib/services/admin-access';
import { performAction } from '@/lib/services/digitalocean';
import { parseRequestBody } from '@/lib/validation';
import { dropletActionSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const dropletId = Number(id);
  if (!await canAccessDroplet(userId, dropletId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = await parseRequestBody(request, dropletActionSchema);
  if (!parsed.success) return parsed.response;

  const { type: actionType } = parsed.data;

  try {
    const action = await performAction(dropletId, actionType);
    return NextResponse.json({ data: action });
  } catch {
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
