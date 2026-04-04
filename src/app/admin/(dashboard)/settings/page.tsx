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

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-[44px] h-[24px] flex-shrink-0 rounded-full border-2 transition-all duration-200 cursor-pointer ${
        checked
          ? 'bg-[#22c55e] border-[#16a34a]'
          : 'bg-[#d1d5db] border-[#9ca3af]'
      }`}
    >
      <span
        className={`absolute top-[2px] w-[16px] h-[16px] rounded-full transition-all duration-200 shadow-sm ${
          checked
            ? 'left-[22px] bg-white'
            : 'left-[2px] bg-white'
        }`}
      />
    </button>
  );
}

function SettingInput({ value, onChange, type = 'text', width = '130px' }: { value: string; onChange: (v: string) => void; type?: string; width?: string }) {
  return (
    <input
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      style={{ width }}
    />
  );
}

function SettingSelect({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      value={value}
      onChange={(e) => onChange(e.target.value)}
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

interface GroupedSettings {
  catalog: {
    default_visibility: string;
    slug_format: string;
    max_product_images: string;
    reviews_enabled: boolean;
  };
  entitlement: {
    default_expiry_days: string;
    expiry_warning_days: string;
    auto_suspend_on_expiry: boolean;
    grace_period_days: string;
  };
  order: {
    auto_fulfill_digital: boolean;
    currency: string;
    refund_window_days: string;
    id_prefix: string;
  };
  contact: {
    billing_email: string;
    ops_alert_email: string;
    support_email: string;
    audit_webhooks: boolean;
  };
  smtp: {
    host: string;
    port: string;
    secure: boolean;
    user: string;
    pass: string;
    from_name: string;
    from_email: string;
  };
}

const DEFAULTS: GroupedSettings = {
  catalog: {
    default_visibility: 'draft',
    slug_format: 'kebab-case',
    max_product_images: '8',
    reviews_enabled: true,
  },
  entitlement: {
    default_expiry_days: '365',
    expiry_warning_days: '7',
    auto_suspend_on_expiry: true,
    grace_period_days: '3',
  },
  order: {
    auto_fulfill_digital: true,
    currency: 'USD',
    refund_window_days: '14',
    id_prefix: 'ORD-',
  },
  contact: {
    billing_email: 'billing@digitalloka.dev',
    ops_alert_email: 'ops@digitalloka.dev',
    support_email: 'support@digitalloka.dev',
    audit_webhooks: false,
  },
  smtp: {
    host: '',
    port: '587',
    secure: false,
    user: '',
    pass: '',
    from_name: 'DigitalLoka',
    from_email: '',
  },
};

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<GroupedSettings>({ ...DEFAULTS });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (res.ok && data.settings) {
        const s = data.settings as Record<string, Record<string, unknown>>;
        const merged = { ...DEFAULTS } as GroupedSettings;

        for (const group of Object.keys(DEFAULTS) as (keyof GroupedSettings)[]) {
          if (s[group]) {
            const defaults = DEFAULTS[group] as Record<string, unknown>;
            const loaded = s[group];
            const target = { ...defaults } as Record<string, unknown>;

            for (const key of Object.keys(defaults)) {
              if (key in loaded) {
                const defaultVal = defaults[key];
                if (typeof defaultVal === 'boolean') {
                  target[key] = loaded[key] === true || loaded[key] === 'true';
                } else {
                  target[key] = loaded[key] != null ? String(loaded[key]) : '';
                }
              }
            }
            (merged as Record<string, unknown>)[group] = target;
          }
        }
        setSettings(merged);
      }
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  }

  function updateField<G extends keyof GroupedSettings>(group: G, key: keyof GroupedSettings[G], value: unknown) {
    setSettings(prev => ({
      ...prev,
      [group]: { ...prev[group], [key]: value },
    }));
  }

  async function saveAll() {
    setSaving(true);
    try {
      const groups = Object.keys(settings) as (keyof GroupedSettings)[];
      await Promise.all(groups.map(group =>
        fetch('/api/admin/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ group, values: settings[group] }),
        })
      ));
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
          <SettingsPanel title="Catalog Settings">
            <SettingRow label="Default Product Visibility" desc="New products created as draft or published">
              <SettingSelect options={['draft', 'published']} value={settings.catalog.default_visibility} onChange={(v) => updateField('catalog', 'default_visibility', v)} />
            </SettingRow>
            <SettingRow label="Product Slug Format" desc="Auto-generated slug style">
              <SettingInput value={settings.catalog.slug_format} onChange={(v) => updateField('catalog', 'slug_format', v)} />
            </SettingRow>
            <SettingRow label="Max Product Images" desc="Per product listing">
              <SettingInput value={settings.catalog.max_product_images} onChange={(v) => updateField('catalog', 'max_product_images', v)} type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Reviews Enabled" desc="Allow users to leave product reviews">
              <Toggle checked={settings.catalog.reviews_enabled} onChange={(v) => updateField('catalog', 'reviews_enabled', v)} />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="Entitlement Defaults">
            <SettingRow label="Default Expiry (days)" desc="Applied when no custom expiry is set">
              <SettingInput value={settings.entitlement.default_expiry_days} onChange={(v) => updateField('entitlement', 'default_expiry_days', v)} type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Expiry Warning (days before)" desc="Notify user N days before expiry">
              <SettingInput value={settings.entitlement.expiry_warning_days} onChange={(v) => updateField('entitlement', 'expiry_warning_days', v)} type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Auto-suspend on Expiry" desc="Automatically suspend expired entitlements">
              <Toggle checked={settings.entitlement.auto_suspend_on_expiry} onChange={(v) => updateField('entitlement', 'auto_suspend_on_expiry', v)} />
            </SettingRow>
            <SettingRow label="Grace Period (days)" desc="Days after expiry before full revocation">
              <SettingInput value={settings.entitlement.grace_period_days} onChange={(v) => updateField('entitlement', 'grace_period_days', v)} type="number" width="70px" />
            </SettingRow>
          </SettingsPanel>
        </div>

        <div>
          <SettingsPanel title="Order & Fulfillment">
            <SettingRow label="Auto-fulfill Digital Orders" desc="Grant access immediately after payment">
              <Toggle checked={settings.order.auto_fulfill_digital} onChange={(v) => updateField('order', 'auto_fulfill_digital', v)} />
            </SettingRow>
            <SettingRow label="Currency" desc="Default storefront currency">
              <SettingSelect options={['USD', 'IDR', 'EUR']} value={settings.order.currency} onChange={(v) => updateField('order', 'currency', v)} />
            </SettingRow>
            <SettingRow label="Refund Window (days)" desc="Days a customer can request a refund">
              <SettingInput value={settings.order.refund_window_days} onChange={(v) => updateField('order', 'refund_window_days', v)} type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Order ID Prefix" desc="Prefix for all generated order IDs">
              <SettingInput value={settings.order.id_prefix} onChange={(v) => updateField('order', 'id_prefix', v)} width="90px" />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="Operational Contacts">
            <SettingRow label="Billing Email" desc="Receives billing alerts and invoices">
              <SettingInput value={settings.contact.billing_email} onChange={(v) => updateField('contact', 'billing_email', v)} width="200px" />
            </SettingRow>
            <SettingRow label="Ops Alert Email" desc="Receives droplet and critical alerts">
              <SettingInput value={settings.contact.ops_alert_email} onChange={(v) => updateField('contact', 'ops_alert_email', v)} width="200px" />
            </SettingRow>
            <SettingRow label="Support Email" desc="User-facing support contact address">
              <SettingInput value={settings.contact.support_email} onChange={(v) => updateField('contact', 'support_email', v)} width="200px" />
            </SettingRow>
            <SettingRow label="Audit Webhooks" desc="POST critical events to external endpoint">
              <Toggle checked={settings.contact.audit_webhooks} onChange={(v) => updateField('contact', 'audit_webhooks', v)} />
            </SettingRow>
          </SettingsPanel>
        </div>
      </div>

      <div className="mt-4">
        <SettingsPanel title="SMTP / Email">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div>
              <SettingRow label="SMTP Host" desc="e.g. smtp.gmail.com, smtp.zoho.com">
                <SettingInput value={settings.smtp.host} onChange={(v) => updateField('smtp', 'host', v)} width="200px" />
              </SettingRow>
              <SettingRow label="SMTP Port" desc="587 (TLS) or 465 (SSL)">
                <SettingInput value={settings.smtp.port} onChange={(v) => updateField('smtp', 'port', v)} type="number" width="80px" />
              </SettingRow>
              <SettingRow label="Use SSL" desc="Enable for port 465">
                <Toggle checked={settings.smtp.secure} onChange={(v) => updateField('smtp', 'secure', v)} />
              </SettingRow>
              <SettingRow label="Username" desc="SMTP login username / email">
                <SettingInput value={settings.smtp.user} onChange={(v) => updateField('smtp', 'user', v)} width="200px" />
              </SettingRow>
            </div>
            <div>
              <SettingRow label="Password" desc="SMTP password or app password">
                <SettingInput value={settings.smtp.pass} onChange={(v) => updateField('smtp', 'pass', v)} type="password" width="200px" />
              </SettingRow>
              <SettingRow label="From Name" desc="Sender display name">
                <SettingInput value={settings.smtp.from_name} onChange={(v) => updateField('smtp', 'from_name', v)} width="160px" />
              </SettingRow>
              <SettingRow label="From Email" desc="Sender email address">
                <SettingInput value={settings.smtp.from_email} onChange={(v) => updateField('smtp', 'from_email', v)} width="200px" />
              </SettingRow>
              <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-4">
                <div>
                  <div className="text-[0.82rem] font-bold">Send Test Email</div>
                  <div className="text-[0.72rem] text-muted-foreground">Save settings first, then test</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                    style={{ width: '160px' }}
                  />
                  <Button
                    size="sm"
                    variant="accent"
                    disabled={sendingTest || !testEmail}
                    onClick={async () => {
                      setSendingTest(true);
                      try {
                        const res = await fetch('/api/admin/settings/test-email', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ to: testEmail }),
                        });
                        const data = await res.json();
                        if (res.ok && data.success) {
                          showToast('Test email sent successfully!');
                        } else {
                          showToast(data.error || 'Failed to send test email');
                        }
                      } catch {
                        showToast('Failed to send test email');
                      } finally {
                        setSendingTest(false);
                      }
                    }}
                  >
                    {sendingTest ? 'Sending...' : 'Send Test'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </SettingsPanel>
      </div>
    </div>
  );
}
