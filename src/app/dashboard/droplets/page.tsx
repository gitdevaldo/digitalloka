'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { Power, RotateCw, Square } from 'lucide-react';

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

  useEffect(() => {
    loadDroplets();
  }, []);

  async function loadDroplets() {
    try {
      const res = await fetch('/api/droplets');
      const data = await res.json();
      setDroplets(data.data || []);
    } catch {
      showToast('Failed to load droplets');
    } finally {
      setLoading(false);
    }
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
    } catch {
      showToast('Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Droplets" subtitle="Manage your DigitalOcean droplets." actions={<Button onClick={loadDroplets}>↻ Refresh</Button>} />
      {loading ? (
        <div className="space-y-4">{[1, 2].map((i) => <div key={i} className="bg-card border-2 border-border rounded-xl h-24 animate-pulse" />)}</div>
      ) : droplets.length === 0 ? (
        <EmptyState icon="🖥️" title="No droplets" description="No droplets are assigned to your account." />
      ) : (
        <div className="space-y-4">
          {droplets.map((d) => {
            const publicIp = d.networks?.v4?.find((n) => n.type === 'public')?.ip_address || 'N/A';
            return (
              <Panel key={d.id}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg border-2 border-foreground bg-accent/10 flex items-center justify-center text-accent shadow-pop-sm">🖥️</div>
                    <div>
                      <div className="font-heading text-sm font-extrabold">{d.name}</div>
                      <div className="text-xs text-muted-foreground font-medium">{publicIp} · {d.region?.name} · {d.image?.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge variant={d.status === 'active' ? 'running' : 'stopped'} label={d.status} />
                    <div className="flex gap-1">
                      <Button size="sm" onClick={() => handleAction(d.id, 'power_on')} disabled={actionLoading === d.id}><Power size={12} /> On</Button>
                      <Button size="sm" onClick={() => handleAction(d.id, 'reboot')} disabled={actionLoading === d.id}><RotateCw size={12} /> Reboot</Button>
                      <Button size="sm" variant="danger" onClick={() => handleAction(d.id, 'shutdown')} disabled={actionLoading === d.id}><Square size={12} /> Off</Button>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: 'Memory', value: `${d.memory} MB` },
                    { label: 'vCPUs', value: String(d.vcpus) },
                    { label: 'Disk', value: `${d.disk} GB` },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted rounded-lg p-2 text-center">
                      <div className="text-[0.6rem] font-extrabold uppercase text-muted-foreground">{s.label}</div>
                      <div className="text-sm font-bold">{s.value}</div>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}
