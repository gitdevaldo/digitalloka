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
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ provider: 'DigitalOcean', slug: '', vcpus: '', memory: '', disk: '', transfer: '', price_monthly: '', selling_price: '' });
  const [addingSave, setAddingSave] = useState(false);
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

  async function addManualSize() {
    if (!selectedProduct) return;
    setAddingSave(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock/sync-sizes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Failed to add size'); return; }
      showToast(`Size "${addForm.slug}" added for ${addForm.provider}`);
      setShowAddModal(false);
      setAddForm({ provider: 'DigitalOcean', slug: '', vcpus: '', memory: '', disk: '', transfer: '', price_monthly: '', selling_price: '' });
      await refreshStocks();
    } catch { showToast('Failed to add size'); }
    finally { setAddingSave(false); }
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
      key: 'selling_price',
      label: 'Price',
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
            ? `Manage VPS sizes & pricing for ${selectedProduct.name} — supports multiple providers`
            : `/admin/products/${selectedProduct.id}/stocks — stock entries for ${selectedProduct.name}`
          }
          actions={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedProduct(null); setStocks([]); }}>Back</Button>
              <Button size="sm" onClick={refreshStocks}>Refresh</Button>
              {isVpsProduct && (
                <>
                  <Button variant="accent" onClick={() => setShowAddModal(true)}>
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
              {isVpsProduct ? 'No sizes found. Click "+ Add Size" to add manually, or "Sync DO Sizes" to fetch from DigitalOcean.' : 'No stock items found.'}
            </div>
          ) : (
            <AdminTable columns={isVpsProduct ? vpsStockColumns : stockColumns} rows={filteredStocks} />
          )}
        </Panel>

        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowAddModal(false)} />
            <div style={{ position: 'relative', background: 'var(--card)', border: '3px solid var(--border)', borderRadius: 'var(--r-md)', padding: 24, width: 480, maxHeight: '90vh', overflow: 'auto', boxShadow: '6px 6px 0 var(--shadow)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 16 }}>Add VPS Size</h3>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Provider *</label>
                  <select
                    className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.8rem] font-semibold bg-input text-foreground"
                    value={addForm.provider}
                    onChange={e => setAddForm(f => ({ ...f, provider: e.target.value }))}
                  >
                    <option value="DigitalOcean">DigitalOcean</option>
                    <option value="AWS">AWS</option>
                    <option value="Google Cloud">Google Cloud</option>
                    <option value="Azure">Azure</option>
                    <option value="Linode">Linode</option>
                    <option value="Vultr">Vultr</option>
                    <option value="Hetzner">Hetzner</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Size Slug *</label>
                  <input
                    className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground font-mono"
                    placeholder="e.g. t3.micro, e2-micro, cx11"
                    value={addForm.slug}
                    onChange={e => setAddForm(f => ({ ...f, slug: e.target.value }))}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">vCPUs *</label>
                    <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground" placeholder="1" value={addForm.vcpus} onChange={e => setAddForm(f => ({ ...f, vcpus: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Memory (MB) *</label>
                    <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground" placeholder="1024" value={addForm.memory} onChange={e => setAddForm(f => ({ ...f, memory: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div>
                    <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Disk (GB) *</label>
                    <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground" placeholder="25" value={addForm.disk} onChange={e => setAddForm(f => ({ ...f, disk: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Transfer (TB)</label>
                    <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground" placeholder="1" value={addForm.transfer} onChange={e => setAddForm(f => ({ ...f, transfer: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1">Selling Price (IDR/mo) *</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.8rem] font-bold text-muted-foreground">Rp</span>
                      <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 text-[0.8rem] bg-input text-foreground font-bold" placeholder="50000" value={addForm.selling_price} onChange={e => setAddForm(f => ({ ...f, selling_price: e.target.value }))} />
                    </div>
                    {addForm.selling_price && Number(addForm.selling_price) > 0 && (
                      <div className="text-[0.65rem] text-muted-foreground mt-1">Displays as: {formatCurrency(Number(addForm.selling_price), 'IDR')}/mo</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 justify-end">
                <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
                <Button variant="accent" onClick={addManualSize} disabled={addingSave || !addForm.slug || !addForm.vcpus || !addForm.memory || !addForm.disk}>
                  {addingSave ? 'Adding...' : 'Add Size'}
                </Button>
              </div>
            </div>
          </div>
        )}
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
