'use client';

import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center bg-accent border-2 border-foreground rounded-[14px] shadow-pop px-[22px] py-[10px]',
        className
      )}
    >
      <span className="font-heading text-[20px] font-extrabold text-white tracking-[-0.5px] leading-none">
        Digital<span className="text-tertiary">Loka</span>
      </span>
    </div>
  );
}
