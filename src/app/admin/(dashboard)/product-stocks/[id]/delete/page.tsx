'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function DeleteStockPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product') || '';
  const { showToast } = useToast();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/product-stocks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const result = await res.json();
        showToast(result.error || 'Delete failed');
        return;
      }
      showToast('Stock item deleted.');
      router.push(`/admin/product-stocks?product=${productId}`);
    } catch { showToast('Delete failed'); }
    finally { setDeleting(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Delete Stock Item"
        subtitle={`Confirm deletion of stock #${String(id).slice(0, 8)}`}
        actions={
          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>← Back to Stocks</Button>
        }
      />

      <Panel>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
          <h3 style={{ fontFamily: 'var(--font-h)', fontWeight: 900, fontSize: '1.1rem', marginBottom: '8px' }}>
            Are you sure you want to delete this stock item?
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '24px' }}>
            This action cannot be undone. The stock entry will be permanently removed.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Button variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
            <Button variant="accent" style={{ background: 'var(--secondary)' }} onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete Stock Item'}
            </Button>
          </div>
        </div>
      </Panel>
    </div>
  );
}
