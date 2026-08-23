import { ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import type { CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { CourseCardStatus, getCourseThumbnail } from './CourseCard';

interface LearningRoadmapProps {
  courses: CourseListEntry[];
}

function courseStatus(course: CourseListEntry): CourseCardStatus {
  if (course.isEnrolled !== true) return 'new';
  return course.progress > 0 ? 'in-progress' : 'next';
}

export function LearningRoadmap({ courses }: LearningRoadmapProps) {
  return (
    <section id="roadmap" aria-labelledby="roadmap-title" className="scroll-mt-4">
      <div className="mb-3">
        <h2 id="roadmap-title" className="text-[18px] font-black tracking-[-.025em] text-[#202129]">Lộ trình đề xuất</h2>
        <p className="mt-0.5 text-[10px] font-medium text-[#8b8e98]">Các khóa học được sắp xếp theo thứ tự hiện có.</p>
      </div>

      {courses.length > 0 ? (
        <ol className="space-y-2.5">
          {courses.slice(0, 5).map((course, index) => {
            const status = courseStatus(course);
            const started = course.isEnrolled === true;
            return (
              <motion.li key={course.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .04 }}>
                <Link to={`/app/courses/${course.id}/learn`} className="group flex items-center gap-3 rounded-[24px] border border-[#ebe6f4] bg-white p-2.5 shadow-[0_4px_14px_rgba(31,23,61,.04)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f45d8]">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-black ${started && course.progress >= 100 ? 'bg-[#e7f8ed] text-[#2d9b5a]' : 'bg-[#f0ebff] text-[#6f45d8]'}`}>
                    {started && course.progress >= 100 ? <Check size={16} /> : index + 1}
                  </span>
                  <img src={getCourseThumbnail(course)} alt="" className="h-14 w-16 shrink-0 rounded-[16px] object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <strong className="truncate text-[12px] font-black text-[#25262c]">{course.title}</strong>
                      <span className="rounded-full bg-[#f5f2fa] px-1.5 py-0.5 text-[8px] font-black text-[#817b8d]">{course.level || '—'}</span>
                    </span>
                    <span className="mt-1 block truncate text-[10px] font-medium text-[#8b8e98]">{course.description || 'Nội dung khóa học đang được cập nhật.'}</span>
                    <span className="mt-2 flex items-center gap-2">
                      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eeeaf5]"><span className="block h-full rounded-full bg-[#7c54e4]" style={{ width: `${course.progress}%` }} /></span>
                      <span className="text-[9px] font-black text-[#6f45d8]">{started ? `${course.progress}%` : 'Chưa bắt đầu'}</span>
                    </span>
                  </span>
                  <span className={`hidden shrink-0 items-center gap-1 rounded-full px-3 py-2 text-[9px] font-black sm:inline-flex ${status === 'in-progress' ? 'bg-[#eee7ff] text-[#6840ce]' : status === 'next' ? 'bg-[#fff0dc] text-[#c87918]' : 'bg-[#e6f8eb] text-[#2b9858]'}`}>
                    {started ? 'Tiếp tục' : 'Bắt đầu'} <ArrowRight size={12} />
                  </span>
                </Link>
              </motion.li>
            );
          })}
        </ol>
      ) : (
        <div className="rounded-[24px] border border-dashed border-[#dcd4ee] bg-[#fbf9ff] p-5 text-center text-[11px] font-medium text-[#85808f]">Chưa có lộ trình khóa học để hiển thị.</div>
      )}
    </section>
  );
}
