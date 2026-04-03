'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function SupportPage() {
  const [ticketOpen, setTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  async function submitTicket() {
    if (!subject.trim() || !message.trim()) { showToast('Subject and message are required'); return; }
    setSubmitting(true);
    try {
      showToast('Ticket submitted');
      setTicketOpen(false);
      setSubject('');
      setMessage('');
    } catch { showToast('Failed to submit'); }
    finally { setSubmitting(false); }
  }

  return (
    <div style={{ animation: 'fadeUp 0.3s var(--ease-bounce)' }}>
      <PageHeader title="Support" subtitle="Get help or open a ticket." actions={<Button variant="accent" onClick={() => setTicketOpen(true)}>+ New Ticket</Button>} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: '📚', title: 'Documentation', desc: 'Browse guides and tutorials' },
          { icon: '💬', title: 'Live Chat', desc: 'Mon–Fri, 9am–6pm WIB' },
          { icon: '📧', title: 'Email Support', desc: 'Response within 24h' },
        ].map(c => (
          <div key={c.title} className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] p-5 shadow-[4px_4px_0_var(--shadow)] cursor-pointer transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--shadow)]">
            <div className="w-9 h-9 rounded-[var(--radius-sm)] border-2 border-foreground flex items-center justify-center mb-3 text-base">{c.icon}</div>
            <div className="font-heading text-[0.95rem] font-extrabold mt-1">{c.title}</div>
            <div className="text-[0.78rem] text-muted-foreground mt-1">{c.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
        <div className="px-5 py-4 border-b-2 border-border"><div className="font-heading text-base font-extrabold">Your Tickets</div></div>
        <EmptyState icon="🎉" title="No open tickets" description="Everything looks good. Open a ticket if you need help." />
      </div>

      <Modal open={ticketOpen} onClose={() => setTicketOpen(false)} title="New Support Ticket">
        <div className="space-y-3">
          <div>
            <label className="block text-[0.72rem] font-bold uppercase text-muted-foreground mb-1">Subject</label>
            <input className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.82rem] bg-input text-foreground focus:outline-none focus:border-accent" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description of the issue" />
          </div>
          <div>
            <label className="block text-[0.72rem] font-bold uppercase text-muted-foreground mb-1">Message</label>
            <textarea className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.82rem] bg-input text-foreground focus:outline-none focus:border-accent resize-none" rows={5} value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe the issue in detail…" />
          </div>
          <Button variant="accent" onClick={submitTicket} disabled={submitting} className="w-full">{submitting ? 'Submitting…' : 'Submit Ticket'}</Button>
        </div>
      </Modal>
    </div>
  );
}
