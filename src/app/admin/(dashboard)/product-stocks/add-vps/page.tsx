'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

export default function AddVpsStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const productName = searchParams.get('name') || 'VPS Product';
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState('');
  const [loadingProduct, setLoadingProduct] = useState(true);

  const [slug, setSlug] = useState('');
  const [vcpus, setVcpus] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [transfer, setTransfer] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  useEffect(() => {
    if (!productId) return;
    setLoadingProduct(true);
    fetch(`/api/admin/products/${productId}`)
      .then(r => r.json())
      .then(data => {
        const p = data.data || data;
        const typeFields = (p?.meta?.type_fields || {}) as Record<string, string>;
        setProvider(typeFields.provider || 'Unknown');
      })
      .catch(() => {})
      .finally(() => setLoadingProduct(false));
  }, [productId]);

  async function handleSave() {
    if (!slug || !vcpus || !memory || !disk) {
      showToast('Slug, vCPUs, Memory, and Disk are required');
      return;
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      showToast('Selling price is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock/sync-sizes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          slug,
          vcpus: Number(vcpus),
          memory: Number(memory),
          disk: Number(disk),
          transfer: Number(transfer || 0),
          selling_price: Number(sellingPrice),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add size');
        return;
      }
      showToast(`Size "${slug}" added`);
      router.push(`/admin/product-stocks?product=${productId}`);
    } catch {
      showToast('Failed to add size');
    } finally {
      setSaving(false);
    }
  }

  if (!productId) {
    return <div className="p-8 text-center text-muted-foreground">No product specified</div>;
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Add VPS Size"
        subtitle={`Product: ${decodeURIComponent(productName)} — Provider: ${loadingProduct ? 'Loading...' : provider}`}
        actions={
          <Button size="sm" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Back</Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="Size Configuration">
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Provider</label>
              <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-muted text-foreground">
                {loadingProduct ? 'Loading...' : provider}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-1">Set in Product Edit → VPS Provider field</div>
            </div>

            <div>
              <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Size Slug *</label>
              <input
                className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground font-mono focus:outline-none focus:border-accent"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. s-1vcpu-1gb, t3.micro, cx11"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">vCPUs *</label>
                <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent" value={vcpus} onChange={e => setVcpus(e.target.value)} placeholder="1" />
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Memory (MB) *</label>
                <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent" value={memory} onChange={e => setMemory(e.target.value)} placeholder="1024" />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Disk (GB) *</label>
                <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent" value={disk} onChange={e => setDisk(e.target.value)} placeholder="25" />
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Transfer (TB)</label>
                <input type="number" className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent" value={transfer} onChange={e => setTransfer(e.target.value)} placeholder="1" />
              </div>
            </div>
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          <Panel title="Pricing">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Selling Price (IDR/mo) *</label>
                <div className="flex items-center gap-2">
                  <span className="text-[0.85rem] font-bold text-muted-foreground">Rp</span>
                  <input
                    type="number"
                    className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-input text-foreground focus:outline-none focus:border-accent"
                    value={sellingPrice}
                    onChange={e => setSellingPrice(e.target.value)}
                    placeholder="50000"
                  />
                </div>
                {sellingPrice && Number(sellingPrice) > 0 && (
                  <div className="text-[0.7rem] text-muted-foreground mt-1">
                    Displays as: {formatCurrency(Number(sellingPrice), 'IDR')}/mo
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <Panel title="Preview">
            <div style={{ background: 'var(--muted)', borderRadius: 'var(--r-sm)', padding: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--accent)' }}>{provider || '—'}</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{slug || '—'}</div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{vcpus || '0'} vCPU</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{memory ? formatMemory(Number(memory)) : '0 MB'}</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{disk || '0'} GB disk</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{transfer || '0'} TB transfer</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {sellingPrice && Number(sellingPrice) > 0 ? `${formatCurrency(Number(sellingPrice), 'IDR')}/mo` : 'No price set'}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        <Button variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
        <Button variant="accent" onClick={handleSave} disabled={saving || !slug || !vcpus || !memory || !disk || !sellingPrice}>
          {saving ? 'Adding...' : 'Add Size'}
        </Button>
      </div>
    </div>
  );
}
