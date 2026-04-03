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
    <div className="animate-fade-up">
      <PageHeader title="Products" subtitle="Manage catalog items." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products" description="Create your first product." />
      ) : (
        <Panel title="All Products" variant="admin">
          <TableShell variant="admin">
            <thead><tr><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id as number}>
                  <td className="font-bold">{p.name as string}</td>
                  <td><span className="text-[0.65rem] font-bold text-muted-foreground bg-muted border border-border rounded-full px-2 py-0.5">{p.product_type as string}</span></td>
                  <td><StatusBadge variant={(p.status as string) === 'available' ? 'active' : 'stopped'} label={p.status as string} /></td>
                  <td><Button size="sm" onClick={() => setEditProduct(p)}>Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} title="Edit Product">
        {editProduct && (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Name</span>
              <input value={editProduct.name as string} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Status</span>
              <select value={editProduct.status as string} onChange={(e) => setEditProduct({ ...editProduct, status: e.target.value })} className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-accent">
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
