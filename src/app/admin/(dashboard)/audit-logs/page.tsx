'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit-logs')
      .then((r) => r.json())
      .then((data) => { setLogs(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const resultColor = (r: string) => r === 'fail' ? 'text-secondary' : r === 'warn' ? 'text-tertiary' : 'text-quaternary';

  return (
    <div className="animate-fade-up">
      <PageHeader title="Audit Logs" subtitle="Track administrative and system actions." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : logs.length === 0 ? (
        <EmptyState icon="📝" title="No audit logs" description="Audit entries will appear here." />
      ) : (
        <Panel title="Recent Activity" variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Actor</th><th>Action</th><th>Target</th><th>Result</th><th>Date</th></tr></thead>
            <tbody>
              {logs.map((log) => {
                const changes = (log.changes as Record<string, unknown>) || {};
                const result = log.action && String(log.action).toLowerCase().includes('fail') ? 'fail'
                  : changes.error ? 'fail' : changes.warning ? 'warn' : 'ok';
                return (
                  <tr key={log.id as number}>
                    <td className="text-xs font-mono">{(log.actor_user_id as string) || 'system'}</td>
                    <td className="font-semibold text-xs">{log.action as string}</td>
                    <td className="text-xs text-muted-foreground">{log.target_type as string}{log.target_id ? `:${log.target_id}` : ''}</td>
                    <td className={`text-xs font-bold ${resultColor(result)}`}>{result.toUpperCase()}</td>
                    <td className="text-xs text-muted-foreground">{log.created_at ? formatDate(log.created_at as string) : '-'}</td>
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
