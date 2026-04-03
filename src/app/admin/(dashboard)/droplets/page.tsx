'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface Droplet {
  id: number;
  name: string;
  region: string | null;
  size: string | null;
  status: string;
  ip_address: string | null;
  owner_user_id: string | null;
  owner_email: string | null;
  entitlement_id: number | null;
  updated_at: string | null;
}

export default function AdminDropletsPage() {
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => { loadDroplets(); }, []);

  async function loadDroplets() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/droplets');
      const data = await res.json();
      if (data.error) {
        showToast(data.error);
        setDroplets([]);
      } else {
        setDroplets(Array.isArray(data.droplets) ? data.droplets : []);
      }
    } catch { showToast('Failed to load droplets'); }
    finally { setLoading(false); }
  }

  const filtered = droplets.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (regionFilter !== 'all' && d.region !== regionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        String(d.id).includes(s) ||
        (d.owner_email || '').toLowerCase().includes(s) ||
        (d.name || '').toLowerCase().includes(s)
      );
    }
    return true;
  });

  const regions = [...new Set(droplets.map(d => d.region).filter(Boolean))] as string[];

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
        <select
          className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="active">Running</option>
          <option value="off">Stopped</option>
          <option value="new">Starting</option>
        </select>
        <select
          className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="all">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>
        <input
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
          placeholder="Search droplet ID or owner…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Panel>
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
        </Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🖥️" title="No droplets" description="Managed droplets will appear here when provisioned." />
      ) : (
        <Panel>
          <TableShell variant="admin">
            <thead><tr><th>Droplet ID</th><th>Owner</th><th>Entitlement</th><th>Region</th><th>Plan</th><th>Status</th><th>IP</th><th>Last Action</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td className="font-mono text-[0.72rem]">{d.id}</td>
                  <td className="text-[0.78rem]">{d.owner_email || '—'}</td>
                  <td className="font-mono text-[0.72rem] text-muted-foreground">{d.entitlement_id ? String(d.entitlement_id).slice(0, 8) : '—'}</td>
                  <td className="text-[0.78rem] font-bold uppercase">{d.region || '—'}</td>
                  <td className="text-[0.78rem]">{d.size || '—'}</td>
                  <td><StatusBadge variant={d.status === 'active' ? 'running' : d.status === 'off' ? 'stopped' : 'starting'} label={d.status} /></td>
                  <td className="font-mono text-[0.72rem]">{d.ip_address || '—'}</td>
                  <td className="text-[0.72rem] text-muted-foreground">{d.updated_at ? new Date(d.updated_at).toLocaleDateString() : '—'}</td>
                  <td><Button size="sm">Actions</Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
