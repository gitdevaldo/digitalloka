import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { sendEmail, buildTestEmailHtml } from '@/lib/services/email';
import { parseRequestBody } from '@/lib/validation';
import { testEmailSchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const parsed = await parseRequestBody(request, testEmailSchema);
  if (!parsed.success) return parsed.response;

  const html = buildTestEmailHtml();
  const success = await sendEmail(parsed.data.to, 'DigitalLoka — SMTP Test Email', html);

  if (success) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: 'Failed to send. Check SMTP settings and save before testing.' },
    { status: 500 }
  );
}
