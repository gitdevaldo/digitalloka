'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { Button } from '@/components/ui/button';

export default function AdminDropletsPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Droplets"
        subtitle="/admin/droplets — server resource administration"
        actions={
          <Button size="sm">
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh All
          </Button>
        }
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Running</option><option>Stopped</option><option>Starting</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Regions</option><option>SGP1</option><option>NYC1</option><option>FRA1</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search droplet ID or owner…" />
      </div>

      <Panel>
        <TableShell variant="admin">
          <thead><tr><th>Droplet ID</th><th>Owner</th><th>Entitlement</th><th>Region</th><th>Plan</th><th>Status</th><th>IP</th><th>Last Action</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan={9} className="text-center text-muted-foreground text-[0.8rem] py-8">Loading droplets...</td></tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
