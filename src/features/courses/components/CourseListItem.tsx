import { ArrowRight, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';

export interface CourseListItemProps {
  key?: string;
  image: string;
  title: string;
  description: string;
  lessons: number;
  level: string;
  rating: number | null;
  to: string;
  progress?: number | null;
  variant?: 'owned' | 'explore';
  active?: boolean;
  index?: number;
}

export function completedLessonCount(course: Pick<CourseListEntry, 'progress' | 'totalLessons'>): number {
  if (!course.totalLessons) return 0;
  return Math.min(course.totalLessons, Math.round((course.totalLessons * course.progress) / 100));
}

function lessonCountLabel(lessons: number): string {
  return lessons > 0 ? `${lessons} bài học` : 'Chưa có số bài học';
}

export function CourseListItem({ image, title, description, lessons, level, rating, to, progress = null, variant = 'explore', active = false, index = 0 }: CourseListItemProps) {
  const owned = variant === 'owned';
  const ownedProgress = progress === null ? null : Math.max(0, Math.min(100, progress));
  const lessonLabel = owned && ownedProgress !== null && lessons > 0
    ? `Bài ${Math.min(lessons, Math.round((lessons * ownedProgress) / 100))} / ${lessons}`
    : owned && ownedProgress !== null
      ? `${ownedProgress}% tiến độ`
      : lessonCountLabel(lessons);

  return (
    <motion.li initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.035 }}>
      <Link
        to={to}
        aria-current={active ? 'page' : undefined}
        className={`group flex items-center gap-3 rounded-[18px] border bg-white transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc] active:scale-[.995] ${owned ? 'min-h-[76px] px-3 py-2.5' : 'min-h-[112px] p-2.5'} ${active ? 'border-[#cdb9f5] shadow-[0_4px_14px_rgba(112,65,220,.1)]' : 'border-[#eeeaf4] shadow-[0_3px_12px_rgba(35,25,65,.035)]'}`}
      >
        <img src={image} alt="" className={`${owned ? 'h-12 w-12 rounded-[12px]' : 'h-[88px] w-[90px] rounded-[14px]'} shrink-0 object-cover`} />
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-[13px] font-black text-[#252333] sm:text-[14px]">{title}</strong>
          {owned ? (
            <>
              <span className="mt-1 block text-[10px] font-semibold text-[#777181]">{lessonLabel}</span>
              <span className="mt-2 flex items-center gap-2">
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eeeaf5]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={ownedProgress ?? undefined} aria-label={`Tiến độ ${title}`}>
                  <span className="block h-full rounded-full bg-[#7544df] transition-[width] duration-500" style={{ width: `${ownedProgress ?? 0}%` }} />
                </span>
                <span className="text-[10px] font-black text-[#6f45d8]">{ownedProgress === null ? '—' : `${ownedProgress}%`}</span>
              </span>
            </>
          ) : (
            <>
              <span className="mt-1 block line-clamp-2 text-[10px] font-medium leading-relaxed text-[#777181]">{description || 'Nội dung khóa học đang được cập nhật.'}</span>
              <span className="mt-2 flex flex-wrap items-center gap-2 text-[9px] font-bold text-[#85808f]">
                <span>{lessonLabel}</span>
                {level && <span className="rounded-full bg-[#eee7ff] px-2 py-1 font-black text-[#6840ce]">{level}</span>}
                {rating !== null && <span className="inline-flex items-center gap-0.5"><Star size={11} className="fill-[#edb83f] text-[#edb83f]" /> {rating}</span>}
              </span>
            </>
          )}
        </span>
        <ArrowRight size={17} className="shrink-0 text-[#8b829e] transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </Link>
    </motion.li>
  );
}
