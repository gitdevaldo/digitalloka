'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';

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
    <div className="animate-fade-up">
      <PageHeader title="Users" subtitle="Manage user roles and access." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : users.length === 0 ? (
        <EmptyState icon="👥" title="No users" description="Users will appear here." />
      ) : (
        <Panel title="All Users" variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id as string}>
                  <td className="font-bold">{u.email as string}</td>
                  <td><StatusBadge variant={(u.role as string) === 'admin' ? 'accent' : 'active'} label={u.role as string} showDot={false} /></td>
                  <td><StatusBadge variant={(u.is_active as boolean) ? 'active' : 'stopped'} label={(u.is_active as boolean) ? 'Active' : 'Inactive'} /></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
