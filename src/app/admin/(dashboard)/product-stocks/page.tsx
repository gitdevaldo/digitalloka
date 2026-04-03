'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
import * as XLSX from 'xlsx';

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function ProductStocksPage() {
  const searchParams = useSearchParams();
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
  const [editStock, setEditStock] = useState<Record<string, unknown> | null>(null);
  const [editCredentials, setEditCredentials] = useState('');
  const [editStatus, setEditStatus] = useState('unsold');
  const [editSaving, setEditSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) setRows(prev => prev ? prev + '\n' + text.trim() : text.trim());
      };
      reader.readAsText(file);
    } else if (ext === 'xls' || ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        const lines = jsonData
          .filter((row) => row.length > 0 && row.some(cell => cell !== undefined && cell !== ''))
          .map((row) => row.join('|'))
          .join('\n');
        if (lines) setRows(prev => prev ? prev + '\n' + lines : lines);
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Unsupported file type. Use CSV, TXT, XLS, or XLSX.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

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

  function openEditStock(stock: Record<string, unknown>) {
    const cred = stock.credential_data as Record<string, string> | undefined;
    const credHeaders = cred ? Object.keys(cred) : [];
    const credValues = cred ? credHeaders.map(h => cred[h] || '') : [];
    setEditStock(stock);
    setEditCredentials(credValues.join('|'));
    setEditStatus(stock.status as string || 'unsold');
  }

  async function handleEditSave() {
    if (!editStock) return;
    const cred = editStock.credential_data as Record<string, string> | undefined;
    const credHeaders = cred ? Object.keys(cred) : [];
    const editedValues = editCredentials.trim();

    if (!editedValues) {
      showToast('Values are required.');
      return;
    }

    if (!['unsold', 'sold'].includes(editStatus)) {
      showToast('Invalid status.');
      return;
    }

    const values = editedValues.split('|').map(v => v.trim());
    if (values.length !== credHeaders.length) {
      showToast('Value count must match existing header count.');
      return;
    }

    const nextCredentialData: Record<string, string> = {};
    credHeaders.forEach((header, index) => {
      nextCredentialData[header] = values[index] || '';
    });

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/product-stocks/${editStock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential_data: nextCredentialData,
          status: editStatus,
        }),
      });
      if (!res.ok) {
        const result = await res.json();
        showToast(result.error || 'Update failed');
        return;
      }
      showToast('Stock item updated.');
      setEditStock(null);
      refreshStocks();
    } catch { showToast('Update failed'); }
    finally { setEditSaving(false); }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/product-stocks/${deleteConfirm.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const result = await res.json();
        showToast(result.error || 'Delete failed');
        return;
      }
      showToast('Stock item deleted.');
      setDeleteConfirm(null);
      refreshStocks();
    } catch { showToast('Delete failed'); }
    finally { setDeleting(false); }
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => openEditStock(row)}>Edit</Button>
          <Button size="sm" variant="ghost" style={{ color: 'var(--secondary)' }} onClick={() => setDeleteConfirm(row)}>Delete</Button>
        </div>
      ),
    },
  ];

  if (selectedProduct) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader
          title="Manage Product Stocks"
          subtitle={`/admin/products/${selectedProduct.id}/stocks — stock entries for ${selectedProduct.name}`}
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
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileImport}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Import File
              </Button>
              <span className="text-[0.68rem] text-muted-foreground ml-2">CSV, TXT, XLS, XLSX</span>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button type="submit" variant="accent" disabled={importing}>
                {importing ? 'Importing...' : 'Add / Import Stocks'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setAddStockOpen(false)}>Cancel</Button>
            </div>
          </form>
        </Modal>

        <Modal open={!!editStock} onClose={() => setEditStock(null)} title="Edit Stock Item">
          {editStock && (
            <div className="space-y-3">
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">
                  Credential Values (| separated) — Headers: {editStock.credential_data ? Object.keys(editStock.credential_data as Record<string, string>).join(' | ') : ''}
                </span>
                <textarea
                  value={editCredentials}
                  onChange={(e) => setEditCredentials(e.target.value)}
                  className={inputClass}
                  rows={3}
                />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className={inputClass}
                >
                  <option value="unsold">unsold</option>
                  <option value="sold">sold</option>
                </select>
              </label>
              <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                <Button variant="accent" onClick={handleEditSave} disabled={editSaving}>
                  {editSaving ? 'Saving...' : 'Update Stock'}
                </Button>
                <Button variant="ghost" onClick={() => setEditStock(null)}>Cancel</Button>
              </div>
            </div>
          )}
        </Modal>

        <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Stock Item">
          <div className="space-y-3">
            <div style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)' }}>Delete this stock item?</div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button variant="accent" style={{ background: 'var(--secondary)' }} onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
              <Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            </div>
          </div>
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
