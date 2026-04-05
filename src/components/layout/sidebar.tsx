'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Package, Server, ShoppingCart,
  FileText, User, HelpCircle, LogOut, ChevronLeft,
  ChevronRight, Users, Settings, CreditCard, Shield,
  Layers, Database
} from 'lucide-react';

interface NavItemDef {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
  indent?: boolean;
  badge?: 'dot' | 'count';
  children?: { label: string; href: string }[];
  bottom?: boolean;
  isLogout?: boolean;
}

const dashboardNav: NavItemDef[] = [
  { label: 'Overview', href: '/dashboard', icon: <LayoutDashboard size={18} />, group: 'Main' },
  {
    label: 'Products', href: '#', icon: <Package size={18} />, group: 'Main',
    children: [
      { label: 'All Products', href: '/dashboard/products' },
      { label: 'VPS Droplets', href: '/dashboard/droplets' },
      { label: 'Digital Products', href: '/dashboard/products/digital' },
    ]
  },
  { label: 'Orders', href: '/dashboard/orders', icon: <ShoppingCart size={18} />, group: 'Main', badge: 'dot' },
  { label: 'Account', href: '/dashboard/account', icon: <User size={18} />, bottom: true },
  { label: 'Support', href: '/dashboard/support', icon: <HelpCircle size={18} />, bottom: true },
  { label: 'Logout', href: '/login', icon: <LogOut size={18} />, bottom: true, isLogout: true },
];

const adminNav: NavItemDef[] = [
  { label: 'Overview', href: '/admin', icon: <LayoutDashboard size={17} />, group: 'Main' },
  {
    label: 'Products', href: '#', icon: <Package size={17} />, group: 'Main',
    children: [
      { label: 'All Products', href: '/admin/products' },
      { label: 'Product Types', href: '/admin/product-types' },
      { label: 'Product Stocks', href: '/admin/product-stocks' },
    ]
  },
  { label: 'Orders', href: '/admin/orders', icon: <ShoppingCart size={17} />, group: 'Main', badge: 'count' },
  { label: 'Users', href: '/admin/users', icon: <Users size={17} />, group: 'Main' },
  { label: 'Entitlements', href: '/admin/entitlements', icon: <CreditCard size={17} />, group: 'Main', badge: 'dot' },
  { label: 'Droplets', href: '/admin/droplets', icon: <Server size={17} />, group: 'Main' },
  { label: 'Audit Logs', href: '/admin/audit-logs', icon: <FileText size={17} />, group: 'Main' },
  { label: 'Settings', href: '/admin/settings', icon: <Settings size={17} />, group: 'Main' },
  { label: 'Admin Account', href: '/admin/account', icon: <User size={17} />, bottom: true },
  { label: 'Support', href: '/admin/support', icon: <HelpCircle size={17} />, bottom: true },
  { label: 'Logout', href: '/admin/login', icon: <LogOut size={17} />, bottom: true, isLogout: true },
];

interface SidebarProps {
  variant?: 'dashboard' | 'admin';
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ variant = 'dashboard', collapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const navItems = variant === 'admin' ? adminNav : dashboardNav;
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const mainItems = navItems.filter(i => !i.bottom);
  const bottomItems = navItems.filter(i => i.bottom);

  const isActive = (item: NavItemDef) => {
    if (item.href === '/dashboard' || item.href === '/admin') return pathname === item.href;
    if (item.href === '#') return false;
    return pathname.startsWith(item.href);
  };

  const isChildActive = (item: NavItemDef) => {
    return item.children?.some(c => pathname === c.href || pathname.startsWith(c.href));
  };

  const handleLogout = async () => {
    await fetch('/api/auth/session', { method: 'DELETE' });
    window.location.href = variant === 'admin' ? '/admin/login' : '/login';
  };

  const renderNavItem = (item: NavItemDef) => {
    const active = isActive(item);
    const hasChildren = item.children && item.children.length > 0;
    const submenuOpen = openSubmenu === item.label;
    const childActive = isChildActive(item);

    if (item.isLogout) {
      return (
        <button
          key={item.label}
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 w-full text-left',
            variant === 'admin' ? 'px-2.5 py-2.5 rounded-[var(--r-md)] text-[0.83rem]' : 'px-2.5 py-2.5 rounded-[var(--radius-md)] text-[0.875rem]',
            'cursor-pointer border-2 border-transparent transition-all duration-150 whitespace-nowrap overflow-hidden min-h-[42px]',
            'text-foreground font-semibold hover:bg-muted hover:border-border hover:text-foreground',
          )}
        >
          <span className="flex-shrink-0 flex items-center justify-center text-muted-foreground">{item.icon}</span>
          <span className={cn('flex-1 overflow-hidden transition-opacity', collapsed && 'opacity-0 w-0')}>{item.label}</span>
        </button>
      );
    }

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => setOpenSubmenu(submenuOpen ? null : item.label)}
            className={cn(
              'flex items-center gap-2.5 w-full text-left',
              variant === 'admin' ? 'px-2.5 py-2.5 rounded-[var(--r-md)] cursor-pointer border-2 border-transparent' : 'px-2.5 py-2.5 rounded-[var(--radius-md)] cursor-pointer border-2 border-transparent',
              'transition-all duration-150 whitespace-nowrap overflow-hidden min-h-[42px]',
              variant === 'admin' ? 'text-foreground text-[0.83rem] font-semibold' : 'text-foreground text-[0.875rem] font-semibold',
              'hover:bg-muted hover:border-border hover:text-foreground',
              childActive && 'bg-muted border-border',
            )}
          >
            <span className={cn('flex-shrink-0 flex items-center justify-center text-muted-foreground', childActive && 'text-accent')}>{item.icon}</span>
            <span className={cn('flex-1 overflow-hidden transition-opacity', collapsed && 'opacity-0 w-0', childActive && 'text-accent font-bold')}>{item.label}</span>
            <span className={cn('ml-auto text-muted-foreground transition-transform duration-200 flex-shrink-0', submenuOpen && 'rotate-90', collapsed && 'opacity-0 w-0')}>
              <ChevronRight size={12} />
            </span>
          </button>
          <div className={cn('overflow-hidden transition-all duration-300', submenuOpen && !collapsed ? 'max-h-[200px]' : 'max-h-0')}>
            <div className="py-0.5 pl-2 flex flex-col gap-0.5">
              {item.children!.map(child => {
                const cActive = pathname === child.href || pathname.startsWith(child.href);
                return (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center gap-2 py-[7px] px-2.5 pl-[18px] rounded-[var(--radius-sm)]',
                      'cursor-pointer border-2 border-transparent transition-all duration-150',
                      'whitespace-nowrap relative text-muted-foreground text-[0.82rem] font-semibold no-underline',
                      'hover:bg-muted hover:text-foreground',
                      cActive && 'bg-accent/10 text-accent border-accent/20',
                    )}
                  >
                    <span className={cn(
                      'absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full transition-colors',
                      cActive ? 'bg-accent' : 'bg-border',
                    )} />
                    {child.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-2.5',
          variant === 'admin' ? 'px-2.5 py-2.5 rounded-[var(--r-md)] text-[0.83rem]' : 'px-2.5 py-2.5 rounded-[var(--radius-md)] text-[0.875rem]',
          'cursor-pointer border-2 border-transparent transition-all duration-150 whitespace-nowrap overflow-hidden',
          item.indent ? 'pl-7 min-h-[38px]' : 'min-h-[42px]',
          'no-underline text-foreground font-semibold',
          active
            ? 'bg-accent text-white border-foreground shadow-[3px_3px_0_var(--shadow)] -translate-x-px -translate-y-px hover:bg-accent hover:border-foreground'
            : 'hover:bg-muted hover:border-border hover:text-foreground',
        )}
      >
        <span className={cn('flex-shrink-0 flex items-center justify-center text-muted-foreground', active && 'text-white')}>{item.icon}</span>
        <span className={cn('flex-1 overflow-hidden transition-opacity', collapsed && 'opacity-0 w-0', active && 'text-white')}>{item.label}</span>
        {item.badge === 'dot' && (
          <span className={cn('w-[7px] h-[7px] rounded-full bg-secondary border-[1.5px] border-white flex-shrink-0 ml-auto', collapsed && 'ml-0')} />
        )}
        {item.badge === 'count' && (
          <span className={cn(
            'flex-shrink-0 bg-secondary text-white border-2 border-foreground rounded-full text-[0.6rem] font-extrabold px-1.5 shadow-[1px_1px_0_var(--shadow)] transition-opacity',
            collapsed && 'opacity-0 w-0 overflow-hidden p-0 border-none',
          )}>0</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'flex-shrink-0 h-[calc(100vh-var(--topbar-h))] border-r-2 border-foreground bg-card flex flex-col overflow-hidden relative z-[100]',
        'transition-all duration-[250ms]',
        collapsed ? 'w-16' : 'w-[var(--sidebar-w)]'
      )}
      style={{ transitionTimingFunction: 'var(--ease)' }}
    >
      <button
        onClick={onToggle}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute top-4 -right-3.5 w-7 h-7 rounded-full bg-card border-2 border-foreground shadow-[2px_2px_0_var(--shadow)] flex items-center justify-center cursor-pointer z-[110] text-foreground transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent"
      >
        <ChevronLeft size={11} className={cn('transition-transform duration-[250ms]', collapsed && 'rotate-180')} style={{ transitionTimingFunction: 'var(--ease)' }} />
      </button>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 pt-3.5 pb-2.5 flex flex-col gap-0.5" aria-label="Main navigation">
        <div className={cn(
          'text-[0.62rem] font-extrabold uppercase tracking-[0.1em] text-muted-foreground px-2 pt-2.5 pb-1 whitespace-nowrap transition-opacity',
          collapsed && 'opacity-0'
        )}>
          Main
        </div>
        {mainItems.map(renderNavItem)}
      </nav>

      <div className="border-t-2 border-border px-2.5 py-2.5 pb-3.5 flex flex-col gap-0.5 flex-shrink-0">
        {bottomItems.map(renderNavItem)}
      </div>
    </aside>
  );
}
