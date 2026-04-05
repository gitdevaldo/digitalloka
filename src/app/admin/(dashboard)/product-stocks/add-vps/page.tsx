'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { VpsStockForm, type StockFieldDef } from '@/components/admin/vps-stock-form';

export default function AddVpsStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product');
  const productName = searchParams.get('name') || 'VPS Product';
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stockFields, setStockFields] = useState<StockFieldDef[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [sellingPrice, setSellingPrice] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/product-types')
      .then(r => r.json())
      .then(data => {
        const types = data.data || [];
        const vpsType = types.find((t: { type?: string; type_key?: string }) => t.type === 'vps_droplet' || t.type_key === 'vps_droplet');
        if (vpsType?.fields) {
          const sFields = (vpsType.fields as StockFieldDef[]).filter(f => f.scope === 'stock');
          setStockFields(sFields);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  }, []);

  async function handleSave() {
    for (const field of stockFields) {
      if (field.required && !values[field.key]) {
        showToast(`${field.label} is required`);
        return;
      }
    }
    if (!sellingPrice || Number(sellingPrice) <= 0) {
      showToast('Selling price is required');
      return;
    }

    setSaving(true);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of stockFields) {
        const val = values[field.key] || '';
        if (field.type === 'number' && val) {
          payload[field.key] = Number(val);
        } else if (val) {
          payload[field.key] = val;
        }
      }
      payload.selling_price = Number(sellingPrice);

      const res = await fetch(`/api/admin/products/${productId}/stock/sync-sizes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add size');
        return;
      }
      showToast(`Size "${values['slug'] || ''}" added`);
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

  const requiredMissing = stockFields.some(f => f.required && !values[f.key]);
  const noPrice = !sellingPrice || Number(sellingPrice) <= 0;

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Add VPS Size"
        subtitle={`Product: ${decodeURIComponent(productName)}`}
        actions={
          <Button size="sm" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Back</Button>
        }
      />

      {loading ? (
        <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
          <div className="h-40 bg-muted rounded-lg animate-pulse" />
        </div>
      ) : stockFields.length === 0 ? (
        <div className="p-8 bg-card border-2 border-border rounded-[var(--r-md)] text-center">
          <div className="text-[0.9rem] font-bold text-secondary mb-2">No stock fields defined</div>
          <div className="text-[0.8rem] text-muted-foreground mb-3">
            The VPS product type has no stock-scoped fields configured.
          </div>
          <a href="/admin/product-types/vps_droplet/edit" className="text-accent underline font-bold text-[0.85rem]">
            Configure VPS fields
          </a>
        </div>
      ) : (
        <>
          <VpsStockForm
            fields={stockFields}
            values={values}
            onChange={handleChange}
            sellingPrice={sellingPrice}
            onSellingPriceChange={setSellingPrice}
            mode="add"
          />

          <div className="flex gap-3 mt-5 justify-end">
            <Button variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
            <Button variant="accent" onClick={handleSave} disabled={saving || requiredMissing || noPrice}>
              {saving ? 'Adding...' : 'Add Size'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
