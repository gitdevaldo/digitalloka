'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
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

  const columns = [
    {
      key: 'name',
      label: 'Product',
      render: (row: Record<string, unknown>) => {
        const product = row.product as Record<string, unknown> | undefined;
        return <span style={{ fontWeight: 700 }}>{(product?.name as string) || 'Unknown'}</span>;
      },
    },
    {
      key: 'license_key',
      label: 'License Key',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem' }}>{maskKey(row.id as number)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Entitlement',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.status as string} label={row.status as string} />
      ),
    },
    {
      key: 'expires_at',
      label: 'Expires',
      render: (row: Record<string, unknown>) => {
        const isExpiring = (row.status as string) === 'expiring';
        return (
          <span style={{ fontSize: '0.78rem', fontWeight: isExpiring ? 700 : 500, color: isExpiring ? 'var(--secondary)' : 'var(--muted-foreground)' }}>
            {row.expires_at ? new Date(row.expires_at as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (row: Record<string, unknown>) => {
        const isActive = (row.status as string) === 'active';
        const isPending = (row.status as string) === 'pending';
        return isActive ? (
          <Button size="sm" onClick={() => handleRevoke(row.id as number)} disabled={revoking === (row.id as number)}>
            {revoking === (row.id as number) ? '…' : 'Revoke'}
          </Button>
        ) : isPending ? (
          <Button size="sm" disabled className="opacity-40 cursor-not-allowed">—</Button>
        ) : (
          <ButtonLink href="/products" size="sm" variant="warning">Renew</ButtonLink>
        );
      },
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Product Access" subtitle="Manage licenses and entitlements for your products." />

      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : products.length === 0 ? (
        <EmptyState icon="🔑" title="No product access" description="Entitlements will appear here when you purchase products." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={products} />
          </div>
        </Panel>
      )}
    </div>
  );
}
