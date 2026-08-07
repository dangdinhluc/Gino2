import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { EXAMS } from '@/src/features/exams/mock/exams';
import {
  Award,
  BriefcaseBusiness,
  ChevronRight,
  Clock3,
  FileText,
  GraduationCap,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { assetPath } from '@/src/shared/lib/assets';

export default function ExamCenter() {
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('Tất cả');
  const [skillFilter, setSkillFilter] = useState('Tất cả');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const providerOptions = ['Tất cả', ...Array.from(new Set(EXAMS.map((exam) => exam.type)))];
  const skillOptions = ['Tất cả', ...Array.from(new Set(EXAMS.flatMap((exam) => exam.skills)))];

  const filteredExams = EXAMS.filter((exam) => {
    const normalizedQuery = query.trim().toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 ||
      exam.title.toLowerCase().includes(normalizedQuery) ||
      exam.type.toLowerCase().includes(normalizedQuery) ||
      exam.skills.some((skill) => skill.toLowerCase().includes(normalizedQuery));
    const matchesProvider = providerFilter === 'Tất cả' || exam.type === providerFilter;
    const matchesSkill = skillFilter === 'Tất cả' || exam.skills.includes(skillFilter);
    return matchesQuery && matchesProvider && matchesSkill;
  });

  const hasActiveFilters = providerFilter !== 'Tất cả' || skillFilter !== 'Tất cả';
  const activeFilterSummary =
    [providerFilter !== 'Tất cả' ? providerFilter : null, skillFilter !== 'Tất cả' ? skillFilter : null]
      .filter(Boolean)
      .join(' · ') || 'Tất cả';

  return (
    <div className="mx-auto max-w-5xl space-y-5 pb-[calc(6.75rem+env(safe-area-inset-bottom))] md:pb-20">
      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] px-4 py-4.5 shadow-2xs sm:px-6 sm:py-6">
        {/* Watermark Kanji */}
        <div
          className="pointer-events-none absolute left-4 top-1 select-none text-4xl font-extrabold text-[#f7c297]/15 sm:text-5xl"
          aria-hidden="true"
        >
          試
        </div>

        <div className="relative flex items-center justify-between gap-4">
          <div className="min-w-0 max-w-lg space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[#d83a00] shadow-2xs">
              <Sparkles size={13} className="text-amber-500 fill-amber-400" /> Phòng thi Tokutei
            </div>
            <h1 className="font-[var(--font-heading)] text-2xl font-black tracking-[-0.03em] text-[#0f172a] sm:text-3xl">
              Chọn đề thi & Thử sức ngay
            </h1>
            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] sm:text-sm">
              Đề thi mô phỏng Tokutei & JFT-Basic bám sát ma trận đề thật, kiểm tra độ nhạy âm thanh và phản xạ ca làm.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-extrabold text-[#c2410c]">
              <span className="flex items-center gap-1 rounded-lg bg-orange-100/70 border border-orange-200/80 px-2.5 py-0.5">
                <FileText size={13} /> {filteredExams.length} đề thi sẵn sàng
              </span>
              <span className="flex items-center gap-1 rounded-lg bg-orange-100/70 border border-orange-200/80 px-2.5 py-0.5">
                <Clock3 size={13} /> 165 phút mỗi đề
              </span>
            </div>
          </div>

          {/* Right 3D Tanuki Mascot */}
          <div className="relative shrink-0 hidden sm:block -my-3 -mr-2">
            <img
              src={assetPath('assets/tanuki_exam_mascot.png')}
              alt="Tokutei Exam Tanuki Mascot"
              className="h-24 w-auto object-contain drop-shadow-md sm:h-28 md:h-32"
            />
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <section className="sticky top-[68px] z-30 rounded-[22px] border border-[#eee3d5] bg-white/95 backdrop-blur-md p-2.5 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="group relative flex-1 min-w-0">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af] transition-colors group-focus-within:text-[#d83a00]"
              size={18}
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên đề thi, từ khóa hoặc kỹ năng..."
              className="w-full rounded-2xl border border-[#eee3d5] bg-[#fffcf9] py-2.5 pl-10 pr-9 text-xs font-bold text-[#0f172a] outline-none transition-all placeholder:text-[#95a0af] focus:border-[#d83a00] focus:bg-white focus:ring-2 focus:ring-[#d83a00]/15 sm:text-sm"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-slate-600 hover:bg-slate-300"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={cn(
              'relative flex h-10 px-3 shrink-0 items-center justify-center gap-1.5 rounded-2xl border text-xs font-extrabold transition-all duration-200 shadow-2xs active:scale-95',
              hasActiveFilters
                ? 'border-[#d83a00] bg-orange-50 text-[#d83a00]'
                : 'border-[#eee3d5] bg-[#fffcf9] text-[#5f6b7c] hover:text-[#0f172a]'
            )}
            aria-label="Mở bộ lọc đề thi"
          >
            <SlidersHorizontal size={15} strokeWidth={2} />
            <span>Bộ lọc</span>
            {hasActiveFilters && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#d83a00] px-1 text-[10px] text-white font-extrabold">
                {[providerFilter, skillFilter].filter((v) => v !== 'Tất cả').length}
              </span>
            )}
          </button>
        </div>

        {/* Quick Provider Filter Pills (Desktop & Tablet) */}
        <div className="hidden flex-wrap items-center gap-1.5 pt-1 md:flex">
          {providerOptions.map((provider) => {
            const isActive = providerFilter === provider;
            return (
              <button
                key={provider}
                type="button"
                onClick={() => setProviderFilter(provider)}
                className={cn(
                  'rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200 shadow-2xs',
                  isActive
                    ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                    : 'border border-[#eee3d5] bg-[#fffcf9] text-[#5f6b7c] hover:border-orange-200 hover:text-[#0f172a]'
                )}
              >
                {provider}
              </button>
            );
          })}
        </div>
      </section>

      {/* Filter Bottom Sheet (Mobile & Desktop) */}
      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.95, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-[28px] border border-[#eee3d5] bg-white p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[#f5ece1] pb-3">
                <div>
                  <h3 className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">
                    Bộ lọc đề thi Tokutei 🎯
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-[#5f6b7c]">Lọc theo loại đề thi hoặc kỹ năng cần ôn</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-extrabold text-[#717d8f] uppercase tracking-wider">Loại đề thi</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {providerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setProviderFilter(option)}
                        className={cn(
                          'rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200',
                          providerFilter === option
                            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                            : 'border border-[#eee3d5] bg-slate-50 text-[#5f6b7c]'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-extrabold text-[#717d8f] uppercase tracking-wider">Kỹ năng đánh giá</span>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {skillOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSkillFilter(option)}
                        className={cn(
                          'rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition-all duration-200',
                          skillFilter === option
                            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                            : 'border border-[#eee3d5] bg-slate-50 text-[#5f6b7c]'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-[#f5ece1] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setProviderFilter('Tất cả');
                    setSkillFilter('Tất cả');
                  }}
                  className="flex-1 rounded-2xl border border-[#eee3d5] bg-slate-50 py-2.5 text-xs font-extrabold text-[#5f6b7c] hover:bg-slate-100"
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] py-2.5 text-xs font-extrabold text-white shadow-xs"
                >
                  Áp dụng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Redesigned Exam Cards List */}
      <div className="space-y-4">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <motion.div
              key={exam.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="group rounded-[24px] border border-[#f5ece1] bg-white p-4.5 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)] sm:p-5"
            >
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                {/* Left Exam Icon & Info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* 3D Exam Badge */}
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff7f0] to-[#ffeedd] border border-orange-200/60 p-2 shadow-2xs group-hover:scale-105 transition-transform">
                    <img
                      src={assetPath(
                        exam.type === 'Interview'
                          ? 'assets/course-workspace-icons/workspace_practice.png'
                          : 'assets/course-workspace-icons/workspace_exam.png'
                      )}
                      alt=""
                      className="h-full w-full object-contain drop-shadow-xs"
                    />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-extrabold text-[#c2410c]">
                        {exam.type}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-extrabold text-[#059669]">
                        <span className="h-2 w-2 rounded-full bg-[#059669] animate-pulse" /> Sẵn sàng làm bài
                      </span>
                    </div>

                    <h3 className="font-[var(--font-heading)] text-base font-black tracking-[-0.01em] text-[#0f172a] transition-colors group-hover:text-[#d83a00] sm:text-lg">
                      {exam.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#717d8f]">
                      <span className="flex items-center gap-1">
                        <Clock3 size={13} className="text-[#d83a00]" /> 165 phút
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={13} className="text-[#d83a00]" /> {exam.skills.length} kỹ năng
                      </span>
                    </div>

                    {/* Skill Pills */}
                    <div className="mt-2 flex flex-wrap gap-1.5 pt-1">
                      {exam.skills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-[#475467]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Action Button */}
                <div className="shrink-0 flex items-center justify-end sm:flex-col sm:items-end sm:justify-center">
                  <Link
                    to={`/app/exams/${exam.id}/start`}
                    className="flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-5 text-xs font-extrabold text-white shadow-xs transition-all duration-200 group-hover:shadow-md group-hover:from-[#c23400] group-hover:to-[#d84800] active:scale-95"
                  >
                    <span>Làm bài ngay</span>
                    <ArrowRight size={15} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-[24px] border border-[#eee3d5] bg-white p-8 text-center space-y-4 shadow-2xs">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-[#d83a00]">
              <Search size={36} strokeWidth={2} />
            </div>
            <div>
              <p className="font-[var(--font-heading)] text-base font-black text-[#0f172a]">Chưa thấy đề thi phù hợp</p>
              <p className="mt-1 text-xs font-semibold text-[#5f6b7c]">Thử thay đổi từ khóa hoặc bỏ bớt các bộ lọc kỹ năng.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setProviderFilter('Tất cả');
                setSkillFilter('Tất cả');
              }}
              className="rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-5 py-2.5 text-xs font-extrabold text-white shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              Bỏ lọc & Hiển thị tất cả
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
