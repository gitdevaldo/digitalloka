'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

export default function DigitalProductsPage() {
  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Digital Products" subtitle="Your downloadable files, templates, and kits." />
      <Panel>
        <TableShell variant="dashboard">
          <thead><tr><th>Product</th><th>Format</th><th>Status</th><th>Purchased</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><strong>NovaDash UI Kit</strong></td>
              <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">Figma + ZIP</span></td>
              <td><StatusBadge variant="active" label="Active" /></td>
              <td className="text-[0.8rem] text-muted-foreground">Feb 14, 2026</td>
              <td><Button size="sm" variant="accent">⬇ Download</Button></td>
            </tr>
            <tr>
              <td><strong>DataViz Pro UI Kit</strong></td>
              <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">Figma</span></td>
              <td><StatusBadge variant="pending" label="Expiring" /></td>
              <td className="text-[0.8rem] text-muted-foreground">Jan 10, 2026</td>
              <td><Button size="sm" variant="warning">Renew</Button></td>
            </tr>
            <tr>
              <td><strong>Indie Maker Notion Pack</strong></td>
              <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">Notion</span></td>
              <td><StatusBadge variant="active" label="Active" /></td>
              <td className="text-[0.8rem] text-muted-foreground">Dec 5, 2025</td>
              <td><Button size="sm" variant="accent">⬇ Download</Button></td>
            </tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
