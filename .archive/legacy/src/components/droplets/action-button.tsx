'use client';

import { cn } from '@/lib/utils';

interface ActionButtonProps {
  label: string;
  description?: string;
  actionType: string;
  variant: 'default' | 'danger' | 'warning' | 'success';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onClick: () => void;
}

const variantStyles = {
  default: 'bg-card border-foreground hover:bg-muted hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover',
  danger: 'bg-secondary text-white border-foreground hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover',
  warning: 'bg-tertiary text-foreground border-foreground hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover',
  success: 'bg-quaternary text-foreground border-foreground hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-pop-hover',
};

export function ActionButton({
  label,
  description,
  actionType,
  variant,
  loading,
  disabled,
  fullWidth,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex flex-col items-start gap-1 px-4 py-3 border-2 rounded-lg font-bold transition-all duration-300 ease-bounce shadow-pop',
        'active:translate-x-[2px] active:translate-y-[2px] active:shadow-pop-active',
        variantStyles[variant],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 cursor-not-allowed hover:translate-x-0 hover:translate-y-0 hover:shadow-pop'
      )}
    >
      <div className="flex items-center gap-2">
        {loading && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        <span className="text-sm">{label}</span>
      </div>
      {description && (
        <span className="text-xs font-medium opacity-70">{description}</span>
      )}
    </button>
  );
}
