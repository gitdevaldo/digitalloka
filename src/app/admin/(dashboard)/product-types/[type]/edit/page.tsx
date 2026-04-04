'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  help_text?: string;
  scope?: 'product' | 'stock';
  options_source?: string;
  provider_data_type?: string;
  depends_on?: string;
}

const emptyField: FieldDef = { key: '', label: '', type: 'text', required: false, help_text: '', scope: 'product' };

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function EditProductTypePage() {
  const router = useRouter();
  const params = useParams();
  const typeKey = decodeURIComponent(params.type as string);
  const { showToast } = useToast();

  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState<'active' | 'inactive'>('active');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/product-types');
        const data = await res.json();
        const found = (data.data || []).find((t: { type: string }) => t.type === typeKey);
        if (!found) {
          showToast('Product type not found');
          router.push('/admin/product-types');
          return;
        }
        setLabel(found.label || '');
        setDescription(found.description || '');
        setIsActive(found.is_active ? 'active' : 'inactive');
        setFields(found.fields || []);
      } catch {
        showToast('Failed to load product type');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [typeKey, router, showToast]);

  function addField() {
    setFields(prev => [...prev, { ...emptyField }]);
  }

  function updateField(idx: number, patch: Partial<FieldDef>) {
    setFields(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }

  function removeField(idx: number) {
    setFields(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim()) {
      showToast('Label is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/product-types/${encodeURIComponent(typeKey)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label,
          description,
          is_active: isActive === 'active',
          fields,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Failed to save');
        return;
      }
      showToast('Product type updated');
      router.push('/admin/product-types');
    } catch {
      showToast('Failed to save product type');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader title="Product Type Editor" subtitle={`/admin/product-types/${typeKey}/edit`} />
        <Panel><div className="h-40 bg-muted rounded-lg animate-pulse" /></Panel>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Type Editor"
        subtitle={`/admin/product-types/${typeKey}/edit — editing: ${label}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => router.push('/admin/product-types')}>← Back to Product Types</Button>
            <Button variant="accent" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Type'}</Button>
          </div>
        }
      />

      <Panel title="Schema Builder">
        <form onSubmit={handleSave} className="grid gap-4" style={{ padding: '22px' }}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Type Key</span>
            <input
              value={typeKey}
              className={inputClass}
              disabled
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={inputClass}
              placeholder="e.g. VPS Droplet"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={inputClass}
              placeholder="Optional description..."
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Status</span>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value as 'active' | 'inactive')}
              className={inputClass}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
            </select>
          </label>

          <div>
            <div className="flex items-center justify-between mb-2 mt-1">
              <span className="text-[0.75rem] font-bold">Fields</span>
              <Button type="button" size="sm" onClick={addField}>+ Add Field</Button>
            </div>
            {fields.length === 0 && (
              <div className="text-[0.75rem] text-muted-foreground py-2">No custom fields defined.</div>
            )}
            <div className="grid gap-4">
              {fields.map((f, idx) => (
                <div key={idx} className="p-4 bg-muted rounded-lg border-2 border-border relative">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Key</label>
                      <input
                        value={f.key}
                        onChange={(e) => updateField(idx, { key: e.target.value.replace(/[^a-z0-9_]/g, '') })}
                        className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                        placeholder="field_key"
                      />
                    </div>
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Label</label>
                      <input
                        value={f.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                        placeholder="Field Label"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Type</label>
                      <select
                        value={f.type}
                        onChange={(e) => updateField(idx, { type: e.target.value })}
                        className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                      >
                        <option value="text">text</option>
                        <option value="number">number</option>
                        <option value="select">select</option>
                        <option value="boolean">boolean</option>
                        <option value="textarea">textarea</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Scope</label>
                      <select
                        value={f.scope || 'product'}
                        onChange={(e) => updateField(idx, { scope: e.target.value as 'product' | 'stock' })}
                        className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                      >
                        <option value="product">product — shown on product edit</option>
                        <option value="stock">stock — shown on stock add/edit only</option>
                      </select>
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={f.required}
                          onChange={(e) => updateField(idx, { required: e.target.checked })}
                          className="w-4 h-4 accent-accent"
                        />
                        Required
                      </label>
                    </div>
                  </div>
                  {f.type === 'select' && (
                    <div className="mb-3">
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Options (comma-separated)</label>
                      <input
                        value={(f.options || []).join(', ')}
                        onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                        className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                        placeholder="Option1, Option2, Option3"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Options Source</label>
                          <select
                            value={f.options_source || ''}
                            onChange={(e) => updateField(idx, { options_source: e.target.value || undefined })}
                            className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                          >
                            <option value="">Static only</option>
                            <option value="provider_data">Also from Provider Data</option>
                          </select>
                        </div>
                        {f.options_source === 'provider_data' && (
                          <div>
                            <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Provider Data Type</label>
                            <select
                              value={f.provider_data_type || ''}
                              onChange={(e) => updateField(idx, { provider_data_type: e.target.value || undefined })}
                              className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                            >
                              <option value="">— select —</option>
                              <option value="region">Region</option>
                              <option value="image">OS Image</option>
                            </select>
                          </div>
                        )}
                      </div>
                      {f.options_source === 'provider_data' && (
                        <div className="mt-2">
                          <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Depends On Field</label>
                          <input
                            value={f.depends_on || ''}
                            onChange={(e) => updateField(idx, { depends_on: e.target.value.replace(/[^a-z0-9_]/g, '') || undefined })}
                            className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                            placeholder="e.g. provider"
                          />
                          <div className="text-[0.6rem] text-muted-foreground mt-0.5">Options will re-load when this field changes</div>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="mb-1">
                    <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Help Text</label>
                    <input
                      value={f.help_text || ''}
                      onChange={(e) => updateField(idx, { help_text: e.target.value })}
                      className="w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent"
                      placeholder="Optional helper text"
                    />
                  </div>
                  {f.type === 'select' && (
                    <div className="text-[0.68rem] text-muted-foreground mt-2">Tip: For select fields, enter options separated by commas.</div>
                  )}
                  <div className="flex justify-end mt-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => removeField(idx)}
                    >
                      Remove Field
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => router.push('/admin/product-types')}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
