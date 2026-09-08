import { Link } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';

interface MyCoursesProps {
  courses: CourseListEntry[];
  activeCourseId: string | null;
  onSwitch: (courseId: string) => void;
  switchingCourseId?: string | null;
}

export function MyCourses({ courses, activeCourseId, onSwitch, switchingCourseId = null }: MyCoursesProps) {
  return (
    <section aria-labelledby="my-courses-center-title">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#5f6b7c]">Lộ trình của bạn</p>
          <h2 id="my-courses-center-title" className="mt-1 font-[var(--font-heading)] text-[20px] font-bold tracking-[-.03em] text-[#172033]">Khóa học của tôi</h2>
        </div>
        <span className="rounded-full bg-[#f9eadb] px-2.5 py-1 text-[11px] font-bold text-[#c96a1b]">{courses.length} khóa</span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          return (
            <li key={course.id}>
              <div
                className={isActive ? 'group flex items-center gap-3 rounded-[24px] border border-[#e6c39f] bg-[#fff9f2] p-3 shadow-[0_6px_18px_rgba(201,106,27,.08)] transition hover:-translate-y-0.5' : 'group flex items-center gap-3 rounded-[24px] border border-[#e8dccb] bg-[#fff9f2] p-3 shadow-[0_3px_12px_rgba(92,61,35,.04)] transition hover:-translate-y-0.5'}
              >
                <Link to={'/app/courses/' + course.id + '/learn'} aria-label={'Mở chi tiết ' + course.title} className="flex min-w-0 flex-1 items-center gap-3">
                  <img src={getCourseThumbnail(course)} alt="" className="h-14 w-14 shrink-0 rounded-[14px] object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <strong className="truncate text-[13px] font-bold text-[#172033]">{course.title}</strong>
                      {isActive && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f9eadb] px-2 py-1 text-[11px] font-bold text-[#c96a1b]"><Check size={11} /> Đang học</span>}
                    </span>
                    <span className="mt-1 block text-[11px] font-medium text-[#5f6b7c]">{course.level} · {course.totalLessons} bài học</span>
                    <span className="mt-2 flex items-center gap-2">
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-[#efe4d5]"><span className="block h-full rounded-full bg-[#c96a1b]" style={{ width: String(course.progress) + '%' }} /></span>
                      <span className="text-[11px] font-bold text-[#c96a1b]">{course.progress}%</span>
                    </span>
                  </span>
                </Link>
                {isActive ? (
                  <Link to={'/app/courses/' + course.id + '/learn'} aria-label={'Mở chi tiết ' + course.title} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c96a1b] text-white shadow-[0_3px_10px_rgba(201,106,27,.2)]">
                    <ChevronRight size={18} aria-hidden="true" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => onSwitch(course.id)} disabled={switchingCourseId !== null} className="min-h-11 shrink-0 rounded-[14px] bg-[#c96a1b] px-3 text-[11px] font-bold text-white disabled:cursor-wait disabled:opacity-60">
                    {switchingCourseId === course.id ? 'Đang chuyển…' : 'Chuyển'}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
