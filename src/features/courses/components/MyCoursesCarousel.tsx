import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { CourseCard } from './CourseCard';

interface MyCoursesCarouselProps {
  courses: CourseListEntry[];
  streak?: number | null;
  loading?: boolean;
}

export function MyCoursesCarousel({ courses, streak = null, loading = false }: MyCoursesCarouselProps) {
  const enrolled = courses.filter((course) => course.isEnrolled === true);

  return (
    <section aria-labelledby="my-courses-title">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 id="my-courses-title" className="text-[18px] font-black tracking-[-.025em] text-[#202129]">Khóa học của bạn</h2>
          <p className="mt-0.5 text-[10px] font-medium text-[#8b8e98]">Tiếp tục hành trình đang dang dở.</p>
        </div>
        <Link to="/app/enrollments" className="text-[10px] font-black text-[#6f45d8] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f45d8]">Xem tất cả</Link>
      </div>

      {loading ? (
        <div className="flex gap-3 overflow-hidden" aria-busy="true" aria-label="Đang tải khóa học">
          {Array.from({ length: 2 }, (_, index) => <div key={index} className="h-[278px] min-w-[220px] animate-pulse rounded-[28px] bg-[#eeeaf5]" />)}
        </div>
      ) : enrolled.length > 0 ? (
        <ul className="flex snap-x gap-3 overflow-x-auto pb-3 scroll-smooth no-scrollbar" aria-label="Khóa học đã tham gia">
          {enrolled.map((course, index) => (
            <li key={course.id} className="min-w-[220px] snap-start">
              <CourseCard course={course} status={course.progress > 0 ? 'in-progress' : 'next'} streak={streak} index={index} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-[28px] border border-dashed border-[#dcd4ee] bg-[#fbf9ff] p-6 text-center">
          <strong className="block text-[14px] font-black text-[#302848]">Bạn chưa có khóa học</strong>
          <p className="mt-1 text-[11px] font-medium text-[#85808f]">Chọn khóa học phù hợp để bắt đầu lộ trình.</p>
          <Link to="/app/enrollments" className="mt-4 inline-flex rounded-full bg-[#6f45d8] px-4 py-2 text-[10px] font-black text-white shadow-[0_4px_12px_rgba(111,69,216,.2)]">Khám phá khóa học</Link>
        </div>
      )}
    </section>
  );
}
