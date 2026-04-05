'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

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

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <div style={{ marginBottom: 8 }}>
        <Link
          href="/dashboard/orders"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--muted-foreground)',
            fontSize: '0.8rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={14} /> Back to orders
        </Link>
      </div>

      <PageHeader
        title={`Invoice #${order.order_number}`}
        subtitle={`Issued on ${formatDate(order.created_at)}`}
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
                  Order Status
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
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, marginBottom: 16 }}>Items</h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto',
              gap: '0',
              fontSize: '0.65rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--muted-foreground)',
              borderBottom: '2px solid var(--border)',
              paddingBottom: 8,
              marginBottom: 8,
            }}>
              <div>Product</div>
              <div style={{ textAlign: 'right' }}>Qty</div>
              <div style={{ textAlign: 'right' }}>Unit Price</div>
              <div style={{ textAlign: 'right' }}>Total</div>
            </div>

            {order.items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '0',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--border)',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                    {item.product?.name || item.item_name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>
                    {item.product?.product_type || '—'}
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, paddingLeft: 24 }}>
                  {item.quantity}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', fontFamily: 'var(--font-h)', fontWeight: 600, paddingLeft: 24 }}>
                  {formatCurrency(item.unit_price, order.currency)}
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', fontFamily: 'var(--font-h)', fontWeight: 800, paddingLeft: 24 }}>
                  {formatCurrency(item.line_total, order.currency)}
                </div>
              </div>
            ))}

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              paddingTop: 12,
              marginTop: 4,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>
                  <span>Subtotal</span>
                  <span style={{ fontFamily: 'var(--font-h)', fontWeight: 600 }}>
                    {formatCurrency(order.subtotal || order.total_amount, order.currency)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, borderTop: '2px solid var(--border)', paddingTop: 8 }}>
                  <span>Total</span>
                  <span style={{ fontFamily: 'var(--font-h)' }}>
                    {formatCurrency(order.total_amount, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Panel>

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
