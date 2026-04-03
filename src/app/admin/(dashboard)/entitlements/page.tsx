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
import { formatDate } from '@/lib/utils';

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
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

  async function updateStatus(status: string) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/entitlements/${selected.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Update failed'); return; }
      showToast(`Entitlement ${status}`);
      setSelected(null);
      loadEntitlements();
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

  const columns = [
    { key: 'id', label: 'ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span> },
    { key: 'user', label: 'User', render: (row: Record<string, unknown>) => { const u = row.user as Record<string, unknown> | undefined; return <span style={{ fontSize: '0.78rem' }}>{(u?.email as string) || '—'}</span>; } },
    { key: 'product', label: 'Product', render: (row: Record<string, unknown>) => { const p = row.product as Record<string, unknown> | undefined; return <span style={{ fontWeight: 700, fontSize: '0.82rem' }}>{(p?.name as string) || '—'}</span>; } },
    { key: 'order_id', label: 'Order', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{row.order_id ? String(row.order_id).slice(0, 8) : '—'}</span> },
    { key: 'status', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge variant={row.status as string} label={row.status as string} /> },
    { key: 'starts_at', label: 'Starts', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.starts_at ? formatDate(row.starts_at as string) : '—'}</span> },
    { key: 'expires_at', label: 'Expires', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.expires_at ? formatDate(row.expires_at as string) : '—'}</span> },
    { key: 'actions', label: 'Actions', render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => setSelected(row)}>Manage</Button> },
  ];

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

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Manage Entitlement">
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">User</span><span className="font-mono text-[0.72rem]">{(selected.user as Record<string, unknown>)?.email as string || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Product</span><span className="font-bold">{(selected.product as Record<string, unknown>)?.name as string || '—'}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Current Status</span><StatusBadge variant={selected.status as string} label={selected.status as string} /></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Expires</span><span>{selected.expires_at ? formatDate(selected.expires_at as string) : 'Never'}</span></div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Change Status</span>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'active', 'expired', 'revoked'].map(s => (
                  <Button key={s} size="sm" variant={selected.status === s ? 'accent' : 'ghost'} onClick={() => updateStatus(s)} disabled={saving}>{s}</Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
