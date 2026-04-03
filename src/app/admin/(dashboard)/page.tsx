'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Package, Users, ShoppingCart, Settings } from 'lucide-react';

export default function AdminOverviewPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader title="Admin Dashboard" subtitle="Manage products, users, orders, and settings." />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '📦', label: 'Products', value: 'Managed' },
          { icon: '👥', label: 'Users', value: 'Governed' },
          { icon: '📋', label: 'Orders', value: 'Controlled' },
          { icon: '⚙️', label: 'Settings', value: 'Configured' },
        ].map((m) => (
          <div key={m.label} className="bg-card border-2 border-foreground rounded-xl p-5 shadow-pop transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover">
            <div className="w-9 h-9 rounded-lg border-2 border-foreground flex items-center justify-center mb-3 text-lg shadow-pop-sm">{m.icon}</div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-muted-foreground mb-0.5">{m.label}</div>
            <div className="font-heading text-2xl font-black">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Products', desc: 'Manage catalog and pricing.', href: '/admin/products', icon: <Package size={16} /> },
          { title: 'Users', desc: 'Review roles and account status.', href: '/admin/users', icon: <Users size={16} /> },
          { title: 'Orders', desc: 'Monitor transitions and throughput.', href: '/admin/orders', icon: <ShoppingCart size={16} /> },
          { title: 'Settings', desc: 'Update site-wide configuration.', href: '/admin/settings', icon: <Settings size={16} /> },
        ].map((c) => (
          <div key={c.title} className="bg-card border-2 border-foreground rounded-xl p-5 shadow-pop">
            <h2 className="font-heading text-base font-extrabold mb-1">{c.title}</h2>
            <p className="text-xs text-muted-foreground font-medium mb-3">{c.desc}</p>
            <ButtonLink href={c.href}>Manage {c.title.toLowerCase()}</ButtonLink>
          </div>
        ))}
      </div>
    </div>
  );
}
