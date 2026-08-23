import { BookOpen, Clock3, Star, Trophy } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

export interface CourseStatsBannerData {
  courseCount: number;
  completedLessons: number;
  studyMinutes: number | null;
  xp: number;
}

interface CourseStatsBannerProps {
  data: CourseStatsBannerData | null;
  loading?: boolean;
  error?: string | null;
}

function formatStudyTime(minutes: number | null): string {
  if (minutes === null) return '—';
  if (minutes < 60) return `${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h${remainingMinutes.toString().padStart(2, '0')}`;
}

export function CourseStatsBanner({ data, loading = false, error = null }: CourseStatsBannerProps) {
  const items = data
    ? [
        { label: 'Khóa học', value: data.courseCount, icon: BookOpen, tone: 'text-[#6f45d8] bg-[#f0ebff]' },
        { label: 'Bài đã học', value: data.completedLessons, icon: Trophy, tone: 'text-[#d78a17] bg-[#fff4dc]' },
        { label: 'Thời gian học', value: formatStudyTime(data.studyMinutes), icon: Clock3, tone: 'text-[#2e9b62] bg-[#e8f8ed]' },
        { label: 'XP', value: data.xp.toLocaleString('vi-VN'), icon: Star, tone: 'text-[#d15c8b] bg-[#ffeaf2]' },
      ]
    : [];

  return (
    <section aria-label="Tổng quan tiến độ học tập" className="relative overflow-hidden rounded-[26px] border border-[#e8e0f6] bg-white p-4 shadow-[0_5px_18px_rgba(31,23,61,.05)] sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-black tracking-[-.02em] text-[#202129]">Bạn đã học được</h2>
          <p className="mt-0.5 text-[10px] font-medium text-[#8b8e98]">Mỗi bước nhỏ đều tạo nên tiến bộ lớn.</p>
        </div>
        <img src={assets.shared.mascots.faceWinking} alt="" className="h-11 w-11 object-contain drop-shadow-sm" />
      </div>

      {loading ? (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4" aria-busy="true" aria-label="Đang tải thống kê">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[70px] animate-pulse rounded-2xl bg-[#f3f0f8]" />)}
        </div>
      ) : !data ? (
        <p role={error ? 'alert' : 'status'} className="mt-4 rounded-2xl bg-[#fbf9ff] px-3 py-3 text-[11px] font-semibold text-[#85808f]">
          {error ?? 'Chưa có thống kê học tập.'}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {items.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex min-w-0 items-center gap-2 rounded-2xl border border-[#f0edf5] bg-[#fcfbfe] px-2.5 py-2.5">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon size={16} /></span>
              <span className="min-w-0">
                <strong className="block truncate text-[14px] font-black text-[#25262c]">{value}</strong>
                <span className="block truncate text-[9px] font-bold text-[#8d909a]">{label}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
