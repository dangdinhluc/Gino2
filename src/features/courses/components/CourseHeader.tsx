import { Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { assets } from '@/src/shared/lib/assets';

interface CourseHeaderProps {
  courseCount: number | null;
  streak: number | null;
  loading?: boolean;
}

function valueOrDash(value: number | null, loading: boolean): string {
  if (loading) return '…';
  return value === null ? '—' : value.toLocaleString('vi-VN');
}

export function CourseHeader({ courseCount, streak, loading = false }: CourseHeaderProps) {
  return (
    <motion.header
      aria-labelledby="course-page-title"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative min-h-[148px] overflow-hidden rounded-[24px] border border-[#e8dccb] bg-[#f8f2e8] px-5 py-5 shadow-[0_6px_18px_rgba(92,61,35,.05)] sm:min-h-[164px] sm:px-7 sm:py-6"
    >
      <div className="relative z-10 max-w-[62%]">
        <h1 id="course-page-title" className="font-[var(--font-heading)] text-[30px] font-bold leading-none tracking-[-.04em] text-[#172033] sm:text-[36px]">
          Khóa học
        </h1>
        <p className="mt-4 text-[12px] font-medium text-[#5f6b7c] sm:text-[13px]">
          Bạn đang học <strong className="font-bold text-[#c96a1b]">{valueOrDash(courseCount, loading)} khóa</strong>
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-bold text-[#c96a1b] sm:text-[13px]">
          <Flame size={15} className="fill-[#c96a1b] text-[#c96a1b]" aria-hidden="true" />
          {valueOrDash(streak, loading)} ngày liên tục
        </p>
      </div>

      <img
        src={assets.shared.mascots.readingBook}
        alt="Tanuki đang học"
        className="absolute -bottom-1 right-1 h-[145px] w-[43%] object-contain object-bottom drop-shadow-[0_8px_12px_rgba(92,61,35,.12)] sm:right-7 sm:h-[165px] sm:w-[35%]"
      />
    </motion.header>
  );
}
