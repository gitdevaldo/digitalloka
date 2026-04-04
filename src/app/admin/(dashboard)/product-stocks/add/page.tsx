'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type * as XLSXType from 'xlsx';

const inputClass = "w-full border-2 border-border rounded-lg px-3 py-2 text-sm font-medium bg-input focus:outline-none focus:border-accent";

export default function AddStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get('product') || '';
  const productName = searchParams.get('name') || 'Product';
  const { showToast } = useToast();

  const [headers, setHeaders] = useState('Email|Password|Recovery Code');
  const [rows, setRows] = useState('');
  const [isUnlimited, setIsUnlimited] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv' || ext === 'txt') {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        if (text) setRows(prev => prev ? prev + '\n' + text.trim() : text.trim());
      };
      reader.readAsText(file);
    } else if (ext === 'xls' || ext === 'xlsx') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const XLSX: typeof XLSXType = await import('xlsx');
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });
        const lines = jsonData
          .filter((row) => row.length > 0 && row.some(cell => cell !== undefined && cell !== ''))
          .map((row) => row.join('|'))
          .join('\n');
        if (lines) setRows(prev => prev ? prev + '\n' + lines : lines);
      };
      reader.readAsArrayBuffer(file);
    } else {
      showToast('Unsupported file type. Use CSV, TXT, XLS, or XLSX.');
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId || !rows.trim()) return;
    setImporting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headers: headers.split('|').map(h => h.trim()),
          rows: rows,
          is_unlimited: isUnlimited,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Import failed');
        return;
      }
      showToast(`Imported ${result.inserted} of ${result.total_lines} stock items`);
      router.push(`/admin/product-stocks?product=${productId}`);
    } catch { showToast('Import failed'); }
    finally { setImporting(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Add Stock"
        subtitle={`Add stock entries for ${productName}`}
        actions={
          <Button size="sm" variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>← Back to Stocks</Button>
        }
      />

      <Panel>
        <form onSubmit={handleSubmit} style={{ padding: '6px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Headers (| separated)</span>
            <input
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className={inputClass}
              placeholder="Email|Password|Recovery Code"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[0.8rem] font-bold">Stock Rows (one row per line, values separated by |)</span>
            <textarea
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              className={inputClass}
              rows={8}
              placeholder={"email1@mail.com|pass1|recovery1\nemail2@mail.com|pass2|recovery2"}
              required
            />
          </label>

          <div className="flex items-center gap-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt,.xls,.xlsx"
                onChange={handleFileImport}
                className="hidden"
              />
              <Button type="button" size="sm" onClick={() => fileInputRef.current?.click()}>Import File</Button>
              <span className="text-[0.68rem] text-muted-foreground ml-2">CSV, TXT, XLS, XLSX</span>
            </div>
          </div>

          <label className="flex items-center gap-3 py-2 px-3 bg-muted/50 rounded-lg border-2 border-border cursor-pointer">
            <input
              type="checkbox"
              checked={isUnlimited}
              onChange={(e) => setIsUnlimited(e.target.checked)}
              className="w-4 h-4 accent-[var(--accent)] cursor-pointer"
            />
            <div>
              <span className="text-[0.8rem] font-bold">Unlimited Stock</span>
              <p className="text-[0.68rem] text-muted-foreground">
                When enabled, these stock items can be sold multiple times without being marked as sold. Use for digital products with no quantity limit.
              </p>
            </div>
          </label>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <Button type="button" variant="ghost" onClick={() => router.push(`/admin/product-stocks?product=${productId}`)}>Cancel</Button>
            <Button type="submit" variant="accent" disabled={importing}>{importing ? 'Importing...' : 'Add / Import Stocks'}</Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
