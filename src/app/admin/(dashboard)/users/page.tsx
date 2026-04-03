'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((data) => { setUsers(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Users" subtitle="/admin/users — user management and access control" />

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
        <Panel variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>User ID</th><th>Email</th><th>Role</th><th>Status</th><th>Products</th><th>Last Active</th><th>Actions</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id as string}>
                  <td className="font-mono text-[0.72rem] text-muted-foreground">{String(u.id).slice(0, 8)}</td>
                  <td className="font-bold">{u.email as string}</td>
                  <td><StatusBadge variant={(u.role as string) === 'admin' ? 'accent' : 'active'} label={u.role as string} showDot={false} /></td>
                  <td><StatusBadge variant={(u.is_active as boolean) ? 'active' : 'stopped'} label={(u.is_active as boolean) ? 'Active' : 'Blocked'} /></td>
                  <td className="text-[0.8rem]">{(u.entitlements_count as number) ?? 0}</td>
                  <td className="text-[0.72rem] text-muted-foreground">{u.last_sign_in_at ? formatDate(u.last_sign_in_at as string) : '—'}</td>
                  <td><Button size="sm">Manage</Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
