'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Droplet, DropletAction } from '@/lib/digitalocean';
import { StatusBadge } from './status-badge';
import { ActionButton } from './action-button';
import { ActionLog } from './action-log';
import { formatUptime } from '@/lib/utils';

interface DropletDetailProps {
  dropletId: string;
}

export function DropletDetail({ dropletId }: DropletDetailProps) {
  const [droplet, setDroplet] = useState<Droplet | null>(null);
  const [actions, setActions] = useState<DropletAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchDroplet = useCallback(async () => {
    try {
      const [dropletRes, actionsRes] = await Promise.all([
        fetch(`/api/droplets/${dropletId}`),
        fetch(`/api/droplets/${dropletId}/actions`),
      ]);

      const dropletData = await dropletRes.json();
      const actionsData = await actionsRes.json();

      if (!dropletRes.ok) {
        throw new Error(dropletData.error || 'Failed to fetch droplet');
      }

      setDroplet(dropletData.droplet);
      setActions(actionsData.actions || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [dropletId]);

  useEffect(() => {
    fetchDroplet();
    const interval = setInterval(fetchDroplet, 30000);
    return () => clearInterval(interval);
  }, [fetchDroplet]);

  const performAction = async (actionType: string) => {
    setActionLoading(actionType);
    setToast(null);

    try {
      const res = await fetch(`/api/droplets/${dropletId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: actionType }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Action failed');
      }

      setToast({ type: 'success', message: `${actionType.replace('_', ' ')} initiated` });
      
      const pollInterval = setInterval(async () => {
        const statusRes = await fetch(`/api/droplets/${dropletId}`);
        const statusData = await statusRes.json();
        
        if (statusRes.ok) {
          setDroplet(statusData.droplet);
          if (!statusData.droplet.locked) {
            clearInterval(pollInterval);
            fetchDroplet();
          }
        }
      }, 5000);

      setTimeout(() => clearInterval(pollInterval), 120000);
    } catch (err) {
      setToast({ type: 'error', message: err instanceof Error ? err.message : 'Action failed' });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-card border-2 border-border rounded-xl p-8 animate-pulse">
          <div className="h-8 bg-muted rounded-lg w-1/3 mb-4" />
          <div className="h-4 bg-muted rounded-lg w-2/3" />
        </div>
      </div>
    );
  }

  if (error || !droplet) {
    return (
      <div className="bg-secondary/10 border-2 border-secondary rounded-xl p-8 text-center shadow-pop-secondary">
        <p className="text-foreground font-bold">{error || 'Droplet not found'}</p>
      </div>
    );
  }

  const publicIp = droplet.networks.v4.find((n) => n.type === 'public')?.ip_address;
  const privateIp = droplet.networks.v4.find((n) => n.type === 'private')?.ip_address;
  const ipv6 = droplet.networks.v6.find((n) => n.type === 'public')?.ip_address;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-foreground shadow-pop animate-pop-in ${
            toast.type === 'success' ? 'bg-quaternary' : 'bg-secondary text-white'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-current border-2 border-foreground" />
          <span className="font-bold">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-pop-accent relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-4 right-4 w-8 h-8 bg-tertiary rounded-full border-2 border-foreground opacity-60"></div>
        <div className="absolute top-12 right-12 w-4 h-4 bg-secondary rotate-45 border-2 border-foreground opacity-60"></div>
        
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent rounded-full border-2 border-foreground shadow-pop flex items-center justify-center text-white">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="8" rx="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2"/>
                <circle cx="19" cy="6" r="1" fill="currentColor"/>
                <circle cx="19" cy="18" r="1" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-heading">{droplet.name}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground font-medium">
                <span>#{droplet.id}</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span>{droplet.region.name}</span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span>{droplet.size_slug}</span>
              </div>
            </div>
          </div>
          <StatusBadge status={droplet.status} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-6">
          <ActionButton
            label="Reboot"
            actionType="reboot"
            variant="default"
            loading={actionLoading === 'reboot'}
            disabled={droplet.locked || droplet.status !== 'active'}
            onClick={() => performAction('reboot')}
          />
          <ActionButton
            label={droplet.status === 'active' ? 'Power Off' : 'Power On'}
            actionType={droplet.status === 'active' ? 'power_off' : 'power_on'}
            variant={droplet.status === 'active' ? 'danger' : 'success'}
            loading={actionLoading === 'power_off' || actionLoading === 'power_on'}
            disabled={droplet.locked}
            onClick={() => performAction(droplet.status === 'active' ? 'power_off' : 'power_on')}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Specs */}
        <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-pop-tertiary">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Specifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted rounded-lg p-4 border-2 border-border">
              <div className="text-3xl font-bold font-heading text-accent">{droplet.vcpus}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase mt-1">vCPUs</div>
            </div>
            <div className="bg-muted rounded-lg p-4 border-2 border-border">
              <div className="text-3xl font-bold font-heading text-secondary">{droplet.memory / 1024} GB</div>
              <div className="text-xs text-muted-foreground font-bold uppercase mt-1">Memory</div>
            </div>
            <div className="bg-muted rounded-lg p-4 border-2 border-border">
              <div className="text-3xl font-bold font-heading text-tertiary">{droplet.disk} GB</div>
              <div className="text-xs text-muted-foreground font-bold uppercase mt-1">Disk</div>
            </div>
            <div className="bg-muted rounded-lg p-4 border-2 border-border">
              <div className="text-3xl font-bold font-heading text-quaternary">{formatUptime(droplet.created_at)}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase mt-1">Uptime</div>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-pop-secondary">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Network</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b-2 border-dashed border-border">
              <span className="text-muted-foreground font-medium">IPv4</span>
              <span className="font-bold text-accent">{publicIp || 'N/A'}</span>
            </div>
            {ipv6 && (
              <div className="flex justify-between items-center py-3 border-b-2 border-dashed border-border">
                <span className="text-muted-foreground font-medium">IPv6</span>
                <span className="font-bold text-xs truncate max-w-[180px]">{ipv6}</span>
              </div>
            )}
            {privateIp && (
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground font-medium">Private</span>
                <span className="font-bold">{privateIp}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Power Actions */}
      <div className="bg-card border-2 border-foreground rounded-xl p-6 shadow-pop-soft">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Power Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ActionButton
            label="Reboot"
            description="Graceful OS restart"
            actionType="reboot"
            variant="default"
            loading={actionLoading === 'reboot'}
            disabled={droplet.locked || droplet.status !== 'active'}
            onClick={() => performAction('reboot')}
            fullWidth
          />
          <ActionButton
            label="Power Cycle"
            description="Hard reset"
            actionType="power_cycle"
            variant="warning"
            loading={actionLoading === 'power_cycle'}
            disabled={droplet.locked || droplet.status !== 'active'}
            onClick={() => performAction('power_cycle')}
            fullWidth
          />
          <ActionButton
            label="Shutdown"
            description="Graceful shutdown"
            actionType="shutdown"
            variant="warning"
            loading={actionLoading === 'shutdown'}
            disabled={droplet.locked || droplet.status !== 'active'}
            onClick={() => performAction('shutdown')}
            fullWidth
          />
          <ActionButton
            label="Power On"
            description="Boot droplet"
            actionType="power_on"
            variant="success"
            loading={actionLoading === 'power_on'}
            disabled={droplet.locked || droplet.status === 'active'}
            onClick={() => performAction('power_on')}
            fullWidth
          />
        </div>
      </div>

      {/* Action Log */}
      <ActionLog actions={actions} />
    </div>
  );
}
