'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

interface Droplet {
  id: number;
  name: string;
  status: string;
  memory: number;
  vcpus: number;
  disk: number;
  region: { name: string; slug: string };
  image: { name: string };
  networks: { v4: { ip_address: string; type: string }[] };
}

export default function DropletsPage() {
  const [droplets, setDroplets] = useState<Droplet[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => { loadDroplets(); }, []);

  async function loadDroplets() {
    try {
      const res = await fetch('/api/droplets');
      const data = await res.json();
      setDroplets(data.data || []);
    } catch { showToast('Failed to load droplets'); }
    finally { setLoading(false); }
  }

  async function handleAction(dropletId: number, action: string) {
    setActionLoading(dropletId);
    try {
      const res = await fetch(`/api/droplets/${dropletId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: action }),
      });
      if (!res.ok) throw new Error();
      showToast(`${action} action sent`);
      setTimeout(loadDroplets, 3000);
    } catch { showToast('Action failed'); }
    finally { setActionLoading(null); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="VPS Droplets" subtitle="Manage your DigitalOcean droplets." actions={<Button onClick={loadDroplets}>↻ Refresh</Button>} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="bg-card border-2 border-border rounded-[var(--radius-xl)] h-[200px] animate-pulse" />)}
        </div>
      ) : droplets.length === 0 ? (
        <EmptyState icon="🖥️" title="No droplets" description="No droplets are assigned to your account." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {droplets.map((d) => {
            const publicIp = d.networks?.v4?.find((n) => n.type === 'public')?.ip_address || '—';
            return (
              <div key={d.id} className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] shadow-[4px_4px_0_var(--shadow)] p-5 relative transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]">
                <div className="w-[44px] h-[44px] bg-gradient-to-br from-violet-100 to-violet-200 border-2 border-foreground rounded-[var(--radius-md)] flex items-center justify-center mb-3 shadow-[2px_2px_0_var(--shadow)]">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="font-heading text-[0.95rem] font-extrabold">{d.name}</div>
                  <StatusBadge variant={d.status === 'active' ? 'running' : 'stopped'} label={d.status === 'active' ? 'Running' : d.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="flex flex-col gap-0.5"><span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">Region</span><span className="text-[0.8rem] font-bold">{d.region?.name || d.region?.slug}</span></div>
                  <div className="flex flex-col gap-0.5"><span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">IP</span><span className="text-[0.78rem] font-bold font-mono">{publicIp}</span></div>
                  <div className="flex flex-col gap-0.5"><span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">Plan</span><span className="text-[0.8rem] font-bold">{d.vcpus}vCPU / {d.memory}MB</span></div>
                  <div className="flex flex-col gap-0.5"><span className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted-foreground">Disk</span><span className="text-[0.8rem] font-bold">{d.disk}GB SSD</span></div>
                </div>

                <div className="flex gap-1.5 flex-wrap pt-3 border-t-2 border-border mt-3">
                  <Button size="sm" onClick={() => handleAction(d.id, 'power_on')} disabled={actionLoading === d.id}>⚡ On</Button>
                  <Button size="sm" onClick={() => handleAction(d.id, 'reboot')} disabled={actionLoading === d.id}>🔄 Reboot</Button>
                  <Button size="sm" variant="danger" onClick={() => handleAction(d.id, 'shutdown')} disabled={actionLoading === d.id}>⏹ Off</Button>
                  <Button size="sm" onClick={() => loadDroplets()}>↻</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
