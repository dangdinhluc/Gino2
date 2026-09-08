import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';

interface CourseMarketplaceProps {
  courses: CourseListEntry[];
  busyCourseId: string | null;
  onEnroll: (course: CourseListEntry) => void;
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function CourseMarketplace({ courses, busyCourseId, onEnroll, categories = [], activeCategory, onSelectCategory }: CourseMarketplaceProps) {
  return (
    <section aria-labelledby="course-marketplace-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6f6880]">Marketplace</p>
          <h2 id="course-marketplace-title" className="mt-1 font-[var(--font-heading)] text-[20px] font-bold tracking-[-.03em] text-[#211b35]">Khám phá khóa học</h2>
        </div>
        <Link to="/app/enrollments" className="inline-flex min-h-11 items-center gap-1 text-[11px] font-bold text-[#6f45d8]">Gói học <ArrowRight size={14} /></Link>
      </div>

      {categories.length > 1 && onSelectCategory && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Lọc khóa học">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={category === activeCategory ? 'min-h-11 shrink-0 rounded-full bg-[#6f45d8] px-3.5 text-[11px] font-bold text-white' : 'min-h-11 shrink-0 rounded-full border border-[#e5dcf2] bg-[#fffcff] px-3.5 text-[11px] font-semibold text-[#6f6880]'}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {courses.length > 0 ? (
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id} className="rounded-[24px] border border-[#e5dcf2] bg-[#fffcff] p-3 shadow-[0_3px_12px_rgba(73,48,126,.04)]">
              <div className="flex gap-3">
                <img src={getCourseThumbnail(course)} alt="" className="h-20 w-20 shrink-0 rounded-[14px] object-cover" />
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-[#f4effb] px-2 py-1 text-[11px] font-bold text-[#6f6880]">{course.level}</span>
                  <strong className="mt-2 block line-clamp-2 text-[13px] font-bold leading-tight text-[#211b35]">{course.title}</strong>
                  <span className="mt-1 block text-[11px] font-medium text-[#6f6880]">{course.totalLessons} bài học</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEnroll(course)}
                disabled={busyCourseId !== null}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[14px] bg-[#6f45d8] px-3 text-[11px] font-bold text-white transition hover:bg-[#5631b8] disabled:cursor-wait disabled:opacity-60"
              >
                {busyCourseId === course.id ? <Loader2 size={14} className="animate-spin" /> : <ShoppingBag size={14} />}
                Đăng ký khóa này
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-[24px] border border-dashed border-[#d6c8ea] bg-[#fffcff] p-5 text-center text-[12px] font-medium text-[#6f6880]">Bạn đã tham gia tất cả khóa đang mở.</p>
      )}
    </section>
  );
}
