'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function EditStockPage() {
  const router = useRouter();
  const { id } = useParams();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product') || '';
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState('');
  const [credHeaders, setCredHeaders] = useState<string[]>([]);
  const [status, setStatus] = useState('unsold');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStock() {
      try {
        const res = await fetch(`/api/admin/product-stocks/${id}`);
        const data = await res.json();
        if (!res.ok) { showToast('Stock not found'); router.back(); return; }
        const stock = data.data;
        const cred = stock.credential_data as Record<string, string> | undefined;
        const headers = cred ? Object.keys(cred) : [];
        const values = cred ? headers.map(h => cred[h] || '') : [];
        setCredHeaders(headers);
        setCredentials(values.join('|'));
        setStatus(stock.status || 'unsold');
      } catch { showToast('Failed to load stock'); }
      finally { setLoading(false); }
    }
    loadStock();
  }, [id, router, showToast]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const editedValues = credentials.trim();
    if (!editedValues) { showToast('Values are required.'); return; }

    const values = editedValues.split('|').map(v => v.trim());
    if (values.length !== credHeaders.length) {
      showToast('Value count must match existing header count.');
      return;
    }

    const nextCredentialData: Record<string, string> = {};
    credHeaders.forEach((header, index) => {
      nextCredentialData[header] = values[index] || '';
    });

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/product-stocks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential_data: nextCredentialData, status }),
      });
      if (!res.ok) {
        const result = await res.json();
        showToast(result.error || 'Update failed');
        return;
      }
      showToast('Stock item updated.');
      router.push(`/admin/product-stocks?product=${productId}`);
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader title="Edit Stock Item" subtitle={`/admin/product-stocks/${id}/edit`} />
        <Panel><div className="h-40 bg-muted rounded-lg animate-pulse" /></Panel>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Edit Stock Item"
        subtitle={`Edit stock entry #${String(id).slice(0, 8)}`}
        actions={
          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>← Back to Stocks</Button>
        }
      />

      <Panel>
        <form onSubmit={handleSave} style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">
              Credential Values (| separated) — Headers: {credHeaders.join(' | ')}
            </span>
            <textarea
              value={credentials}
              onChange={(e) => setCredentials(e.target.value)}
              className={inputClass}
              rows={3}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="unsold">unsold</option>
              <option value="sold">sold</option>
            </select>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <Button type="button" variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={saving}>{saving ? 'Saving...' : 'Update Stock'}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
