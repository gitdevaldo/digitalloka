'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button, ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

export default function ProductAccessPage() {
  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);
  const { showToast } = useToast();

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch('/api/user/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch { showToast('Failed to load'); }
    finally { setLoading(false); }
  }

  async function handleRevoke(entitlementId: number) {
    if (!confirm('Are you sure you want to revoke access to this product? This cannot be undone.')) return;
    setRevoking(entitlementId);
    try {
      const res = await fetch(`/api/user/products/${entitlementId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke' }),
      });
      if (!res.ok) throw new Error();
      showToast('Access revoked');
      loadProducts();
    } catch { showToast('Failed to revoke'); }
    finally { setRevoking(null); }
  }

  const maskKey = (id: number) => {
    const s = String(id).padStart(8, '0');
    return `DL-${s.slice(0, 4)}-XXXX-${s.slice(-4)}`;
  };

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Product Access" subtitle="Manage licenses and entitlements for your products." />

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="🔑" title="No product access" description="Entitlements will appear here when you purchase products." />
      ) : (
        <Panel>
          <TableShell variant="dashboard">
            <thead><tr><th>Product</th><th>License Key</th><th>Entitlement</th><th>Expires</th><th></th></tr></thead>
            <tbody>
              {products.map(item => {
                const product = item.product as Record<string, unknown> | undefined;
                const isActive = (item.status as string) === 'active';
                const isPending = (item.status as string) === 'pending';
                const isExpiring = (item.status as string) === 'expiring';
                return (
                  <tr key={item.id as number}>
                    <td><strong>{(product?.name as string) || 'Unknown'}</strong></td>
                    <td className="font-mono text-[0.72rem]">{maskKey(item.id as number)}</td>
                    <td><StatusBadge variant={item.status as string} label={item.status as string} /></td>
                    <td className={`text-[0.8rem] ${isExpiring ? 'font-bold text-secondary' : 'text-muted-foreground'}`}>
                      {item.expires_at ? new Date(item.expires_at as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      {isActive ? (
                        <Button size="sm" onClick={() => handleRevoke(item.id as number)} disabled={revoking === (item.id as number)}>
                          {revoking === (item.id as number) ? '…' : 'Revoke'}
                        </Button>
                      ) : isPending ? (
                        <Button size="sm" disabled className="opacity-40 cursor-not-allowed">—</Button>
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
