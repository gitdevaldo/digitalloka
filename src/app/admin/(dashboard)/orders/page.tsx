'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'order_number', label: 'Order ID', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 700 }}>{row.order_number as string}</span> },
    { key: 'user', label: 'User', render: (row: Record<string, unknown>) => { const u = row.user as Record<string, unknown> | undefined; return <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>{(u?.email as string) || '—'}</span>; } },
    { key: 'items', label: 'Items', render: (row: Record<string, unknown>) => <span style={{ fontSize: '0.78rem' }}>{(row.items as unknown[])?.length || 0}</span> },
    { key: 'total_amount', label: 'Total', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800 }}>{formatCurrency(row.total_amount as number, row.currency as string)}</span> },
    { key: 'payment_status', label: 'Payment', render: (row: Record<string, unknown>) => <StatusBadge variant={row.payment_status as string || 'pending'} label={row.payment_status as string || 'pending'} /> },
    { key: 'fulfillment_status', label: 'Fulfillment', render: (row: Record<string, unknown>) => <StatusBadge variant={row.fulfillment_status as string || 'pending'} label={row.fulfillment_status as string || 'pending'} /> },
    { key: 'created_at', label: 'Created', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{formatDate(row.created_at as string)}</span> },
    { key: 'actions', label: 'Actions', render: () => <Button size="sm">View</Button> },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Orders" subtitle="/admin/orders — order management and fulfillment" />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Fulfillment</option><option>Pending</option><option>Active</option><option>Completed</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Payment</option><option>Paid</option><option>Pending</option><option>Refunded</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search order ID or user email…" />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="Orders will appear here." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={orders} />
          </div>
        </Panel>
      )}
    </div>
  );
}
