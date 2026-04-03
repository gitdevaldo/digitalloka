'use client';

import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function AdminSupportPage() {
  return (
    <div style={{ animation: 'fadeUp 0.28s var(--ease)' }}>
      <PageHeader title="Support" subtitle="Internal support tools and documentation" actions={<Button variant="accent">+ New Ticket</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          { icon: '📚', title: 'Documentation', desc: 'Admin guides and API reference' },
          { icon: '🔧', title: 'System Status', desc: 'Infra and provider health' },
          { icon: '📧', title: 'Contact Support', desc: 'Escalation and billing disputes' },
        ].map(c => (
          <div key={c.title} className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)] cursor-pointer transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]">
            <div className="p-5 text-center py-7">
              <div className="text-[2rem] mb-2">{c.icon}</div>
              <div className="font-heading font-extrabold mb-1">{c.title}</div>
              <div className="text-[0.75rem] text-muted-foreground">{c.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-foreground rounded-[14px] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
        <div className="px-5 py-3.5 border-b-2 border-border"><div className="font-heading text-base font-extrabold">Open Tickets</div></div>
        <EmptyState icon="🎉" title="No open tickets" description="All clear. Open a ticket if you need escalation support." />
      </div>
    </div>
  );
}
