'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayload, setSelectedPayload] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((data) => { setLogs(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resultColor = (r: string) => r === 'fail' ? 'var(--secondary)' : r === 'warn' ? 'var(--tertiary)' : 'var(--quaternary)';

  const columns = [
    { key: 'id', label: 'Event ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span> },
    { key: 'actor_user_id', label: 'Actor', render: (row: Record<string, unknown>) => <span style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{(row.actor_user_id as string) || 'system'}</span> },
    { key: 'action', label: 'Action', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 600, fontSize: '0.78rem' }}>{row.action as string}</span> },
    { key: 'target_type', label: 'Target Type', style: { fontSize: '0.78rem', color: 'var(--muted-foreground)' } as React.CSSProperties },
    { key: 'target_id', label: 'Target ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{row.target_id ? String(row.target_id).slice(0, 8) : '—'}</span> },
    {
      key: 'result',
      label: 'Result',
      render: (row: Record<string, unknown>) => {
        const changes = (row.changes as Record<string, unknown>) || {};
        const result = row.action && String(row.action).toLowerCase().includes('fail') ? 'fail' : changes.error ? 'fail' : changes.warning ? 'warn' : 'ok';
        return <span style={{ fontSize: '0.72rem', fontWeight: 700, color: resultColor(result) }}>{result.toUpperCase()}</span>;
      },
    },
    { key: 'created_at', label: 'Timestamp', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.created_at ? formatDate(row.created_at as string) : '—'}</span> },
    {
      key: 'payload',
      label: 'Payload',
      render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => setSelectedPayload((row.changes as Record<string, unknown>) || {})}>View</Button>,
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Audit Logs"
        subtitle="/admin/audit-logs — full event history"
        actions={<Button size="sm" variant="ghost">Export CSV</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Actors</option><option>admin@dl.dev</option><option>system</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Actions</option><option>droplet.*</option><option>entitlement.*</option><option>user.*</option><option>product.*</option><option>order.*</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Results</option><option>ok</option><option>fail</option><option>warn</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search target ID or actor…" />
        <input type="date" className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)] w-auto" />
        <input type="date" className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)] w-auto" />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : logs.length === 0 ? (
        <EmptyState icon="📝" title="No audit logs" description="Audit entries will appear here." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={logs} />
          </div>
        </Panel>
      )}

      <Modal open={!!selectedPayload} onClose={() => setSelectedPayload(null)} title="Event Payload">
        <pre className="text-[0.72rem] font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(selectedPayload, null, 2)}</pre>
      </Modal>
    </div>
  );
}
