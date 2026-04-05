'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  ArrowLeft, Package, CreditCard, Calendar,
  Hash, Receipt, Clock, Copy, Check, FileText,
} from 'lucide-react';

interface OrderItem {
  id: number;
  product_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  meta: Record<string, unknown> | null;
  product: {
    id: number;
    name: string;
    slug: string;
    product_type: string;
  } | null;
}

interface Transaction {
  id: number;
  provider: string;
  provider_ref: string | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  subtotal: number;
  currency: string;
  created_at: string;
  payment_status: string | null;
  items: OrderItem[];
  transactions: Transaction[];
  meta: Record<string, unknown> | null;
}

function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : (label || 'Copy to clipboard')}
      className="inline-flex items-center justify-center rounded-md transition-colors hover:bg-muted"
      style={{ padding: 4, background: 'none', border: 'none', cursor: 'pointer', color: copied ? 'var(--quaternary)' : 'var(--muted-foreground)' }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function InfoCard({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border-2 border-border bg-muted"
      style={{ padding: '14px 16px' }}
    >
      <div
        className="flex items-center justify-center rounded-lg border-2 border-foreground bg-card flex-shrink-0"
        style={{ width: 36, height: 36, boxShadow: '2px 2px 0 var(--shadow)' }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="text-muted-foreground font-extrabold uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', marginBottom: 2 }}>
          {label}
        </div>
        <div className="text-foreground font-bold" style={{ fontSize: '0.88rem' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function productTypeLabel(type: string): string {
  const map: Record<string, string> = {
    vps_droplet: 'VPS',
    digital_product: 'Digital',
    template: 'Template',
    plugin: 'Plugin',
    license: 'License',
  };
  return map[type] || type;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/user/orders/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setOrder(data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
        <div className="h-10 w-28 bg-muted rounded-lg animate-pulse mb-4" />
        <div className="h-8 w-64 bg-muted rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-40 bg-muted rounded-lg animate-pulse mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-card border-2 border-border rounded-xl animate-pulse" />)}
        </div>
        <div className="h-52 bg-card border-2 border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
        <EmptyState icon="❌" title="Order not found" description="This order doesn't exist or you don't have access to it." />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/dashboard/orders" className="text-accent font-semibold text-sm no-underline hover:underline">
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const isPaid = order.payment_status === 'paid';

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <div style={{ marginBottom: 8 }}>
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-muted-foreground text-[0.8rem] font-semibold no-underline hover:text-accent transition-colors"
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      </div>

      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Placed on ${formatDate(order.created_at)}`}
      />

      <div className="flex flex-col" style={{ gap: 20 }}>

        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 12 }}>
          <InfoCard icon={<Hash size={16} />} label="Order Number">
            <span className="flex items-center gap-1">
              <span className="font-mono text-[0.82rem]">{order.order_number}</span>
              <CopyButton value={order.order_number} label="Copy order number" />
            </span>
          </InfoCard>
          <InfoCard icon={<FileText size={16} />} label="Order Status">
            <StatusBadge variant={order.status} label={order.status} />
          </InfoCard>
          <InfoCard icon={<CreditCard size={16} />} label="Payment">
            <StatusBadge variant={order.payment_status || 'pending'} label={order.payment_status || 'pending'} />
          </InfoCard>
          <InfoCard icon={<Calendar size={16} />} label="Date">
            {formatDate(order.created_at)}
          </InfoCard>
        </div>

        <Panel>
          <div style={{ padding: '20px' }}>
            <div className="flex items-center gap-2 mb-4">
              <Package size={16} className="text-accent" />
              <h3 className="font-heading text-[0.92rem] font-extrabold m-0">Order Items</h3>
              <span
                className="bg-accent text-white rounded-full font-extrabold border-2 border-foreground"
                style={{ fontSize: '0.58rem', padding: '1px 7px', boxShadow: '1px 1px 0 var(--shadow)' }}
              >
                {order.items.length}
              </span>
            </div>

            <div className="hidden md:grid border-b-2 border-border pb-2 mb-1" style={{ gridTemplateColumns: '1fr 80px 120px 120px', gap: 12 }}>
              <div className="text-muted-foreground font-extrabold uppercase" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Product</div>
              <div className="text-muted-foreground font-extrabold uppercase text-center" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Qty</div>
              <div className="text-muted-foreground font-extrabold uppercase text-right" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Unit Price</div>
              <div className="text-muted-foreground font-extrabold uppercase text-right" style={{ fontSize: '0.6rem', letterSpacing: '0.1em' }}>Total</div>
            </div>

            {order.items.map((item, idx) => (
              <div
                key={item.id}
                className="md:grid items-center"
                style={{
                  gridTemplateColumns: '1fr 80px 120px 120px',
                  gap: 12,
                  padding: '14px 0',
                  borderBottom: idx < order.items.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-lg border-2 border-foreground bg-muted flex-shrink-0"
                    style={{ width: 40, height: 40, boxShadow: '2px 2px 0 var(--shadow)' }}
                  >
                    <Package size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-bold text-foreground" style={{ fontSize: '0.88rem' }}>
                      {item.product?.name || item.item_name}
                    </div>
                    {item.product?.product_type && (
                      <span
                        className="inline-block bg-muted text-muted-foreground rounded-full font-bold border border-border mt-0.5"
                        style={{ fontSize: '0.58rem', padding: '1px 7px' }}
                      >
                        {productTypeLabel(item.product.product_type)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="hidden md:block text-center font-semibold text-foreground" style={{ fontSize: '0.88rem' }}>
                  {item.quantity}
                </div>

                <div className="hidden md:block text-right font-semibold text-muted-foreground font-mono" style={{ fontSize: '0.85rem' }}>
                  {formatCurrency(item.unit_price, order.currency)}
                </div>

                <div className="hidden md:block text-right font-extrabold text-foreground font-mono" style={{ fontSize: '0.88rem' }}>
                  {formatCurrency(item.line_total, order.currency)}
                </div>

                <div className="flex md:hidden items-center justify-between mt-2 ml-[52px]">
                  <span className="text-muted-foreground text-[0.78rem]">
                    {item.quantity} x {formatCurrency(item.unit_price, order.currency)}
                  </span>
                  <span className="font-extrabold font-mono text-[0.88rem]">
                    {formatCurrency(item.line_total, order.currency)}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex justify-end mt-4 pt-2">
              <div style={{ minWidth: 220 }}>
                <div className="flex justify-between items-center py-1.5" style={{ fontSize: '0.85rem' }}>
                  <span className="text-muted-foreground font-medium">Subtotal</span>
                  <span className="font-semibold font-mono">
                    {formatCurrency(order.subtotal ?? order.total_amount, order.currency)}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center border-t-2 border-foreground pt-3 mt-1"
                >
                  <span className="font-heading font-extrabold" style={{ fontSize: '1rem' }}>Total</span>
                  <span
                    className="font-heading font-black font-mono"
                    style={{ fontSize: '1.15rem' }}
                  >
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Panel>

        {order.transactions.length > 0 && (
          <Panel>
            <div style={{ padding: '20px' }}>
              <div className="flex items-center gap-2 mb-4">
                <Receipt size={16} className="text-accent" />
                <h3 className="font-heading text-[0.92rem] font-extrabold m-0">Payment History</h3>
              </div>

              <div className="flex flex-col" style={{ gap: 10 }}>
                {order.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl border-2 border-border bg-muted gap-3"
                    style={{ padding: '14px 16px' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center rounded-lg border-2 border-foreground bg-card flex-shrink-0"
                        style={{ width: 36, height: 36, boxShadow: '2px 2px 0 var(--shadow)' }}
                      >
                        <CreditCard size={16} className="text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-bold text-foreground capitalize" style={{ fontSize: '0.85rem' }}>
                          {txn.provider}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground" style={{ fontSize: '0.7rem' }}>
                          <Clock size={10} />
                          <span>{formatDate(txn.created_at)}</span>
                          {txn.provider_ref && (
                            <>
                              <span>·</span>
                              <span className="font-mono">{txn.provider_ref.length > 20 ? txn.provider_ref.slice(0, 20) + '...' : txn.provider_ref}</span>
                              <CopyButton value={txn.provider_ref} label="Copy payment reference" />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:flex-shrink-0 ml-[48px] sm:ml-0">
                      <span className="font-extrabold font-mono text-foreground" style={{ fontSize: '0.9rem' }}>
                        {formatCurrency(txn.amount, txn.currency)}
                      </span>
                      <StatusBadge variant={txn.status} label={txn.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        )}

        {isPaid && (
          <div
            className="flex items-center gap-3 rounded-xl border-2 border-foreground bg-quaternary"
            style={{ padding: '14px 18px', boxShadow: '3px 3px 0 var(--shadow)' }}
          >
            <Check size={18} className="text-foreground flex-shrink-0" />
            <div>
              <div className="font-heading font-extrabold text-foreground" style={{ fontSize: '0.85rem' }}>
                Payment Complete
              </div>
              <div className="text-foreground" style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                Your order has been paid and fulfilled. Check your products page for access details.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
