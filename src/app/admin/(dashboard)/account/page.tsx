'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

export default function AdminAccountPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Admin Account" subtitle="Your admin profile and session settings" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
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
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-[0.82rem] py-2 border-b border-border"><span className="text-muted-foreground font-semibold">Role</span><StatusBadge variant="accent" label="Admin" /></div>
              <div className="flex justify-between text-[0.82rem] py-2 border-b border-border"><span className="text-muted-foreground font-semibold">Location</span><span className="font-bold">Jakarta, Indonesia</span></div>
              <div className="flex justify-between items-center text-[0.82rem] py-2 border-b border-border">
                <span className="text-muted-foreground font-semibold">Two-Factor Auth</span>
                <label className="relative w-[38px] h-[22px] flex-shrink-0">
                  <input type="checkbox" defaultChecked className="opacity-0 w-0 h-0 peer" />
                  <span className="absolute inset-0 bg-border rounded-full cursor-pointer transition-colors border-2 border-foreground peer-checked:bg-quaternary before:content-[''] before:absolute before:w-3.5 before:h-3.5 before:left-0.5 before:top-0.5 before:bg-muted-foreground before:rounded-full before:transition-transform peer-checked:before:translate-x-3.5 peer-checked:before:bg-foreground" />
                </label>
              </div>
              <div className="flex justify-between text-[0.82rem] py-2"><span className="text-muted-foreground font-semibold">Session Timeout</span><input className="border-2 border-border rounded-[var(--r-sm)] px-2.5 py-1 font-body text-[0.78rem] font-semibold bg-input text-foreground w-[100px]" defaultValue="30 min" /></div>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
          <div className="px-5 py-3.5 border-b-2 border-border">
            <div className="font-heading text-base font-extrabold">Recent Admin Sessions</div>
          </div>
          <div className="p-0">
            <table className="w-full border-collapse">
              <thead><tr className="text-left text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-muted-foreground"><th className="px-3 py-2.5 border-b-2 border-border">IP</th><th className="px-3 py-2.5 border-b-2 border-border">Device</th><th className="px-3 py-2.5 border-b-2 border-border">Started</th><th className="px-3 py-2.5 border-b-2 border-border">Status</th></tr></thead>
              <tbody>
                <tr className="hover:bg-muted"><td className="px-3 py-2.5 text-[0.8rem] font-mono border-b border-border">103.x.x.x</td><td className="px-3 py-2.5 text-[0.8rem] border-b border-border">Chrome / macOS</td><td className="px-3 py-2.5 text-[0.72rem] text-muted-foreground border-b border-border">Now</td><td className="px-3 py-2.5 border-b border-border"><StatusBadge variant="active" label="Active" /></td></tr>
                <tr className="hover:bg-muted"><td className="px-3 py-2.5 text-[0.8rem] font-mono">103.x.x.x</td><td className="px-3 py-2.5 text-[0.8rem]">Chrome / macOS</td><td className="px-3 py-2.5 text-[0.72rem] text-muted-foreground">Yesterday</td><td className="px-3 py-2.5"><StatusBadge variant="expired" label="Expired" /></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
