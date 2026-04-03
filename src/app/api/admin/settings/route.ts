import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { listGroupedSettings, upsertSetting } from '@/lib/services/site-settings';

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const settings = await listGroupedSettings();
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  if (!body.group || !body.key) return NextResponse.json({ error: 'group and key are required' }, { status: 422 });

  try {
    const result = await upsertSetting(body.group, body.key, body.value, userId);
    return NextResponse.json({ data: result });
  } catch (err: unknown) {
    return NextResponse.json({ error: 'Update failed' }, { status: 422 });
  }
}
