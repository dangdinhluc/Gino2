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
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8b829e]">Marketplace</p>
          <h2 id="course-marketplace-title" className="mt-1 text-[20px] font-black tracking-[-.03em] text-[#201b36]">Khám phá khóa học</h2>
        </div>
        <Link to="/app/enrollments" className="inline-flex items-center gap-1 text-[10px] font-black text-[#6f45d8]">Gói học <ArrowRight size={13} /></Link>
      </div>

      {categories.length > 1 && onSelectCategory && (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Lọc khóa học">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={category === activeCategory ? 'shrink-0 rounded-full bg-[#7041dc] px-3 py-1.5 text-[10px] font-black text-white' : 'shrink-0 rounded-full border border-[#e8e1f5] bg-white px-3 py-1.5 text-[10px] font-black text-[#777181]'}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {courses.length > 0 ? (
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {courses.map((course) => (
            <li key={course.id} className="rounded-[18px] border border-[#eeeaf4] bg-white p-2.5 shadow-[0_3px_12px_rgba(35,25,65,.035)]">
              <div className="flex gap-3">
                <img src={getCourseThumbnail(course)} alt="" className="h-20 w-20 shrink-0 rounded-[14px] object-cover" />
                <div className="min-w-0 flex-1">
                  <span className="rounded-full bg-[#eee7ff] px-2 py-1 text-[9px] font-black text-[#6840ce]">{course.level}</span>
                  <strong className="mt-2 block line-clamp-2 text-[12px] font-black leading-tight text-[#302a41]">{course.title}</strong>
                  <span className="mt-1 block text-[9px] font-semibold text-[#8b829e]">{course.totalLessons} bài học</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onEnroll(course)}
                disabled={busyCourseId !== null}
                className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#7041dc] py-2.5 text-[10px] font-black text-white disabled:cursor-wait disabled:opacity-60"
              >
                {busyCourseId === course.id ? <Loader2 size={13} className="animate-spin" /> : <ShoppingBag size={13} />}
                Đăng ký khóa này
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-[18px] border border-dashed border-[#d8ccef] bg-white p-5 text-center text-[11px] font-semibold text-[#777181]">Anh đã tham gia tất cả khóa đang mở.</p>
      )}
    </section>
  );
}
