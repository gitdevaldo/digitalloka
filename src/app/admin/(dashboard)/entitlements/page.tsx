'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

function formatEntitlementId(id: number | string): string {
  return `ENT-${String(id).padStart(3, '0')}`;
}

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadEntitlements(); }, []);

  async function loadEntitlements() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/entitlements');
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to load entitlements'); return; }
      setEntitlements(data.data || []);
    } catch { showToast('Failed to load entitlements'); }
    finally { setLoading(false); }
  }

  async function extendEntitlement(id: unknown, days: number) {
    try {
      const res = await fetch(`/api/admin/entitlements/${id}/extend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Extend failed'); return; }
      showToast(`Entitlement extended by ${days} days.`);
      loadEntitlements();
    } catch { showToast('Extend failed'); }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{formatEntitlementId(row.id as number)}</span> },
    { key: 'user', label: 'User', render: (row: Record<string, unknown>) => { const u = row.user as Record<string, unknown> | undefined; return <span className="font-bold" style={{ fontSize: '0.78rem' }}>{(u?.email as string) || '—'}</span>; } },
    { key: 'product', label: 'Product', render: (row: Record<string, unknown>) => { const p = row.product as Record<string, unknown> | undefined; return <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{(p?.name as string) || '—'}</span>; } },
    { key: 'order_item_id', label: 'Order', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{row.order_item_id ? `ITEM-${row.order_item_id}` : '—'}</span> },
    { key: 'status', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge variant={row.status as string} label={row.status as string} /> },
    { key: 'starts_at', label: 'Starts', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.starts_at ? formatDate(row.starts_at as string) : '—'}</span> },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 700, fontSize: '0.8rem', color: row.status === 'expiring' ? 'var(--secondary)' : 'var(--foreground)' }}>
          {row.expires_at ? formatDate(row.expires_at as string) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" style={{ color: 'var(--quaternary)' }} onClick={() => updateStatusDirect(row.id, 'active')} disabled={saving}>Activate</Button>
          <Button size="sm" variant="ghost" style={{ color: 'var(--tertiary)' }} onClick={() => updateStatusDirect(row.id, 'pending')} disabled={saving}>Pending</Button>
          <Button size="sm" variant="ghost" style={{ color: 'var(--secondary)' }} onClick={() => updateStatusDirect(row.id, 'revoked')} disabled={saving}>Revoke</Button>
          <Button size="sm" onClick={() => extendEntitlement(row.id, 30)}>+30d</Button>
        </div>
      ),
    },
  ];

  async function updateStatusDirect(id: unknown, status: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/entitlements/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Update failed'); return; }
      showToast(`Entitlement ${status}`);
      loadEntitlements();
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Entitlements" subtitle="/admin/entitlements — license and access lifecycle" actions={<Button size="sm" onClick={loadEntitlements}>Refresh</Button>} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Expiring</option><option>Suspended</option><option>Revoked</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search user email or product name…" />
      </div>

      {loading ? (
        <Panel><div className="h-24 bg-muted rounded-lg animate-pulse" /></Panel>
      ) : entitlements.length === 0 ? (
        <EmptyState icon="🔑" title="No entitlements" description="Entitlements will appear here when orders are fulfilled." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={entitlements} />
          </div>
        </Panel>
      )}
    </div>
  );
}
