'use client';

import Link from 'next/link';
import { Button, ButtonLink } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { PageHeader } from '@/components/layout/page-header';

export default function DashboardOverviewPage() {
  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader
        title="Good morning, Aldo 👋"
        subtitle="Here's what's happening with your products today."
        actions={
          <ButtonLink href="/dashboard/products" variant="accent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </ButtonLink>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          { icon: '📦', label: 'Total Products', value: '8', sub: 'across all types', bg: 'rgba(139,92,246,0.12)' },
          { icon: '🖥️', label: 'VPS Droplets', value: '3', sub: '2 running · 1 stopped', bg: 'rgba(139,92,246,0.12)', bars: true },
          { icon: '✅', label: 'Active Entitlements', value: '7', sub: '1 expiring in 7 days', bg: 'rgba(52,211,153,0.15)' },
          { icon: '🛒', label: 'Recent Orders', value: '12', sub: '2 pending fulfillment', bg: 'rgba(251,191,36,0.15)' },
        ].map((s, i) => (
          <div key={i} className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] p-5 shadow-[4px_4px_0_var(--shadow)] relative overflow-hidden transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]" style={{ animation: `popIn 0.3s var(--ease-bounce) both`, animationDelay: `${i * 0.04}s` }}>
            <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full border-2 border-current opacity-[0.15]" />
            <div className="w-9 h-9 rounded-[var(--radius-sm)] border-2 border-foreground flex items-center justify-center mb-3 text-base" style={{ background: s.bg }}>{s.icon}</div>
            <div className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted-foreground mb-1">{s.label}</div>
            <div className="font-heading text-[1.8rem] font-black leading-none">{s.value}</div>
            <div className="text-[0.72rem] font-semibold text-muted-foreground mt-1">{s.sub}</div>
            {s.bars && (
              <div className="flex gap-1.5 mt-2.5">
                <div className="h-1.5 rounded-full bg-quaternary" style={{ flex: 2 }} />
                <div className="h-1.5 rounded-full bg-secondary" style={{ flex: 1 }} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Panel title="VPS Health Summary" actions={<ButtonLink href="/dashboard/droplets" size="sm">View all</ButtonLink>}>
          <TableShell variant="dashboard">
            <thead><tr><th>Droplet</th><th>Status</th><th>IP</th></tr></thead>
            <tbody>
              <tr><td><strong>koncoweb-prod</strong></td><td><StatusBadge variant="running" label="Running" /></td><td className="font-mono text-[0.78rem]">192.168.1.10</td></tr>
              <tr><td><strong>api-staging</strong></td><td><StatusBadge variant="running" label="Running" /></td><td className="font-mono text-[0.78rem]">192.168.1.11</td></tr>
              <tr><td><strong>dev-sandbox</strong></td><td><StatusBadge variant="stopped" label="Stopped" /></td><td className="font-mono text-[0.78rem] text-muted-foreground">—</td></tr>
            </tbody>
          </TableShell>
        </Panel>

        <Panel title="Recent Orders" actions={<ButtonLink href="/dashboard/orders" size="sm">View all</ButtonLink>}>
          <TableShell variant="dashboard">
            <thead><tr><th>Order</th><th>Status</th><th>Amount</th></tr></thead>
            <tbody>
              <tr>
                <td><div className="font-bold text-[0.82rem]">#ORD-0042</div><div className="text-[0.72rem] text-muted-foreground">NovaDash UI Kit</div></td>
                <td><StatusBadge variant="active" label="Active" /></td>
                <td className="font-heading font-extrabold text-[0.95rem]">$49</td>
              </tr>
              <tr>
                <td><div className="font-bold text-[0.82rem]">#ORD-0041</div><div className="text-[0.72rem] text-muted-foreground">VPS — SGP1 2vCPU</div></td>
                <td><StatusBadge variant="running" label="Active" /></td>
                <td className="font-heading font-extrabold text-[0.95rem]">$24/mo</td>
              </tr>
              <tr>
                <td><div className="font-bold text-[0.82rem]">#ORD-0040</div><div className="text-[0.72rem] text-muted-foreground">AI Prompt Course</div></td>
                <td><StatusBadge variant="pending" label="Pending" /></td>
                <td className="font-heading font-extrabold text-[0.95rem]">$99</td>
              </tr>
            </tbody>
          </TableShell>
        </Panel>
      </div>

      <Panel title="⚠️ Expiring / Blocked Entitlements">
        <TableShell variant="dashboard">
          <thead><tr><th>Product</th><th>Type</th><th>Status</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><strong>DataViz Pro UI Kit</strong></td>
              <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">ui-kit</span></td>
              <td><StatusBadge variant="pending" label="Expiring" /></td>
              <td className="font-bold text-[0.82rem] text-secondary">7 days</td>
              <td><Button size="sm" variant="accent">Renew</Button></td>
            </tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
