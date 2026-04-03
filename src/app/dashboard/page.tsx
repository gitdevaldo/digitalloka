'use client';

import { PageHeader } from '@/components/layout/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Server, Package, ShoppingCart } from 'lucide-react';

export default function DashboardOverviewPage() {
  return (
    <div className="animate-fade-up">
      <PageHeader title="Dashboard" subtitle="Manage droplets, products, and orders from a single panel." />
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: '🟢', label: 'Droplets', value: 'Live' },
          { icon: '📦', label: 'Products', value: 'Entitled' },
          { icon: '📋', label: 'Orders', value: 'Tracked' },
        ].map((m) => (
          <div key={m.label} className="bg-card border-2 border-foreground rounded-xl p-5 shadow-pop transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover relative overflow-hidden">
            <div className="w-9 h-9 rounded-lg border-2 border-foreground flex items-center justify-center mb-3 text-lg shadow-pop-sm">{m.icon}</div>
            <div className="text-[0.62rem] font-extrabold uppercase tracking-[0.09em] text-muted-foreground mb-0.5">{m.label}</div>
            <div className="font-heading text-3xl font-black">{m.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Droplets', desc: 'Manage droplet actions and monitoring.', href: '/dashboard/droplets', icon: <Server size={20} /> },
          { title: 'Products', desc: 'Track product access and entitlements.', href: '/dashboard/products', icon: <Package size={20} /> },
          { title: 'Orders', desc: 'Review order statuses and history.', href: '/dashboard/orders', icon: <ShoppingCart size={20} /> },
        ].map((card) => (
          <div key={card.title} className="bg-card border-2 border-foreground rounded-xl p-5 shadow-pop">
            <h2 className="font-heading text-base font-extrabold mb-1">{card.title}</h2>
            <p className="text-xs text-muted-foreground font-medium mb-3">{card.desc}</p>
            <ButtonLink href={card.href}>Open {card.title.toLowerCase()}</ButtonLink>
          </div>
        ))}
      </div>
    </div>
  );
}
