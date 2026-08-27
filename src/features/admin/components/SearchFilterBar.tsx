import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

interface SearchFilterBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function SearchFilterBar({ value, onChange, placeholder, label = 'Tìm kiếm', filters, actions }: SearchFilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-3 sm:flex-row sm:items-center">
      <label className="relative min-w-0 flex-1" aria-label={label}>
        <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8796]" size={18} />
        <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white py-2 pl-10 pr-3 text-sm text-[#172033] outline-none transition focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15" />
      </label>
      {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
