import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';

interface CourseSelectorProps {
  courses: CourseListEntry[];
  selectedCourseId: string | null;
  busy: boolean;
  error: string | null;
  onSelect: (courseId: string) => void;
  onContinue: () => void;
}

export function CourseSelector({ courses, selectedCourseId, busy, error, onSelect, onContinue }: CourseSelectorProps) {
  return (
    <main className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-6 sm:px-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[#dfd2f7] bg-gradient-to-br from-[#f8f5ff] via-white to-[#fff9f1] p-5 shadow-[0_10px_28px_rgba(91,50,174,.08)] sm:p-7">
        <img src={assets.shared.mascots.readingBook} alt="" className="absolute -bottom-3 right-2 h-32 w-32 object-contain opacity-90 sm:h-40 sm:w-40" />
        <div className="relative z-10 max-w-[70%]">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#6f45d8]">Bắt đầu lộ trình</p>
          <h1 className="mt-2 text-[28px] font-black leading-tight tracking-[-.04em] text-[#201b36]">Chào mừng đến với Gino2 🦝</h1>
          <p className="mt-3 text-[12px] font-semibold leading-6 text-[#6d6879]">Chọn khóa học bạn muốn bắt đầu. Sau này anh có thể thêm khóa khác và chuyển khóa bất cứ lúc nào.</p>
        </div>
      </section>

      <section className="mt-6" aria-labelledby="course-selector-title">
        <h2 id="course-selector-title" className="text-[18px] font-black text-[#201b36]">Chọn khóa học bạn muốn bắt đầu</h2>
        <div className="mt-3 space-y-2.5">
          {courses.map((course) => {
            const selected = course.id === selectedCourseId;
            return (
              <button
                key={course.id}
                type="button"
                onClick={() => onSelect(course.id)}
                className={selected ? 'flex w-full items-center gap-3 rounded-[18px] border border-[#7041dc] bg-white p-2.5 text-left shadow-[0_5px_18px_rgba(112,65,220,.16)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]' : 'flex w-full items-center gap-3 rounded-[18px] border border-[#eeeaf4] bg-white p-2.5 text-left shadow-[0_3px_12px_rgba(35,25,65,.035)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc]'}
              >
                <img src={getCourseThumbnail(course)} alt="" className="h-16 w-16 shrink-0 rounded-[14px] object-cover" />
                <span className="min-w-0 flex-1">
                  <strong className="block text-[13px] font-black text-[#302a41]">{course.title}</strong>
                  <span className="mt-1 block text-[10px] font-semibold text-[#777181]">{course.level} · {course.totalLessons} bài học</span>
                  <span className="mt-1 block line-clamp-1 text-[10px] text-[#9691a0]">{course.description}</span>
                </span>
                <span className={selected ? 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#7041dc] text-white' : 'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f3efff] text-[#9b8bc4]'} aria-hidden="true"><Check size={15} /></span>
              </button>
            );
          })}
        </div>
      </section>

      {error && <p role="alert" className="mt-4 rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[11px] font-semibold text-red-700">{error}</p>}

      <button
        type="button"
        onClick={onContinue}
        disabled={!selectedCourseId || busy}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#7041dc] px-4 py-3.5 text-[12px] font-black text-white shadow-[0_7px_18px_rgba(112,65,220,.25)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {busy ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        Tiếp tục
      </button>
    </main>
  );
}
