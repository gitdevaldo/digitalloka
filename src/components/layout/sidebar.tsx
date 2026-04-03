'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Server, Package, ShoppingCart,
  User, HelpCircle, Settings, Users, FileText,
  Shield, ChevronLeft
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
}

const dashboardNav: NavItem[] = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={18} />, group: 'Main' },
  { label: 'Droplets', href: '/dashboard/droplets', icon: <Server size={18} />, group: 'Main' },
  { label: 'Products', href: '/dashboard/products', icon: <Package size={18} />, group: 'Main' },
  { label: 'Orders', href: '/dashboard/orders', icon: <ShoppingCart size={18} />, group: 'Main' },
  { label: 'Account', href: '/dashboard/account', icon: <User size={18} />, group: 'Settings' },
  { label: 'Support', href: '/dashboard/support', icon: <HelpCircle size={18} />, group: 'Settings' },
];

const adminNav: NavItem[] = [
  { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={18} />, group: 'Main' },
  { label: 'Products', href: '/admin/products', icon: <Package size={18} />, group: 'Manage' },
  { label: 'Users', href: '/admin/users', icon: <Users size={18} />, group: 'Manage' },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingCart size={18} />, group: 'Manage' },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={18} />, group: 'Manage' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText size={18} />, group: 'Security' },
];

interface SidebarProps {
  variant?: 'dashboard' | 'admin';
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ variant = 'dashboard', collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const navItems = variant === 'admin' ? adminNav : dashboardNav;

  const groups = navItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    const g = item.group || 'Main';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-[calc(100vh-var(--topbar-h))] border-r-2 border-foreground bg-card flex flex-col transition-all duration-300 overflow-hidden relative z-[100]',
        collapsed ? 'w-16' : 'w-[var(--sidebar-w)]'
      )}
    >
      <button
        onClick={onToggle}
        className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-card border-2 border-foreground shadow-pop-sm flex items-center justify-center cursor-pointer z-[110] text-foreground transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent"
      >
        <ChevronLeft size={12} className={cn('transition-transform duration-300', collapsed && 'rotate-180')} />
      </button>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pt-3.5 pb-2.5 flex flex-col gap-0.5">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <div className={cn(
              'text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-muted-foreground px-2 pt-2.5 pb-1 whitespace-nowrap transition-opacity',
              collapsed && 'opacity-0'
            )}>
              {group}
            </div>
            {items.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2.5 px-2.5 py-2.5 rounded-[14px] cursor-pointer border-2 border-transparent',
                    'transition-all duration-150 whitespace-nowrap overflow-hidden min-h-[42px] no-underline',
                    'text-foreground text-[0.83rem] font-semibold',
                    'hover:bg-muted hover:border-border',
                    isActive && 'bg-accent text-white border-foreground shadow-pop -translate-x-px -translate-y-px'
                  )}
                >
                  <span className={cn('flex-shrink-0 flex items-center justify-center text-muted-foreground', isActive && 'text-white')}>
                    {item.icon}
                  </span>
                  <span className={cn('flex-1 overflow-hidden transition-opacity', collapsed && 'opacity-0 w-0', isActive && 'text-white')}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
