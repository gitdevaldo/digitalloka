'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
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

  const resultColor = (r: string) => r === 'fail' ? 'text-secondary' : r === 'warn' ? 'text-tertiary' : 'text-quaternary';

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
        <Panel variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Event ID</th><th>Actor</th><th>Action</th><th>Target Type</th><th>Target ID</th><th>Result</th><th>Timestamp</th><th>Payload</th></tr></thead>
            <tbody>
              {logs.map((log) => {
                const changes = (log.changes as Record<string, unknown>) || {};
                const result = log.action && String(log.action).toLowerCase().includes('fail') ? 'fail'
                  : changes.error ? 'fail' : changes.warning ? 'warn' : 'ok';
                return (
                  <tr key={log.id as number}>
                    <td className="font-mono text-[0.68rem] text-muted-foreground">{String(log.id).slice(0, 8)}</td>
                    <td className="text-[0.78rem] font-mono">{(log.actor_user_id as string) || 'system'}</td>
                    <td className="font-semibold text-[0.78rem]">{log.action as string}</td>
                    <td className="text-[0.78rem] text-muted-foreground">{log.target_type as string}</td>
                    <td className="font-mono text-[0.68rem] text-muted-foreground">{log.target_id ? String(log.target_id).slice(0, 8) : '—'}</td>
                    <td className={`text-[0.72rem] font-bold ${resultColor(result)}`}>{result.toUpperCase()}</td>
                    <td className="text-[0.72rem] text-muted-foreground">{log.created_at ? formatDate(log.created_at as string) : '—'}</td>
                    <td><Button size="sm" onClick={() => setSelectedPayload(changes)}>View</Button></td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Panel>
      )}

      <Modal open={!!selectedPayload} onClose={() => setSelectedPayload(null)} title="Event Payload">
        <pre className="text-[0.72rem] font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(selectedPayload, null, 2)}</pre>
      </Modal>
    </div>
  );
}
