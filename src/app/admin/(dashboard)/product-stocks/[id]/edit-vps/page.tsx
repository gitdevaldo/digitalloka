'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { formatCurrency } from '@/lib/utils';

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

export default function EditVpsStockPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const stockId = params.id as string;
  const productId = searchParams.get('product');
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [stock, setStock] = useState<Record<string, unknown> | null>(null);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);

  const [provider, setProvider] = useState('');
  const [slug, setSlug] = useState('');
  const [vcpus, setVcpus] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [transfer, setTransfer] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [status, setStatus] = useState('disabled');
  const [isUnlimited, setIsUnlimited] = useState(true);

  useEffect(() => {
    loadStock();
  }, [stockId]);

  async function loadStock() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/product-stocks/${stockId}`);
      const data = await res.json();
      if (!res.ok || !data.data) {
        showToast('Stock item not found');
        router.back();
        return;
      }
      const item = data.data;
      setStock(item);
      const prod = item.product || null;
      setProduct(prod);

      const cred = (item.credential_data || {}) as Record<string, unknown>;
      const meta = (item.meta || {}) as Record<string, unknown>;

      setSlug((cred.slug as string) || '');
      setVcpus(String(cred.vcpus || ''));
      setMemory(String(cred.memory || ''));
      setDisk(String(cred.disk || ''));
      setTransfer(String(cred.transfer || ''));
      setSellingPrice(String(meta.selling_price || ''));
      setStatus(item.status || 'disabled');
      setIsUnlimited(item.is_unlimited ?? true);

      if (prod?.id) {
        const prodRes = await fetch(`/api/admin/products/${prod.id}`);
        const prodData = await prodRes.json();
        const p = prodData.data || prodData;
        const typeFields = (p?.meta?.type_fields || {}) as Record<string, string>;
        setProvider(typeFields.provider || (meta.provider as string) || 'Unknown');
      } else {
        setProvider((meta.provider as string) || 'Unknown');
      }
    } catch {
      showToast('Failed to load stock item');
    } finally {
      setLoading(false);
    }
  }

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
      const existingCred = ((stock as Record<string, unknown>)?.credential_data || {}) as Record<string, unknown>;
      const existingMeta = ((stock as Record<string, unknown>)?.meta || {}) as Record<string, unknown>;

      const updatedCred = {
        ...existingCred,
        slug,
        vcpus: Number(vcpus),
        memory: Number(memory),
        disk: Number(disk),
        transfer: Number(transfer || 0),
      };

      const updatedMeta = {
        ...existingMeta,
        provider,
        selling_price: Number(sellingPrice),
        updated_at: new Date().toISOString(),
      };

      const res = await fetch(`/api/admin/product-stocks/${stockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential_data: updatedCred,
          meta: updatedMeta,
          status,
          is_unlimited: isUnlimited,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save');
        return;
      }
      showToast('VPS size updated successfully');
      if (productId) {
        router.push(`/admin/product-stocks?product=${productId}`);
      } else {
        router.back();
      }
    } catch {
      showToast('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this VPS size?')) return;
    try {
      const res = await fetch(`/api/admin/product-stocks/${stockId}`, { method: 'DELETE' });
      if (!res.ok) {
        showToast('Failed to delete');
        return;
      }
      showToast('VPS size deleted');
      if (productId) {
        router.push(`/admin/product-stocks?product=${productId}`);
      } else {
        router.back();
      }
    } catch {
      showToast('Failed to delete');
    }
  }

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader title="Edit VPS Size" subtitle="Loading..." />
        <Panel><div className="h-40 bg-muted rounded-lg animate-pulse" /></Panel>
      </div>
    );
  }

  const productName = (product as Record<string, unknown>)?.name as string || 'VPS Product';
  const currency = 'IDR';

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title={`Edit VPS Size: ${slug || 'Unknown'}`}
        subtitle={`Product: ${productName}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => productId ? router.push(`/admin/product-stocks?product=${productId}`) : router.back()}>Back</Button>
            <Button size="sm" variant="ghost" style={{ color: 'var(--secondary)' }} onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="Size Configuration">
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Provider</label>
              {!provider && loading ? (
                <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-muted text-muted-foreground">Loading...</div>
              ) : provider ? (
                <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-muted text-foreground">{provider}</div>
              ) : (
                <div className="border-2 border-secondary rounded-[var(--r-sm)] px-3 py-2 bg-secondary/10">
                  <div className="text-[0.8rem] font-bold text-secondary">Provider not set</div>
                  <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                    Go to{' '}
                    <a href={`/admin/products/${(product as Record<string, unknown>)?.id || productId}/edit`} className="text-accent underline font-bold">Product Edit</a>
                    {' '}and set the "VPS Provider" field first.
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Size Slug</label>
              <input
                className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground font-mono focus:outline-none focus:border-accent"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="e.g. s-1vcpu-1gb, t3.micro"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">vCPUs</label>
                <input
                  type="number"
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent"
                  value={vcpus}
                  onChange={e => setVcpus(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Memory (MB)</label>
                <input
                  type="number"
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent"
                  value={memory}
                  onChange={e => setMemory(e.target.value)}
                  placeholder="1024"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Disk (GB)</label>
                <input
                  type="number"
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent"
                  value={disk}
                  onChange={e => setDisk(e.target.value)}
                  placeholder="25"
                />
              </div>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Transfer (TB)</label>
                <input
                  type="number"
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent"
                  value={transfer}
                  onChange={e => setTransfer(e.target.value)}
                  placeholder="1"
                />
              </div>
            </div>
          </div>
        </Panel>

        <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          <Panel title="Pricing & Status">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Selling Price ({currency}/mo)</label>
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
                    Displays as: {formatCurrency(Number(sellingPrice), currency)}/mo
                  </div>
                )}
              </div>

              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Status</label>
                <select
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.85rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent"
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  <option value="enabled">Enabled (visible to customers)</option>
                  <option value="disabled">Disabled (hidden from customers)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unlimited"
                  checked={isUnlimited}
                  onChange={e => setIsUnlimited(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <label htmlFor="unlimited" className="text-[0.8rem] font-semibold cursor-pointer">Unlimited stock (VPS sizes are typically unlimited)</label>
              </div>
            </div>
          </Panel>

          <Panel title="Preview">
            <div style={{ background: 'var(--muted)', borderRadius: 'var(--r-sm)', padding: 16 }}>
              <div className="flex items-center gap-2 mb-2">
                <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--accent)' }}>{provider}</span>
              </div>
              <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{slug || '—'}</div>
              <div className="flex gap-1.5 flex-wrap mb-3">
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{vcpus || '0'} vCPU</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{memory ? formatMemory(Number(memory)) : '0 MB'}</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{disk || '0'} GB disk</span>
                <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{transfer || '0'} TB transfer</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {sellingPrice && Number(sellingPrice) > 0 ? `${formatCurrency(Number(sellingPrice), currency)}/mo` : 'No price set'}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        <Button variant="ghost" onClick={() => productId ? router.push(`/admin/product-stocks?product=${productId}`) : router.back()}>Cancel</Button>
        <Button variant="accent" onClick={handleSave} disabled={saving || !slug || !vcpus || !memory || !disk || !sellingPrice}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
