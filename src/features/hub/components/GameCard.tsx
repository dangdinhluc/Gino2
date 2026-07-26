import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

interface GameCardProps {
  to: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** màu accent — dùng cho icon background gradient */
  accent: string;
  /** ví dụ "A1 → A2" */
  level: string;
}

/**
 * Card reusable cho mỗi game trong Learning Hub.
 * Design tham chiếu: docs/design/new-games-mvp.md §9 (Hub Card Spec).
 */
export function GameCard({ to, icon: Icon, title, subtitle, accent, level }: GameCardProps) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <Link
        to={to}
        className="flex items-center gap-4 rounded-3xl border border-[#E4D8C9] bg-white p-5 shadow-[0_8px_24px_-12px_rgba(96,70,42,0.12)] transition-shadow hover:shadow-[0_16px_36px_-16px_rgba(96,70,42,0.2)]"
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
          aria-hidden="true"
        >
          <Icon size={26} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-black text-gray-900">{title}</h3>
          <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">{subtitle}</p>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{ backgroundColor: `${accent}1a`, color: accent }}
        >
          {level}
        </span>
      </Link>
    </motion.div>
  );
}
