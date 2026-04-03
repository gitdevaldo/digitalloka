'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';

export default function EntitlementsPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Entitlements" subtitle="/admin/entitlements — license and access lifecycle" />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Expiring</option><option>Suspended</option><option>Revoked</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search user email or product name…" />
      </div>

      <Panel>
        <TableShell variant="admin">
          <thead><tr><th>ID</th><th>User</th><th>Product</th><th>Order</th><th>Status</th><th>Starts</th><th>Expires</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan={8} className="text-center text-muted-foreground text-[0.8rem] py-8">Loading entitlements...</td></tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
