'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

export default function AdminDropletsPage() {
  const [droplets, setDroplets] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { loadDroplets(); }, []);

  async function loadDroplets() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/droplets');
      const data = await res.json();
      setDroplets(data.data || []);
    } catch { showToast('Failed to load droplets'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Droplets"
        subtitle="/admin/droplets — server resource administration"
        actions={
          <Button size="sm" onClick={loadDroplets}>
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

      {loading ? (
        <Panel>
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
        </Panel>
      ) : droplets.length === 0 ? (
        <EmptyState icon="🖥️" title="No droplets" description="Managed droplets will appear here when provisioned." />
      ) : (
        <Panel>
          <TableShell variant="admin">
            <thead><tr><th>Droplet ID</th><th>Owner</th><th>Entitlement</th><th>Region</th><th>Plan</th><th>Status</th><th>IP</th><th>Last Action</th><th>Actions</th></tr></thead>
            <tbody>
              {droplets.map((d) => {
                const user = d.user as Record<string, unknown> | undefined;
                const ent = d.entitlement as Record<string, unknown> | undefined;
                return (
                  <tr key={d.id as number}>
                    <td className="font-mono text-[0.72rem]">{d.droplet_id as string || String(d.id).slice(0, 8)}</td>
                    <td className="text-[0.78rem]">{user?.email as string || '—'}</td>
                    <td className="font-mono text-[0.72rem] text-muted-foreground">{ent ? String(ent.id).slice(0, 8) : '—'}</td>
                    <td className="text-[0.78rem] font-bold uppercase">{d.region as string || '—'}</td>
                    <td className="text-[0.78rem]">{d.size_slug as string || d.plan as string || '—'}</td>
                    <td><StatusBadge variant={d.status === 'active' || d.status === 'running' ? 'running' : d.status === 'stopped' ? 'stopped' : 'starting'} label={d.status as string} /></td>
                    <td className="font-mono text-[0.72rem]">{d.ip_address as string || '—'}</td>
                    <td className="text-[0.72rem] text-muted-foreground">{d.last_action_at ? formatDate(d.last_action_at as string) : '—'}</td>
                    <td><Button size="sm">Actions</Button></td>
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
