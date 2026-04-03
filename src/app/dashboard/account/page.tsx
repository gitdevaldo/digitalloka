'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';

export default function AccountPage() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="animate-fade-up">
      <PageHeader title="Account" subtitle="Manage your account settings." />
      <Panel title="Session">
        <p className="text-sm text-muted-foreground mb-4">You are currently signed in via Supabase magic link authentication.</p>
        <Button variant="danger" onClick={handleLogout}>Sign out</Button>
      </Panel>
    </div>
  );
}
