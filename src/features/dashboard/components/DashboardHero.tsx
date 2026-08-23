import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, ChevronRight, Flame, Rocket, Sparkles, Sprout, Zap } from 'lucide-react';
import type { LearnerNotification } from '@/src/features/notifications/repositories/notificationRepository';
import { resolveDashboardHeroAsset, type DashboardHeroSlotLike } from '@/src/features/dashboard/lib/dashboardHero';
import { assets } from '@/src/shared/lib/assets';

const sakuraPetals = [
  ['4%', 12, '-2s', '16s'],
  ['15%', 9, '-9s', '19s'],
  ['27%', 14, '-5s', '15s'],
  ['39%', 10, '-12s', '20s'],
  ['51%', 13, '-3s', '17s'],
  ['64%', 9, '-11s', '21s'],
  ['76%', 15, '-6s', '18s'],
  ['89%', 11, '-14s', '22s'],
] as const;

interface DashboardHeroProps {
  displayName: string;
  streak: number;
  totalXp: number;
  level: number;
  heroSlot: DashboardHeroSlotLike | null;
  announcement: LearnerNotification | null;
  announcementTarget: string;
}

export function DashboardHero({
  displayName,
  streak,
  totalXp,
  level,
  heroSlot,
  announcement,
  announcementTarget,
}: DashboardHeroProps) {
  const heroAsset = resolveDashboardHeroAsset(heroSlot?.assetKey);

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[28px] border border-[#fde6d2] p-4 shadow-[0_10px_32px_rgba(217,74,19,0.06)] sm:p-8"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255, 252, 248, 0.45) 0%, rgba(255, 245, 235, 0.88) 100%), url("${assets.shared.backgrounds.englishHero}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {sakuraPetals.map(([left, size, delay, duration], index) => (
          <span
            className="dashboard-sakura-petal"
            key={`${left}-${index}`}
            style={{ left, width: size, height: size, animationDelay: delay, animationDuration: duration }}
          />
        ))}
      </div>

      <div className="relative z-10 grid gap-6 md:grid-cols-[1.25fr_0.75fr] items-center">
        <div className="space-y-3.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/95 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-[#d83a00] shadow-2xs backdrop-blur-xs">
            <Sparkles size={13} className="text-amber-500 fill-amber-400" /> TOKUTEI GINO • TIẾNG NHẬT ĐI LÀM
          </div>

          <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-tight text-[#0f172a] sm:text-4xl leading-tight">
            Chào mừng trở lại,<br className="sm:hidden" />{' '}
            <span className="inline-block whitespace-nowrap bg-gradient-to-r from-[#d83a00] via-[#f26522] to-[#ff8c42] bg-clip-text text-transparent">
              <span className="inline-flex items-center gap-1.5">
                {displayName}
                <Rocket aria-hidden="true" className="shrink-0 text-[#f26522]" size={28} strokeWidth={2.5} />
              </span>
            </span>
          </h1>

          <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm max-w-md">
            Nhiệm vụ Tokutei hôm nay đang chờ. Hành trình chinh phục tiếng Nhật vẫn tiếp tục!
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="flex items-center gap-1.5 rounded-full border border-orange-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#c2410c] shadow-2xs">
              <Flame size={14} className="text-[#d83a00] fill-[#d83a00]" /> Chuỗi {streak} ngày
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-amber-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#b45309] shadow-2xs">
              <Zap size={14} className="text-amber-500 fill-amber-400" /> {totalXp} XP
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-200/90 bg-white/90 px-3.5 py-1.5 text-xs font-black text-[#059669] shadow-2xs">
              <Sprout aria-hidden="true" size={14} /> Cấp {level}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center text-center">
          <div className="mb-2 max-w-xs rounded-2xl border border-orange-200/80 bg-white/95 p-3 text-left shadow-md backdrop-blur-xs sm:mb-2.5 sm:p-3.5">
            <div className="flex items-center gap-1 text-[10px] font-black uppercase text-[#d83a00]">
              <Bell aria-hidden="true" size={12} />
              <span>【 THÔNG BÁO ADMIN 】</span>
            </div>
            {announcement ? (
              <Link to={announcementTarget} className="group mt-1 block">
                <strong className="block truncate text-xs font-black text-[#0f172a] group-hover:text-[#d83a00]">{announcement.title}</strong>
                <span className="mt-0.5 hidden line-clamp-3 text-xs font-extrabold leading-relaxed text-[#5f6b7c] sm:block">{announcement.body}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-[#d83a00] sm:mt-2">Xem thông báo <ChevronRight aria-hidden="true" size={13} /></span>
              </Link>
            ) : (
              <Link to="/app/notifications" className="group mt-1 block">
                <strong className="block truncate text-xs font-black text-[#0f172a]">Chưa có thông báo mới</strong>
                <span className="mt-0.5 hidden text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:block">Thông báo từ quản trị viên sẽ hiển thị tại đây.</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-black text-[#d83a00] sm:mt-2">Mở trung tâm thông báo <ChevronRight aria-hidden="true" size={13} /></span>
              </Link>
            )}
          </div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative h-24 w-24 shrink-0 sm:h-44 sm:w-44"
          >
            <img
              src={heroAsset.src}
              alt={heroSlot?.altText || heroAsset.alt}
              className="h-full w-full object-contain drop-shadow-[0_12px_24px_rgba(217,74,19,0.22)]"
            />
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
