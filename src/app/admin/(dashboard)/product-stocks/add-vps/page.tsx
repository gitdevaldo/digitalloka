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

interface ProviderDataOption {
  slug: string;
  name: string;
  available: boolean;
}

export default function AddVpsStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const productName = searchParams.get('name') || 'VPS Product';
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [provider, setProvider] = useState('');
  const [providerOptions, setProviderOptions] = useState<string[]>([]);
  const [loadingType, setLoadingType] = useState(true);

  const [slug, setSlug] = useState('');
  const [vcpus, setVcpus] = useState('');
  const [memory, setMemory] = useState('');
  const [disk, setDisk] = useState('');
  const [transfer, setTransfer] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');

  const [region, setRegion] = useState('');
  const [os, setOs] = useState('');
  const [regions, setRegions] = useState<ProviderDataOption[]>([]);
  const [images, setImages] = useState<ProviderDataOption[]>([]);
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);

  useEffect(() => {
    setLoadingType(true);
    fetch('/api/admin/product-types')
      .then(r => r.json())
      .then(data => {
        const types = data.data || [];
        const vpsType = types.find((t: { type_key?: string; type?: string }) => t.type_key === 'vps_droplet' || t.type === 'vps_droplet');
        if (vpsType?.fields) {
          const providerField = (vpsType.fields as Array<{ key: string; options?: string[] }>).find((f) => f.key === 'provider');
          if (providerField?.options) {
            setProviderOptions(providerField.options);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingType(false));
  }, []);

  useEffect(() => {
    setRegion('');
    setOs('');
    if (!provider) {
      setRegions([]);
      setImages([]);
      return;
    }

    setLoadingRegions(true);
    setLoadingImages(true);

    fetch(`/api/admin/provider-data?provider=${encodeURIComponent(provider)}&type=region`)
      .then(r => r.json())
      .then(d => {
        const available = (d.data || []).filter((r: ProviderDataOption) => r.available);
        setRegions(available);
      })
      .catch(() => setRegions([]))
      .finally(() => setLoadingRegions(false));

    fetch(`/api/admin/provider-data?provider=${encodeURIComponent(provider)}&type=image`)
      .then(r => r.json())
      .then(d => {
        const available = (d.data || []).filter((i: ProviderDataOption) => i.available);
        setImages(available);
      })
      .catch(() => setImages([]))
      .finally(() => setLoadingImages(false));
  }, [provider]);

  async function handleSave() {
    if (!slug || !vcpus || !memory || !disk) {
      showToast('Slug, vCPUs, Memory, and Disk are required');
      return;
    }
    if (!provider) {
      showToast('Provider is required');
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
          region: region || undefined,
          os: os || undefined,
          region_name: regions.find(r => r.slug === region)?.name || undefined,
          os_name: images.find(i => i.slug === os)?.name || undefined,
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

  const selectedRegionName = regions.find(r => r.slug === region)?.name || '';
  const selectedOsName = images.find(i => i.slug === os)?.name || '';

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Add VPS Size"
        subtitle={`Product: ${decodeURIComponent(productName)}`}
        actions={
          <Button size="sm" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Back</Button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Panel title="Size Configuration">
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Provider *</label>
              {loadingType ? (
                <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-muted text-muted-foreground">Loading...</div>
              ) : providerOptions.length > 0 ? (
                <select
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-input text-foreground focus:outline-none focus:border-accent"
                  value={provider}
                  onChange={e => setProvider(e.target.value)}
                >
                  <option value="">— select provider —</option>
                  {providerOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : (
                <div className="border-2 border-secondary rounded-[var(--r-sm)] px-3 py-2 bg-secondary/10">
                  <div className="text-[0.8rem] font-bold text-secondary">No provider options found</div>
                  <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                    Add a "provider" field with options to the{' '}
                    <a href="/admin/product-types/vps_droplet/edit" className="text-accent underline font-bold">vps_droplet product type</a>.
                  </div>
                </div>
              )}
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
          <Panel title="Region & OS">
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Region / Datacenter</label>
                {!provider ? (
                  <div className="text-[0.78rem] text-muted-foreground italic">Select a provider first</div>
                ) : loadingRegions ? (
                  <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-muted text-muted-foreground">Loading regions...</div>
                ) : regions.length > 0 ? (
                  <select
                    className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-input text-foreground focus:outline-none focus:border-accent"
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                  >
                    <option value="">— select region —</option>
                    {regions.map(r => (
                      <option key={r.slug} value={r.slug}>{r.name} ({r.slug})</option>
                    ))}
                  </select>
                ) : (
                  <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 bg-muted/50">
                    <div className="text-[0.78rem] text-muted-foreground">No regions synced for {provider}</div>
                    <div className="text-[0.65rem] text-muted-foreground mt-0.5">Sync provider data or add regions manually.</div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[0.72rem] font-bold text-muted-foreground block mb-1.5">Operating System</label>
                {!provider ? (
                  <div className="text-[0.78rem] text-muted-foreground italic">Select a provider first</div>
                ) : loadingImages ? (
                  <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-muted text-muted-foreground">Loading OS images...</div>
                ) : images.length > 0 ? (
                  <select
                    className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-input text-foreground focus:outline-none focus:border-accent"
                    value={os}
                    onChange={e => setOs(e.target.value)}
                  >
                    <option value="">— select OS —</option>
                    {images.map(i => (
                      <option key={i.slug} value={i.slug}>{i.name}</option>
                    ))}
                  </select>
                ) : (
                  <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 bg-muted/50">
                    <div className="text-[0.78rem] text-muted-foreground">No OS images synced for {provider}</div>
                    <div className="text-[0.65rem] text-muted-foreground mt-0.5">Sync provider data or add images manually.</div>
                  </div>
                )}
              </div>
            </div>
          </Panel>

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
              {(selectedRegionName || selectedOsName) && (
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {selectedRegionName && (
                    <span className="inline-flex bg-accent/10 text-accent rounded text-[0.68rem] font-bold px-2 py-0.5 border border-accent/30">{selectedRegionName}</span>
                  )}
                  {selectedOsName && (
                    <span className="inline-flex bg-quaternary/10 text-foreground rounded text-[0.68rem] font-bold px-2 py-0.5 border border-quaternary/30">{selectedOsName}</span>
                  )}
                </div>
              )}
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                {sellingPrice && Number(sellingPrice) > 0 ? `${formatCurrency(Number(sellingPrice), 'IDR')}/mo` : 'No price set'}
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <div className="flex gap-3 mt-5 justify-end">
        <Button variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
        <Button variant="accent" onClick={handleSave} disabled={saving || !slug || !vcpus || !memory || !disk || !sellingPrice || !provider}>
          {saving ? 'Adding...' : 'Add Size'}
        </Button>
      </div>
    </div>
  );
}
