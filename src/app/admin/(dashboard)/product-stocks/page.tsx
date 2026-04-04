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
import { formatDate, formatCurrency } from '@/lib/utils';

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

function isLinkValue(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

function maskValue(value: string): string {
  if (isLinkValue(value)) return value;
  return '*'.repeat(Math.min(value.length, 20));
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
  const [stockPage, setStockPage] = useState(1);
  const [syncing, setSyncing] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [revealedIds, setRevealedIds] = useState<Set<number>>(new Set());
  const { showToast } = useToast();
  const STOCKS_PER_PAGE = 20;

  const toggleReveal = (id: number) => {
    setRevealedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

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

  function getProvider(row: Record<string, unknown>): string {
    const meta = row.meta as Record<string, unknown> | undefined;
    if (meta?.provider) return meta.provider as string;
    if (meta?.type === 'manual_size') return (meta?.provider as string) || 'Manual';
    const cred = row.credential_data as Record<string, unknown> | undefined;
    if (cred?.slug && typeof cred.slug === 'string' && cred.slug.startsWith('s-')) return 'DigitalOcean';
    return 'Unknown';
  }

  function getSellingPrice(row: Record<string, unknown>): number | null {
    const meta = row.meta as Record<string, unknown> | undefined;
    if (meta?.selling_price !== undefined) return Number(meta.selling_price);
    return null;
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
  const totalStockPages = Math.max(1, Math.ceil(filteredStocks.length / STOCKS_PER_PAGE));
  const paginatedStocks = filteredStocks.slice((stockPage - 1) * STOCKS_PER_PAGE, stockPage * STOCKS_PER_PAGE);

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

  const providerColors: Record<string, string> = {
    DigitalOcean: '#0080FF',
    AWS: '#FF9900',
    'Google Cloud': '#4285F4',
    Azure: '#0078D4',
    Linode: '#00A95C',
    Vultr: '#007BFC',
    Hetzner: '#D50C2D',
  };

  const vpsStockColumns = [
    {
      key: 'provider',
      label: 'Provider',
      render: (row: Record<string, unknown>) => {
        const provider = getProvider(row);
        const color = providerColors[provider] || 'var(--muted-foreground)';
        return (
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.03em' }}>
            {provider}
          </span>
        );
      },
    },
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
      key: 'provider_price',
      label: 'Provider Price',
      render: (row: Record<string, unknown>) => {
        const cred = row.credential_data as Record<string, unknown> | undefined;
        const pm = cred?.price_monthly as number;
        if (!pm && pm !== 0) return <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>—</span>;
        return (
          <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>
            ${pm.toFixed(0)}/mo
          </span>
        );
      },
    },
    {
      key: 'selling_price',
      label: 'Sell Price',
      render: (row: Record<string, unknown>) => {
        const sp = getSellingPrice(row);
        if (sp !== null && sp > 0) {
          return <span style={{ fontWeight: 700, fontSize: '0.75rem' }}>{formatCurrency(sp, 'IDR')}/mo</span>;
        }
        return <span style={{ fontSize: '0.72rem', color: 'var(--secondary)', fontWeight: 600 }}>Not set</span>;
      },
    },
    {
      key: 'status',
      label: 'Status',
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
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => {
        const status = row.status as string;
        const isSold = status === 'sold' && !(row.is_unlimited as boolean);
        return (
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={() => router.push(`/admin/product-stocks/${row.id}/edit-vps?product=${selectedProduct?.id}`)}
            >
              Edit
            </Button>
            {!isSold && (
              <Button
                size="sm"
                variant={status === 'enabled' ? 'ghost' : 'default'}
                disabled={togglingId === (row.id as number)}
                onClick={() => toggleStockStatus(row.id as number, status)}
              >
                {togglingId === (row.id as number) ? '...' : status === 'enabled' ? 'Disable' : 'Enable'}
              </Button>
            )}
          </div>
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
        const entries = Object.entries(cred);
        if (entries.length === 0) return <span style={{ color: 'var(--muted-foreground)', fontSize: '0.72rem' }}>Empty</span>;
        const rowId = row.id as number;
        const revealed = revealedIds.has(rowId);
        const hasSecret = entries.some(([, v]) => !isLinkValue(String(v)));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {entries.map(([k, v]) => {
              const val = String(v);
              const display = revealed ? val : maskValue(val);
              return (
                <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.03em', minWidth: '60px', flexShrink: 0 }}>
                    {k}
                  </span>
                  <span className="font-mono" style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--foreground)', wordBreak: 'break-all' }}>
                    {display.slice(0, 30)}{display.length > 30 ? '…' : ''}
                  </span>
                </div>
              );
            })}
            {hasSecret && (
              <button
                onClick={() => toggleReveal(rowId)}
                style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0', textAlign: 'left' }}
              >
                {revealed ? 'Hide' : 'Reveal'}
              </button>
            )}
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
      key: 'sold_to',
      label: 'Sold To',
      style: { fontSize: '0.72rem', color: 'var(--muted-foreground)' } as React.CSSProperties,
      render: (row: Record<string, unknown>) => {
        const soldUser = row.sold_user as { id: string; email: string } | null;
        if (!soldUser) return <span>—</span>;
        return (
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--foreground)' }}>{soldUser.email}</span>
        );
      },
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
            ? `Manage VPS sizes & pricing for ${selectedProduct.name} — supports multiple providers`
            : `/admin/products/${selectedProduct.id}/stocks — stock entries for ${selectedProduct.name}`
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedProduct(null); setStocks([]); }}>Back</Button>
              <Button size="sm" onClick={refreshStocks}>Refresh</Button>
              {isVpsProduct && (
                <>
                  <Button variant="accent" onClick={() => router.push(`/admin/product-stocks/add-vps?product=${selectedProduct.id}&name=${encodeURIComponent(selectedProduct.name as string)}`)}>
                    + Add Size
                  </Button>
                  <Button variant="accent" onClick={syncDoSizes} disabled={syncing}>
                    {syncing ? 'Syncing...' : 'Sync DO Sizes'}
                  </Button>
                </>
              )}
              {!isVpsProduct && (
                <Button variant="accent" onClick={() => router.push(`/admin/product-stocks/add?product=${selectedProduct.id}&name=${encodeURIComponent(selectedProduct.name as string)}`)}>Add Stock</Button>
              )}
            </div>
          }
        />

        <Panel title={isVpsProduct ? `VPS Sizes: ${selectedProduct.name}` : `Stock Management: ${selectedProduct.name}`} actions={
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
              onChange={(e) => { setStockFilter(e.target.value); setStockPage(1); }}
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
              {isVpsProduct ? 'No sizes found. Click "+ Add Size" to add manually, or "Sync DO Sizes" to fetch from DigitalOcean.' : 'No stock items found.'}
            </div>
          ) : (
            <>
              <AdminTable columns={isVpsProduct ? vpsStockColumns : stockColumns} rows={paginatedStocks} />
              {totalStockPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                  <span className="text-[0.72rem] text-muted-foreground font-medium">
                    Showing {(stockPage - 1) * STOCKS_PER_PAGE + 1}–{Math.min(stockPage * STOCKS_PER_PAGE, filteredStocks.length)} of {filteredStocks.length}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button size="sm" variant="ghost" disabled={stockPage === 1} onClick={() => setStockPage(1)}>«</Button>
                    <Button size="sm" variant="ghost" disabled={stockPage === 1} onClick={() => setStockPage(p => p - 1)}>‹ Prev</Button>
                    <span className="text-[0.72rem] font-bold px-2">Page {stockPage} of {totalStockPages}</span>
                    <Button size="sm" variant="ghost" disabled={stockPage === totalStockPages} onClick={() => setStockPage(p => p + 1)}>Next ›</Button>
                    <Button size="sm" variant="ghost" disabled={stockPage === totalStockPages} onClick={() => setStockPage(totalStockPages)}>»</Button>
                  </div>
                </div>
              )}
            </>
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
