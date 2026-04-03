'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

export default function DigitalProductsPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/user/products')
      .then(r => r.json())
      .then(data => {
        const digital = (data.data || []).filter((item: Record<string, unknown>) => {
          const p = item.product as Record<string, unknown> | undefined;
          const t = (p?.product_type as string) || '';
          return ['digital', 'template', 'ui-kit', 'course'].includes(t);
        });
        setProducts(digital);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleDownload(entitlementId: number) {
    setDownloading(entitlementId);
    try {
      const res = await fetch(`/api/user/products/${entitlementId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'download_assets' }),
      });
      if (!res.ok) throw new Error();
      showToast('Download request queued');
    } catch { showToast('Download failed'); }
    finally { setDownloading(null); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Digital Products" subtitle="Your downloadable files, templates, and kits." />

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="📥" title="No digital products" description="Digital products will appear here when purchased." />
      ) : (
        <Panel>
          <TableShell variant="dashboard">
            <thead><tr><th>Product</th><th>Type</th><th>Status</th><th>Started</th><th></th></tr></thead>
            <tbody>
              {products.map(item => {
                const product = item.product as Record<string, unknown> | undefined;
                const isActive = (item.status as string) === 'active';
                return (
                  <tr key={item.id as number}>
                    <td><strong>{(product?.name as string) || 'Unknown'}</strong></td>
                    <td><span className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted border border-border rounded-full text-[0.68rem] font-bold text-muted-foreground">{(product?.product_type as string) || '—'}</span></td>
                    <td><StatusBadge variant={item.status as string} label={item.status as string} /></td>
                    <td className="text-[0.8rem] text-muted-foreground">{item.starts_at ? new Date(item.starts_at as string).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                    <td>
                      {isActive ? (
                        <Button size="sm" variant="accent" onClick={() => handleDownload(item.id as number)} disabled={downloading === (item.id as number)}>
                          {downloading === (item.id as number) ? '…' : '⬇ Download'}
                        </Button>
                      ) : (
                        <ButtonLink href="/products" size="sm" variant="warning">Renew</ButtonLink>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        </Panel>
      )}
    </div>
  );
}
