'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { Button, ButtonLink } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

export default function ProductTypesPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Types"
        subtitle="/admin/product-types — manage schema per product type"
        actions={
          <div className="flex gap-2">
            <Button size="sm">Refresh</Button>
            <Button variant="accent">+ Create Type</Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Types</option><option>VPS Only</option><option>Custom Types</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search type key or label..." />
      </div>

      <Panel>
        <TableShell variant="admin">
          <thead><tr><th>Type Key</th><th>Label</th><th>Status</th><th>Description</th><th>Fields</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan={6} className="text-center text-muted-foreground text-[0.8rem] py-8">Loading product types...</td></tr>
          </tbody>
        </TableShell>
      </Panel>

      <Panel title="DigitalOcean Regional Availability Reference">
        <a href="https://docs.digitalocean.com/platform/regional-availability/" target="_blank" rel="noopener" className="btn btn-sm">Open DigitalOcean Regional Availability</a>
      </Panel>
    </div>
  );
}
