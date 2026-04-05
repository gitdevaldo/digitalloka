'use client';

import { useEffect, useState, useCallback } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AdminTable, type Column } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';

type Row = Record<string, unknown>;

export default function DashboardOverviewPage() {
  const [products, setProducts] = useState<Row[]>([]);
  const [orders, setOrders] = useState<Row[]>([]);
  const [droplets, setDroplets] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch('/api/user/products').then(r => r.json()).then(d => setProducts(d.data || [])).catch((err) => console.error('[Dashboard] Failed to load products:', err)),
      fetch('/api/user/orders').then(r => r.json()).then(d => setOrders(d.data || [])).catch((err) => console.error('[Dashboard] Failed to load orders:', err)),
      fetch('/api/droplets').then(r => r.json()).then(d => setDroplets(d.data || [])).catch((err) => console.error('[Dashboard] Failed to load droplets:', err)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const runningDroplets = droplets.filter(d => (d.status as string) === 'active').length;
  const stoppedDroplets = droplets.length - runningDroplets;
  const expiringProducts = products.filter(p => (p.status as string) === 'expiring' || (p.status as string) === 'pending');

  const stats = [
    { icon: '📦', label: 'Total Products', value: String(products.length), sub: 'across all types', bg: 'rgba(139,92,246,0.12)' },
    { icon: '🖥️', label: 'VPS Droplets', value: String(droplets.length), sub: `${runningDroplets} running · ${stoppedDroplets} stopped`, bg: 'rgba(139,92,246,0.12)', bars: droplets.length > 0 },
    { icon: '✅', label: 'Active Products', value: String(products.filter(p => (p.status as string) === 'active').length), sub: expiringProducts.length ? `${expiringProducts.length} expiring soon` : 'all good', bg: 'rgba(52,211,153,0.15)' },
    { icon: '🛒', label: 'Recent Orders', value: String(orders.length), sub: `${orders.filter(o => (o.status as string) === 'pending').length} pending`, bg: 'rgba(251,191,36,0.15)' },
  ];

  const dropletColumns: Column<Row>[] = [
    {
      key: 'name',
      label: 'Droplet',
      render: (row) => <span style={{ fontWeight: 700 }}>{row.name as string}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          variant={(row.status as string) === 'active' ? 'running' : 'stopped'}
          label={(row.status as string) === 'active' ? 'Running' : (row.status as string)}
        />
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (row) => {
        const ip = (row.networks as Record<string, unknown>)?.v4
          ? ((row.networks as Record<string, {ip_address: string; type: string}[]>).v4?.find(n => n.type === 'public')?.ip_address || '—')
          : '—';
        return <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{ip}</span>;
      },
    },
  ];

  const orderColumns: Column<Row>[] = [
    {
      key: 'order_number',
      label: 'Order',
      render: (row) => <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{row.order_number as string}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge
          variant={row.status as string || row.payment_status as string || 'pending'}
          label={row.status as string || row.payment_status as string || 'pending'}
        />
      ),
    },
    {
      key: 'total_amount',
      label: 'Amount',
      render: (row) => (
        <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800, fontSize: '0.95rem' }}>
          {formatCurrency(row.total_amount as number, row.currency as string)}
        </span>
      ),
    },
  ];

  const expiringColumns: Column<Row>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (row) => {
        const product = row.product as Row | undefined;
        return <span style={{ fontWeight: 700 }}>{(product?.name as string) || 'Unknown'}</span>;
      },
    },
    {
      key: 'product_type',
      label: 'Type',
      render: (row) => {
        const product = row.product as Row | undefined;
        return (
          <span
            className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground"
            style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}
          >
            {(product?.product_type as string) || '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge variant={row.status as string} label={row.status as string} />,
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (row) => (
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--secondary)' }}>
          {row.expires_at ? formatDate(row.expires_at as string) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: () => <ButtonLink href="/products" size="sm" variant="accent">Renew</ButtonLink>,
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader
        title="Dashboard"
        subtitle="Here's what's happening with your products today."
        actions={
          <ButtonLink href="/products" variant="accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Browse Products
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {stats.map((s, i) => (
          <div key={i} className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] p-5 shadow-[4px_4px_0_var(--shadow)] relative overflow-hidden transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]" style={{ animation: `popIn 0.3s var(--ease-bounce) both`, animationDelay: `${i * 0.04}s` }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-2 border-current opacity-[0.15]" />
            <div className="w-9 h-9 rounded-[var(--radius-sm)] border-2 border-foreground flex items-center justify-center mb-3 text-base" style={{ background: s.bg }}>{s.icon}</div>
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">{s.label}</div>
            <div className="font-heading text-[1.8rem] font-black leading-none">{loading ? '—' : s.value}</div>
            <div className="text-[0.72rem] font-semibold text-muted-foreground mt-1">{s.sub}</div>
            {s.bars && (
              <div className="flex gap-1.5 mt-2.5">
                <div className="h-1.5 rounded-full bg-quaternary" style={{ flex: runningDroplets || 1 }} />
                <div className="h-1.5 rounded-full bg-secondary" style={{ flex: stoppedDroplets || 1 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Panel title="VPS Health Summary" actions={<ButtonLink href="/dashboard/droplets" size="sm">View all</ButtonLink>} noPad>
          {droplets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-[0.82rem]">No droplets assigned</div>
          ) : (
            <div style={{ padding: 16 }}>
              <AdminTable columns={dropletColumns} rows={droplets.slice(0, 5)} />
            </div>
          )}
        </Panel>

        <Panel title="Recent Orders" actions={<ButtonLink href="/dashboard/orders" size="sm">View all</ButtonLink>} noPad>
          {orders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-[0.82rem]">No orders yet</div>
          ) : (
            <div style={{ padding: 16 }}>
              <AdminTable columns={orderColumns} rows={orders.slice(0, 5)} />
            </div>
          )}
        </Panel>
      </div>

      {expiringProducts.length > 0 && (
        <Panel title="⚠️ Expiring / Pending Products" noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={expiringColumns} rows={expiringProducts} />
          </div>
        </Panel>
      )}
    </div>
  );
}
