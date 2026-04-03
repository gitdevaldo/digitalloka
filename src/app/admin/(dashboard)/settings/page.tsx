'use client';

import { useState } from 'react';
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

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative w-[38px] h-[22px] flex-shrink-0">
      <input type="checkbox" defaultChecked={defaultChecked} className="opacity-0 w-0 h-0 peer" />
      <span className="absolute inset-0 bg-border rounded-full cursor-pointer transition-colors border-2 border-foreground peer-checked:bg-quaternary before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:left-0.5 before:top-0.5 before:bg-muted-foreground before:rounded-full before:transition-transform peer-checked:before:translate-x-3.5 peer-checked:before:bg-foreground" />
    </label>
  );
}

function SettingInput({ defaultValue, type = 'text', width = '130px' }: { defaultValue: string; type?: string; width?: string }) {
  return (
    <input
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      defaultValue={defaultValue}
      type={type}
      style={{ width }}
    />
  );
}

function SettingSelect({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  return (
    <select
      className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground cursor-pointer focus:outline-none focus:border-accent focus:shadow-[2px_2px_0_var(--accent)]"
      defaultValue={defaultValue}
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

export default function AdminSettingsPage() {
  const { showToast } = useToast();

  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader
        title="Settings"
        subtitle="/admin/settings — platform configuration"
        actions={<Button variant="accent" onClick={() => showToast('Settings saved')}>Save All Changes</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <SettingsPanel title="📦 Catalog Settings">
            <SettingRow label="Default Product Visibility" desc="New products created as draft or published">
              <SettingSelect options={['draft', 'published']} />
            </SettingRow>
            <SettingRow label="Product Slug Format" desc="Auto-generated slug style">
              <SettingInput defaultValue="kebab-case" />
            </SettingRow>
            <SettingRow label="Max Product Images" desc="Per product listing">
              <SettingInput defaultValue="8" type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Reviews Enabled" desc="Allow users to leave product reviews">
              <Toggle defaultChecked />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="🔑 Entitlement Defaults">
            <SettingRow label="Default Expiry (days)" desc="Applied when no custom expiry is set">
              <SettingInput defaultValue="365" type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Expiry Warning (days before)" desc="Notify user N days before expiry">
              <SettingInput defaultValue="7" type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Auto-suspend on Expiry" desc="Automatically suspend expired entitlements">
              <Toggle defaultChecked />
            </SettingRow>
            <SettingRow label="Grace Period (days)" desc="Days after expiry before full revocation">
              <SettingInput defaultValue="3" type="number" width="70px" />
            </SettingRow>
          </SettingsPanel>
        </div>

        <div>
          <SettingsPanel title="🛒 Order & Fulfillment">
            <SettingRow label="Auto-fulfill Digital Orders" desc="Grant access immediately after payment">
              <Toggle defaultChecked />
            </SettingRow>
            <SettingRow label="Currency" desc="Default storefront currency">
              <SettingSelect options={['USD', 'IDR', 'EUR']} />
            </SettingRow>
            <SettingRow label="Refund Window (days)" desc="Days a customer can request a refund">
              <SettingInput defaultValue="14" type="number" width="70px" />
            </SettingRow>
            <SettingRow label="Order ID Prefix" desc="Prefix for all generated order IDs">
              <SettingInput defaultValue="ORD-" width="90px" />
            </SettingRow>
          </SettingsPanel>

          <SettingsPanel title="📧 Operational Contacts">
            <SettingRow label="Billing Email" desc="Receives billing alerts and invoices">
              <SettingInput defaultValue="billing@digitalloka.dev" width="200px" />
            </SettingRow>
            <SettingRow label="Ops Alert Email" desc="Receives droplet and critical alerts">
              <SettingInput defaultValue="ops@digitalloka.dev" width="200px" />
            </SettingRow>
            <SettingRow label="Support Email" desc="User-facing support contact address">
              <SettingInput defaultValue="support@digitalloka.dev" width="200px" />
            </SettingRow>
            <SettingRow label="Audit Webhooks" desc="POST critical events to external endpoint">
              <Toggle />
            </SettingRow>
          </SettingsPanel>
        </div>
      </div>
    </div>
  );
}
