import { cn } from '@/lib/utils';

const badgeVariants: Record<string, string> = {
  running: 'bg-quaternary text-foreground',
  active: 'bg-quaternary text-foreground',
  stopped: 'bg-secondary text-white',
  starting: 'bg-tertiary text-foreground',
  pending: 'bg-tertiary text-foreground',
  accent: 'bg-accent text-white',
  paid: 'bg-quaternary text-foreground',
  cancelled: 'bg-muted text-muted-foreground border-border shadow-none',
  fulfilled: 'bg-accent text-white',
  revoked: 'bg-secondary text-white',
  expired: 'bg-muted text-muted-foreground border-border shadow-none',
};

const dotColors: Record<string, string> = {
  running: 'bg-[#065f46]',
  active: 'bg-[#065f46]',
  stopped: 'bg-[#9f1239]',
  starting: 'bg-[#78350f]',
  pending: 'bg-[#78350f]',
  paid: 'bg-[#065f46]',
  cancelled: 'bg-gray-500',
  fulfilled: 'bg-[#ede9fe]',
  revoked: 'bg-[#9f1239]',
  expired: 'bg-gray-500',
};

interface StatusBadgeProps {
  variant?: string;
  label: string;
  showDot?: boolean;
  className?: string;
}

export function StatusBadge({ variant = 'active', label, showDot = true, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        'text-[0.62rem] font-extrabold uppercase',
        'border-2 border-foreground whitespace-nowrap',
        badgeVariants[variant] || 'bg-muted text-muted-foreground',
        className
      )}
      style={{ padding: '3px 9px', letterSpacing: '0.05em', boxShadow: '2px 2px 0 var(--shadow)' }}
    >
      {showDot && <span className={cn('rounded-full', dotColors[variant] || 'bg-gray-500')} style={{ width: 6, height: 6 }} />}
      {label}
    </span>
  );
}
