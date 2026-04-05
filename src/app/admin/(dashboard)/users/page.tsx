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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to load users'); return; }
      setUsers(data.data || []);
    } catch { showToast('Failed to load users'); }
    finally { setLoading(false); }
  }

  async function updateAccess(updates: Record<string, unknown>) {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${selected.id}/access`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) { const r = await res.json(); showToast(r.error || 'Update failed'); return; }
      showToast('User updated');
      setSelected(null);
      loadUsers();
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

  const columns = [
    { key: 'id', label: 'User ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span> },
    { key: 'email', label: 'Email', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 700 }}>{row.email as string}</span> },
    { key: 'role', label: 'Role', render: (row: Record<string, unknown>) => <StatusBadge variant={(row.role as string) === 'admin' ? 'accent' : 'active'} label={row.role as string} showDot={false} /> },
    { key: 'is_active', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge variant={(row.is_active as boolean) ? 'active' : 'stopped'} label={(row.is_active as boolean) ? 'Active' : 'Blocked'} /> },
    { key: 'orders_count', label: 'Orders', render: (row: Record<string, unknown>) => <span>{(row.orders_count as number) ?? 0}</span> },
    { key: 'last_sign_in_at', label: 'Last Active', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.last_sign_in_at ? formatDate(row.last_sign_in_at as string) : '—'}</span> },
    { key: 'actions', label: 'Actions', render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => setSelected(row)}>Manage</Button> },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Users" subtitle="/admin/users — user management and access control" actions={<Button size="sm" onClick={loadUsers}>Refresh</Button>} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Roles</option><option>user</option><option>admin</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Blocked</option><option>Pending</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search email or user ID…" />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users" description="Users will appear here." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={users} />
          </div>
        </Panel>
      )}

      <Modal open={!!selected} onClose={() => setSelected(null)} title={`User: ${selected?.email || ''}`}>
        {selected && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-[0.82rem]">
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">User ID</span><span className="font-mono text-[0.72rem]">{String(selected.id).slice(0, 12)}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Email</span><span className="font-bold">{selected.email as string}</span></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Role</span><StatusBadge variant={(selected.role as string) === 'admin' ? 'accent' : 'active'} label={selected.role as string} showDot={false} /></div>
              <div><span className="text-muted-foreground font-semibold block text-xs uppercase">Status</span><StatusBadge variant={(selected.is_active as boolean) ? 'active' : 'stopped'} label={(selected.is_active as boolean) ? 'Active' : 'Blocked'} /></div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Change Role</span>
              <div className="flex gap-2">
                <Button size="sm" variant={selected.role === 'user' ? 'accent' : 'ghost'} onClick={() => updateAccess({ role: 'user' })} disabled={saving}>User</Button>
                <Button size="sm" variant={selected.role === 'admin' ? 'accent' : 'ghost'} onClick={() => updateAccess({ role: 'admin' })} disabled={saving}>Admin</Button>
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Account Access</span>
              <div className="flex gap-2">
                <Button size="sm" variant={selected.is_active ? 'accent' : 'ghost'} onClick={() => updateAccess({ is_active: true })} disabled={saving}>Activate</Button>
                <Button size="sm" variant={!selected.is_active ? 'danger' : 'ghost'} onClick={() => updateAccess({ is_active: false })} disabled={saving}>Block</Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
