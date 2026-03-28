'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Droplets',
    href: '/dashboard',
    color: 'bg-accent',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2"/>
        <rect x="2" y="14" width="20" height="8" rx="2"/>
        <circle cx="19" cy="6" r="1" fill="currentColor"/>
        <circle cx="19" cy="18" r="1" fill="currentColor"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 shrink-0 h-full bg-card border-r-2 border-foreground p-4 flex flex-col">
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 mb-3">
        Navigation
      </div>
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-bold transition-all duration-300 ease-bounce',
                isActive
                  ? 'bg-accent text-white border-foreground shadow-pop'
                  : 'bg-card text-foreground border-border hover:border-foreground hover:shadow-pop hover:-translate-x-[2px] hover:-translate-y-[2px]'
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center',
                isActive ? 'bg-white text-accent' : item.color + ' text-white'
              )}>
                {item.icon}
              </div>
              {item.label}
            </Link>
          );
        })}
      </div>
      
      {/* Decorative shapes */}
      <div className="relative mt-4 pt-4 border-t-2 border-border">
        <div className="absolute -top-3 left-4 w-6 h-6 bg-tertiary rounded-full border-2 border-foreground"></div>
        <div className="absolute -top-2 left-12 w-4 h-4 bg-secondary rotate-45 border-2 border-foreground"></div>
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          © 2026 DigitalLoka
        </div>
      </div>
    </nav>
  );
}
