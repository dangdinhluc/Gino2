import { ArrowRight, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { assets } from '@/src/shared/lib/assets';

export type CourseCardStatus = 'in-progress' | 'next' | 'new';

interface CourseCardProps {
  course: CourseListEntry;
  status: CourseCardStatus;
  streak?: number | null;
  index?: number;
}

const STATUS_STYLES: Record<CourseCardStatus, { label: string; className: string }> = {
  'in-progress': { label: 'ĐANG HỌC', className: 'bg-[#eee7ff] text-[#6840ce]' },
  next: { label: 'TIẾP THEO', className: 'bg-[#fff0dc] text-[#c87918]' },
  new: { label: 'MỚI', className: 'bg-[#e6f8eb] text-[#2b9858]' },
};

export function getCourseThumbnail(course: Pick<CourseListEntry, 'image' | 'title' | 'description' | 'level'>): string {
  if (course.image) return course.image;
  const searchable = `${course.title} ${course.description} ${course.level}`.toLowerCase();
  if (searchable.includes('giao tiếp') || searchable.includes('kaiwa') || searchable.includes('speaking')) return assets.courses.workspace.practice;
  if (searchable.includes('kanji')) return assets.courses.workspace.documents;
  if (searchable.includes('ngữ pháp') || searchable.includes('grammar')) return assets.courses.workspace.vocabulary;
  return assets.shared.backgrounds.fujiScene;
}

export function CourseCard({ course, status, streak = null, index = 0 }: CourseCardProps) {
  const statusStyle = STATUS_STYLES[status];
  const thumbnail = getCourseThumbnail(course);

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * .04 }}
      className="min-w-[220px] max-w-[220px] snap-start"
    >
      <Link
        to={`/app/courses/${course.id}/learn`}
        aria-label={`${course.title}, ${statusStyle.label.toLowerCase()}, ${course.progress}%`}
        className="group block overflow-hidden rounded-[28px] border border-[#ebe6f4] bg-white p-2.5 shadow-[0_5px_16px_rgba(31,23,61,.05)] transition-transform hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f45d8] active:scale-[.99]"
      >
        <div className="relative h-[126px] overflow-hidden rounded-[22px] bg-[#f0ebff]">
          <img src={thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          <span className={`absolute left-2.5 top-2.5 rounded-full px-2 py-1 text-[9px] font-black tracking-wide ${statusStyle.className}`}>
            {statusStyle.label}
          </span>
        </div>
        <div className="px-1.5 pb-1 pt-3">
          <div className="flex items-start justify-between gap-2">
            <strong className="line-clamp-2 min-h-8 text-[13px] font-black leading-tight text-[#25262c]">{course.title}</strong>
            {status === 'in-progress' && <Flame size={15} className="mt-0.5 shrink-0 fill-[#ff8559] text-[#ff8559]" aria-hidden="true" />}
          </div>
          <div className="mt-3 flex items-center justify-between gap-2 text-[10px] font-black text-[#767986]">
            <span>{course.progress}%</span>
            <span className="inline-flex items-center gap-1"><Flame size={11} className="fill-[#ff8559] text-[#ff8559]" /> {streak === null ? '— ngày' : `${streak} ngày`}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eeeaf5]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress} aria-label={`Tiến độ ${course.title}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-[#7d54e6] to-[#a98af4] transition-[width] duration-500" style={{ width: `${course.progress}%` }} />
          </div>
          <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-black text-[#6f45d8]">{status === 'new' ? 'Khám phá' : 'Tiếp tục'} <ArrowRight size={12} /></span>
        </div>
      </Link>
    </motion.article>
  );
}
