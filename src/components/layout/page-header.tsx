interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between mb-6 flex-wrap gap-3">
      <div>
        <h1 className="font-heading text-[1.75rem] font-black text-foreground leading-tight">{title}</h1>
        {subtitle && <p className="text-sm font-medium text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 items-center flex-wrap">{actions}</div>}
    </header>
  );
}
