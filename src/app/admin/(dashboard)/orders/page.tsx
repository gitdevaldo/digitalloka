'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
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
        <Panel variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Order ID</th><th>User</th><th>Items</th><th>Total</th><th>Payment</th><th>Fulfillment</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map((o) => {
                const user = o.user as Record<string, unknown> | undefined;
                return (
                  <tr key={o.id as number}>
                    <td className="font-bold">{o.order_number as string}</td>
                    <td className="text-[0.78rem] text-muted-foreground">{user?.email as string || '—'}</td>
                    <td className="text-[0.78rem]">{(o.items as unknown[])?.length || 0}</td>
                    <td className="font-heading font-extrabold">{formatCurrency(o.total_amount as number, o.currency as string)}</td>
                    <td><StatusBadge variant={o.payment_status as string || 'pending'} label={o.payment_status as string || 'pending'} /></td>
                    <td><StatusBadge variant={o.fulfillment_status as string || 'pending'} label={o.fulfillment_status as string || 'pending'} /></td>
                    <td className="text-[0.72rem] text-muted-foreground">{formatDate(o.created_at as string)}</td>
                    <td><Button size="sm">View</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
