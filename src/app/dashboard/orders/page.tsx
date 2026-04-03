'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/orders')
      .then((r) => r.json())
      .then((data) => { setOrders(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Order History" subtitle="Track your orders and payment status." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="Your order history will appear here." />
      ) : (
        <Panel title="Orders">
          <TableShell>
            <thead>
              <tr><th>Order</th><th>Status</th><th>Total</th><th>Date</th></tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id as number}>
                  <td className="font-bold">{order.order_number as string}</td>
                  <td><StatusBadge variant={order.status as string} label={order.status as string} /></td>
                  <td>{formatCurrency(order.total_amount as number, order.currency as string)}</td>
                  <td className="text-xs text-muted-foreground">{formatDate(order.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
