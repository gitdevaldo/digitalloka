'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AccountPage() {
  async function handleLogout() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = '/login';
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Account" subtitle="Manage your profile and billing settings." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
          <div className="px-5 py-3.5 border-b-2 border-border flex items-center justify-between">
            <div className="font-heading text-base font-extrabold">Profile</div>
            <Button size="sm">Edit</Button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-accent to-secondary border-2 border-foreground shadow-[3px_3px_0_var(--shadow)] flex items-center justify-center font-heading font-black text-[1.2rem] text-white">AL</div>
              <div>
                <div className="font-heading text-[1.05rem] font-extrabold">Aldo</div>
                <div className="text-[0.78rem] text-muted-foreground">devaldo@index-now.dev</div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Role</span><StatusBadge variant="accent" label="User" showDot={false} /></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Email</span><span className="font-bold">devaldo@index-now.dev</span></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Location</span><span className="font-bold">Jakarta, Indonesia</span></div>
              <div className="flex justify-between items-center text-[0.82rem] py-2.5"><span className="text-muted-foreground font-semibold">Member Since</span><span className="font-bold text-muted-foreground">2025</span></div>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
          <div className="px-5 py-3.5 border-b-2 border-border">
            <div className="font-heading text-base font-extrabold">Billing & Subscription</div>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Active Plan</span><StatusBadge variant="active" label="Pro" showDot={false} /></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Payment Method</span><span className="font-bold">•••• 4242</span></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Next Billing</span><span className="font-bold">May 1, 2026</span></div>
              <div className="flex justify-between text-[0.82rem] py-2.5"><span className="text-muted-foreground font-semibold">Total Spent</span><span className="font-heading font-extrabold text-[1rem]">$247.00</span></div>
            </div>
            <div className="mt-5 pt-4 border-t-2 border-border flex gap-2">
              <Button size="sm" variant="danger" onClick={handleLogout}>Sign Out</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
