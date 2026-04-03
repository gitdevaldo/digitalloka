'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
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
  const [selected, setSelected] = useState<Droplet | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadDroplets(); }, []);

  async function loadDroplets() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/droplets');
      const data = await res.json();
      if (data.error) { showToast(data.error); setDroplets([]); }
      else { setDroplets(Array.isArray(data.droplets) ? data.droplets : []); }
    } catch { showToast('Failed to load droplets'); }
    finally { setLoading(false); }
  }

  async function performAction(action: string) {
    if (!selected) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/droplets/${selected.id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action }),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Action failed'); return; }
      showToast(`${action} action sent to droplet ${selected.id}`);
      setSelected(null);
      setTimeout(loadDroplets, 3000);
    } catch { showToast('Action failed'); }
    finally { setActionLoading(false); }
  }

  const filtered = droplets.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (regionFilter !== 'all' && d.region !== regionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return String(d.id).includes(s) || (d.owner_email || '').toLowerCase().includes(s) || (d.name || '').toLowerCase().includes(s);
    }
    return true;
  });

  const regions = [...new Set(droplets.map(d => d.region).filter(Boolean))] as string[];

  const columns = [
    { key: 'id', label: 'Droplet ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{row.id as number}</span> },
    { key: 'owner_email', label: 'Owner', style: { fontSize: '0.78rem' } as React.CSSProperties },
    { key: 'entitlement_id', label: 'Entitlement', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{row.entitlement_id ? String(row.entitlement_id).slice(0, 8) : '—'}</span> },
    { key: 'region', label: 'Region', render: (row: Record<string, unknown>) => <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' as const }}>{(row.region as string) || '—'}</span> },
    { key: 'size', label: 'Plan', style: { fontSize: '0.78rem' } as React.CSSProperties },
    { key: 'status', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge variant={(row.status as string) === 'active' ? 'running' : (row.status as string) === 'off' ? 'stopped' : 'starting'} label={row.status as string} /> },
    { key: 'ip_address', label: 'IP', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{(row.ip_address as string) || '—'}</span> },
    { key: 'updated_at', label: 'Last Action', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.updated_at ? new Date(row.updated_at as string).toLocaleDateString() : '—'}</span> },
    { key: 'actions', label: 'Actions', render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => setSelected(row as unknown as Droplet)}>Actions</Button> },
  ];

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
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option><option value="active">Running</option><option value="off">Stopped</option><option value="new">Starting</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)}>
          <option value="all">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search droplet ID or owner…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <Panel><div className="h-24 bg-muted rounded-lg animate-pulse" /></Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🖥️" title="No droplets" description="Managed droplets will appear here when provisioned." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={filtered as unknown as Record<string, unknown>[]} />
          </div>
        </Panel>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`Droplet: ${selected?.name || selected?.id || ''}`}>
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Droplet ID</span><span className="font-mono font-bold">{selected.id}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Status</span><StatusBadge variant={selected.status === 'active' ? 'running' : 'stopped'} label={selected.status} /></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Region</span><span className="font-bold uppercase">{selected.region || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Plan</span><span>{selected.size || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">IP</span><span className="font-mono">{selected.ip_address || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Owner</span><span className="text-[0.75rem]">{selected.owner_email || '—'}</span></div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Power Actions</span>
              <div className="flex gap-2 flex-wrap">
                <Button size="sm" onClick={() => performAction('power_on')} disabled={actionLoading}>Power On</Button>
                <Button size="sm" onClick={() => performAction('reboot')} disabled={actionLoading}>Reboot</Button>
                <Button size="sm" onClick={() => performAction('shutdown')} disabled={actionLoading}>Shutdown</Button>
                <Button size="sm" variant="danger" onClick={() => performAction('power_off')} disabled={actionLoading}>Force Off</Button>
                <Button size="sm" onClick={() => performAction('power_cycle')} disabled={actionLoading}>Power Cycle</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
