'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';
import { formatDate } from '@/lib/utils';
export default function AdminProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [editProduct, setEditProduct] = useState<Record<string, unknown> | null>(null);
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduct) return;
    try {
      const res = await fetch(`/api/admin/products/${editProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProduct),
      });
      if (!res.ok) throw new Error();
      showToast('Product updated');
      setEditProduct(null);
      loadProducts();
    } catch { showToast('Save failed'); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Products"
        subtitle="/admin/products — catalog item management"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={loadProducts}>Refresh</Button>
            <Button variant="accent">+ Create Product</Button>
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
        <Panel variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>ID</th><th>Product Name</th><th>Type</th><th>Category</th><th>Visibility</th><th>Pricing</th><th>Updated</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => {
                const pricing = p.pricing as Record<string, unknown> | undefined;
                const category = p.category as Record<string, unknown> | undefined;
                return (
                  <tr key={p.id as number}>
                    <td className="font-mono text-[0.72rem] text-muted-foreground">{String(p.id).slice(0, 8)}</td>
                    <td><div className="font-bold">{p.name as string}</div><div className="text-[0.68rem] text-muted-foreground">{p.slug as string}</div></td>
                    <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">{p.product_type as string}</span></td>
                    <td className="text-[0.8rem]">{category?.name as string || '—'}</td>
                    <td><StatusBadge variant={(p.catalog_visibility as string) === 'visible' ? 'active' : 'stopped'} label={p.catalog_visibility as string || 'visible'} /></td>
                    <td className="font-heading font-extrabold">{pricing ? `$${pricing.amount}` : '—'}</td>
                    <td className="text-[0.72rem] text-muted-foreground">{formatDate(p.updated_at as string)}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <Button size="sm" onClick={() => setEditProduct(p)}>Edit</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Panel>
      )}

      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Name</span>
              <input value={editProduct.name as string} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
              <select value={editProduct.status as string} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })} className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent">
                <option value="available">Available</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="coming-soon">Coming Soon</option>
              </select>
            </label>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="submit" variant="accent">Save</Button>
              <Button type="button" variant="ghost" onClick={() => setEditProduct(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
