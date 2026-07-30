import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface GameCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** vi du "A1 -> A2" */
  level: string;
}

/**
 * Card reusable cho moi game trong Learning Hub.
 * Thiet ke phang, mot mau nhan cam — dong bo voi he thong chung.
 */
export function GameCard({ to, icon: Icon, title, subtitle, level }: GameCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3.5 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
        <Icon size={23} strokeWidth={1.8} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-bold text-[#172033]">{title}</h3>
        <p className="mt-0.5 truncate text-xs text-[#7b8796]">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded-lg bg-orange-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-700">
        {level}
      </span>
    </Link>
  );
}
