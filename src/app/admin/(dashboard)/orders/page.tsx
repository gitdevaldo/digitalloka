'use client';

import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatCurrency, formatDate } from '@/lib/utils';

function formatOrderId(row: Record<string, unknown>): string {
  if (row.order_number) return row.order_number as string;
  return `ORD-${String(row.id).padStart(4, '0')}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setNextCursor(null);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to load orders'); return; }
      setOrders(data.data || []);
      setNextCursor(data.next_cursor || null);
    } catch { showToast('Failed to load orders'); }
    finally { setLoading(false); }
  }, [showToast]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/admin/orders?cursor=${encodeURIComponent(nextCursor)}`);
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to load more orders'); return; }
      setOrders(prev => [...prev, ...(data.data || [])]);
      setNextCursor(data.next_cursor || null);
    } catch { showToast('Failed to load more orders'); }
    finally { setLoadingMore(false); }
  }

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function updateStatus(value: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: value }),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Update failed'); return; }
      showToast('Order status updated.');
      setSelected(null);
      loadOrders();
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

  const columns = [
    { key: 'order_number', label: 'Order ID', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 700 }}>{formatOrderId(row)}</span> },
    { key: 'user', label: 'User', render: (row: Record<string, unknown>) => { const u = row.user as Record<string, unknown> | undefined; return <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', color: 'var(--muted-foreground)' }}>{(u?.email as string) || (row.user_id as string) || '—'}</span>; } },
    { key: 'items', label: 'Items', render: (row: Record<string, unknown>) => <span style={{ textAlign: 'center', fontWeight: 700 }}>{(row.items as unknown[])?.length || 0}</span> },
    { key: 'total_amount', label: 'Total', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800 }}>{formatCurrency(row.total_amount as number, row.currency as string)}</span> },
    { key: 'payment_status', label: 'Payment', render: (row: Record<string, unknown>) => <StatusBadge variant={String(row.payment_status || 'pending').toLowerCase()} label={String(row.payment_status || 'pending').toLowerCase()} /> },
    { key: 'fulfillment_status', label: 'Fulfillment', render: (row: Record<string, unknown>) => <StatusBadge variant={String(row.status || 'pending').toLowerCase()} label={String(row.status || 'pending').toLowerCase()} /> },
    { key: 'created_at', label: 'Created', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{formatDate(row.created_at as string)}</span> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => setSelected(row)}>View</Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(row)}>Update</Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Orders" subtitle="/admin/orders — order management and fulfillment" actions={<Button size="sm" onClick={loadOrders}>Refresh</Button>} />

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
            {nextCursor && (
              <div className="flex justify-center pt-4 pb-2">
                <Button size="sm" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? 'Loading…' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </Panel>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Order: ${selected ? formatOrderId(selected) : ''}`}>
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Order ID</span><span className="font-bold">{formatOrderId(selected)}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Total</span><span className="font-heading font-extrabold">{formatCurrency(selected.total_amount as number, selected.currency as string)}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">User</span><span className="font-mono text-[0.75rem]">{(selected.user as Record<string, unknown>)?.email as string || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Created</span><span>{formatDate(selected.created_at as string)}</span></div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Update Status</span>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'paid', 'fulfilled', 'cancelled'].map(s => (
                  <Button key={s} size="sm" variant={String(selected.status || 'pending').toLowerCase() === s ? 'accent' : 'ghost'} onClick={() => updateStatus(s)} disabled={saving || String(selected.status || 'pending').toLowerCase() === s}>{s}</Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
