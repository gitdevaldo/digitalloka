'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

const emptyField: FieldDef = { key: '', label: '', type: 'text', required: false, help_text: '', scope: 'product' };

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function CreateProductTypePage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [typeKey, setTypeKey] = useState('');
  const [label, setLabel] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState<'active' | 'inactive'>('active');
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [saving, setSaving] = useState(false);

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
    if (!typeKey.trim() || !label.trim()) {
      showToast('Type key and label are required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/product-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: typeKey,
          label,
          description,
          is_active: isActive === 'active',
          fields,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Failed to create product type');
        return;
      }
      showToast('Product type created');
      router.push('/admin/product-types');
    } catch {
      showToast('Failed to create product type');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Type Editor"
        subtitle="/admin/product-types/create — create or edit product type schema"
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
              onChange={(e) => setTypeKey(e.target.value.replace(/[^a-z0-9_]/g, ''))}
              className={inputClass}
              placeholder="e.g. vps_droplet"
              required
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
            <Button type="submit" variant="accent" disabled={saving}>{saving ? 'Saving...' : 'Create Type'}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
