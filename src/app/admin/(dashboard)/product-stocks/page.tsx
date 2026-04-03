'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { Button } from '@/components/ui/button';

export default function ProductStocksPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Stocks"
        subtitle="/admin/product-stocks — manage account inventory by product"
        actions={<Button size="sm">Refresh</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search active products by name/slug/type..." />
      </div>

      <Panel>
        <TableShell variant="admin">
          <thead><tr><th>ID</th><th>Product</th><th>Type</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr><td colSpan={6} className="text-center text-muted-foreground text-[0.8rem] py-8">Loading products...</td></tr>
          </tbody>
        </TableShell>
      </Panel>
    </div>
  );
}
