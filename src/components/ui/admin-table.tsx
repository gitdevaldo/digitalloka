'use client';

import React from 'react';

export interface Column<T = Record<string, unknown>> {
  key: string;
  label: string;
  className?: string;
  style?: React.CSSProperties;
  render?: (row: T) => React.ReactNode;
}

interface AdminTableProps<T = Record<string, unknown>> {
  columns: Column<T>[];
  rows: T[];
  emptyText?: string;
  onRowClick?: (row: T) => void;
}

export function AdminTable<T extends Record<string, unknown>>({ columns, rows, emptyText = 'No data found.', onRowClick }: AdminTableProps<T>) {
  return (
    <div className="admin-table-shell">
      <table className="admin-tbl">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ color: 'var(--muted-foreground)', fontSize: '0.78rem' }}>{emptyText}</td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={(row.id as string | number) ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                style={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={col.className} style={col.style}>
                    {col.render ? col.render(row) : (row[col.key] as React.ReactNode) ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style jsx>{`
        .admin-table-shell {
          width: 100%;
          overflow-x: auto;
          padding: 4px 6px 6px;
          border-radius: 8px;
        }
        .admin-tbl {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        .admin-tbl th {
          text-align: left;
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: var(--muted-foreground);
          padding: 10px 10px;
          border-bottom: 2px solid var(--border);
          white-space: nowrap;
        }
        .admin-tbl td {
          padding: 10px 10px;
          font-size: 0.8rem;
          font-weight: 500;
          line-height: 1.25;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
          color: var(--foreground);
        }
        .admin-tbl th:first-child,
        .admin-tbl td:first-child {
          padding-left: 12px;
        }
        .admin-tbl th:last-child,
        .admin-tbl td:last-child {
          padding-right: 12px;
        }
        .admin-tbl tr:last-child td {
          border-bottom: none;
        }
        .admin-tbl tbody tr:hover td {
          background: var(--muted);
        }
      `}</style>
    </div>
  );
}
