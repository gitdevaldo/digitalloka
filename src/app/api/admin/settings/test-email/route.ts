import { NextRequest, NextResponse } from 'next/server';
import { getSessionUserId, isAdmin } from '@/lib/services/supabase-auth';
import { sendEmail } from '@/lib/services/email';

export async function POST(request: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId || !await isAdmin(userId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { to } = body;

  if (!to || !to.includes('@')) {
    return NextResponse.json({ error: 'Valid email address required' }, { status: 422 });
  }

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="500" cellpadding="0" cellspacing="0" style="background:#ffffff;border:3px solid #1a1a2e;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#6c5ce7;padding:24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;">DigitalLoka</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;text-align:center;">
              <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:20px;">SMTP Test Successful</h2>
              <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">
                Your SMTP settings are configured correctly.<br>
                Emails will be sent from this server.
              </p>
              <div style="margin-top:20px;padding:12px;background:#e8f5e8;border:2px solid #2d8a4e;border-radius:8px;">
                <p style="margin:0;color:#2d6a2e;font-size:13px;font-weight:600;">
                  All systems operational
                </p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background:#1a1a2e;padding:16px;text-align:center;">
              <p style="margin:0;color:#999;font-size:11px;">&copy; DigitalLoka — Test Email</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const success = await sendEmail(to, 'DigitalLoka — SMTP Test Email', html);

  if (success) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: 'Failed to send. Check SMTP settings and save before testing.' },
    { status: 500 }
  );
}
