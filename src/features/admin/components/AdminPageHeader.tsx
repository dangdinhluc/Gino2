import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

export function AdminPageHeader({ eyebrow, title, description, actions, children }: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-[#E4D8C9] pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7A5B3D]">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#172033] sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5F6B7C]">{description}</p>}
        {children && <div className="mt-3">{children}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
