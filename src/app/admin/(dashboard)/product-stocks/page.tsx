'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function ProductStocksPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Record<string, unknown> | null>(null);
  const [stocks, setStocks] = useState<Record<string, unknown>[]>([]);
  const [stocksLoading, setStocksLoading] = useState(false);
  const [addStockOpen, setAddStockOpen] = useState(false);
  const [headers, setHeaders] = useState('Email|Password|Recovery Code');
  const [rows, setRows] = useState('');
  const [importing, setImporting] = useState(false);
  const [stockFilter, setStockFilter] = useState('');
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

  async function handleImportStock(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct || !rows.trim()) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: headers.split('|').map(h => h.trim()),
          rows: rows,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Import failed');
        return;
      }
      showToast(`Imported ${result.inserted} of ${result.total_lines} stock items`);
      setAddStockOpen(false);
      setRows('');
      refreshStocks();
    } catch { showToast('Import failed'); }
    finally { setImporting(false); }
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
      render: (row: Record<string, unknown>) => <Button size="sm" onClick={() => openStockManagement(row)}>Manage Stock</Button>,
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
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.status === 'unsold' ? 'active' : 'stopped'} label={row.status as string} />
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
  ];

  if (selectedProduct) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader
          title="Manage Product Stocks"
          subtitle={`/admin/products/${String(selectedProduct.id).slice(0, 8)}/stocks — stock entries for ${selectedProduct.name}`}
          actions={
            <div className="flex gap-2">
              <Button size="sm" onClick={() => { setSelectedProduct(null); setStocks([]); }}>Back</Button>
              <Button size="sm" onClick={refreshStocks}>Refresh</Button>
              <Button variant="accent" onClick={() => setAddStockOpen(true)}>Add Stock</Button>
            </div>
          }
        />

        <Panel title={`Stock Management: ${selectedProduct.name}`} actions={
          <span className="text-[0.72rem] font-bold text-muted-foreground">{stocks.length} total items</span>
        }>
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <select
              className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent"
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="unsold">unsold</option>
              <option value="sold">sold</option>
            </select>
          </div>
          {stocksLoading ? (
            <div className="h-20 bg-muted rounded-lg animate-pulse" />
          ) : filteredStocks.length === 0 ? (
            <div className="text-center text-muted-foreground text-[0.8rem] py-6">No stock items found.</div>
          ) : (
            <AdminTable columns={stockColumns} rows={filteredStocks} />
          )}
        </Panel>

        <Modal open={addStockOpen} onClose={() => setAddStockOpen(false)} title="Add Stock Entries">
          <form onSubmit={handleImportStock} className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Headers (| separated)</span>
              <input
                value={headers}
                onChange={(e) => setHeaders(e.target.value)}
                className={inputClass}
                placeholder="Email|Password|Recovery Code"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Stock Rows (one row per line, values separated by |)</span>
              <textarea
                value={rows}
                onChange={(e) => setRows(e.target.value)}
                className={inputClass}
                rows={5}
                placeholder={"email1@mail.com|pass1|recovery1\nemail2@mail.com|pass2|recovery2"}
                required
              />
            </label>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button type="submit" variant="accent" disabled={importing}>
                {importing ? 'Importing...' : 'Add / Import Stocks'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAddStockOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>
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
