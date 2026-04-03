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

export default function EntitlementsPage() {
  const [entitlements, setEntitlements] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { loadEntitlements(); }, []);

  async function loadEntitlements() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/entitlements');
      const data = await res.json();
      setEntitlements(data.data || []);
    } catch { showToast('Failed to load entitlements'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Entitlements" subtitle="/admin/entitlements — license and access lifecycle" />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Expiring</option><option>Suspended</option><option>Revoked</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search user email or product name…" />
      </div>

      {loading ? (
        <Panel>
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
        </Panel>
      ) : entitlements.length === 0 ? (
        <EmptyState icon="🔑" title="No entitlements" description="Entitlements will appear here when orders are fulfilled." />
      ) : (
        <Panel>
          <TableShell variant="admin">
            <thead><tr><th>ID</th><th>User</th><th>Product</th><th>Order</th><th>Status</th><th>Starts</th><th>Expires</th><th>Actions</th></tr></thead>
            <tbody>
              {entitlements.map((e) => {
                const user = e.user as Record<string, unknown> | undefined;
                const product = e.product as Record<string, unknown> | undefined;
                return (
                  <tr key={e.id as number}>
                    <td className="font-mono text-[0.72rem] text-muted-foreground">{String(e.id).slice(0, 8)}</td>
                    <td className="text-[0.78rem]">{user?.email as string || '—'}</td>
                    <td className="font-bold text-[0.82rem]">{product?.name as string || '—'}</td>
                    <td className="font-mono text-[0.72rem] text-muted-foreground">{e.order_id ? String(e.order_id).slice(0, 8) : '—'}</td>
                    <td><StatusBadge variant={e.status as string} label={e.status as string} /></td>
                    <td className="text-[0.72rem] text-muted-foreground">{e.starts_at ? formatDate(e.starts_at as string) : '—'}</td>
                    <td className="text-[0.72rem] text-muted-foreground">{e.expires_at ? formatDate(e.expires_at as string) : '—'}</td>
                    <td><Button size="sm">Manage</Button></td>
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
