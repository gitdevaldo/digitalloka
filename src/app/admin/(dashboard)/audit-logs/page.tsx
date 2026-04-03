'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

function formatAuditId(id: number | string): string {
  return `EVT-${String(id).padStart(4, '0')}`;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayload, setSelectedPayload] = useState<Record<string, unknown> | null>(null);
  const { showToast } = useToast();

  useEffect(() => { loadLogs(); }, []);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to load audit logs'); return; }
      setLogs(data.data || []);
    } catch { showToast('Failed to load audit logs'); }
    finally { setLoading(false); }
  }

  function exportCSV() {
    if (logs.length === 0) { showToast('No logs to export'); return; }
    const headers = ['id', 'actor', 'action', 'target_type', 'target_id', 'result', 'created_at'];
    const csvRows = [headers.join(',')];
    logs.forEach(log => {
      csvRows.push(headers.map(h => `"${String(log[h] || '')}"`).join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV exported');
  }

  const columns = [
    { key: 'id', label: 'Event ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{formatAuditId(row.id as number)}</span> },
    { key: 'actor', label: 'Actor', render: (row: Record<string, unknown>) => <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', fontWeight: 700 }}>{(row.actor as string) || (row.actor_user_id as string) || 'system'}</span> },
    { key: 'action', label: 'Action', render: (row: Record<string, unknown>) => <span style={{ fontWeight: 700, fontSize: '0.78rem' }}>{row.action as string}</span> },
    { key: 'target_type', label: 'Target Type', render: (row: Record<string, unknown>) => <span className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground" style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}>{row.target_type as string}</span> },
    { key: 'target_id', label: 'Target ID', render: (row: Record<string, unknown>) => <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{(row.target_id as string) || '—'}</span> },
    {
      key: 'result',
      label: 'Result',
      render: (row: Record<string, unknown>) => {
        const result = String(row.result || 'ok').toLowerCase();
        return <StatusBadge variant={result === 'ok' ? 'active' : result === 'fail' || result === 'failed' ? 'stopped' : 'pending'} label={result} />;
      },
    },
    { key: 'created_at', label: 'Timestamp', style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties, render: (row: Record<string, unknown>) => <span>{row.created_at ? formatDate(row.created_at as string) : '—'}</span> },
    {
      key: 'payload',
      label: 'Payload',
      render: (row: Record<string, unknown>) => <Button size="sm" variant="ghost" onClick={() => setSelectedPayload((row.changes as Record<string, unknown>) || row)}>Payload</Button>,
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Audit Logs"
        subtitle="/admin/audit-logs — full event history"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={loadLogs}>Refresh</Button>
            <Button size="sm" variant="ghost" onClick={exportCSV}>Export CSV</Button>
          </div>
        }
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
