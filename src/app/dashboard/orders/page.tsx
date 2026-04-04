'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function UserOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');

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

  const filtered = orders.filter(o => {
    if (statusFilter && (o.status as string) !== statusFilter.toLowerCase()) return false;
    if (search && !(o.order_number as string || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns = [
    {
      key: 'order_number',
      label: 'Order',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700 }}>{row.order_number as string}</span>
      ),
    },
    {
      key: 'items',
      label: 'Items',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
          {(row.items as unknown[])?.length || 0} item(s)
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.status as string} label={row.status as string} />
      ),
    },
    {
      key: 'total_amount',
      label: 'Total',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800 }}>
          {formatCurrency(row.total_amount as number, row.currency as string)}
        </span>
      ),
    },
    {
      key: 'created_at',
      label: 'Date',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
          {formatDate(row.created_at as string)}
        </span>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Order History" subtitle="Track your orders and payment status." />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select
          className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
        </select>
        <input
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent"
          placeholder="Search order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : orders.length === 0 ? (
        <EmptyState icon="📋" title="No orders" description="Your order history will appear here." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={filtered} emptyText="No orders match your filters." />
          </div>
          {nextCursor && (
            <div className="flex justify-center py-4 border-t border-border">
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
