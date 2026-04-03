'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { AdminTable } from '@/components/ui/admin-table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

interface FieldDef {
  key: string;
  label: string;
  type: string;
  required: boolean;
}

interface ProductType {
  id?: number;
  type: string;
  label: string;
  description: string;
  is_active: boolean;
  fields: FieldDef[];
}

const emptyType: ProductType = { type: '', label: '', description: '', is_active: true, fields: [] };
const emptyField: FieldDef = { key: '', label: '', type: 'text', required: false };

export default function ProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProductType | null>(null);
  const [isCreate, setIsCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { loadTypes(); }, []);

  async function loadTypes() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/product-types');
      const data = await res.json();
      setTypes(Array.isArray(data.data) ? data.data : []);
    } catch { showToast('Failed to load product types'); }
    finally { setLoading(false); }
  }

  function openCreate() {
    setEditing({ ...emptyType });
    setIsCreate(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditing({
      id: row.id as number,
      type: row.type as string,
      label: row.label as string,
      description: row.description as string || '',
      is_active: row.is_active as boolean,
      fields: (row.fields as FieldDef[]) || [],
    });
    setIsCreate(false);
  }

  function closeModal() {
    setEditing(null);
    setIsCreate(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.type.trim() || !editing.label.trim()) {
      showToast('Type key and label are required');
      return;
    }
    setSaving(true);
    try {
      const url = isCreate
        ? '/api/admin/product-types'
        : `/api/admin/product-types/${encodeURIComponent(editing.type)}`;
      const method = isCreate ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: editing.type,
          label: editing.label,
          description: editing.description,
          is_active: editing.is_active,
          fields: editing.fields,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Failed to save');
        return;
      }
      showToast(isCreate ? 'Product type created' : 'Product type updated');
      closeModal();
      loadTypes();
    } catch { showToast('Failed to save product type'); }
    finally { setSaving(false); }
  }

  async function deleteType(typeKey: string) {
    if (!confirm(`Delete product type "${typeKey}"?`)) return;
    try {
      const res = await fetch(`/api/admin/product-types/${encodeURIComponent(typeKey)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      showToast('Product type deleted');
      loadTypes();
    } catch { showToast('Failed to delete'); }
  }

  function addField() {
    if (!editing) return;
    setEditing({ ...editing, fields: [...editing.fields, { ...emptyField }] });
  }

  function updateField(idx: number, patch: Partial<FieldDef>) {
    if (!editing) return;
    const fields = [...editing.fields];
    fields[idx] = { ...fields[idx], ...patch };
    setEditing({ ...editing, fields });
  }

  function removeField(idx: number) {
    if (!editing) return;
    setEditing({ ...editing, fields: editing.fields.filter((_, i) => i !== idx) });
  }

  const filtered = types.filter(t => {
    if (filter === 'vps_only' && t.type !== 'vps_droplet') return false;
    if (filter === 'custom_only' && ['digital', 'template', 'course', 'vps_droplet'].includes(t.type)) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.type.toLowerCase().includes(s) || t.label.toLowerCase().includes(s);
    }
    return true;
  });

  const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

  const columns = [
    {
      key: 'type',
      label: 'Type Key',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--muted-foreground)' }}>{row.type as string}</span>
      ),
    },
    {
      key: 'label',
      label: 'Label',
      render: (row: Record<string, unknown>) => (
        <span style={{ fontWeight: 800 }}>{row.label as string}</span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row: Record<string, unknown>) => (
        <StatusBadge variant={row.is_active ? 'active' : 'stopped'} label={row.is_active ? 'Active' : 'Inactive'} />
      ),
    },
    {
      key: 'description',
      label: 'Description',
      style: { color: 'var(--muted-foreground)', fontSize: '0.74rem' } as React.CSSProperties,
    },
    {
      key: 'fields',
      label: 'Fields',
      render: (row: Record<string, unknown>) => (
        <span
          className="inline-flex items-center bg-muted rounded-full text-[0.65rem] font-bold text-muted-foreground"
          style={{ padding: '2px 8px', border: '1.5px solid var(--border)' }}
        >
          {(row.fields as unknown[] || []).length} fields
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row: Record<string, unknown>) => (
        <div className="flex gap-1 flex-wrap">
          <Button size="sm" onClick={() => openEdit(row)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => deleteType(row.type as string)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Types"
        subtitle="/admin/product-types — manage schema per product type"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={loadTypes}>Refresh</Button>
            <Button variant="accent" onClick={openCreate}>+ Create Type</Button>
          </div>
        }
      />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <select
          className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1.5 font-body text-[0.75rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="vps_only">VPS Only</option>
          <option value="custom_only">Custom Types</option>
        </select>
        <input
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)] min-w-[170px]"
          placeholder="Search type key or label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Panel><div className="h-24 bg-muted rounded-lg animate-pulse" /></Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No product types" description="Create a product type to define schemas for your products." />
      ) : (
        <Panel noPad>
          <div style={{ padding: 16 }}>
            <AdminTable columns={columns} rows={filtered as unknown as Record<string, unknown>[]} emptyText="No product type schema found." />
          </div>
        </Panel>
      )}

      <Panel title="DigitalOcean Regional Availability Reference">
        <a
          href="https://docs.digitalocean.com/platform/regional-availability/"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 font-body font-bold border-2 border-foreground rounded-full cursor-pointer px-3 py-1 text-xs shadow-[2px_2px_0_var(--shadow)] bg-card text-foreground no-underline hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--shadow)] transition-all duration-150"
        >
          Open DigitalOcean Regional Availability
        </a>
      </Panel>

      <Modal open={!!editing} onClose={closeModal} title={isCreate ? 'Create Product Type' : `Edit: ${editing?.label || ''}`}>
        {editing && (
          <form onSubmit={handleSave} className="space-y-3">
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Type Key</span>
              <input
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value.replace(/[^a-z0-9_]/g, '') })}
                className={inputClass}
                placeholder="e.g. vps_droplet"
                disabled={!isCreate}
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Label</span>
              <input
                value={editing.label}
                onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                className={inputClass}
                placeholder="e.g. VPS Droplet"
                required
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase text-muted-foreground">Description</span>
              <textarea
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className={inputClass}
                rows={2}
                placeholder="Optional description..."
              />
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })}
                className="w-4 h-4 accent-accent"
              />
              <span className="text-sm font-bold">Active</span>
            </label>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground">Custom Fields</span>
                <Button type="button" size="sm" onClick={addField}>+ Add Field</Button>
              </div>
              {editing.fields.length === 0 && (
                <div className="text-[0.75rem] text-muted-foreground py-2">No custom fields defined.</div>
              )}
              {editing.fields.map((f, idx) => (
                <div key={idx} className="flex gap-2 items-start mb-2 p-2 bg-muted rounded-lg border border-border">
                  <input
                    value={f.key}
                    onChange={(e) => updateField(idx, { key: e.target.value.replace(/[^a-z0-9_]/g, '') })}
                    className="flex-1 border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input"
                    placeholder="key"
                  />
                  <input
                    value={f.label}
                    onChange={(e) => updateField(idx, { label: e.target.value })}
                    className="flex-1 border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input"
                    placeholder="Label"
                  />
                  <select
                    value={f.type}
                    onChange={(e) => updateField(idx, { type: e.target.value })}
                    className="border-2 border-border rounded px-2 py-1 text-xs font-medium bg-input w-20"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="boolean">Boolean</option>
                    <option value="textarea">Textarea</option>
                  </select>
                  <label className="flex items-center gap-1 text-[0.65rem] font-bold whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={f.required}
                      onChange={(e) => updateField(idx, { required: e.target.checked })}
                      className="w-3 h-3"
                    />
                    Req
                  </label>
                  <button
                    type="button"
                    onClick={() => removeField(idx)}
                    className="text-xs font-bold text-secondary px-1.5 py-0.5 hover:bg-secondary/10 rounded"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <Button type="submit" variant="accent" disabled={saving}>
                {saving ? 'Saving...' : isCreate ? 'Create Type' : 'Save Changes'}
              </Button>
              <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
