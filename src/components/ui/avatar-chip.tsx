import { cn } from '@/lib/utils';

interface AvatarChipProps {
  label?: string;
  title?: string;
  className?: string;
}

export function AvatarChip({ label = 'AL', title = 'Account', className }: AvatarChipProps) {
  return (
    <div
      title={title}
      className={cn(
        'w-9 h-9 rounded-full bg-gradient-to-br from-accent to-secondary',
        'border-2 border-foreground shadow-pop-sm',
        'flex items-center justify-center',
        'font-heading font-extrabold text-[0.85rem] text-white cursor-pointer',
        'transition-all duration-150 hover:-translate-x-px hover:-translate-y-px hover:shadow-pop',
        className
      )}
    >
      {label}
    </div>
  );
}
