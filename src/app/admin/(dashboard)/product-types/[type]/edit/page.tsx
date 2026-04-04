'use client';

import { useEffect, useState, useCallback } from 'react';
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

interface ProviderDataEntry {
  id: number;
  slug: string;
  name: string;
  provider: string;
  resource_type: string;
  available: boolean;
}

const emptyField: FieldDef = { key: '', label: '', type: 'text', required: false, help_text: '', scope: 'product' };

const fieldInputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

function ProviderDataManager({ resourceType, providerOptions }: { resourceType: string; providerOptions: string[] }) {
  const [entries, setEntries] = useState<ProviderDataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProvider, setNewProvider] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);
  const { showToast } = useToast();

  const loadEntries = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/provider-data?type=${resourceType}`);
      const data = await res.json();
      setEntries(data.data || []);
    } catch {
      showToast('Failed to load provider data');
    } finally {
      setLoading(false);
    }
  }, [resourceType, showToast]);

  useEffect(() => { loadEntries(); }, [loadEntries]);

  async function handleAdd() {
    if (!newProvider || !newSlug || !newName) {
      showToast('Provider, slug, and name are required');
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/admin/provider-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: newProvider,
          resource_type: resourceType,
          slug: newSlug,
          name: newName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to add');
        return;
      }
      showToast('Entry added');
      setNewSlug('');
      setNewName('');
      loadEntries();
    } catch {
      showToast('Failed to add entry');
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res = await fetch(`/api/admin/provider-data?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        showToast('Failed to delete');
        return;
      }
      setEntries(prev => prev.filter(e => e.id !== id));
      showToast('Entry deleted');
    } catch {
      showToast('Failed to delete');
    }
  }

  async function handleToggle(entry: ProviderDataEntry) {
    try {
      const res = await fetch('/api/admin/provider-data', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: entry.id, available: !entry.available }),
      });
      if (!res.ok) {
        showToast('Failed to update');
        return;
      }
      setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, available: !e.available } : e));
    } catch {
      showToast('Failed to update');
    }
  }

  const grouped = entries.reduce<Record<string, ProviderDataEntry[]>>((acc, e) => {
    if (!acc[e.provider]) acc[e.provider] = [];
    acc[e.provider].push(e);
    return acc;
  }, {});

  return (
    <div className="mt-3 p-3 bg-background rounded-lg border-2 border-border">
      <div className="text-[0.7rem] font-bold text-muted-foreground mb-2">
        {resourceType === 'region' ? 'Regions' : 'OS Images'} in Provider Data Table
      </div>

      {loading ? (
        <div className="text-[0.7rem] text-muted-foreground py-2">Loading...</div>
      ) : entries.length === 0 ? (
        <div className="text-[0.7rem] text-muted-foreground py-2">No entries yet. Add one below.</div>
      ) : (
        <div className="mb-3 max-h-[300px] overflow-y-auto">
          {Object.entries(grouped).map(([provider, items]) => (
            <div key={provider} className="mb-2">
              <div className="text-[0.68rem] font-bold text-accent mb-1">{provider}</div>
              <div className="grid gap-1">
                {items.map(entry => (
                  <div key={entry.id} className="flex items-center gap-2 text-[0.75rem] py-1 px-2 bg-muted rounded">
                    <button
                      type="button"
                      onClick={() => handleToggle(entry)}
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${entry.available ? 'bg-green-500' : 'bg-red-400'}`}
                      title={entry.available ? 'Available (click to disable)' : 'Disabled (click to enable)'}
                    />
                    <span className="font-medium flex-1">{entry.name}</span>
                    <span className="text-muted-foreground text-[0.65rem]">{entry.slug}</span>
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-400 hover:text-red-300 text-[0.65rem] font-bold ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-border pt-2 mt-2">
        <div className="text-[0.68rem] font-bold text-muted-foreground mb-1.5">Add New Entry</div>
        <div className="grid grid-cols-4 gap-2">
          <input
            list={`provider-options-${resourceType}`}
            value={newProvider}
            onChange={(e) => setNewProvider(e.target.value)}
            className="border-2 border-border rounded-lg px-2 py-1.5 text-[0.75rem] font-medium bg-input focus:outline-none focus:border-accent"
            placeholder="Provider..."
          />
          <datalist id={`provider-options-${resourceType}`}>
            {providerOptions.map(p => (
              <option key={p} value={p} />
            ))}
          </datalist>
          <input
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            className="border-2 border-border rounded-lg px-2 py-1.5 text-[0.75rem] font-medium bg-input focus:outline-none focus:border-accent"
            placeholder="slug (e.g. sgp1)"
          />
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="border-2 border-border rounded-lg px-2 py-1.5 text-[0.75rem] font-medium bg-input focus:outline-none focus:border-accent"
            placeholder="Display Name"
          />
          <Button type="button" size="sm" onClick={handleAdd} disabled={adding}>
            {adding ? 'Adding...' : '+ Add'}
          </Button>
        </div>
      </div>
    </div>
  );
}

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

  const providerField = fields.find(f => f.key === 'provider' && f.type === 'select');
  const providerOptions = providerField?.options || [];

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
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
            <Button variant="accent" onClick={() => handleSave()} disabled={saving}>{saving ? 'Saving...' : 'Save Type'}</Button>
          </div>
        }
      />

      <Panel title="Schema Builder">
        <form onSubmit={handleSave} className="grid gap-4" style={{ padding: '22px' }}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Type Key</span>
            <input
              value={typeKey}
              className={fieldInputClass}
              disabled
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Label</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className={fieldInputClass}
              placeholder="e.g. VPS Droplet"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={fieldInputClass}
              placeholder="Optional description..."
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.75rem] font-bold">Status</span>
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value as 'active' | 'inactive')}
              className={fieldInputClass}
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
                        className={fieldInputClass}
                        placeholder="field_key"
                      />
                    </div>
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Label</label>
                      <input
                        value={f.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className={fieldInputClass}
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
                        className={fieldInputClass}
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
                        className={fieldInputClass}
                      >
                        <option value="product">product — shown on product edit</option>
                        <option value="stock">stock — shown on stock add/edit only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Help Text</label>
                      <input
                        value={f.help_text || ''}
                        onChange={(e) => updateField(idx, { help_text: e.target.value })}
                        className={fieldInputClass}
                        placeholder="Optional helper text"
                      />
                    </div>
                  </div>

                  {f.type === 'select' && (
                    <div className="mb-3">
                      <div className="mb-2">
                        <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Options (comma-separated)</label>
                        <input
                          value={(f.options || []).join(', ')}
                          onChange={(e) => updateField(idx, { options: e.target.value.split(',').map(o => o.trim()).filter(Boolean) })}
                          className={fieldInputClass}
                          placeholder="Option1, Option2, Option3"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Provider Data Type</label>
                          <select
                            value={f.provider_data_type || ''}
                            onChange={(e) => {
                              const val = e.target.value || undefined;
                              updateField(idx, {
                                provider_data_type: val,
                                options_source: val ? 'provider_data' : undefined,
                              });
                            }}
                            className={fieldInputClass}
                          >
                            <option value="">None</option>
                            <option value="region">Region</option>
                            <option value="image">OS Image</option>
                          </select>
                          <div className="text-[0.6rem] text-muted-foreground mt-0.5">Links this field to the provider data table</div>
                        </div>
                        {f.provider_data_type && (
                          <div>
                            <label className="text-[0.7rem] font-bold text-muted-foreground block mb-1">Reload When Field Changes</label>
                            <input
                              value={f.depends_on || ''}
                              onChange={(e) => updateField(idx, { depends_on: e.target.value.replace(/[^a-z0-9_]/g, '') || undefined })}
                              className={fieldInputClass}
                              placeholder="e.g. provider"
                            />
                            <div className="text-[0.6rem] text-muted-foreground mt-0.5">Filter options by this field&apos;s value</div>
                          </div>
                        )}
                      </div>

                      {f.provider_data_type && (
                        <ProviderDataManager
                          resourceType={f.provider_data_type}
                          providerOptions={providerOptions}
                        />
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 mt-3">
                    <label className="flex items-center gap-2 text-sm font-bold cursor-pointer mr-auto">
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={(e) => updateField(idx, { required: e.target.checked })}
                        className="w-4 h-4 accent-accent"
                      />
                      Required
                    </label>
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
