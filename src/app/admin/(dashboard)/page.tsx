'use client';

import { useEffect, useState, useCallback } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/layout/page-header';
import { formatDate, formatCurrency } from '@/lib/utils';

interface OverviewStats {
  products: number;
  entitlements: number;
  users: number;
  orders: number;
  droplets: number;
  actions: number;
  revenue: string;
  audit: number;
  productsSub: string;
  entitlementsSub: string;
  usersSub: string;
  ordersSub: string;
  dropletsSub: string;
  actionsSub: string;
  revenueSub: string;
  auditSub: string;
  pendingOrders: number;
  expiringEntitlements: number;
  dropletsInAction: number;
}

interface AuditRow {
  [key: string]: unknown;
  actor: string;
  action: string;
  result: string;
  ts: string;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats>({
    products: 0, entitlements: 0, users: 0, orders: 0,
    droplets: 0, actions: 0, revenue: '$0.00', audit: 0,
    productsSub: '0 active', entitlementsSub: '0 expiring soon',
    usersSub: '0 blocked', ordersSub: '0 pending',
    dropletsSub: '0 in action', actionsSub: '0 users affected',
    revenueSub: 'From paid orders', auditSub: '0 failures',
    pendingOrders: 0, expiringEntitlements: 0, dropletsInAction: 0,
  });
  const [auditRows, setAuditRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, entitlementsRes, usersRes, dropletsRes, auditRes] = await Promise.allSettled([
        fetch('/api/admin/products').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json()),
        fetch('/api/admin/entitlements').then(r => r.json()),
        fetch('/api/admin/users').then(r => r.json()),
        fetch('/api/admin/droplets').then(r => r.json()),
        fetch('/api/admin/audit-logs').then(r => r.json()),
      ]);

      const products = productsRes.status === 'fulfilled' ? (productsRes.value.data || []) : [];
      const orders = ordersRes.status === 'fulfilled' ? (ordersRes.value.data || []) : [];
      const entitlements = entitlementsRes.status === 'fulfilled' ? (entitlementsRes.value.data || []) : [];
      const users = usersRes.status === 'fulfilled' ? (usersRes.value.data || []) : [];
      const dropletsRaw = dropletsRes.status === 'fulfilled' ? (dropletsRes.value.data || []) : [];
      const audit = auditRes.status === 'fulfilled' ? (auditRes.value.data || []) : [];

      const activeProducts = products.filter((p: Record<string, unknown>) => Boolean(p.is_visible)).length;
      const activeEntitlements = entitlements.filter((e: Record<string, unknown>) => e.status === 'active').length;

      const now = new Date();
      const upper = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const expiringEntitlements = entitlements.filter((e: Record<string, unknown>) => {
        if (e.status === 'expiring') return true;
        const expiryDate = e.expires_at ? new Date(e.expires_at as string) : null;
        if (!expiryDate || isNaN(expiryDate.getTime())) return false;
        return expiryDate >= now && expiryDate <= upper;
      }).length;

      const blockedUsers = users.filter((u: Record<string, unknown>) => !u.is_active).length;
      const pendingOrders = orders.filter((o: Record<string, unknown>) => (o.status || 'pending') === 'pending').length;

      const droplets = Array.isArray(dropletsRaw) ? dropletsRaw : [];
      const dropletsInAction = droplets.filter((d: Record<string, unknown>) => !['running', 'stopped'].includes(String(d.status || 'stopped').toLowerCase())).length;

      const revenueMtd = orders
        .filter((o: Record<string, unknown>) => String(o.payment_status || '').toLowerCase() === 'paid')
        .reduce((total: number, o: Record<string, unknown>) => total + Number(o.total_amount || 0), 0);

      const auditFailures = audit.filter((e: Record<string, unknown>) => ['fail', 'failed'].includes(String(e.result || '').toLowerCase())).length;

      const actionUserCount = new Set(
        droplets
          .filter((d: Record<string, unknown>) => !['running', 'stopped'].includes(String(d.status || 'stopped').toLowerCase()))
          .map((d: Record<string, unknown>) => d.owner_email || d.owner_user_id)
          .filter(Boolean)
      ).size;

      setStats({
        products: products.length,
        entitlements: activeEntitlements,
        users: users.length,
        orders: orders.length,
        droplets: droplets.length,
        actions: dropletsInAction,
        revenue: formatCurrency(revenueMtd, 'USD'),
        audit: audit.length,
        productsSub: `${activeProducts} active`,
        entitlementsSub: `${expiringEntitlements} expiring soon`,
        usersSub: `${blockedUsers} blocked`,
        ordersSub: `${pendingOrders} pending`,
        dropletsSub: `${dropletsInAction} in action`,
        actionsSub: `${actionUserCount} users affected`,
        revenueSub: 'From paid orders',
        auditSub: `${auditFailures} failures`,
        pendingOrders,
        expiringEntitlements,
        dropletsInAction,
      });

      setAuditRows(audit.slice(0, 4).map((e: Record<string, unknown>) => ({
        actor: String(e.actor || 'system'),
        action: String(e.action || ''),
        result: String(e.result || 'ok').toLowerCase(),
        ts: formatDate(e.created_at as string),
      })));
    } catch (err) {
      console.error('[AdminOverview] Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAllData(); }, [loadAllData]);

  const auditColumns = [
    { key: 'actor', label: 'Actor', render: (row: AuditRow) => <span className="font-mono text-[0.78rem]">{row.actor}</span> },
    { key: 'action', label: 'Action', render: (row: AuditRow) => <span className="font-bold">{row.action}</span> },
    { key: 'result', label: 'Result', render: (row: AuditRow) => <StatusBadge variant={row.result === 'ok' ? 'active' : row.result === 'fail' || row.result === 'failed' ? 'stopped' : 'pending'} label={row.result} /> },
    { key: 'time', label: 'Time', render: (row: AuditRow) => <span className="text-[0.72rem] text-muted-foreground">{row.ts}</span> },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Admin Overview"
        subtitle="System health and operational snapshot · /admin"
        actions={
          <ButtonLink href="/admin/audit-logs" variant="accent">
            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            View Audit Logs
          </ButtonLink>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📦', label: 'Total Products', value: stats.products, sub: stats.productsSub, bg: 'rgba(139,92,246,0.1)' },
            { icon: '✅', label: 'Active Entitlements', value: stats.entitlements, sub: stats.entitlementsSub, bg: 'rgba(52,211,153,0.12)' },
            { icon: '👥', label: 'Total Users', value: stats.users, sub: stats.usersSub, bg: 'rgba(244,114,182,0.12)' },
            { icon: '🛒', label: 'Total Orders', value: stats.orders, sub: stats.ordersSub, bg: 'rgba(251,191,36,0.15)' },
            { icon: '🖥️', label: 'Managed Droplets', value: stats.droplets, sub: stats.dropletsSub, bg: 'rgba(139,92,246,0.1)' },
            { icon: '⚡', label: 'Actions In Progress', value: stats.actions, sub: stats.actionsSub, bg: 'rgba(244,114,182,0.12)' },
            { icon: '💰', label: 'Revenue (MTD)', value: stats.revenue, sub: stats.revenueSub, bg: 'rgba(52,211,153,0.12)' },
            { icon: '📊', label: 'Audit Events (24h)', value: stats.audit, sub: stats.auditSub, bg: 'rgba(251,191,36,0.15)' },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card border-2 border-foreground rounded-[var(--r-xl)] p-5 relative overflow-hidden shadow-[4px_4px_0_var(--shadow)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]"
              style={{ animation: `fadeUp 0.3s var(--ease) both`, animationDelay: `${i * 0.03}s` }}
            >
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full border-2 border-foreground opacity-[0.06]" />
              <div className="w-9 h-9 rounded-[var(--r-sm)] border-2 border-foreground flex items-center justify-center mb-3 text-base shadow-[2px_2px_0_var(--shadow)]" style={{ background: s.bg }}>{s.icon}</div>
              <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-muted-foreground mb-0.5">{s.label}</div>
              <div className="font-heading text-[1.8rem] font-black leading-none">{s.value}</div>
              <div className="text-[0.68rem] font-semibold text-muted-foreground mt-1">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Panel title="🚨 Critical Audit Events" actions={<ButtonLink href="/admin/audit-logs" size="sm">All logs →</ButtonLink>}>
          <AdminTable
            columns={auditColumns}
            rows={auditRows}
            emptyText="No audit data available."
          />
        </Panel>

        <div className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
          <div className="px-5 py-3.5 border-b-2 border-border">
            <div className="font-heading text-base font-extrabold">⏳ High-Priority Queues</div>
          </div>
          <div className="p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between p-3.5 px-4 border-2 border-foreground rounded-[var(--r-lg)] shadow-[3px_3px_0_var(--shadow)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--shadow)]" style={{ background: 'rgba(244,114,182,0.08)' }}>
              <div>
                <div className="font-bold text-[0.85rem]">Pending Orders</div>
                <div className="text-[0.72rem] text-muted-foreground mt-0.5">Awaiting fulfillment</div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-heading text-2xl font-black text-secondary">{stats.pendingOrders}</span>
                <ButtonLink href="/admin/orders" size="sm">Review →</ButtonLink>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-2 border-foreground rounded-[var(--r-lg)] shadow-[3px_3px_0_var(--shadow)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--shadow)]" style={{ background: 'rgba(251,191,36,0.08)' }}>
              <div>
                <div className="font-bold text-[0.85rem]">Expiring Entitlements</div>
                <div className="text-[0.72rem] text-muted-foreground mt-0.5">Expire within 7 days</div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-heading text-2xl font-black text-tertiary">{stats.expiringEntitlements}</span>
                <ButtonLink href="/admin/entitlements" size="sm">Review →</ButtonLink>
              </div>
            </div>
            <div className="flex items-center justify-between p-3.5 px-4 border-2 border-foreground rounded-[var(--r-lg)] shadow-[3px_3px_0_var(--shadow)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--shadow)]" style={{ background: 'rgba(139,92,246,0.07)' }}>
              <div>
                <div className="font-bold text-[0.85rem]">Droplets In Action</div>
                <div className="text-[0.72rem] text-muted-foreground mt-0.5">Processing or stuck</div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-heading text-2xl font-black text-accent">{stats.dropletsInAction}</span>
                <ButtonLink href="/admin/droplets" size="sm">Review →</ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
