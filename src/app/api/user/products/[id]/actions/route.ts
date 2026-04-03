import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId } from '@/lib/services/supabase-auth';

const ALLOWED_ACTIONS = ['view_details', 'download_assets', 'renew'];

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  if (!ALLOWED_ACTIONS.includes(body.action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 422 });
  }

  return NextResponse.json({ data: { queued: true, action: body.action, product_id: (await params).id } });
}
