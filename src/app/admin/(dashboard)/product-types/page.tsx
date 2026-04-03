'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { TableShell } from '@/components/ui/table-shell';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';

interface ProductType {
  type: string;
  label: string;
  description: string;
  is_active: boolean;
  fields: unknown[];
}

export default function ProductTypesPage() {
  const [types, setTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
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

  const filtered = types.filter(t => {
    if (filter === 'vps_only' && t.type !== 'vps_droplet') return false;
    if (filter === 'custom_only' && ['digital', 'template', 'course', 'vps_droplet'].includes(t.type)) return false;
    if (search) {
      const s = search.toLowerCase();
      return t.type.toLowerCase().includes(s) || t.label.toLowerCase().includes(s);
    }
    return true;
  });

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Product Types"
        subtitle="/admin/product-types — manage schema per product type"
        actions={
          <div className="flex gap-2">
            <Button size="sm" onClick={loadTypes}>Refresh</Button>
            <Button variant="accent">+ Create Type</Button>
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
          className="border-2 border-border rounded-[var(--r-sm)] px-3 py-1.5 font-body text-[0.75rem] font-medium bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
          placeholder="Search type key or label..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Panel>
          <div className="h-24 bg-muted rounded-lg animate-pulse" />
        </Panel>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title="No product types" description="Create a product type to define schemas for your products." />
      ) : (
        <Panel>
          <TableShell variant="admin">
            <thead><tr><th>Type Key</th><th>Label</th><th>Status</th><th>Description</th><th>Fields</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.type}>
                  <td className="font-mono text-[0.78rem] font-bold">{t.type}</td>
                  <td className="font-bold">{t.label}</td>
                  <td><StatusBadge variant={t.is_active ? 'active' : 'stopped'} label={t.is_active ? 'Active' : 'Inactive'} /></td>
                  <td className="text-[0.78rem] text-muted-foreground max-w-[200px] truncate">{t.description || '—'}</td>
                  <td className="text-[0.78rem]">{(t.fields || []).length} field(s)</td>
                  <td><Button size="sm">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        </Panel>
      )}

      <Panel title="DigitalOcean Regional Availability Reference">
        <a href="https://docs.digitalocean.com/platform/regional-availability/" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 font-body font-bold border-2 border-foreground rounded-full cursor-pointer px-3 py-1 text-xs shadow-[2px_2px_0_var(--shadow)] bg-card text-foreground no-underline hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--shadow)] transition-all duration-150">Open DigitalOcean Regional Availability</a>
      </Panel>
    </div>
  );
}
