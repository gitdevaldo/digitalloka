import { createSupabaseAdminClient } from '@/lib/supabase/server';
import type { FulfillmentResult } from './fulfillment';

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

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation</title>
</head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0e8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border:3px solid #1a1a2e;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#6c5ce7;padding:32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                DigitalLoka
              </h1>
              <p style="margin:8px 0 0;color:#d4ccff;font-size:14px;">Order Confirmation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1a1a2e;">
                Hi <strong>${params.customerName}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.5;">
                Thank you for your purchase! Your order has been confirmed and processed.
              </p>

              <table width="100%" cellpadding="12" cellspacing="0" style="background:#f8f6f0;border:2px solid #1a1a2e;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="border-bottom:1px solid #e0ddd5;">
                    <strong style="color:#666;font-size:12px;text-transform:uppercase;">Order Number</strong><br>
                    <span style="font-size:16px;font-weight:700;color:#1a1a2e;">${params.orderNumber}</span>
                  </td>
                  <td style="border-bottom:1px solid #e0ddd5;text-align:right;">
                    <strong style="color:#666;font-size:12px;text-transform:uppercase;">Date</strong><br>
                    <span style="font-size:14px;color:#1a1a2e;">${formattedDate}</span>
                  </td>
                </tr>
                <tr>
                  <td colspan="2">
                    <strong style="color:#666;font-size:12px;text-transform:uppercase;">Total</strong><br>
                    <span style="font-size:22px;font-weight:900;color:#6c5ce7;">${formattedTotal}</span>
                  </td>
                </tr>
              </table>

              <h2 style="margin:0 0 12px;font-size:18px;color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:8px;">
                Order Items
              </h2>
              ${params.itemsHtml}

              ${params.fulfillmentHtml}

              <table width="100%" cellpadding="16" cellspacing="0" style="background:#e8f5e8;border:2px solid #2d8a4e;border-radius:8px;margin-top:24px;">
                <tr>
                  <td style="text-align:center;">
                    <p style="margin:0;font-size:14px;color:#2d6a2e;">
                      ✅ Your digital products are ready. Visit your dashboard to access them.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#1a1a2e;padding:24px;text-align:center;">
              <p style="margin:0;color:#999;font-size:12px;">
                &copy; DigitalLoka — Premium Digital Products for Builders
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
  if (items.length === 0) return '<p style="color:#999;">No items</p>';

  const rows = items.map(item => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#1a1a2e;">
        ${item.item_name}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#666;text-align:center;">
        ${item.quantity}
      </td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-size:14px;color:#1a1a2e;text-align:right;font-weight:600;">
        ${new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(item.line_total)}
      </td>
    </tr>
  `).join('');

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
      <thead>
        <tr style="background:#f8f6f0;">
          <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;">Product</th>
          <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;">Qty</th>
          <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;">Amount</th>
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
        <div style="background:#fff3f3;border:1px solid #e74c3c;border-radius:6px;padding:12px;margin-bottom:8px;">
          <strong style="color:#e74c3c;">⚠️ Fulfillment issue</strong>
          <p style="margin:4px 0 0;font-size:13px;color:#666;">
            Product #${r.product_id}: ${r.error || 'Unknown error'}
          </p>
        </div>
      `;
    }

    switch (r.product_type) {
      case 'vps_droplet': {
        const d = r.details;
        return `
          <div style="background:#f0f4ff;border:1px solid #6c5ce7;border-radius:6px;padding:12px;margin-bottom:8px;">
            <strong style="color:#6c5ce7;">🖥️ VPS Droplet Provisioned</strong>
            <table style="margin-top:8px;font-size:13px;color:#333;" cellpadding="4" cellspacing="0">
              <tr><td style="color:#666;">Name:</td><td><strong>${d.droplet_name || '-'}</strong></td></tr>
              <tr><td style="color:#666;">Size:</td><td>${d.size_slug || '-'}</td></tr>
              <tr><td style="color:#666;">Region:</td><td>${d.region || '-'}</td></tr>
              <tr><td style="color:#666;">Image:</td><td>${d.image || '-'}</td></tr>
              <tr><td style="color:#666;">Status:</td><td>${d.status || 'provisioning'}</td></tr>
            </table>
            <p style="margin:8px 0 0;font-size:12px;color:#888;">
              Your VPS is being provisioned. Access details will be available in your dashboard shortly.
            </p>
          </div>
        `;
      }
      case 'digital':
      case 'template':
      case 'course':
        return `
          <div style="background:#f0fff0;border:1px solid #2d8a4e;border-radius:6px;padding:12px;margin-bottom:8px;">
            <strong style="color:#2d8a4e;">📦 Digital Product Ready</strong>
            <p style="margin:4px 0 0;font-size:13px;color:#666;">
              Your product has been assigned and is ready to access from your dashboard.
            </p>
          </div>
        `;
      default:
        return `
          <div style="background:#f8f6f0;border:1px solid #ddd;border-radius:6px;padding:12px;margin-bottom:8px;">
            <strong>✅ Product Fulfilled</strong>
          </div>
        `;
    }
  }).join('');

  return `
    <h2 style="margin:24px 0 12px;font-size:18px;color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:8px;">
      Delivery Details
    </h2>
    ${sections}
  `;
}

async function dispatchEmail(email: EmailPayload): Promise<void> {
  console.log(`[email] Sending order confirmation to ${email.to}: ${email.subject}`);
  console.log(`[email] HTML length: ${email.html.length} chars`);

  const admin = createSupabaseAdminClient();
  await admin.from('email_queue' as never).insert({
    to_email: email.to,
    subject: email.subject,
    html_body: email.html,
    status: 'pending',
    created_at: new Date().toISOString(),
  } as never);

  console.log(`[email] Queued email for ${email.to}`);
}
