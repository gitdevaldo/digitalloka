'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { VpsStockForm, type StockFieldDef } from '@/components/admin/vps-stock-form';

const CREDENTIAL_KEYS = ['slug', 'vcpus', 'memory', 'disk', 'transfer'];

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
  const [stockFields, setStockFields] = useState<StockFieldDef[]>([]);

  const [values, setValues] = useState<Record<string, string>>({});
  const [sellingPrice, setSellingPrice] = useState('');
  const [status, setStatus] = useState('disabled');
  const [isUnlimited, setIsUnlimited] = useState(true);

  useEffect(() => {
    loadData();
  }, [stockId]);

  async function loadData() {
    setLoading(true);
    try {
      const [stockRes, typeRes] = await Promise.all([
        fetch(`/api/admin/product-stocks/${stockId}`),
        fetch('/api/admin/product-types'),
      ]);

      const typeData = await typeRes.json();
      const types = typeData.data || [];
      const vpsType = types.find((t: { type?: string; type_key?: string }) => t.type === 'vps_droplet' || t.type_key === 'vps_droplet');
      if (vpsType?.fields) {
        const sFields = (vpsType.fields as StockFieldDef[]).filter(f => f.scope === 'stock');
        setStockFields(sFields);
      }

      const stockData = await stockRes.json();
      if (!stockRes.ok || !stockData.data) {
        showToast('Stock item not found');
        router.back();
        return;
      }
      const item = stockData.data;
      setStock(item);
      setProduct(item.product || null);

      const cred = (item.credential_data || {}) as Record<string, unknown>;
      const meta = (item.meta || {}) as Record<string, unknown>;

      const initialValues: Record<string, string> = {};
      for (const key of CREDENTIAL_KEYS) {
        if (cred[key] !== undefined && cred[key] !== null) {
          initialValues[key] = String(cred[key]);
        }
      }
      if (meta.provider) initialValues['provider'] = String(meta.provider);
      if (meta.region) initialValues['region'] = String(meta.region);
      if (meta.os) initialValues['os'] = String(meta.os);

      for (const [k, v] of Object.entries(meta)) {
        if (!initialValues[k] && typeof v === 'string') {
          initialValues[k] = v;
        }
      }
      for (const [k, v] of Object.entries(cred)) {
        if (!initialValues[k] && (typeof v === 'string' || typeof v === 'number')) {
          initialValues[k] = String(v);
        }
      }

      setValues(initialValues);
      setSellingPrice(String(meta.selling_price || ''));
      setStatus(item.status || 'disabled');
      setIsUnlimited(item.is_unlimited ?? true);
    } catch {
      showToast('Failed to load stock item');
    } finally {
      setLoading(false);
    }
  }

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
      const existingCred = ((stock as Record<string, unknown>)?.credential_data || {}) as Record<string, unknown>;
      const existingMeta = ((stock as Record<string, unknown>)?.meta || {}) as Record<string, unknown>;

      const updatedCred = { ...existingCred };
      const updatedMeta = { ...existingMeta };

      for (const field of stockFields) {
        const val = values[field.key] || '';
        if (CREDENTIAL_KEYS.includes(field.key)) {
          if (field.type === 'number' && val) {
            updatedCred[field.key] = Number(val);
          } else {
            updatedCred[field.key] = val;
          }
        } else {
          updatedMeta[field.key] = val || undefined;
        }
      }

      updatedMeta.selling_price = Number(sellingPrice);
      updatedMeta.updated_at = new Date().toISOString();

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
        <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
          <div className="h-40 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const productName = (product as Record<string, unknown>)?.name as string || 'VPS Product';
  const requiredMissing = stockFields.some(f => f.required && !values[f.key]);
  const noPrice = !sellingPrice || Number(sellingPrice) <= 0;

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title={`Edit VPS Size: ${values['slug'] || 'Unknown'}`}
        subtitle={`Product: ${productName}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={() => productId ? router.push(`/admin/product-stocks?product=${productId}`) : router.back()}>Back</Button>
            <Button size="sm" variant="ghost" style={{ color: 'var(--secondary)' }} onClick={handleDelete}>Delete</Button>
          </div>
        }
      />

      {stockFields.length === 0 ? (
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
            mode="edit"
            status={status}
            onStatusChange={setStatus}
            isUnlimited={isUnlimited}
            onUnlimitedChange={setIsUnlimited}
          />

          <div className="flex gap-3 mt-5 justify-end">
            <Button variant="ghost" onClick={() => productId ? router.push(`/admin/product-stocks?product=${productId}`) : router.back()}>Cancel</Button>
            <Button variant="accent" onClick={handleSave} disabled={saving || requiredMissing || noPrice}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
