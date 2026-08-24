import { Check, Loader2, Repeat2 } from 'lucide-react';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';

interface CourseSwitcherProps {
  courses: CourseListEntry[];
  activeCourseId: string | null;
  busy: boolean;
  onSwitch: (courseId: string) => void;
}

export function CourseSwitcher({ courses, activeCourseId, busy, onSwitch }: CourseSwitcherProps) {
  return (
    <section id="course-switcher" aria-labelledby="course-switcher-title" className="scroll-mt-4 rounded-[22px] border border-[#e8e1f5] bg-[#f9f7ff] p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#6f45d8] shadow-2xs"><Repeat2 size={17} /></span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8b829e]">Learning context</p>
          <h2 id="course-switcher-title" className="text-[16px] font-black text-[#29233f]">Chuyển khóa đang học</h2>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {courses.map((course) => {
          const isActive = course.id === activeCourseId;
          return (
            <div key={course.id} className={isActive ? 'flex items-center gap-2.5 rounded-[16px] border border-[#cdb9f5] bg-white p-2.5' : 'flex items-center gap-2.5 rounded-[16px] border border-[#eeeaf4] bg-white p-2.5'}>
              <img src={getCourseThumbnail(course)} alt="" className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-[11px] font-black text-[#302a41]">{course.title}</strong>
                <span className="text-[9px] font-semibold text-[#8b829e]">{course.progress}% tiến độ</span>
              </div>
              {isActive ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#eee7ff] px-2 py-1 text-[9px] font-black text-[#6840ce]"><Check size={10} /> Đang học</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onSwitch(course.id)}
                  disabled={busy}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#7041dc] px-2.5 py-2 text-[9px] font-black text-white disabled:cursor-wait disabled:opacity-60"
                >
                  {busy ? <Loader2 size={11} className="animate-spin" /> : null}
                  Chuyển
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
