'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft, Eye, EyeOff, ExternalLink, Copy, Check } from 'lucide-react';

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

interface Entitlement {
  id: number;
  product_id: number;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  meta: Record<string, unknown> | null;
  credential_data: Record<string, string> | null;
  credential_headers: string[] | null;
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
  currency: string;
  created_at: string;
  payment_status: string | null;
  items: OrderItem[];
  transactions: Transaction[];
  entitlements: Entitlement[];
  meta: Record<string, unknown> | null;
}

function isLinkValue(val: string): boolean {
  return /^https?:\/\//i.test(val);
}

function CredentialCard({ entitlement, productName }: { entitlement: Entitlement; productName: string }) {
  const [revealed, setRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const cred = entitlement.credential_data;
  if (!cred || Object.keys(cred).length === 0) return null;

  const headers = entitlement.credential_headers || Object.keys(cred);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div style={{
      border: '2px solid var(--border)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '2px solid var(--border)',
        background: 'var(--muted)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{productName}</div>
          <StatusBadge variant={entitlement.status} label={entitlement.status} />
        </div>
        <button
          onClick={() => setRevealed(!revealed)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--card)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--r-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--foreground)',
          }}
        >
          {revealed ? <EyeOff size={14} /> : <Eye size={14} />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {headers.map((header) => {
          const value = cred[header];
          if (!value) return null;
          const isLink = isLinkValue(value);

          return (
            <div key={header}>
              <div style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--muted-foreground)',
                marginBottom: 4,
              }}>
                {header}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--muted)',
                borderRadius: 'var(--r-sm)',
                padding: '8px 12px',
                border: '1.5px solid var(--border)',
              }}>
                <span style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  color: 'var(--foreground)',
                }}>
                  {revealed ? value : '••••••••••••••••••••'}
                </span>
                {revealed && (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => handleCopy(value, header)}
                      title="Copy"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: copiedField === header ? 'var(--success)' : 'var(--muted-foreground)',
                        padding: 4,
                      }}
                    >
                      {copiedField === header ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    {isLink && (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Open link"
                        style={{
                          color: 'var(--accent)',
                          padding: 4,
                          display: 'flex',
                        }}
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VpsDetails({ entitlement, productName }: { entitlement: Entitlement; productName: string }) {
  const meta = (entitlement.meta as Record<string, unknown>) || {};
  const dropletId = meta.droplet_id as number | undefined;
  const dropletName = meta.droplet_name as string | undefined;
  const sizeSlug = meta.size_slug as string | undefined;
  const region = meta.region as string | undefined;
  const image = meta.image as string | undefined;

  if (!dropletId) return null;

  const fields = [
    { label: 'Droplet ID', value: String(dropletId) },
    { label: 'Name', value: dropletName || '—' },
    { label: 'Size', value: sizeSlug || '—' },
    { label: 'Region', value: region || '—' },
    { label: 'Image', value: image || '—' },
  ];

  return (
    <div style={{
      border: '2px solid var(--border)',
      borderRadius: 'var(--r-md)',
      overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: '2px solid var(--border)',
        background: 'var(--muted)',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{productName}</div>
          <StatusBadge variant={entitlement.status} label={entitlement.status} />
        </div>
      </div>
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {fields.map((f) => (
          <div key={f.label}>
            <div style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted-foreground)',
              marginBottom: 4,
            }}>
              {f.label}
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              background: 'var(--muted)',
              borderRadius: 'var(--r-sm)',
              padding: '8px 12px',
              border: '1.5px solid var(--border)',
              color: 'var(--foreground)',
            }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
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
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
        <EmptyState icon="❌" title="Order not found" description="This order doesn't exist or you don't have access to it." />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/dashboard/orders" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem' }}>
            ← Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const productMap = new Map<number, string>();
  for (const item of order.items) {
    productMap.set(item.product_id, item.product?.name || item.item_name);
  }

  const credentialEntitlements = order.entitlements.filter(
    (e) => e.credential_data && Object.keys(e.credential_data).length > 0
  );
  const vpsEntitlements = order.entitlements.filter((e) => {
    const meta = (e.meta as Record<string, unknown>) || {};
    return !!meta.droplet_id;
  });

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => router.push('/dashboard/orders')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
            fontWeight: 600,
            padding: 0,
          }}
        >
          <ArrowLeft size={14} /> Back to orders
        </button>
      </div>

      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`Placed on ${formatDate(order.created_at)}`}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Panel>
          <div style={{ padding: 16 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 16,
            }}>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Status
                </div>
                <StatusBadge variant={order.status} label={order.status} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Payment
                </div>
                <StatusBadge variant={order.payment_status || 'pending'} label={order.payment_status || 'pending'} />
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Total
                </div>
                <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '1rem' }}>
                  {formatCurrency(order.total_amount, order.currency)}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', marginBottom: 4 }}>
                  Date
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {formatDate(order.created_at)}
                </span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div style={{ padding: 16 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>Order Items</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--muted)',
                    borderRadius: 'var(--r-sm)',
                    border: '1.5px solid var(--border)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                      {item.product?.name || item.item_name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                      {item.product?.product_type || '—'} · Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.9rem' }}>
                    {formatCurrency(item.line_total, order.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>

        {(credentialEntitlements.length > 0 || vpsEntitlements.length > 0) && (
          <Panel>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>Product Access & Credentials</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {credentialEntitlements.map((ent) => (
                  <CredentialCard
                    key={ent.id}
                    entitlement={ent}
                    productName={productMap.get(ent.product_id) || 'Product'}
                  />
                ))}
                {vpsEntitlements.map((ent) => (
                  <VpsDetails
                    key={ent.id}
                    entitlement={ent}
                    productName={productMap.get(ent.product_id) || 'VPS'}
                  />
                ))}
              </div>
            </div>
          </Panel>
        )}

        {order.transactions.length > 0 && (
          <Panel>
            <div style={{ padding: 16 }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 12 }}>Payment History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {order.transactions.map((txn) => (
                  <div
                    key={txn.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--muted)',
                      borderRadius: 'var(--r-sm)',
                      border: '1.5px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'capitalize' }}>
                        {txn.provider}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
                        {formatDate(txn.created_at)}
                        {txn.provider_ref && ` · ${txn.provider_ref}`}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.85rem' }}>
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
      </div>
    </div>
  );
}
