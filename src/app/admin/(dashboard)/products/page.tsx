'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Record<string, unknown> | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch { showToast('Failed to load products'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditProduct({
      name: '',
      slug: '',
      product_type: 'digital',
      short_description: '',
      status: 'available',
    });
    setIsCreate(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditProduct({ ...row });
    setIsCreate(false);
  }

  function closeModal() {
    setEditProduct(null);
    setIsCreate(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    setSaving(true);
    try {
      const url = isCreate ? '/api/admin/products' : `/api/admin/products/${editProduct.id}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Failed to save');
        return;
      }
      showToast(isCreate ? 'Product created' : 'Product updated');
      closeModal();
      loadProducts();
    } catch { showToast('Save failed'); }
    finally { setSaving(false); }
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

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
        return <span>{(cat?.name as string) || '—'}</span>;
      },
    },
    {
      key: 'catalog_visibility',
      label: 'Visibility',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={(row.catalog_visibility as string) === 'visible' ? 'active' : 'stopped'} label={row.catalog_visibility as string || 'visible'} />
      ),
    },
    {
      key: 'pricing',
      label: 'Pricing',
      render: (row: Record<string, unknown>) => {
        const prices = row.prices as Record<string, unknown>[] | undefined;
        const price = prices?.[0];
        return <span style={{ fontFamily: 'var(--font-h)', fontWeight: 800 }}>{price ? `$${price.amount}` : '—'}</span>;
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
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1">
          <Button size="sm" onClick={() => openEdit(row)}>Edit</Button>
        </div>
      ),
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
            <Button variant="accent" onClick={openCreate}>+ Create Product</Button>
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
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products" description="Create your first product." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={products} />
          </div>
        </Panel>
      )}

      <Modal open={!!editProduct} onClose={closeModal} title={isCreate ? 'Create Product' : `Edit: ${editProduct?.name || ''}`}>
        {editProduct && (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Product Name</span>
              <input
                value={(editProduct.name as string) || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  const updates: Record<string, unknown> = { ...editProduct, name };
                  if (isCreate) updates.slug = autoSlug(name);
                  setEditProduct(updates);
                }}
                className={inputClass}
                placeholder="e.g. NovaDash UI Kit"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Slug</span>
              <input
                value={(editProduct.slug as string) || ''}
                onChange={(e) => setEditProduct({ ...editProduct, slug: e.target.value })}
                className={inputClass}
                placeholder="e.g. novadash-ui-kit"
                required
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Type</span>
                <select
                  value={(editProduct.product_type as string) || 'digital'}
                  onChange={(e) => setEditProduct({ ...editProduct, product_type: e.target.value })}
                  className={inputClass}
                >
                  <option value="digital">digital</option>
                  <option value="template">template</option>
                  <option value="course">course</option>
                  <option value="vps_droplet">vps_droplet</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
                <select
                  value={(editProduct.status as string) || 'available'}
                  onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="available">Available</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="coming-soon">Coming Soon</option>
                </select>
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Short Description</span>
              <textarea
                value={(editProduct.short_description as string) || ''}
                onChange={(e) => setEditProduct({ ...editProduct, short_description: e.target.value })}
                className={inputClass}
                rows={2}
                placeholder="Brief product description..."
              />
            </label>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button type="submit" variant="accent" disabled={saving}>
                {saving ? 'Saving...' : isCreate ? 'Create Product' : 'Save Changes'}
              </Button>
              <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
