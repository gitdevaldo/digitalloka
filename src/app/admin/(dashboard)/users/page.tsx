'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
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

  const columns = [
    { key: 'id', label: 'User ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span> },
    { key: 'email', label: 'Email', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 700 }}>{row.email as string}</span> },
    { key: 'role', label: 'Role', render: (row: Record<string, unknown>) => <StatusBadge variant={(row.role as string) === 'admin' ? 'accent' : 'active'} label={row.role as string} showDot={false} /> },
    { key: 'is_active', label: 'Status', render: (row: Record<string, unknown>) => <StatusBadge variant={(row.is_active as boolean) ? 'active' : 'stopped'} label={(row.is_active as boolean) ? 'Active' : 'Blocked'} /> },
    { key: 'entitlements_count', label: 'Products', render: (row: Record<string, unknown>) => <span>{(row.entitlements_count as number) ?? 0}</span> },
    { key: 'last_sign_in_at', label: 'Last Active', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.last_sign_in_at ? formatDate(row.last_sign_in_at as string) : '—'}</span> },
    { key: 'actions', label: 'Actions', render: () => <Button size="sm">Manage</Button> },
  ];

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
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={users} />
          </div>
        </Panel>
      )}
    </div>
  );
}
