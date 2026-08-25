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
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8b829e]">Lộ trình của bạn</p>
          <h2 id="my-courses-center-title" className="mt-1 text-[20px] font-black tracking-[-.03em] text-[#201b36]">Khóa học của tôi</h2>
        </div>
        <span className="rounded-full bg-[#eee7ff] px-2.5 py-1 text-[10px] font-black text-[#6840ce]">{courses.length} khóa</span>
      </div>

      <ul className="mt-3 space-y-2.5">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          return (
            <li key={course.id}>
              <div
                className={isActive ? 'group flex items-center gap-3 rounded-[18px] border border-[#cdb9f5] bg-white p-2.5 shadow-[0_5px_16px_rgba(112,65,220,.12)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]' : 'group flex items-center gap-3 rounded-[18px] border border-[#eeeaf4] bg-white p-2.5 shadow-[0_3px_12px_rgba(35,25,65,.035)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]'}
              >
                <Link to={'/app/courses/' + course.id + '/learn'} aria-label={'Mở chi tiết ' + course.title} className="flex min-w-0 flex-1 items-center gap-3">
                  <img src={getCourseThumbnail(course)} alt="" className="h-14 w-14 shrink-0 rounded-[14px] object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <strong className="truncate text-[13px] font-black text-[#252333]">{course.title}</strong>
                      {isActive && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eee7ff] px-2 py-1 text-[9px] font-black text-[#6840ce]"><Check size={10} /> Đang học</span>}
                    </span>
                    <span className="mt-1 block text-[10px] font-semibold text-[#777181]">{course.level} · {course.totalLessons} bài học</span>
                    <span className="mt-2 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eeeaf5]"><span className="block h-full rounded-full bg-[#7544df]" style={{ width: String(course.progress) + '%' }} /></span>
                      <span className="text-[10px] font-black text-[#6f45d8]">{course.progress}%</span>
                    </span>
                  </span>
                </Link>
                {isActive ? (
                  <Link to={'/app/courses/' + course.id + '/learn'} aria-label={'Mở chi tiết ' + course.title} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7041dc] text-white shadow-2xs">
                    <ChevronRight size={17} aria-hidden="true" />
                  </Link>
                ) : (
                  <button type="button" onClick={() => onSwitch(course.id)} disabled={switchingCourseId !== null} className="shrink-0 rounded-full bg-[#7041dc] px-2.5 py-2 text-[9px] font-black text-white disabled:cursor-wait disabled:opacity-60">
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
