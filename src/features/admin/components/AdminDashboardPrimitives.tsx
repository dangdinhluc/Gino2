import { type ReactNode } from 'react';
import { ChevronRight, Search, ShieldCheck, Sparkles, TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  getStatusClass,
  getStatusLabel,
  sectionConfigs,
  type AdminSection,
  type FilterOption,
  type FilterValue,
  type ProgressTone,
} from '@/src/features/admin/lib/adminDashboardModel';

interface KpiCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  trend: string;
  tone?: 'blue' | 'orange' | 'green' | 'red' | 'purple';
}

interface StatusBadgeProps {
  value: string;
  tone?: 'neutral' | 'strong';
}

interface ProgressBarProps {
  value: number;
  tone?: ProgressTone;
}

interface FilterBarProps {
  options: FilterOption[];
  value: FilterValue;
  onChange: (value: FilterValue) => void;
}

interface EntitySectionProps {
  title: string;
  description: string;
  count: number;
  children: ReactNode;
  aside?: ReactNode;
}

interface MobileEntityListProps<TItem> {
  items: TItem[];
  getKey: (item: TItem) => string;
  getTitle: (item: TItem) => string;
  getSubtitle: (item: TItem) => string;
  getMeta: (item: TItem) => ReactNode;
  onSelect: (item: TItem) => void;
}

export function StatusBadge({ value, tone = 'neutral' }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold',
        getStatusClass(value),
        tone === 'strong' && 'px-3 py-1.5 text-sm',
      )}
    >
      {getStatusLabel(value)}
    </span>
  );
}

export function ProgressBar({ value, tone = 'blue' }: ProgressBarProps) {
  const colors: Record<ProgressTone, string> = {
    blue: 'bg-[#315C73]',
    green: 'bg-emerald-500',
    orange: 'bg-[#C96A1B]',
    red: 'bg-red-500',
  };

  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#E9DED0]">
      <div className={cn('h-full rounded-full', colors[tone])} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export function KpiCard({ label, value, detail, icon: Icon, trend, tone = 'blue' }: KpiCardProps) {
  const toneClasses: Record<NonNullable<KpiCardProps['tone']>, string> = {
    blue: 'bg-[#315C73]/10 text-[#315C73]',
    orange: 'bg-[#C96A1B]/10 text-[#C96A1B]',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-[#6F4AA8]/10 text-[#6F4AA8]',
  };
  const isNegativeTrend = trend.trim().startsWith('-');
  const TrendIcon = isNegativeTrend ? TrendingDown : TrendingUp;

  return (
    <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm shadow-[#7A542E]/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#5F6B7C]">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-[#172033]">{value}</p>
        </div>
        <span className={cn('rounded-2xl p-3', toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-[#5F6B7C]">{detail}</span>
        <span className={cn('inline-flex items-center gap-1 font-bold', isNegativeTrend ? 'text-red-700' : 'text-emerald-700')}>
          <TrendIcon className="h-4 w-4" />
          {trend}
        </span>
      </div>
    </article>
  );
}

export function FilterBar({ options, value, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition',
            value === option.value
              ? 'border-[#315C73] bg-[#315C73] text-white shadow-sm'
              : 'border-[#E4D8C9] bg-[#FFFCF7] text-[#5F6B7C] hover:border-[#315C73]/40 hover:text-[#172033]',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function AdminSidebar({ activeSection, onChange }: { activeSection: AdminSection; onChange: (section: AdminSection) => void }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#E4D8C9] bg-[#FFFCF7]/92 px-4 py-5 lg:flex lg:flex-col">
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#172033] text-white shadow-sm">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#C96A1B]">Gino Admin</p>
          <p className="text-lg font-black text-[#172033]">TOKUTEI GINO</p>
        </div>
      </div>

      <nav className="mt-8 space-y-1.5">
        {sectionConfigs.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition',
                isActive ? 'bg-[#172033] text-white shadow-sm' : 'text-[#5F6B7C] hover:bg-[#F0E8DC] hover:text-[#172033]',
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-bold">{section.label}</span>
                <span className={cn('block truncate text-xs', isActive ? 'text-white/70' : 'text-[#7A8795]')}>
                  {section.description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-[#E4D8C9] bg-[#F5EFE6] p-4">
        <p className="text-sm font-black text-[#172033]">Operational rule</p>
        <p className="mt-2 text-sm leading-6 text-[#5F6B7C]">
          Ưu tiên học viên rủi ro, content thiếu asset và khóa có completion thấp.
        </p>
      </div>
    </aside>
  );
}

export function AdminTopbar({ query, onQueryChange }: { query: string; onQueryChange: (query: string) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E4D8C9] bg-[#F5EFE6]/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-[#C96A1B]">
            <Sparkles className="h-4 w-4" />
            Admin Management Dashboard
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">
            Quản lý học viên, khóa học và nội dung học tiếng Đức
          </h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative block min-w-0 flex-1 sm:w-80">
            <span className="sr-only">Tìm kiếm admin data</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7C]" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Tìm khóa học, học viên, gói, prompt, API key..."
              className="w-full rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] py-3 pl-11 pr-4 text-sm font-semibold text-[#172033] outline-none transition placeholder:text-[#8A95A3] focus:border-[#315C73] focus:ring-4 focus:ring-[#315C73]/10"
            />
          </label>
          <button
            type="button"
            className="rounded-2xl bg-[#C96A1B] px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#A95415]"
          >
            Tạo nội dung
          </button>
        </div>
      </div>
    </header>
  );
}

export function SectionSwitcher({ activeSection, onChange }: { activeSection: AdminSection; onChange: (section: AdminSection) => void }) {
  return (
    <div className="lg:hidden">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-6">
        {sectionConfigs.map((section) => {
          const Icon = section.icon;

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onChange(section.id)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-bold',
                activeSection === section.id
                  ? 'border-[#172033] bg-[#172033] text-white'
                  : 'border-[#E4D8C9] bg-[#FFFCF7] text-[#5F6B7C]',
              )}
            >
              <Icon className="h-4 w-4" />
              {section.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function EntitySection({ title, description, count, children, aside }: EntitySectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#C96A1B]">{count} bản ghi</p>
          <h2 className="mt-1 text-2xl font-black text-[#172033]">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[#5F6B7C]">{description}</p>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function MobileEntityList<TItem>({ items, getKey, getTitle, getSubtitle, getMeta, onSelect }: MobileEntityListProps<TItem>) {
  return (
    <div className="grid gap-3 md:hidden">
      {items.map((item) => (
        <button
          key={getKey(item)}
          type="button"
          onClick={() => onSelect(item)}
          className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 text-left shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-[#172033]">{getTitle(item)}</p>
              <p className="mt-1 text-sm text-[#5F6B7C]">{getSubtitle(item)}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-[#8A95A3]" />
          </div>
          <div className="mt-4">{getMeta(item)}</div>
        </button>
      ))}
    </div>
  );
}
