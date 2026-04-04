'use client';

import { useEffect, useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';

export interface StockFieldDef {
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

interface ProviderDataOption {
  slug: string;
  name: string;
  available: boolean;
}

interface VpsStockFormProps {
  fields: StockFieldDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  sellingPrice: string;
  onSellingPriceChange: (v: string) => void;
  mode: 'add' | 'edit';
  status?: string;
  onStatusChange?: (v: string) => void;
  isUnlimited?: boolean;
  onUnlimitedChange?: (v: boolean) => void;
}

function formatMemory(mb: number): string {
  if (mb >= 1024) return `${(mb / 1024).toFixed(mb % 1024 === 0 ? 0 : 1)} GB`;
  return `${mb} MB`;
}

const inputClass = "w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-input text-foreground focus:outline-none focus:border-accent";
const selectClass = "w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] font-bold bg-input text-foreground focus:outline-none focus:border-accent";
const labelClass = "text-[0.72rem] font-bold text-muted-foreground block mb-1.5";

export function VpsStockForm({
  fields,
  values,
  onChange,
  sellingPrice,
  onSellingPriceChange,
  mode,
  status,
  onStatusChange,
  isUnlimited,
  onUnlimitedChange,
}: VpsStockFormProps) {
  const [providerDataOptions, setProviderDataOptions] = useState<Record<string, ProviderDataOption[]>>({});
  const [loadingProviderData, setLoadingProviderData] = useState<Record<string, boolean>>({});

  const fetchProviderData = useCallback(async (provider: string, dataType: string, fieldKey: string) => {
    if (!provider) {
      setProviderDataOptions(prev => ({ ...prev, [fieldKey]: [] }));
      return;
    }
    setLoadingProviderData(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const res = await fetch(`/api/admin/provider-data?provider=${encodeURIComponent(provider)}&type=${encodeURIComponent(dataType)}`);
      const d = await res.json();
      const available = (d.data || []).filter((item: ProviderDataOption) => item.available);
      setProviderDataOptions(prev => ({ ...prev, [fieldKey]: available }));
    } catch {
      setProviderDataOptions(prev => ({ ...prev, [fieldKey]: [] }));
    } finally {
      setLoadingProviderData(prev => ({ ...prev, [fieldKey]: false }));
    }
  }, []);

  useEffect(() => {
    const providerDataFields = fields.filter(f => f.provider_data_type);
    for (const field of providerDataFields) {
      const depValue = field.depends_on ? (values[field.depends_on] || '') : (values['provider'] || '');
      fetchProviderData(depValue, field.provider_data_type!, field.key);
    }
  }, [values, fields, fetchProviderData]);

  function handleFieldChange(changedKey: string, value: string) {
    onChange(changedKey, value);
    const dependentFields = fields.filter(f => f.depends_on === changedKey);
    for (const f of dependentFields) {
      onChange(f.key, '');
    }
  }

  function getOptionsForField(field: StockFieldDef): { value: string; label: string }[] {
    if (field.provider_data_type) {
      const dynamicItems = providerDataOptions[field.key] || [];
      return dynamicItems.map(item => ({
        value: item.slug,
        label: `${item.name} (${item.slug})`,
      }));
    }

    return (field.options || []).map(opt => ({ value: opt, label: opt }));
  }

  function renderField(field: StockFieldDef) {
    const value = values[field.key] || '';
    const hasDependents = fields.some(f => f.depends_on === field.key);
    const isLoading = loadingProviderData[field.key] || false;
    const isDependentEmpty = field.depends_on && !values[field.depends_on];

    if (field.type === 'select') {
      const options = getOptionsForField(field);

      if (isDependentEmpty) {
        return (
          <div key={field.key}>
            <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
            <div className="text-[0.78rem] text-muted-foreground italic">
              Select {fields.find(f => f.key === field.depends_on)?.label?.toLowerCase() || field.depends_on} first
            </div>
          </div>
        );
      }

      if (isLoading) {
        return (
          <div key={field.key}>
            <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
            <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 text-[0.85rem] bg-muted text-muted-foreground">
              Loading {field.label.toLowerCase()}...
            </div>
          </div>
        );
      }

      if (options.length === 0 && field.provider_data_type) {
        return (
          <div key={field.key}>
            <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
            <div className="border-2 border-border rounded-[var(--r-sm)] px-3 py-2 bg-muted/50">
              <div className="text-[0.78rem] text-muted-foreground">
                No {field.label.toLowerCase()} data available for {values['provider'] || 'this provider'}
              </div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                Sync provider data or add options in the product type definition.
              </div>
            </div>
          </div>
        );
      }

      if (options.length === 0) {
        return (
          <div key={field.key}>
            <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
            <div className="border-2 border-secondary rounded-[var(--r-sm)] px-3 py-2 bg-secondary/10">
              <div className="text-[0.8rem] font-bold text-secondary">No options defined</div>
              <div className="text-[0.65rem] text-muted-foreground mt-0.5">
                Add options in the product type field definition.
              </div>
            </div>
          </div>
        );
      }

      return (
        <div key={field.key}>
          <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
          <select
            className={selectClass}
            value={value}
            onChange={e => hasDependents ? handleFieldChange(field.key, e.target.value) : onChange(field.key, e.target.value)}
          >
            <option value="">— select {field.label.toLowerCase()} —</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {field.help_text && <div className="text-[0.65rem] text-muted-foreground mt-1">{field.help_text}</div>}
        </div>
      );
    }

    if (field.type === 'number') {
      return (
        <div key={field.key}>
          <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
          <input
            type="number"
            className={inputClass}
            value={value}
            onChange={e => onChange(field.key, e.target.value)}
            placeholder={field.help_text || ''}
          />
        </div>
      );
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key}>
          <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
          <textarea
            className={inputClass + ' min-h-[60px]'}
            value={value}
            onChange={e => onChange(field.key, e.target.value)}
            placeholder={field.help_text || ''}
          />
        </div>
      );
    }

    if (field.type === 'boolean') {
      return (
        <div key={field.key} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`field_${field.key}`}
            checked={value === 'true'}
            onChange={e => onChange(field.key, String(e.target.checked))}
            className="w-4 h-4 accent-[var(--accent)]"
          />
          <label htmlFor={`field_${field.key}`} className="text-[0.8rem] font-semibold cursor-pointer">
            {field.label}
          </label>
        </div>
      );
    }

    return (
      <div key={field.key}>
        <label className={labelClass}>{field.label}{field.required ? ' *' : ''}</label>
        <input
          className={inputClass + (field.key === 'slug' ? ' font-mono' : '')}
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.help_text || ''}
        />
      </div>
    );
  }

  const configFields = fields.filter(f => !f.provider_data_type);
  const locationFields = fields.filter(f => !!f.provider_data_type);

  const numberPairKeys = ['vcpus', 'memory', 'disk', 'transfer'];
  const numberFields = configFields.filter(f => numberPairKeys.includes(f.key));
  const otherConfigFields = configFields.filter(f => !numberPairKeys.includes(f.key));

  const selectedRegion = values['region'] || '';
  const selectedOs = values['os'] || '';
  const regionOptions = providerDataOptions['region'] || [];
  const osOptions = providerDataOptions['os'] || [];
  const regionName = regionOptions.find(r => r.slug === selectedRegion)?.name ||
    fields.find(f => f.key === 'region')?.options?.find(o => o === selectedRegion) || selectedRegion;
  const osName = osOptions.find(i => i.slug === selectedOs)?.name ||
    fields.find(f => f.key === 'os')?.options?.find(o => o === selectedOs) || selectedOs;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
        <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
          <h3 className="text-[0.8rem] font-extrabold uppercase tracking-wider mb-4">Size Configuration</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            {otherConfigFields.map(f => renderField(f))}
            {numberFields.length > 0 && (
              <>
                {(() => {
                  const pairs: StockFieldDef[][] = [];
                  for (let i = 0; i < numberFields.length; i += 2) {
                    pairs.push(numberFields.slice(i, i + 2));
                  }
                  return pairs.map((pair, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: pair.length === 2 ? '1fr 1fr' : '1fr', gap: 12 }}>
                      {pair.map(f => renderField(f))}
                    </div>
                  ));
                })()}
              </>
            )}
          </div>
        </div>

        {locationFields.length > 0 && (
          <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
            <h3 className="text-[0.8rem] font-extrabold uppercase tracking-wider mb-4">Region & OS</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              {locationFields.map(f => renderField(f))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
        <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
          <h3 className="text-[0.8rem] font-extrabold uppercase tracking-wider mb-4">
            {mode === 'edit' ? 'Pricing & Status' : 'Pricing'}
          </h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label className={labelClass}>Selling Price (IDR/mo) *</label>
              <div className="flex items-center gap-2">
                <span className="text-[0.85rem] font-bold text-muted-foreground">Rp</span>
                <input
                  type="number"
                  className={inputClass + ' font-bold'}
                  value={sellingPrice}
                  onChange={e => onSellingPriceChange(e.target.value)}
                  placeholder="50000"
                />
              </div>
              {sellingPrice && Number(sellingPrice) > 0 && (
                <div className="text-[0.7rem] text-muted-foreground mt-1">
                  Displays as: {formatCurrency(Number(sellingPrice), 'IDR')}/mo
                </div>
              )}
            </div>

            {mode === 'edit' && onStatusChange && (
              <div>
                <label className={labelClass}>Status</label>
                <select
                  className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.85rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent"
                  value={status}
                  onChange={e => onStatusChange(e.target.value)}
                >
                  <option value="enabled">Enabled (visible to customers)</option>
                  <option value="disabled">Disabled (hidden from customers)</option>
                </select>
              </div>
            )}

            {mode === 'edit' && onUnlimitedChange !== undefined && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="unlimited"
                  checked={isUnlimited}
                  onChange={e => onUnlimitedChange(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <label htmlFor="unlimited" className="text-[0.8rem] font-semibold cursor-pointer">Unlimited stock</label>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 bg-card border-2 border-border rounded-[var(--r-md)]">
          <h3 className="text-[0.8rem] font-extrabold uppercase tracking-wider mb-4">Preview</h3>
          <div style={{ background: 'var(--muted)', borderRadius: 'var(--r-sm)', padding: 16 }}>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--accent)' }}>
                {values['provider'] || '—'}
              </span>
            </div>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>
              {values['slug'] || '—'}
            </div>
            <div className="flex gap-1.5 flex-wrap mb-3">
              <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{values['vcpus'] || '0'} vCPU</span>
              <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{values['memory'] ? formatMemory(Number(values['memory'])) : '0 MB'}</span>
              <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{values['disk'] || '0'} GB disk</span>
              <span className="inline-flex bg-card rounded text-[0.68rem] font-mono px-2 py-0.5 border border-border">{values['transfer'] || '0'} TB transfer</span>
            </div>
            {(regionName || osName) && (selectedRegion || selectedOs) && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {selectedRegion && (
                  <span className="inline-flex bg-accent/10 text-accent rounded text-[0.68rem] font-bold px-2 py-0.5 border border-accent/30">{regionName}</span>
                )}
                {selectedOs && (
                  <span className="inline-flex bg-quaternary/10 text-foreground rounded text-[0.68rem] font-bold px-2 py-0.5 border border-quaternary/30">{osName}</span>
                )}
              </div>
            )}
            <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
              {sellingPrice && Number(sellingPrice) > 0 ? `${formatCurrency(Number(sellingPrice), 'IDR')}/mo` : 'No price set'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

export function getResolvedNames(
  fields: StockFieldDef[],
  values: Record<string, string>,
  providerDataOptions?: Record<string, ProviderDataOption[]>
): { regionName?: string; osName?: string } {
  const region = values['region'] || '';
  const os = values['os'] || '';
  if (!region && !os) return {};

  const regionOptions = providerDataOptions?.['region'] || [];
  const osOptions = providerDataOptions?.['os'] || [];
  const regionField = fields.find(f => f.key === 'region');
  const osField = fields.find(f => f.key === 'os');

  return {
    regionName: region ? (regionOptions.find(r => r.slug === region)?.name || regionField?.options?.find(o => o === region) || region) : undefined,
    osName: os ? (osOptions.find(i => i.slug === os)?.name || osField?.options?.find(o => o === os) || os) : undefined,
  };
}
