'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span>
      ),
    },
    {
      key: 'name',
      label: 'Product',
      render: (row: Record<string, unknown>) => (
        <div>
          <div style={{ fontWeight: 700 }}>{row.name as string}</div>
          <div style={{ fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{row.slug as string}</div>
        </div>
      ),
    },
    {
      key: 'product_type',
      label: 'Type',
      render: (row: Record<string, unknown>) => (
        <span
          className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground"
          style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}
        >
          {row.product_type as string}
        </span>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row: Record<string, unknown>) => {
        const cat = row.category as Record<string, unknown> | undefined;
        return <span>{(cat?.name as string) || '—'}</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.status === 'available' ? 'active' : 'stopped'} label={row.status as string} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: () => <Button size="sm">Manage Stock</Button>,
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Stocks"
        subtitle="/admin/product-stocks — manage account inventory by product"
        actions={<Button size="sm" onClick={loadProducts}>Refresh</Button>}
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <input
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)] min-w-[200px]"
          placeholder="Search active products by name/slug/type..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Panel><div className="h-24 bg-muted rounded-lg animate-pulse" /></Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No products found" description={search ? 'No products match your search.' : 'No active products available for stock management.'} />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={filtered} emptyText="No active products available for stock management." />
          </div>
        </Panel>
      )}
    </div>
  );
}
