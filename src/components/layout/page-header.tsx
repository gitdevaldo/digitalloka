interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <div className="font-heading text-[1.75rem] font-black text-foreground leading-tight">{title}</div>
        {subtitle && <div className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</div>}
      </div>
      {actions && <div className="flex gap-2 items-center flex-wrap">{actions}</div>}
    </div>
  );
}
