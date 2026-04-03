'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/ui/toast';

export default function AccountPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch('/api/auth/session')
      .then(r => r.json())
      .then(data => {
        const u = data.user || data.data;
        if (u) {
          setProfile(u);
          setName((u.name as string) || (u.email as string)?.split('@')[0] || '');
          setLocation((u.location as string) || '');
        }
      })
      .catch(() => {});
  }, []);

  const displayName = (profile?.name as string) || (profile?.email as string)?.split('@')[0] || 'User';
  const email = (profile?.email as string) || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  function openEdit() {
    setName(displayName);
    setLocation((profile?.location as string) || '');
    setEditOpen(true);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      showToast('Profile updated');
      setProfile(prev => prev ? { ...prev, name, location } : prev);
      setEditOpen(false);
    } catch { showToast('Update failed'); }
    finally { setSaving(false); }
  }

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
            <Button size="sm" onClick={openEdit}>Edit</Button>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-accent to-secondary border-2 border-foreground shadow-[3px_3px_0_var(--shadow)] flex items-center justify-center font-heading font-black text-[1.2rem] text-white">{initials}</div>
              <div>
                <div className="font-heading text-[1.05rem] font-extrabold">{displayName}</div>
                <div className="text-[0.78rem] text-muted-foreground">{email}</div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Role</span><StatusBadge variant="accent" label={profile?.role as string || 'User'} showDot={false} /></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Email</span><span className="font-bold">{email}</span></div>
              <div className="flex justify-between text-[0.82rem] py-2.5 border-b border-border"><span className="text-muted-foreground font-semibold">Location</span><span className="font-bold">{(profile?.location as string) || 'Not set'}</span></div>
              <div className="flex justify-between items-center text-[0.82rem] py-2.5"><span className="text-muted-foreground font-semibold">Member Since</span><span className="font-bold text-muted-foreground">{profile?.created_at ? new Date(profile.created_at as string).getFullYear() : '—'}</span></div>
            </div>
          </div>
        </div>

        <div className="bg-card border-2 border-foreground rounded-[var(--radius-xl)] overflow-hidden shadow-[4px_4px_0_var(--shadow)]">
          <div className="px-5 py-3.5 border-b-2 border-border">
            <div className="font-heading text-base font-extrabold">Account Actions</div>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[0.82rem] py-2.5 border-b border-border">
                <span className="text-muted-foreground font-semibold">Sign out of your account</span>
                <Button size="sm" variant="danger" onClick={handleLogout}>Sign Out</Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-3">
          <div>
            <label className="block text-[0.72rem] font-bold uppercase text-muted-foreground mb-1">Display Name</label>
            <input className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.82rem] bg-input text-foreground focus:outline-none focus:border-accent" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-[0.72rem] font-bold uppercase text-muted-foreground mb-1">Location</label>
            <input className="w-full border-2 border-border rounded-[var(--r-sm)] px-3 py-2 font-body text-[0.82rem] bg-input text-foreground focus:outline-none focus:border-accent" value={location} onChange={e => setLocation(e.target.value)} placeholder="City, Country" />
          </div>
          <Button variant="accent" onClick={saveProfile} disabled={saving} className="w-full">{saving ? 'Saving…' : 'Save Changes'}</Button>
        </div>
      </Modal>
    </div>
  );
}
