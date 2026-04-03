'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';

export default function ProductAccessPage() {
  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Product Access" subtitle="Manage licenses and entitlements for your products." />
      <Panel>
        <TableShell variant="dashboard">
          <thead><tr><th>Product</th><th>License Key</th><th>Entitlement</th><th>Expires</th><th></th></tr></thead>
          <tbody>
            <tr>
              <td><strong>NovaDash UI Kit</strong></td>
              <td className="font-mono text-[0.72rem]">NOVA-XXXX-XXXX-1A2B</td>
              <td><StatusBadge variant="active" label="Active" /></td>
              <td className="text-[0.8rem] text-muted-foreground">Feb 2027</td>
              <td><Button size="sm">Revoke</Button></td>
            </tr>
            <tr>
              <td><strong>AI Prompt Course</strong></td>
              <td className="font-mono text-[0.72rem]">AIP-XXXX-XXXX-3C4D</td>
              <td><StatusBadge variant="pending" label="Pending" /></td>
              <td className="text-[0.8rem] text-muted-foreground">—</td>
              <td><Button size="sm" disabled className="opacity-40 cursor-not-allowed">—</Button></td>
            </tr>
            <tr>
              <td><strong>DataViz Pro UI Kit</strong></td>
              <td className="font-mono text-[0.72rem]">DVP-XXXX-XXXX-5E6F</td>
              <td><StatusBadge variant="pending" label="Expiring" /></td>
              <td className="text-[0.82rem] font-bold text-secondary">7 days</td>
              <td><Button size="sm" variant="warning">Renew</Button></td>
            </tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
