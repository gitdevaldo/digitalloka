'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

export default function ProductStocksPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Record<string, unknown> | null>(null);
  const [stocks, setStocks] = useState<Record<string, unknown>[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [stockFilter, setStockFilter] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const { showToast } = useToast();

  const isVpsProduct = selectedProduct?.product_type === 'vps_droplet';

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const productId = searchParams.get('product');
    if (productId && products.length > 0) {
      const product = products.find(p => String(p.id) === productId);
      if (product) openStockManagement(product);
    }
  }, [searchParams, products]);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch { showToast('Failed to load products'); }
    finally { setLoading(false); }
  }

  async function openStockManagement(product: Record<string, unknown>) {
    setSelectedProduct(product);
    setStocksLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/stock`);
      const data = await res.json();
      setStocks(data.data || []);
    } catch { showToast('Failed to load stocks'); }
    finally { setStocksLoading(false); }
  }

  async function refreshStocks() {
    if (!selectedProduct) return;
    setStocksLoading(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock`);
      const data = await res.json();
      setStocks(data.data || []);
    } catch { showToast('Failed to refresh stocks'); }
    finally { setStocksLoading(false); }
  }

  async function syncDoSizes() {
    if (!selectedProduct) return;
    setSyncing(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock/sync-sizes`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Sync failed');
        return;
      }
      showToast(`Synced ${data.synced} sizes (${data.created} new, ${data.updated} updated)`);
      await refreshStocks();
    } catch { showToast('Sync failed'); }
    finally { setSyncing(false); }
  }

  async function toggleStockStatus(stockId: number, currentStatus: string) {
    if (!selectedProduct) return;
    const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
    setTogglingId(stockId);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock/sync-sizes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock_item_id: stockId, status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Toggle failed');
        return;
      }
      setStocks(prev => prev.map(s =>
        (s.id as number) === stockId ? { ...s, status: newStatus } : s
      ));
    } catch { showToast('Toggle failed'); }
    finally { setTogglingId(null); }
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

  const filteredStocks = stocks.filter(s => {
    if (stockFilter && s.status !== stockFilter) return false;
    return true;
  });

  const productColumns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{`PRD-${String(row.id).padStart(3, '0')}`}</span>
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
      render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => openStockManagement(row)}>Manage Stock</Button>,
    },
  ];

  const vpsStockColumns = [
    {
      key: 'slug',
      label: 'Size Slug',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, unknown> | undefined;
        return (
          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', fontWeight: 700 }}>
            {(cred?.slug as string) || '—'}
          </span>
        );
      },
    },
    {
      key: 'specs',
      label: 'Specs',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, unknown> | undefined;
        if (!cred) return <span>—</span>;
        return (
          <div className="flex gap-1.5 flex-wrap">
            <span className="inline-flex bg-muted rounded text-[0.62rem] font-mono px-1.5 py-0.5 border border-border">
              {cred.vcpus as number} vCPU
            </span>
            <span className="inline-flex bg-muted rounded text-[0.62rem] font-mono px-1.5 py-0.5 border border-border">
              {formatMemory(cred.memory as number)}
            </span>
            <span className="inline-flex bg-muted rounded text-[0.62rem] font-mono px-1.5 py-0.5 border border-border">
              {cred.disk as number} GB disk
            </span>
            <span className="inline-flex bg-muted rounded text-[0.62rem] font-mono px-1.5 py-0.5 border border-border">
              {cred.transfer as number} TB transfer
            </span>
          </div>
        );
      },
    },
    {
      key: 'price',
      label: 'Price',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, unknown> | undefined;
        if (!cred) return <span>—</span>;
        return (
          <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>
            ${(cred.price_monthly as number)?.toFixed(0)}/mo
          </span>
        );
      },
    },
    {
      key: 'available',
      label: 'DO Available',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, unknown> | undefined;
        const available = cred?.available as boolean;
        return (
          <StatusBadge variant={available ? 'active' : 'stopped'} label={available ? 'Available' : 'Unavailable'} />
        );
      },
    },
    {
      key: 'status',
      label: 'Enabled',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        return (
          <StatusBadge
            variant={status === 'enabled' ? 'active' : status === 'disabled' ? 'stopped' : 'active'}
            label={status === 'enabled' ? 'Enabled' : status === 'disabled' ? 'Disabled' : 'Sold'}
          />
        );
      },
    },
    {
      key: 'unlimited',
      label: 'Unlimited',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.72rem', color: row.is_unlimited ? 'var(--quaternary)' : 'var(--muted-foreground)' }}>
          {row.is_unlimited ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        if (status === 'sold' && !(row.is_unlimited as boolean)) return <span className="text-[0.68rem] text-muted-foreground">Sold</span>;
        return (
          <Button
            size="sm"
            variant={status === 'enabled' ? 'ghost' : 'default'}
            disabled={togglingId === (row.id as number)}
            onClick={() => toggleStockStatus(row.id as number, status)}
          >
            {togglingId === (row.id as number) ? '...' : status === 'enabled' ? 'Disable' : 'Enable'}
          </Button>
        );
      },
    },
  ];

  const stockColumns = [
    {
      key: 'id',
      label: 'ID',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.68rem', color: 'var(--muted-foreground)' }}>{String(row.id).slice(0, 8)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        return (
          <StatusBadge
            variant={status === 'enabled' ? 'active' : status === 'disabled' ? 'stopped' : 'stopped'}
            label={status}
          />
        );
      },
    },
    {
      key: 'unlimited',
      label: 'Unlimited',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontSize: '0.72rem', color: row.is_unlimited ? 'var(--quaternary)' : 'var(--muted-foreground)' }}>
          {row.is_unlimited ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'credential_data',
      label: 'Credentials',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, string> | undefined;
        if (!cred) return <span>—</span>;
        return (
          <div className="flex gap-1 flex-wrap">
            {Object.entries(cred).map(([k, v]) => (
              <span key={k} className="inline-flex bg-muted rounded text-[0.62rem] font-mono px-1.5 py-0.5 border border-border">
                {k}: {String(v).slice(0, 20)}{String(v).length > 20 ? '...' : ''}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Added',
      style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties,
      render: (row: Record<string, unknown>) => <span>{row.created_at ? formatDate(row.created_at as string) : '—'}</span>,
    },
    {
      key: 'sold_at',
      label: 'Sold',
      style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties,
      render: (row: Record<string, unknown>) => <span>{row.sold_at ? formatDate(row.sold_at as string) : '—'}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        return (
          <div className="flex gap-1">
            {status !== 'sold' && (
              <Button
                size="sm"
                variant={status === 'enabled' ? 'ghost' : 'default'}
                disabled={togglingId === (row.id as number)}
                onClick={() => toggleStockStatus(row.id as number, status)}
              >
                {togglingId === (row.id as number) ? '...' : status === 'enabled' ? 'Disable' : 'Enable'}
              </Button>
            )}
            <Button size="sm" onClick={() => router.push(`/admin/product-stocks/${row.id}/edit?product=${selectedProduct?.id}`)}>Edit</Button>
            <Button size="sm" variant="ghost" style={{ color: 'var(--secondary)' }} onClick={() => router.push(`/admin/product-stocks/${row.id}/delete?product=${selectedProduct?.id}`)}>Delete</Button>
          </div>
        );
      },
    },
  ];

  if (selectedProduct) {
    const enabledCount = stocks.filter(s => s.status === 'enabled').length;
    const disabledCount = stocks.filter(s => s.status === 'disabled').length;
    const soldCount = stocks.filter(s => s.status === 'sold').length;

    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader
          title={isVpsProduct ? 'VPS Size Management' : 'Manage Product Stocks'}
          subtitle={isVpsProduct
            ? `Sync and manage DigitalOcean sizes for ${selectedProduct.name}`
            : `/admin/products/${selectedProduct.id}/stocks — stock entries for ${selectedProduct.name}`
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedProduct(null); setStocks([]); }}>Back</Button>
              <Button size="sm" onClick={refreshStocks}>Refresh</Button>
              {isVpsProduct && (
                <Button variant="accent" onClick={syncDoSizes} disabled={syncing}>
                  {syncing ? 'Syncing...' : 'Sync DO Sizes'}
                </Button>
              )}
              {!isVpsProduct && (
                <Button variant="accent" onClick={() => router.push(`/admin/product-stocks/add?product=${selectedProduct.id}&name=${encodeURIComponent(selectedProduct.name as string)}`)}>Add Stock</Button>
              )}
            </div>
          }
        />

        <Panel title={isVpsProduct ? `DigitalOcean Sizes: ${selectedProduct.name}` : `Stock Management: ${selectedProduct.name}`} actions={
          <div className="flex gap-3 items-center">
            <span className="text-[0.72rem] font-bold text-muted-foreground">{stocks.length} total</span>
            <span className="text-[0.68rem] text-green-600 font-bold">{enabledCount} enabled</span>
            <span className="text-[0.68rem] text-muted-foreground font-bold">{disabledCount} disabled</span>
            {soldCount > 0 && <span className="text-[0.68rem] text-amber-600 font-bold">{soldCount} sold</span>}
          </div>
        }>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <select
              className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
              {!isVpsProduct && <option value="sold">Sold</option>}
            </select>
          </div>
          {stocksLoading ? (
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          ) : filteredStocks.length === 0 ? (
            <div className="text-center text-muted-foreground text-[0.8rem] py-6">
              {isVpsProduct ? 'No sizes found. Click "Sync DO Sizes" to fetch from DigitalOcean.' : 'No stock items found.'}
            </div>
          ) : (
            <AdminTable columns={isVpsProduct ? vpsStockColumns : stockColumns} rows={filteredStocks} />
          )}
        </Panel>
      </div>
    );
  }

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
            <AdminTable columns={productColumns} rows={filtered} emptyText="No active products available for stock management." />
          </div>
        </Panel>
      )}
    </div>
  );
}
