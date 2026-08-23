import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { getCourseThumbnail } from './CourseCard';
import { completedLessonCount } from './CourseListItem';

interface ActiveCourseCardProps {
  course: CourseListEntry | null;
  loading?: boolean;
}

function lessonLabel(course: CourseListEntry): string {
  if (!course.totalLessons) return `${course.progress}% tiến độ`;
  return `Bài ${completedLessonCount(course)} / ${course.totalLessons}`;
}

export function ActiveCourseCard({ course, loading = false }: ActiveCourseCardProps) {
  if (loading) {
    return <div className="h-[198px] animate-pulse rounded-[24px] border border-[#ece8f4] bg-white" aria-busy="true" aria-label="Đang tải khóa học đang học" />;
  }

  if (!course) {
    return (
      <section aria-labelledby="active-course-title" className="rounded-[24px] border border-dashed border-[#d8ccef] bg-white p-5 text-center">
        <h2 id="active-course-title" className="text-[16px] font-black text-[#29233f]">Chưa có khóa học đang học</h2>
        <p className="mt-1 text-[11px] font-medium text-[#85808f]">Chọn một khóa học để bắt đầu lộ trình.</p>
        <Link to="/app/enrollments" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#6f45d8] px-4 py-2.5 text-[11px] font-black text-white shadow-[0_5px_14px_rgba(111,69,216,.2)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f45d8]">
          Khám phá khóa học <ArrowRight size={13} />
        </Link>
      </section>
    );
  }

  const thumbnail = getCourseThumbnail(course);
  const actionLabel = course.progress >= 100 ? 'Xem lại khóa học' : course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học';

  return (
    <motion.section
      aria-labelledby="active-course-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-[24px] border border-[#dfd2f7] bg-white p-3.5 shadow-[0_7px_20px_rgba(91,50,174,.1)] sm:p-4"
    >
      <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 sm:grid-cols-[140px_minmax(0,1fr)] sm:gap-4">
        <img src={thumbnail} alt="" className="h-[154px] w-full rounded-[18px] object-cover sm:h-[166px]" />
        <div className="flex min-w-0 flex-col py-0.5">
          <span className="w-fit rounded-full bg-[#eee7ff] px-2 py-1 text-[9px] font-black uppercase tracking-wide text-[#6840ce]">Đang học</span>
          <h2 id="active-course-title" className="mt-3 line-clamp-2 text-[17px] font-black leading-tight text-[#242036] sm:text-[19px]">{course.title}</h2>
          <p className="mt-2 text-[12px] font-bold text-[#6f45d8]">{lessonLabel(course)}</p>
          <div className="mt-auto">
            <div className="mt-4 flex items-center justify-between text-[11px] font-black text-[#565263]">
              <span>Tiến độ</span>
              <span>{course.progress}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eeeaf6]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={course.progress} aria-label={`Tiến độ ${course.title}`}>
              <div className="h-full rounded-full bg-[#7544df] transition-[width] duration-500" style={{ width: `${course.progress}%` }} />
            </div>
            <Link to={`/app/courses/${course.id}/learn`} className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[#7041dc] px-3 py-2.5 text-[11px] font-black text-white shadow-[0_5px_12px_rgba(112,65,220,.2)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc] active:scale-[.98]">
              <Play size={12} fill="currentColor" aria-hidden="true" />
              {actionLabel}
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
