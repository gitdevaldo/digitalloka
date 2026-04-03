import { cn } from '@/lib/utils';

interface TableShellProps {
  variant?: 'dashboard' | 'admin';
  children: React.ReactNode;
}

export function TableShell({ variant = 'dashboard', children }: TableShellProps) {
  const isAdmin = variant === 'admin';
  return (
    <div className={cn('w-full overflow-x-auto', isAdmin ? 'px-1.5 py-1 rounded-lg' : 'p-1 rounded-lg')}>
      <table className={cn('w-full', isAdmin ? 'tbl' : 'data-table')}>
        {children}
      </table>
      <style jsx>{`
        .tbl, .data-table { border-collapse: separate; border-spacing: 0; }
        .tbl th, .data-table th {
          text-align: left; font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--muted-foreground); padding: 10px;
          border-bottom: 2px solid var(--border); white-space: nowrap;
        }
        .tbl td, .data-table td {
          padding: 10px; font-size: 0.8rem; font-weight: 500; line-height: 1.25;
          border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--foreground);
        }
        .tbl th:first-child, .tbl td:first-child { padding-left: 12px; }
        .tbl th:last-child, .tbl td:last-child { padding-right: 12px; }
        .tbl tr:last-child td, .data-table tr:last-child td { border-bottom: none; }
        .tbl tr:hover td, .data-table tr:hover td { background: var(--muted); }
      `}</style>
    </div>
  );
}
