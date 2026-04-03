import { cn } from '@/lib/utils';

interface TableShellProps {
  variant?: 'dashboard' | 'admin';
  children: React.ReactNode;
}

export function TableShell({ variant = 'dashboard', children }: TableShellProps) {
  const tableClass = variant === 'admin' ? 'tbl' : 'data-table';
  return (
    <div className="w-full overflow-x-auto p-1 rounded-lg">
      <table className={cn('w-full border-collapse', tableClass)}>
        {children}
      </table>
      <style jsx>{`
        .tbl th, .data-table th {
          text-align: left; font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.09em; color: var(--muted-foreground); padding: 10px;
          border-bottom: 2px solid var(--border); white-space: nowrap;
        }
        .tbl td, .data-table td {
          padding: 10px; font-size: 0.8rem; font-weight: 500; line-height: 1.25;
          border-bottom: 1px solid var(--border); vertical-align: middle; color: var(--foreground);
        }
        .tbl tr:last-child td, .data-table tr:last-child td { border-bottom: none; }
        .tbl tr:hover td, .data-table tr:hover td { background: var(--muted); }
      `}</style>
    </div>
  );
}
