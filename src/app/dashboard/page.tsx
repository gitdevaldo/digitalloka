'use client';

import { useEffect, useState } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardOverviewPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [orders, setOrders] = useState<Record<string, unknown>[]>([]);
  const [droplets, setDroplets] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/user/products').then(r => r.json()).then(d => setProducts(d.data || [])).catch(() => {}),
      fetch('/api/user/orders').then(r => r.json()).then(d => setOrders(d.data || [])).catch(() => {}),
      fetch('/api/droplets').then(r => r.json()).then(d => setDroplets(d.data || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  const runningDroplets = droplets.filter(d => (d.status as string) === 'active').length;
  const stoppedDroplets = droplets.length - runningDroplets;
  const expiringProducts = products.filter(p => (p.status as string) === 'expiring' || (p.status as string) === 'pending');

  const stats = [
    { icon: '📦', label: 'Total Products', value: String(products.length), sub: 'across all types', bg: 'rgba(139,92,246,0.12)' },
    { icon: '🖥️', label: 'VPS Droplets', value: String(droplets.length), sub: `${runningDroplets} running · ${stoppedDroplets} stopped`, bg: 'rgba(139,92,246,0.12)', bars: droplets.length > 0 },
    { icon: '✅', label: 'Active Entitlements', value: String(products.filter(p => (p.status as string) === 'active').length), sub: expiringProducts.length ? `${expiringProducts.length} expiring soon` : 'all good', bg: 'rgba(52,211,153,0.15)' },
    { icon: '🛒', label: 'Recent Orders', value: String(orders.length), sub: `${orders.filter(o => (o.status as string) === 'pending').length} pending`, bg: 'rgba(251,191,36,0.15)' },
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
        <Panel title="VPS Health Summary" actions={<ButtonLink href="/dashboard/droplets" size="sm">View all</ButtonLink>}>
          {droplets.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-[0.82rem]">No droplets assigned</div>
          ) : (
            <TableShell variant="dashboard">
              <thead><tr><th>Droplet</th><th>Status</th><th>IP</th></tr></thead>
              <tbody>
                {droplets.slice(0, 5).map(d => {
                  const ip = (d.networks as Record<string, unknown>)?.v4
                    ? ((d.networks as Record<string, {ip_address: string; type: string}[]>).v4?.find(n => n.type === 'public')?.ip_address || '—')
                    : '—';
                  return (
                    <tr key={d.id as number}>
                      <td><strong>{d.name as string}</strong></td>
                      <td><StatusBadge variant={(d.status as string) === 'active' ? 'running' : 'stopped'} label={(d.status as string) === 'active' ? 'Running' : (d.status as string)} /></td>
                      <td className="font-mono text-[0.78rem]">{ip}</td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
          )}
        </Panel>

        <Panel title="Recent Orders" actions={<ButtonLink href="/dashboard/orders" size="sm">View all</ButtonLink>}>
          {orders.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-[0.82rem]">No orders yet</div>
          ) : (
            <TableShell variant="dashboard">
              <thead><tr><th>Order</th><th>Status</th><th>Amount</th></tr></thead>
              <tbody>
                {orders.slice(0, 5).map(order => (
                  <tr key={order.id as number}>
                    <td><div className="font-bold text-[0.82rem]">{order.order_number as string}</div></td>
                    <td><StatusBadge variant={order.status as string || order.payment_status as string || 'pending'} label={order.status as string || order.payment_status as string || 'pending'} /></td>
                    <td className="font-heading font-extrabold text-[0.95rem]">{formatCurrency(order.total_amount as number, order.currency as string)}</td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </Panel>
      </div>

      {expiringProducts.length > 0 && (
        <Panel title="⚠️ Expiring / Pending Entitlements">
          <TableShell variant="dashboard">
            <thead><tr><th>Product</th><th>Type</th><th>Status</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {expiringProducts.map(item => {
                const product = item.product as Record<string, unknown> | undefined;
                return (
                  <tr key={item.id as number}>
                    <td><strong>{(product?.name as string) || 'Unknown'}</strong></td>
                    <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">{(product?.product_type as string) || '—'}</span></td>
                    <td><StatusBadge variant={item.status as string} label={item.status as string} /></td>
                    <td className="font-bold text-[0.82rem] text-secondary">{item.expires_at ? formatDate(item.expires_at as string) : '—'}</td>
                    <td><ButtonLink href="/products" size="sm" variant="accent">Renew</ButtonLink></td>
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
