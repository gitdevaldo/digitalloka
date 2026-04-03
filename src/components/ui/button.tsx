'use client';

import { cn } from '@/lib/utils';
import React from 'react';

const variantClasses: Record<string, string> = {
  default: 'bg-card text-foreground',
  accent: 'bg-accent text-white',
  danger: 'bg-secondary text-white',
  success: 'bg-quaternary text-foreground',
  warning: 'bg-tertiary text-foreground',
  ghost: 'bg-muted border-border shadow-[2px_2px_0_var(--border)] hover:shadow-[3px_3px_0_var(--border)]',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: 'default' | 'sm';
  asChild?: boolean;
}

export function Button({ variant = 'default', size = 'default', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'font-body font-bold border-2 border-foreground rounded-full cursor-pointer',
        'transition-all duration-150 inline-flex items-center gap-1.5',
        'shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover',
        'active:translate-x-px active:translate-y-px active:shadow-pop-active',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none',
        size === 'sm' ? 'px-3 py-1 text-xs shadow-pop-sm hover:shadow-pop' : 'px-[18px] py-2 text-[0.8rem]',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface ButtonLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof variantClasses;
  size?: 'default' | 'sm';
}

export function ButtonLink({ variant = 'default', size = 'default', className, children, ...props }: ButtonLinkProps) {
  return (
    <a
      className={cn(
        'font-body font-bold border-2 border-foreground rounded-full cursor-pointer no-underline',
        'transition-all duration-150 inline-flex items-center gap-1.5',
        'shadow-pop hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-pop-hover',
        'active:translate-x-px active:translate-y-px active:shadow-pop-active',
        size === 'sm' ? 'px-3 py-1 text-xs shadow-pop-sm hover:shadow-pop' : 'px-[18px] py-2 text-[0.8rem]',
        variantClasses[variant] || variantClasses.default,
        className
      )}
      {...props}
    >
      {children}
    </a>
  );
}
