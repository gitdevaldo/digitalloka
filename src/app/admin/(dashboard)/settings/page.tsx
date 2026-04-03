'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => { setSettings(data.settings || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-up">
      <PageHeader title="Settings" subtitle="Manage site-wide configuration." />
      {loading ? (
        <div className="h-32 bg-card border-2 border-border rounded-xl animate-pulse" />
      ) : Object.keys(settings).length === 0 ? (
        <Panel title="Settings">
          <p className="text-sm text-muted-foreground">No settings configured yet.</p>
        </Panel>
      ) : (
        Object.entries(settings).map(([group, items]) => (
          <Panel key={group} title={group} variant="admin">
            {(items as Record<string, unknown>[]).map((item) => (
              <div key={item.setting_key as string} className="flex items-center justify-between py-3 border-b border-border last:border-b-0 gap-4">
                <div>
                  <div className="text-sm font-bold">{item.setting_key as string}</div>
                  <div className="text-xs text-muted-foreground">{item.setting_group as string}</div>
                </div>
                <div className="text-sm font-mono text-muted-foreground max-w-[200px] truncate">
                  {JSON.stringify(item.setting_value)}
                </div>
              </div>
            ))}
          </Panel>
        ))
      )}
    </div>
  );
}
