'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

export default function ProductStocksPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { showToast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch { showToast('Failed to load products'); }
    finally { setLoading(false); }
  }

  const filtered = products.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      String(p.name || '').toLowerCase().includes(s) ||
      String(p.slug || '').toLowerCase().includes(s) ||
      String(p.product_type || '').toLowerCase().includes(s)
    );
  });

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Stocks"
        subtitle="/admin/product-stocks — manage account inventory by product"
        actions={<Button size="sm" onClick={loadProducts}>Refresh</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)] flex-1 min-w-[200px]"
          placeholder="Search active products by name/slug/type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Panel>
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
        </Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No products found" description={search ? 'No products match your search.' : 'Create a product first to manage stock.'} />
      ) : (
        <Panel>
          <TableShell variant="admin">
            <thead><tr><th>ID</th><th>Product</th><th>Type</th><th>Category</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((p) => {
                const category = p.category as Record<string, unknown> | undefined;
                return (
                  <tr key={p.id as number}>
                    <td className="font-mono text-[0.72rem] text-muted-foreground">{String(p.id).slice(0, 8)}</td>
                    <td><div className="font-bold">{p.name as string}</div><div className="text-[0.68rem] text-muted-foreground">{p.slug as string}</div></td>
                    <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">{p.product_type as string}</span></td>
                    <td className="text-[0.8rem]">{category?.name as string || '—'}</td>
                    <td><StatusBadge variant={p.status === 'available' ? 'active' : 'stopped'} label={p.status as string} /></td>
                    <td><Button size="sm">Manage Stock</Button></td>
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
