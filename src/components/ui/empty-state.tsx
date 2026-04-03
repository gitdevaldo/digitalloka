import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon = '📭', title, description, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-6 border-2 border-dashed border-border rounded-xl bg-muted', className)}>
      <div className="text-4xl mb-2.5">{icon}</div>
      <div className="font-heading text-lg font-extrabold mb-1.5">{title}</div>
      <div className="text-sm text-muted-foreground font-medium">{description}</div>
    </div>
  );
}
