'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import { useDataFetch } from '@/hooks/use-data-fetch';

function formatProductId(id: number | string): string {
  return `PRD-${String(id).padStart(3, '0')}`;
}

function formatPriceCompact(amount: number, currency = 'USD'): string {
  const n = Number(amount || 0);
  if (isNaN(n)) return `${currency.toUpperCase()} 0`;
  const isInt = Math.floor(n) === n;
  if (isInt) return `${currency.toUpperCase()} ${n.toLocaleString('en-US')}`;
  const trimmed = n.toFixed(2).replace(/\.00$/, '').replace(/(\.\d*[1-9])0$/, '$1');
  return `${currency.toUpperCase()} ${trimmed}`;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const [viewPayload, setViewPayload] = useState<Record<string, unknown> | null>(null);
  const { showToast } = useToast();

  const { data: products, loading, error, isEmpty, refetch: loadProducts } = useDataFetch<Record<string, unknown>[]>({
    url: '/api/admin/products',
    transform: (raw) => (raw as { data?: Record<string, unknown>[] }).data || [],
    onError: (msg) => showToast(msg || 'Failed to load products'),
  });

  async function toggleVisibility(product: Record<string, unknown>) {
    const isVisible = Boolean(product.is_visible);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: product.name,
          slug: product.slug,
          product_type: product.product_type,
          status: product.status,
          short_description: product.short_description || null,
          catalog_visibility: isVisible ? 'hidden' : 'visible',
        }),
      });
      if (!res.ok) { showToast('Failed to update visibility'); return; }
      showToast(`Product ${isVisible ? 'hidden' : 'visible'}.`);
      loadProducts();
    } catch { showToast('Failed to update visibility'); }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{formatProductId(row.id as number)}</span>
      ),
    },
    {
      key: 'name',
      label: 'Product Name',
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
        return <span style={{ color: 'var(--muted-foreground)' }}>{(cat?.name as string) || 'General'}</span>;
      },
    },
    {
      key: 'catalog_visibility',
      label: 'Visibility',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={Boolean(row.is_visible) ? 'active' : 'stopped'} label={Boolean(row.is_visible) ? 'visible' : 'hidden'} />
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (row: Record<string, unknown>) => {
        const prices = row.prices as Record<string, unknown>[] | undefined;
        const price = prices?.[0];
        return <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800 }}>{price ? formatPriceCompact(Number(price.amount), String(price.currency || 'USD')) : '—'}</span>;
      },
    },
    {
      key: 'updated_at',
      label: 'Updated',
      style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties,
      render: (row: Record<string, unknown>) => <span>{formatDate(row.updated_at as string)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => {
        const isVisible = Boolean(row.is_visible);
        const isAvailable = String(row.status || '').toLowerCase() === 'available';
        return (
          <div className="flex gap-1">
            {isVisible && isAvailable ? (
              <Button size="sm" onClick={() => router.push(`/admin/product-stocks?product=${row.id}`)}>Stocks</Button>
            ) : (
              <Button size="sm" variant="ghost" disabled title="Only active products can manage stocks">Stocks</Button>
            )}
            <Button size="sm" onClick={() => router.push(`/admin/products/${row.id}/edit`)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => toggleVisibility(row)}>{isVisible ? 'Hide' : 'Show'}</Button>
            <Button size="sm" variant="ghost" onClick={() => setViewPayload(row)}>View</Button>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Products"
        subtitle="/admin/products — full catalog management"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={loadProducts}>Refresh</Button>
            <Button variant="accent" onClick={() => router.push('/admin/products/create')}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Create Product
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Types</option><option>vps_droplet</option><option>digital</option><option>course</option><option>template</option>
        </select>
        <select className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]">
          <option>All Statuses</option><option>Active</option><option>Draft</option><option>Archived</option>
        </select>
        <input className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]" placeholder="Search product name or slug…" />
      </div>

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : error ? (
        <div>
          <EmptyState icon="⚠️" title="Failed to load" description={error} />
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <Button size="sm" onClick={loadProducts}>Retry</Button>
          </div>
        </div>
      ) : isEmpty || !products || products.length === 0 ? (
        <EmptyState icon="📦" title="No products" description="Create your first product." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={products} />
          </div>
        </Panel>
      )}

      <Modal open={!!viewPayload} onClose={() => setViewPayload(null)} title="Product Details">
        <pre className="text-[0.72rem] font-mono bg-muted p-4 rounded-lg overflow-auto max-h-[400px] whitespace-pre-wrap">{JSON.stringify(viewPayload, null, 2)}</pre>
      </Modal>
    </div>
  );
}
