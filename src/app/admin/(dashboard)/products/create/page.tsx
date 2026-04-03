'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface ProductType {
  type: string;
  label: string;
  fields: Array<{ key: string; label: string; type: string; required: boolean }>;
}

interface FeaturedItem {
  label: string;
  value: string;
  sub: string;
}

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function CreateProductPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [productType, setProductType] = useState('digital');
  const [status, setStatus] = useState('available');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [priceAmount, setPriceAmount] = useState('');
  const [priceCurrency, setPriceCurrency] = useState('USD');
  const [priceName, setPriceName] = useState('');
  const [priceBillingPeriod, setPriceBillingPeriod] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [catalogVisibility, setCatalogVisibility] = useState('visible');
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [typeFields, setTypeFields] = useState<Record<string, string>>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/categories').then(r => r.json()).catch(() => ({ data: [] })),
      fetch('/api/admin/product-types').then(r => r.json()).catch(() => ({ data: [] })),
    ]).then(([catData, typeData]) => {
      setCategories(catData.data || []);
      setProductTypes(typeData.data || []);
    });
  }, []);

  const currentTypeSchema = productTypes.find(t => t.type === productType);

  function addFeatured() {
    if (featured.length >= 4) { showToast('Max 4 featured items'); return; }
    setFeatured(prev => [...prev, { label: '', value: '', sub: '' }]);
  }

  function updateFeatured(idx: number, patch: Partial<FeaturedItem>) {
    setFeatured(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function removeFeatured(idx: number) {
    setFeatured(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Name and slug are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          product_type: productType,
          status,
          category_id: categoryId || undefined,
          category_name: categoryName || undefined,
          price_amount: priceAmount || undefined,
          price_currency: priceCurrency,
          price_name: priceName,
          price_billing_period: priceBillingPeriod,
          short_description: shortDescription,
          description,
          catalog_visibility: catalogVisibility,
          featured: featured.filter(f => f.label || f.value),
          meta: { type_fields: typeFields },
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Failed to create product');
        return;
      }
      showToast('Product created');
      router.push('/admin/products');
    } catch {
      showToast('Failed to create product');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Create Product"
        subtitle="/admin/products/create — create catalog item"
        actions={
          <Button size="sm" variant="ghost" onClick={() => router.push('/admin/products')}>← Back to Products</Button>
        }
      />

      <Panel>
        <form onSubmit={handleSubmit} style={{ padding: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <label className="flex flex-col gap-1.5" style={{ gridColumn: '1 / span 2' }}>
            <span className="text-[0.8rem] font-bold">Product Name</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setSlug(autoSlug(e.target.value));
              }}
              className={inputClass}
              placeholder="NovaDash UI Kit"
              required
              maxLength={150}
            />
          </label>

          <label className="flex flex-col gap-1.5" style={{ gridColumn: '1 / span 2' }}>
            <span className="text-[0.8rem] font-bold">Slug</span>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={inputClass}
              placeholder="novadash-ui-kit"
              required
              maxLength={180}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Type</span>
            <select
              value={productType}
              onChange={(e) => { setProductType(e.target.value); setTypeFields({}); }}
              className={inputClass}
            >
              {productTypes.length > 0 ? productTypes.map(t => (
                <option key={t.type} value={t.type}>{t.type}</option>
              )) : (
                <>
                  <option value="digital">digital</option>
                  <option value="template">template</option>
                  <option value="course">course</option>
                  <option value="vps_droplet">vps_droplet</option>
                </>
              )}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="available">available</option>
              <option value="out-of-stock">out-of-stock</option>
              <option value="coming-soon">coming-soon</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Category</span>
            <select
              value={categoryId}
              onChange={(e) => { setCategoryId(e.target.value); if (e.target.value) setCategoryName(''); }}
              className={inputClass}
            >
              <option value="">— select existing —</option>
              {categories.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
            <input
              value={categoryName}
              onChange={(e) => { setCategoryName(e.target.value); if (e.target.value) setCategoryId(''); }}
              className={inputClass}
              placeholder="Or add new category name (e.g. VPS)"
              style={{ marginTop: '6px' }}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Price Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceAmount}
              onChange={(e) => setPriceAmount(e.target.value)}
              className={inputClass}
              placeholder="49.00"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Price Currency</span>
            <select value={priceCurrency} onChange={(e) => setPriceCurrency(e.target.value)} className={inputClass}>
              <option value="USD">USD</option>
              <option value="IDR">IDR</option>
              <option value="EUR">EUR</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Price Name</span>
            <input
              value={priceName}
              onChange={(e) => setPriceName(e.target.value)}
              className={inputClass}
              placeholder="Standard"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Billing Period</span>
            <input
              value={priceBillingPeriod}
              onChange={(e) => setPriceBillingPeriod(e.target.value)}
              className={inputClass}
              placeholder="one-time / monthly"
            />
          </label>

          <label className="flex flex-col gap-1.5" style={{ gridColumn: '1 / span 2' }}>
            <span className="text-[0.8rem] font-bold">Product Description</span>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className={inputClass}
              rows={4}
              placeholder="Product description"
            />
          </label>

          <label className="flex flex-col gap-1.5" style={{ gridColumn: '1 / span 2' }}>
            <span className="text-[0.8rem] font-bold">Product Details</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              rows={5}
              placeholder="Full product details and specifications..."
            />
          </label>

          <label className="flex flex-col gap-1.5" style={{ gridColumn: '1 / span 2' }}>
            <span className="text-[0.8rem] font-bold">Catalog Visibility</span>
            <select value={catalogVisibility} onChange={(e) => setCatalogVisibility(e.target.value)} className={inputClass}>
              <option value="visible">visible</option>
              <option value="hidden">hidden</option>
            </select>
          </label>

          <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
            <div className="font-heading text-[0.95rem] font-extrabold mb-2">Featured Highlights</div>
            <p className="text-[0.8rem] text-muted-foreground mb-3">Displayed on product detail page spec grid (max 4 items)</p>
            <div className="grid gap-2 mb-2">
              {featured.map((f, idx) => (
                <div key={idx} className="flex gap-2 items-center p-2 bg-muted rounded-lg border border-border">
                  <input
                    value={f.label}
                    onChange={(e) => updateFeatured(idx, { label: e.target.value })}
                    className="flex-1 border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input"
                    placeholder="Label"
                  />
                  <input
                    value={f.value}
                    onChange={(e) => updateFeatured(idx, { value: e.target.value })}
                    className="flex-1 border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input"
                    placeholder="Value"
                  />
                  <input
                    value={f.sub}
                    onChange={(e) => updateFeatured(idx, { sub: e.target.value })}
                    className="flex-1 border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input"
                    placeholder="Sub"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeatured(idx)}
                    className="text-xs font-bold text-secondary px-1.5 py-0.5 hover:bg-secondary/10 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" onClick={addFeatured} disabled={featured.length >= 4}>Add Featured Item</Button>
          </div>

          {currentTypeSchema && currentTypeSchema.fields.length > 0 && (
            <div style={{ gridColumn: '1 / span 2', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
              <div className="font-heading text-[0.95rem] font-extrabold mb-3">Type-Specific Fields</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {currentTypeSchema.fields.map((f) => (
                  <label key={f.key} className="flex flex-col gap-1.5">
                    <span className="text-[0.78rem] font-bold">
                      {f.label}
                      {f.required && <span className="text-secondary ml-1">*</span>}
                    </span>
                    {f.type === 'boolean' ? (
                      <select
                        value={typeFields[f.key] || 'false'}
                        onChange={(e) => setTypeFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea
                        value={typeFields[f.key] || ''}
                        onChange={(e) => setTypeFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className={inputClass}
                        rows={3}
                      />
                    ) : (
                      <input
                        type={f.type === 'number' ? 'number' : 'text'}
                        value={typeFields[f.key] || ''}
                        onChange={(e) => setTypeFields(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className={inputClass}
                      />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ gridColumn: '1 / span 2', display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/products')}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={saving}>{saving ? 'Creating...' : 'Create Product'}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
