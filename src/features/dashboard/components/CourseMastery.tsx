import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { cn } from '@/src/lib/utils';

interface CourseMasteryProps {
  topicMastery: NonNullable<LearnerStatsSnapshot['topicMastery']>;
}

export function CourseMastery({ topicMastery }: CourseMasteryProps) {
  return (
    <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 shadow-2xs sm:p-6" aria-label="Tiến độ theo khóa học">
      <div className="flex items-end justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#717d8f]">LỘ TRÌNH CỦA ANH</span>
          <h2 className="mt-1 font-[var(--font-heading)] text-lg font-black text-[#0f172a]">Tiến độ theo khóa học</h2>
        </div>
        <Link to="/app/courses" className="inline-flex items-center gap-1 text-xs font-black text-[#d83a00] hover:text-[#b52f00]">
          Mở khóa học <ChevronRight size={14} />
        </Link>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {topicMastery.map((topic) => {
          const percent = Math.max(0, Math.min(100, Math.round(topic.percent)));
          const tone = percent >= 80 ? 'emerald' : percent >= 40 ? 'orange' : 'sky';
          return (
            <Link
              key={topic.courseId}
              to={`/app/courses/${topic.courseId}/learn`}
              className="group rounded-2xl border border-[#f5ece1] bg-[#fffdf9] p-4 transition-all hover:border-orange-200 hover:shadow-2xs"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-sm font-black text-[#172033] group-hover:text-[#d83a00]">{topic.courseTitle}</h3>
                <span className={cn(
                  'shrink-0 rounded-full px-2.5 py-1 text-xs font-black',
                  tone === 'emerald' ? 'bg-emerald-50 text-emerald-700' : tone === 'orange' ? 'bg-orange-50 text-[#c2410c]' : 'bg-sky-50 text-sky-700'
                )}>{percent}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efe5d7]" role="progressbar" aria-label={`Tiến độ ${topic.courseTitle}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
                <div className={cn('h-full rounded-full transition-all', tone === 'emerald' ? 'bg-emerald-500' : tone === 'orange' ? 'bg-gradient-to-r from-[#d83a00] to-[#f26522]' : 'bg-sky-500')} style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold text-[#7b8796]">{topic.mastered}/{topic.total} từ đã mastery</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
