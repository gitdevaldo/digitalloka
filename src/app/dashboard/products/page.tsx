'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function UserProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/user/products')
      .then((r) => r.json())
      .then((data) => { setProducts(data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (row: Record<string, unknown>) => {
        const product = row.product as Record<string, unknown> | undefined;
        return <span style={{ fontWeight: 700 }}>{(product?.name as string) || 'Unknown'}</span>;
      },
    },
    {
      key: 'product_type',
      label: 'Type',
      render: (row: Record<string, unknown>) => {
        const product = row.product as Record<string, unknown> | undefined;
        return (
          <span
            className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground"
            style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}
          >
            {(product?.product_type as string) || '—'}
          </span>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.status as string} label={row.status as string} />
      ),
    },
    {
      key: 'starts_at',
      label: 'Access',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
          {row.starts_at ? formatDate(row.starts_at as string) : '—'}
        </span>
      ),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)' }}>
          {row.expires_at ? formatDate(row.expires_at as string) : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (row: Record<string, unknown>) => (
        <Button size="sm" onClick={() => router.push(`/dashboard/products/${row.id}`)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="All Products" subtitle="Your purchased products and entitlements." />

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No purchased products" description="Products will appear here once you make a purchase." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={products} />
          </div>
        </Panel>
      )}
    </div>
  );
}
