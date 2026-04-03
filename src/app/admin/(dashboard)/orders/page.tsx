'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
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
    <div className="animate-fade-up">
      <PageHeader title="Orders" subtitle="Monitor order transitions across all users." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="Orders will appear here." />
      ) : (
        <Panel title="All Orders" variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Order</th><th>User</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id as number}>
                  <td className="font-bold">{o.order_number as string}</td>
                  <td className="text-xs text-muted-foreground">{(o.user as Record<string, unknown>)?.email as string || '-'}</td>
                  <td><StatusBadge variant={o.status as string} label={o.status as string} /></td>
                  <td>{formatCurrency(o.total_amount as number, o.currency as string)}</td>
                  <td className="text-xs text-muted-foreground">{formatDate(o.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
