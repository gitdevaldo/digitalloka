'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function UserProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="All Products" subtitle="Your purchased products and entitlements." />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--radius-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Types</option><option>VPS Droplet</option><option>Digital</option><option>Course</option><option>Template</option>
        </select>
        <select className="border-2 border-border rounded-[var(--radius-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Expiring</option><option>Suspended</option>
        </select>
        <input className="border-2 border-border rounded-[var(--radius-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search product name..." />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No purchased products" description="Products will appear here once you make a purchase." />
      ) : (
        <Panel>
          <TableShell variant="dashboard">
            <thead><tr><th>Product</th><th>Type</th><th>Status</th><th>Access</th><th>Expires</th></tr></thead>
            <tbody>
              {products.map((item) => {
                const product = item.product as Record<string, unknown> | undefined;
                return (
                  <tr key={item.id as number}>
                    <td className="font-bold">{product?.name as string || 'Unknown'}</td>
                    <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">{product?.product_type as string || '—'}</span></td>
                    <td><StatusBadge variant={item.status as string} label={item.status as string} /></td>
                    <td className="text-[0.8rem] text-muted-foreground">{item.starts_at ? new Date(item.starts_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                    <td className="text-[0.8rem] text-muted-foreground">{item.expires_at ? new Date(item.expires_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
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
