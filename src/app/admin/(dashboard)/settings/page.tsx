'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

interface SettingRowProps {
  label: string;
  desc: string;
  children: React.ReactNode;
}

function SettingRow({ label, desc, children }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-4">
      <div>
        <div className="text-[0.82rem] font-bold">{label}</div>
        <div className="text-[0.72rem] text-muted-foreground">{desc}</div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, settingGroup, settingKey }: { checked: boolean; onChange: (v: boolean) => void; settingGroup: string; settingKey: string }) {
  return (
    <label className="relative w-[38px] h-[22px] flex-shrink-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        data-setting-group={settingGroup}
        data-setting-key={settingKey}
        className="opacity-0 w-0 h-0 peer"
      />
      <span className="absolute inset-0 bg-border rounded-full cursor-pointer transition-colors border-2 border-foreground peer-checked:bg-quaternary before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:left-0.5 before:top-0.5 before:bg-muted-foreground before:rounded-full before:transition-transform peer-checked:before:translate-x-3.5 peer-checked:before:bg-foreground" />
    </label>
  );
}

function SettingInput({ value, onChange, type = 'text', width = '130px', settingGroup, settingKey }: { value: string; onChange: (v: string) => void; type?: string; width?: string; settingGroup: string; settingKey: string }) {
  return (
    <input
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      style={{ width }}
      data-setting-group={settingGroup}
      data-setting-key={settingKey}
    />
  );
}

function SettingSelect({ options, value, onChange, settingGroup, settingKey }: { options: string[]; value: string; onChange: (v: string) => void; settingGroup: string; settingKey: string }) {
  return (
    <select
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      data-setting-group={settingGroup}
      data-setting-key={settingKey}
    >
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)] mb-4">
      <div className="px-5 py-3.5 border-b-2 border-border">
        <div className="font-heading text-base font-extrabold">{title}</div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

type SettingsState = Record<string, string | boolean>;

const DEFAULT_SETTINGS: SettingsState = {
  'catalog.default_visibility': 'draft',
  'catalog.slug_format': 'kebab-case',
  'catalog.max_product_images': '8',
  'catalog.reviews_enabled': true,
  'entitlement.default_expiry_days': '365',
  'entitlement.expiry_warning_days': '7',
  'entitlement.auto_suspend_on_expiry': true,
  'entitlement.grace_period_days': '3',
  'order.auto_fulfill_digital': true,
  'order.currency': 'USD',
  'order.refund_window_days': '14',
  'order.id_prefix': 'ORD-',
  'contact.billing_email': 'billing@digitalloka.dev',
  'contact.ops_alert_email': 'ops@digitalloka.dev',
  'contact.support_email': 'support@digitalloka.dev',
  'contact.audit_webhooks': false,
};

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<SettingsState>({ ...DEFAULT_SETTINGS });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const loaded = { ...DEFAULT_SETTINGS };
        Object.entries(data.settings as Record<string, Array<{ setting_key: string; setting_value: unknown }>>).forEach(([, items]) => {
          if (!Array.isArray(items)) return;
          items.forEach((item) => {
            const val = item.setting_value && typeof item.setting_value === 'object' && Object.prototype.hasOwnProperty.call(item.setting_value, 'value')
              ? (item.setting_value as Record<string, unknown>).value
              : item.setting_value;
            const key = item.setting_key;
            if (key in DEFAULT_SETTINGS) {
              if (typeof DEFAULT_SETTINGS[key] === 'boolean') {
                loaded[key] = Boolean(val);
              } else {
                loaded[key] = val != null ? String(val) : '';
              }
            }
          });
        });
        setSettings(loaded);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  function update(key: string, value: string | boolean) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const entries = Object.entries(settings);
      await Promise.all(entries.map(([key, value]) => {
        const dotIdx = key.indexOf('.');
        const group = key.substring(0, dotIdx);
        return fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group,
            key,
            value: { value },
          }),
        });
      }));
      showToast('Settings saved and audit logged.');
    } catch {
      showToast('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
        <PageHeader title="Settings" subtitle="/admin/settings — platform configuration" />
        <div className="h-64 bg-card border-2 border-border rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Settings"
        subtitle="/admin/settings — platform configuration"
        actions={<Button variant="accent" onClick={saveAll} disabled={saving}>{saving ? 'Saving...' : 'Save All Changes'}</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SettingsPanel title="📦 Catalog Settings">
            <SettingRow label="Default Product Visibility" desc="New products created as draft or published">
              <SettingSelect options={['draft', 'published']} value={settings['catalog.default_visibility'] as string} onChange={(v) => update('catalog.default_visibility', v)} settingGroup="catalog" settingKey="catalog.default_visibility" />
            </SettingRow>
            <SettingRow label="Product Slug Format" desc="Auto-generated slug style">
              <SettingInput value={settings['catalog.slug_format'] as string} onChange={(v) => update('catalog.slug_format', v)} settingGroup="catalog" settingKey="catalog.slug_format" />
            </SettingRow>
            <SettingRow label="Max Product Images" desc="Per product listing">
              <SettingInput value={settings['catalog.max_product_images'] as string} onChange={(v) => update('catalog.max_product_images', v)} type="number" width="70px" settingGroup="catalog" settingKey="catalog.max_product_images" />
            </SettingRow>
            <SettingRow label="Reviews Enabled" desc="Allow users to leave product reviews">
              <Toggle checked={settings['catalog.reviews_enabled'] as boolean} onChange={(v) => update('catalog.reviews_enabled', v)} settingGroup="catalog" settingKey="catalog.reviews_enabled" />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="🔑 Entitlement Defaults">
            <SettingRow label="Default Expiry (days)" desc="Applied when no custom expiry is set">
              <SettingInput value={settings['entitlement.default_expiry_days'] as string} onChange={(v) => update('entitlement.default_expiry_days', v)} type="number" width="70px" settingGroup="entitlement" settingKey="entitlement.default_expiry_days" />
            </SettingRow>
            <SettingRow label="Expiry Warning (days before)" desc="Notify user N days before expiry">
              <SettingInput value={settings['entitlement.expiry_warning_days'] as string} onChange={(v) => update('entitlement.expiry_warning_days', v)} type="number" width="70px" settingGroup="entitlement" settingKey="entitlement.expiry_warning_days" />
            </SettingRow>
            <SettingRow label="Auto-suspend on Expiry" desc="Automatically suspend expired entitlements">
              <Toggle checked={settings['entitlement.auto_suspend_on_expiry'] as boolean} onChange={(v) => update('entitlement.auto_suspend_on_expiry', v)} settingGroup="entitlement" settingKey="entitlement.auto_suspend_on_expiry" />
            </SettingRow>
            <SettingRow label="Grace Period (days)" desc="Days after expiry before full revocation">
              <SettingInput value={settings['entitlement.grace_period_days'] as string} onChange={(v) => update('entitlement.grace_period_days', v)} type="number" width="70px" settingGroup="entitlement" settingKey="entitlement.grace_period_days" />
            </SettingRow>
          </SettingsPanel>
        </div>

        <div>
          <SettingsPanel title="🛒 Order & Fulfillment">
            <SettingRow label="Auto-fulfill Digital Orders" desc="Grant access immediately after payment">
              <Toggle checked={settings['order.auto_fulfill_digital'] as boolean} onChange={(v) => update('order.auto_fulfill_digital', v)} settingGroup="order" settingKey="order.auto_fulfill_digital" />
            </SettingRow>
            <SettingRow label="Currency" desc="Default storefront currency">
              <SettingSelect options={['USD', 'IDR', 'EUR']} value={settings['order.currency'] as string} onChange={(v) => update('order.currency', v)} settingGroup="order" settingKey="order.currency" />
            </SettingRow>
            <SettingRow label="Refund Window (days)" desc="Days a customer can request a refund">
              <SettingInput value={settings['order.refund_window_days'] as string} onChange={(v) => update('order.refund_window_days', v)} type="number" width="70px" settingGroup="order" settingKey="order.refund_window_days" />
            </SettingRow>
            <SettingRow label="Order ID Prefix" desc="Prefix for all generated order IDs">
              <SettingInput value={settings['order.id_prefix'] as string} onChange={(v) => update('order.id_prefix', v)} width="90px" settingGroup="order" settingKey="order.id_prefix" />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="📧 Operational Contacts">
            <SettingRow label="Billing Email" desc="Receives billing alerts and invoices">
              <SettingInput value={settings['contact.billing_email'] as string} onChange={(v) => update('contact.billing_email', v)} width="200px" settingGroup="contact" settingKey="contact.billing_email" />
            </SettingRow>
            <SettingRow label="Ops Alert Email" desc="Receives droplet and critical alerts">
              <SettingInput value={settings['contact.ops_alert_email'] as string} onChange={(v) => update('contact.ops_alert_email', v)} width="200px" settingGroup="contact" settingKey="contact.ops_alert_email" />
            </SettingRow>
            <SettingRow label="Support Email" desc="User-facing support contact address">
              <SettingInput value={settings['contact.support_email'] as string} onChange={(v) => update('contact.support_email', v)} width="200px" settingGroup="contact" settingKey="contact.support_email" />
            </SettingRow>
            <SettingRow label="Audit Webhooks" desc="POST critical events to external endpoint">
              <Toggle checked={settings['contact.audit_webhooks'] as boolean} onChange={(v) => update('contact.audit_webhooks', v)} settingGroup="contact" settingKey="contact.audit_webhooks" />
            </SettingRow>
          </SettingsPanel>
        </div>
      </div>
    </div>
  );
}
