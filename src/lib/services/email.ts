import nodemailer from 'nodemailer';
import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { FulfillmentResult } from './fulfillment';

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from_name: string;
  from_email: string;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from('site_settings')
    .select('setting_value')
    .eq('setting_key', 'smtp')
    .single();

  if (!data?.setting_value) return null;

  const s = data.setting_value as Record<string, unknown>;

  if (!s.host || !s.user || !s.pass) return null;

  return {
    host: String(s.host),
    port: Number(s.port) || 587,
    secure: s.secure === true || s.secure === 'true',
    user: String(s.user),
    pass: String(s.pass),
    from_name: String(s.from_name || 'DigitalLoka'),
    from_email: String(s.from_email || s.user),
  };
}

interface OrderEmailData {
  orderId: number;
  userId: string;
  fulfillmentResults: FulfillmentResult[];
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from('orders')
    .select('id, order_number, total_amount, currency, status, created_at')
    .eq('id', data.orderId)
    .single();

  if (!order) {
    console.error('[email] Order not found:', data.orderId);
    return;
  }

  const { data: user } = await admin
    .from('users')
    .select('id, email')
    .eq('id', data.userId)
    .single();

  if (!user?.email) {
    console.error('[email] User email not found:', data.userId);
    return;
  }

  const { data: items } = await admin
    .from('order_items')
    .select('id, product_id, item_name, quantity, unit_price, line_total')
    .eq('order_id', data.orderId);

  const fulfillmentHtml = buildFulfillmentDetails(data.fulfillmentResults);
  const itemsHtml = buildItemsTable(items || []);

  const email: EmailPayload = {
    to: user.email,
    subject: `Order Confirmed — ${order.order_number}`,
    html: buildOrderEmail({
      customerName: user.email.split('@')[0] || 'Customer',
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      currency: order.currency,
      createdAt: order.created_at,
      itemsHtml,
      fulfillmentHtml,
    }),
  };

  await dispatchEmail(email);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  return dispatchEmail({ to, subject, html });
}

const FONT_HEADING = "'Outfit',system-ui,sans-serif";
const FONT_BODY = "'Plus Jakarta Sans',system-ui,sans-serif";
const COLOR_BG = '#FFFDF5';
const COLOR_PURPLE = '#8B5CF6';
const COLOR_DARK = '#1E293B';
const COLOR_YELLOW = '#FBBF24';
const COLOR_GREEN = '#34D399';
const COLOR_MUTED = '#64748B';
const COLOR_LIGHT_PURPLE = '#F8F5FF';
const COLOR_BORDER = '#E2E8F0';

function emailShell(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${title} — DigitalLoka</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: ${COLOR_BG}; font-family: ${FONT_BODY}; -webkit-font-smoothing: antialiased; }
    @media only screen and (max-width: 600px) {
      .email-wrapper { padding: 16px !important; }
      .card-body { padding: 28px 20px !important; }
      .hero-pad { padding: 28px 24px 44px !important; }
      .hero-title { font-size: 26px !important; line-height: 1.15 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_BG};">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${COLOR_BG};">
<tr><td class="email-wrapper" align="center" style="padding:48px 16px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:560px;margin:0 auto;">

  <!-- LOGO -->
  <tr><td align="center" style="padding-bottom:28px;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
      <td style="background-color:${COLOR_PURPLE};border:2px solid ${COLOR_DARK};border-radius:14px;box-shadow:4px 4px 0px ${COLOR_DARK};padding:10px 22px;">
        <span style="font-family:${FONT_HEADING};font-size:20px;font-weight:800;color:#FFFFFF;letter-spacing:-0.5px;">
          Digital<span style="color:${COLOR_YELLOW};">Loka</span>
        </span>
      </td>
    </tr></table>
  </td></tr>

  <!-- MAIN CARD -->
  <tr><td style="background-color:#FFFFFF;border:2px solid ${COLOR_DARK};border-radius:24px;box-shadow:8px 8px 0px ${COLOR_DARK};overflow:hidden;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    ${content}
  </table>
  </td></tr>

  <!-- BOTTOM FOOTER -->
  <tr><td align="center" style="padding-top:28px;">
    <p style="font-family:${FONT_BODY};font-size:12px;color:#94A3B8;line-height:1.7;margin:0;">
      &copy; 2026 DigitalLoka. All rights reserved.<br/>
      <a href="#" style="color:${COLOR_PURPLE};text-decoration:none;font-weight:500;">Unsubscribe</a>
      &nbsp;&middot;&nbsp;
      <a href="#" style="color:${COLOR_PURPLE};text-decoration:none;font-weight:500;">Privacy Policy</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function heroSection(emoji: string, heading: string): string {
  return `
    <tr><td class="hero-pad" style="background-color:${COLOR_PURPLE};padding:36px 40px 52px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
        <tr><td style="background-color:${COLOR_YELLOW};border:2px solid ${COLOR_DARK};border-radius:9999px;box-shadow:4px 4px 0px ${COLOR_DARK};width:58px;height:58px;text-align:center;vertical-align:middle;font-size:24px;line-height:58px;">
          ${emoji}
        </td></tr>
      </table>
      <h1 class="hero-title" style="font-family:${FONT_HEADING};font-size:32px;font-weight:800;color:#FFFFFF;letter-spacing:-0.7px;line-height:1.15;margin:0;">
        ${heading}
      </h1>
    </td></tr>`;
}

function cardFooter(message: string): string {
  return `
    <tr><td style="background-color:${COLOR_LIGHT_PURPLE};border-top:2px solid ${COLOR_BORDER};padding:20px 40px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="font-family:${FONT_BODY};font-size:12px;color:${COLOR_MUTED};line-height:1.6;">
            ${message}
          </td>
          <td align="right">
            <span style="display:inline-block;background-color:${COLOR_GREEN};border:2px solid ${COLOR_DARK};border-radius:9999px;box-shadow:2px 2px 0px ${COLOR_DARK};padding:4px 12px;font-family:${FONT_HEADING};font-size:11px;font-weight:700;color:#FFFFFF;white-space:nowrap;">
              CONFIRMED &#10003;
            </span>
          </td>
        </tr>
      </table>
    </td></tr>`;
}

interface OrderEmailParams {
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  itemsHtml: string;
  fulfillmentHtml: string;
}

function buildOrderEmail(params: OrderEmailParams): string {
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: params.currency || 'IDR',
    minimumFractionDigits: 0,
  }).format(params.totalAmount);

  const formattedDate = new Date(params.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const content = `
    ${heroSection('&#128230;', 'Your order is<br/>confirmed! &#127881;')}

    <tr><td class="card-body" style="padding:36px 40px 32px;">

      <p style="font-family:${FONT_BODY};font-size:16px;color:${COLOR_DARK};line-height:1.7;margin:0 0 6px;">
        Hey ${params.customerName} &#128075;
      </p>
      <p style="font-family:${FONT_BODY};font-size:16px;color:${COLOR_MUTED};line-height:1.7;margin:0 0 28px;">
        Thank you for your purchase! Your order has been confirmed and processed successfully.
      </p>

      <!-- ORDER INFO BOX -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:28px;">
        <tr><td style="background-color:${COLOR_LIGHT_PURPLE};border:2px solid #C4B5FD;border-radius:16px;padding:20px 24px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding-bottom:12px;border-bottom:2px dashed #C4B5FD;">
                <span style="font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;">Order Number</span><br/>
                <span style="font-family:${FONT_HEADING};font-size:18px;font-weight:800;color:${COLOR_DARK};letter-spacing:-0.3px;">${params.orderNumber}</span>
              </td>
              <td align="right" style="padding-bottom:12px;border-bottom:2px dashed #C4B5FD;">
                <span style="font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;">Date</span><br/>
                <span style="font-family:${FONT_BODY};font-size:14px;font-weight:500;color:${COLOR_DARK};">${formattedDate}</span>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:12px;">
                <span style="font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;">Total</span><br/>
                <span style="font-family:${FONT_HEADING};font-size:28px;font-weight:800;color:${COLOR_PURPLE};letter-spacing:-0.5px;">${formattedTotal}</span>
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- DIVIDER -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 20px;">
        <tr>
          <td style="border-top:2px dashed ${COLOR_BORDER};"></td>
          <td style="padding:0 12px;white-space:nowrap;font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;">order items</td>
          <td style="border-top:2px dashed ${COLOR_BORDER};"></td>
        </tr>
      </table>

      ${params.itemsHtml}

      ${params.fulfillmentHtml}

      <!-- DASHBOARD CTA -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 0;">
        <tr><td style="background-color:${COLOR_PURPLE};border:2px solid ${COLOR_DARK};border-radius:9999px;box-shadow:4px 4px 0px ${COLOR_DARK};">
          <a href="#" style="display:inline-block;padding:14px 32px;font-family:${FONT_HEADING};font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;letter-spacing:-0.2px;white-space:nowrap;">
            View in Dashboard &nbsp;&rarr;
          </a>
        </td></tr>
      </table>

    </td></tr>

    ${cardFooter('Sent by <strong style="color:' + COLOR_DARK + ';">DigitalLoka</strong> &middot; Order confirmation for your recent purchase.')}`;

  return emailShell('Order Confirmation', content);
}

interface OrderItemRow {
  id: number;
  product_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

function buildItemsTable(items: OrderItemRow[]): string {
  if (items.length === 0) return `<p style="font-family:${FONT_BODY};font-size:14px;color:${COLOR_MUTED};">No items</p>`;

  const rows = items.map(item => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_DARK};">
        ${item.item_name}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_BODY};font-size:14px;color:${COLOR_MUTED};text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid ${COLOR_BORDER};font-family:${FONT_HEADING};font-size:14px;font-weight:700;color:${COLOR_DARK};text-align:right;">
        ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(item.line_total)}
      </td>
    </tr>
  `).join('');

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:8px;">
      <thead>
        <tr>
          <th style="padding:10px 14px;text-align:left;font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${COLOR_DARK};">Product</th>
          <th style="padding:10px 14px;text-align:center;font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${COLOR_DARK};">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;border-bottom:2px solid ${COLOR_DARK};">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function buildFulfillmentDetails(results: FulfillmentResult[]): string {
  if (results.length === 0) return '';

  const sections = results.map(r => {
    if (!r.success) {
      return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:12px;">
          <tr><td style="background-color:#FEF2F2;border:2px solid #EF4444;border-radius:12px;padding:16px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding-right:12px;vertical-align:top;font-size:20px;">&#9888;&#65039;</td>
                <td>
                  <span style="font-family:${FONT_HEADING};font-size:14px;font-weight:700;color:#DC2626;">Fulfillment Issue</span>
                  <p style="font-family:${FONT_BODY};font-size:13px;color:${COLOR_MUTED};line-height:1.5;margin:4px 0 0;">
                    Product #${r.product_id}: ${r.error || 'Unknown error'}. Please contact support.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      `;
    }

    switch (r.product_type) {
      case 'vps_droplet': {
        const d = r.details;
        return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:12px;">
          <tr><td style="background-color:${COLOR_LIGHT_PURPLE};border:2px solid #C4B5FD;border-radius:12px;padding:16px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding-right:12px;vertical-align:top;font-size:20px;">&#9889;</td>
                <td>
                  <span style="font-family:${FONT_HEADING};font-size:14px;font-weight:700;color:${COLOR_PURPLE};">VPS Droplet Provisioned</span>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:10px;">
                    <tr>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${COLOR_MUTED};width:70px;">Name</td>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:13px;font-weight:600;color:${COLOR_DARK};">${d.droplet_name || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${COLOR_MUTED};">Size</td>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_DARK};">${d.size_slug || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${COLOR_MUTED};">Region</td>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_DARK};">${d.region || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${COLOR_MUTED};">Image</td>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:13px;color:${COLOR_DARK};">${d.image || '-'}</td>
                    </tr>
                    <tr>
                      <td style="padding:3px 0;font-family:${FONT_BODY};font-size:12px;font-weight:600;color:${COLOR_MUTED};">Status</td>
                      <td style="padding:3px 0;">
                        <span style="display:inline-block;background-color:${COLOR_YELLOW};border:2px solid ${COLOR_DARK};border-radius:9999px;padding:2px 10px;font-family:${FONT_HEADING};font-size:11px;font-weight:700;color:${COLOR_DARK};">
                          ${(d.status || 'provisioning').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  </table>
                  <p style="font-family:${FONT_BODY};font-size:12px;color:${COLOR_MUTED};line-height:1.5;margin:10px 0 0;">
                    Your VPS is being provisioned. Access details will be available in your dashboard shortly.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
        `;
      }
      case 'digital':
      case 'template':
      case 'course': {
        const cred = r.details.credential_data as Record<string, string> | undefined;
        const credRows = cred ? Object.entries(cred).map(([k, v]) => `
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid ${COLOR_BORDER};">
              <span style="display:block;font-family:${FONT_BODY};font-size:10px;font-weight:700;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">${k}</span>
              <span style="display:block;font-family:${FONT_BODY};font-size:14px;font-weight:600;color:${COLOR_DARK};word-break:break-all;line-height:1.4;">${String(v)}</span>
            </td>
          </tr>
        `).join('') : '';

        return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:12px;">
          <tr><td style="background-color:#ECFDF5;border:2px solid ${COLOR_GREEN};border-radius:16px;padding:20px 24px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td style="padding-bottom:14px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding-right:10px;vertical-align:middle;font-size:20px;">&#10024;</td>
                      <td style="font-family:${FONT_HEADING};font-size:15px;font-weight:700;color:#059669;vertical-align:middle;">Digital Product Ready</td>
                    </tr>
                  </table>
                </td>
              </tr>
              ${credRows ? `
              <tr>
                <td>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#FFFFFF;border:2px solid ${COLOR_BORDER};border-radius:10px;overflow:hidden;">
                    ${credRows}
                  </table>
                </td>
              </tr>
              ` : `
              <tr>
                <td>
                  <p style="font-family:${FONT_BODY};font-size:13px;color:${COLOR_MUTED};line-height:1.5;margin:0;">
                    Your product has been assigned and is ready to access from your dashboard.
                  </p>
                </td>
              </tr>
              `}
            </table>
          </td></tr>
        </table>
        `;
      }
      default:
        return `
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:12px;">
          <tr><td style="background-color:${COLOR_LIGHT_PURPLE};border:2px solid ${COLOR_BORDER};border-radius:12px;padding:16px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td style="padding-right:12px;vertical-align:top;font-size:20px;">&#128230;</td>
                <td>
                  <span style="font-family:${FONT_HEADING};font-size:14px;font-weight:700;color:${COLOR_DARK};">Product Fulfilled</span>
                  <p style="font-family:${FONT_BODY};font-size:13px;color:${COLOR_MUTED};line-height:1.5;margin:4px 0 0;">
                    Your product is ready. Check your dashboard for details.
                  </p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
        `;
    }
  }).join('');

  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:24px 0 0;">
      <tr>
        <td style="border-top:2px dashed ${COLOR_BORDER};"></td>
        <td style="padding:0 12px;white-space:nowrap;font-family:${FONT_BODY};font-size:11px;font-weight:600;color:${COLOR_MUTED};text-transform:uppercase;letter-spacing:0.08em;">delivery details</td>
        <td style="border-top:2px dashed ${COLOR_BORDER};"></td>
      </tr>
    </table>
    <div style="padding-top:16px;">
      ${sections}
    </div>
  `;
}

export function buildTestEmailHtml(): string {
  const content = `
    ${heroSection('&#9889;', 'SMTP test<br/>successful! &#127881;')}

    <tr><td class="card-body" style="padding:36px 40px 32px;">

      <p style="font-family:${FONT_BODY};font-size:16px;color:${COLOR_DARK};line-height:1.7;margin:0 0 6px;">
        Hey there &#128075;
      </p>
      <p style="font-family:${FONT_BODY};font-size:16px;color:${COLOR_MUTED};line-height:1.7;margin:0 0 28px;">
        Your SMTP settings are configured correctly. Emails will be sent from this server going forward.
      </p>

      <!-- SUCCESS BOX -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:20px;">
        <tr><td style="background-color:#ECFDF5;border:2px solid ${COLOR_GREEN};border-radius:12px;padding:16px 20px;text-align:center;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
            <tr>
              <td style="padding-right:10px;font-size:20px;vertical-align:middle;">&#9989;</td>
              <td style="font-family:${FONT_HEADING};font-size:15px;font-weight:700;color:#059669;vertical-align:middle;">
                All systems operational
              </td>
            </tr>
          </table>
        </td></tr>
      </table>

      <!-- INFO BOX -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr><td style="background-color:#FFFBEB;border:2px solid ${COLOR_YELLOW};border-radius:12px;padding:14px 18px;">
          <p style="font-family:${FONT_BODY};font-size:13px;font-weight:500;color:#92400E;line-height:1.6;margin:0;">
            &#128161; &nbsp;This is a test email sent from your <strong style="color:${COLOR_DARK};">DigitalLoka</strong> admin panel to verify SMTP configuration.
          </p>
        </td></tr>
      </table>

    </td></tr>

    ${cardFooter('Sent by <strong style="color:' + COLOR_DARK + ';">DigitalLoka</strong> &middot; SMTP configuration test email.')}`;

  return emailShell('SMTP Test', content);
}

async function dispatchEmail(email: EmailPayload): Promise<boolean> {
  console.log(`[email] Preparing to send to ${email.to}: ${email.subject}`);

  try {
    const config = await getSmtpConfig();

    if (!config) {
      console.warn('[email] SMTP not configured. Email not sent. Configure SMTP in Admin > Settings.');
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    const result = await transporter.sendMail({
      from: `"${config.from_name}" <${config.from_email}>`,
      to: email.to,
      subject: email.subject,
      html: email.html,
    });

    console.log(`[email] Sent successfully to ${email.to}, messageId: ${result.messageId}`);
    return true;
  } catch (err) {
    console.error('[email] Failed to send:', err);
    return false;
  }
}
