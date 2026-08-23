import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, GraduationCap, Target } from 'lucide-react';

interface DashboardShortcutsProps {
  displayDueCount: number;
}

export function DashboardShortcuts({ displayDueCount }: DashboardShortcutsProps) {
  return (
    <section className="rounded-[28px] border border-[#f5ece1] bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#717d8f]">
            HỌC THÊM • KẾT NỐI
          </span>
          <h2 className="font-[var(--font-heading)] text-lg font-black text-[#0f172a]">
            Lối tắt ứng dụng Tokutei 🚀
          </h2>
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 md:grid-cols-4">
        <Link
          to="/app/courses"
          className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-sky-300 hover:shadow-md space-y-3 gino-hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200/70 group-hover:scale-105 transition-transform">
              <BookOpen size={22} />
            </div>
            <ChevronRight size={16} className="text-[#95a0af] group-hover:text-sky-600 transition-colors" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] group-hover:text-sky-600 transition-colors">
              Khóa học Tokutei
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
              Lộ trình JFT, từ vựng & bài học
            </p>
          </div>
        </Link>

        <Link
          to="/app/practice"
          className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-emerald-300 hover:shadow-md space-y-3 gino-hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#059669] border border-emerald-200/70 group-hover:scale-105 transition-transform">
              <Target size={22} />
            </div>
            <ChevronRight size={16} className="text-[#95a0af] group-hover:text-[#059669] transition-colors" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] group-hover:text-[#059669] transition-colors">
              Ôn tập Flashcards
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
              {displayDueCount > 0 ? `${displayDueCount} thẻ đến hạn hôm nay` : 'Luyện thẻ nhớ tự động SRS'}
            </p>
          </div>
        </Link>

        <Link
          to="/app/exams"
          className="group flex flex-col justify-between rounded-2xl border border-[#f5ece1] bg-gradient-to-b from-white to-[#fffaf3] p-4 transition-all duration-200 hover:border-amber-300 hover:shadow-md space-y-3 gino-hover-lift"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-[#b45309] border border-amber-200/70 group-hover:scale-105 transition-transform">
              <GraduationCap size={22} />
            </div>
            <ChevronRight size={16} className="text-[#95a0af] group-hover:text-[#b45309] transition-colors" />
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0f172a] group-hover:text-[#b45309] transition-colors">
              Thi thử Tokutei
            </h3>
            <p className="mt-0.5 text-xs font-semibold text-[#717d8f]">
              Đề thi mô phỏng chuẩn hóa
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
