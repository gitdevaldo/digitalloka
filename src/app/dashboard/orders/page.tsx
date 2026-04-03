'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const loadOrders = useCallback(() => {
    setLoading(true);
    setNextCursor(null);
    fetch('/api/user/orders')
      .then((r) => r.json())
      .then((data) => {
        setOrders(data.data || []);
        setNextCursor(data.next_cursor || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/user/orders?cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      setOrders(prev => [...prev, ...(data.data || [])]);
      setNextCursor(data.next_cursor || null);
    } catch { /* ignore */ }
    finally { setLoadingMore(false); }
  }

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Order History" subtitle="Track your orders and payment status." />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--radius-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Status</option><option>Paid</option><option>Pending</option><option>Refunded</option>
        </select>
        <input className="border-2 border-border rounded-[var(--radius-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search order ID..." />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="Your order history will appear here." />
      ) : (
        <Panel>
          <TableShell variant="dashboard">
            <thead><tr><th>Order</th><th>Items</th><th>Status</th><th>Total</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id as number}>
                  <td className="font-bold">{order.order_number as string}</td>
                  <td className="text-[0.8rem] text-muted-foreground">{(order.items as unknown[])?.length || 0} item(s)</td>
                  <td><StatusBadge variant={order.status as string} label={order.status as string} /></td>
                  <td className="font-heading font-extrabold">{formatCurrency(order.total_amount as number, order.currency as string)}</td>
                  <td className="text-[0.78rem] text-muted-foreground">{formatDate(order.created_at as string)}</td>
                </tr>
              ))}
            </tbody>
          </TableShell>
          {nextCursor && (
            <div className="flex justify-center py-4">
              <Button size="sm" onClick={loadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load More'}
              </Button>
            </div>
          )}
        </Panel>
      )}
    </div>
  );
}
