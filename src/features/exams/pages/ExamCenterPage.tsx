import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { EXAMS } from '@/src/features/exams/mock/exams';
import { FileText, Headphones, Edit3, MessageSquare, ChevronRight, Search, SlidersHorizontal, Clock3, CheckCircle2, Sparkles, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function ExamCenter() {
  const [query, setQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('Tất cả');
  const [skillFilter, setSkillFilter] = useState('Tất cả');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const skillIcons: Record<string, typeof FileText> = {
    'Tiếng Nhật': FileText,
    'Nghe hiểu': Headphones,
    'Biển báo': FileText,
    'Tình huống': MessageSquare,
    'Hồ sơ': Edit3,
    'Phỏng vấn': MessageSquare,
    'Tự giới thiệu': Edit3,
    'Mục tiêu': MessageSquare,
  };
  const providerOptions = ['Tất cả', ...Array.from(new Set(EXAMS.map((exam) => exam.type)))];
  const skillOptions = ['Tất cả', ...Array.from(new Set(EXAMS.flatMap((exam) => exam.skills)))];
  const examTypeCount = providerOptions.length - 1;
  const skillCount = skillOptions.length - 1;
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
  const mobileFilterSummary = [providerFilter !== 'Tất cả' ? providerFilter : null, skillFilter !== 'Tất cả' ? skillFilter : null].filter(Boolean).join(' · ') || 'Tất cả';
  const overviewStats = [
    { label: 'Đề sẵn sàng', value: EXAMS.length, valueTone: 'text-[#172033]' },
    { label: 'Định dạng', value: examTypeCount, valueTone: 'text-blue-500' },
    { label: 'Kỹ năng', value: skillCount, valueTone: 'text-emerald-500' },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[1.95rem] border border-[#e7ddcf] bg-[radial-gradient(circle_at_top_right,rgba(255,214,153,0.34),transparent_36%),linear-gradient(180deg,rgba(255,251,245,0.98)_0%,rgba(247,242,234,0.98)_100%)] p-4 shadow-[0_28px_68px_-46px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-6 lg:p-7">
        <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-center lg:gap-8">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex flex-wrap items-end gap-2">
                <h2 className="text-[2rem] font-black tracking-[-0.08em] text-[#172033] md:text-4xl">Luyện</h2>
                <span className="rounded-[1rem] bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[1.9rem] font-black leading-none tracking-[-0.08em] text-white shadow-[0_18px_34px_-20px_rgba(249,115,22,0.42)] md:px-4 md:text-4xl">
                  thi
                </span>
              </div>
              <div className="inline-flex w-fit items-center rounded-full border border-orange-100/80 bg-white/90 px-3 py-1.5 text-[11px] font-black text-orange-600 shadow-[0_12px_24px_-20px_rgba(249,115,22,0.48)]">
                {filteredExams.length} đề phù hợp
              </div>
            </div>
            <p className="max-w-md text-sm font-semibold leading-relaxed text-[#7b6a58]">
              Chọn đúng đề và vào làm ngay, không mất thời gian lọc lại nhiều lần.
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-white/90 bg-white/84 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_22px_44px_-34px_rgba(148,163,184,0.28)] backdrop-blur-sm md:p-3">
            <div className="grid grid-cols-3 divide-x divide-[#ede3d7]">
              {overviewStats.map((stat) => (
                <div key={stat.label} className="min-w-0 px-2 py-2.5 text-center md:px-4 md:py-3">
                  <div className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">
                    {stat.label}
                  </div>
                  <div className={cn('mt-1.5 text-2xl font-black leading-none md:mt-2 md:text-[1.9rem]', stat.valueTone)}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3]/95 p-4 shadow-[0_20px_48px_-38px_rgba(148,163,184,0.18)] md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên đề, track hoặc nhóm kỹ năng..."
                  className="w-full rounded-2xl border border-[#e1d8cb] bg-[#f5efe6]/80 py-3 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-200 focus:bg-[#fffaf3] focus:ring-2 focus:ring-orange-100/70"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white transition-all md:hidden',
                  hasActiveFilters ? 'border-orange-200 bg-orange-50 text-orange-500 shadow-sm shadow-orange-100' : 'border-[#e1d8cb] text-gray-500'
                )}
                aria-label="Mở bộ lọc đề thi"
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
              >
                <SlidersHorizontal size={18} />
                {hasActiveFilters && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#fffaf3]" />}
              </button>
            </div>
            <div className="hidden items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-500 md:flex">
              <SlidersHorizontal size={16} />
              {filteredExams.length} đề phù hợp
            </div>
          </div>

          <div className="hidden flex-col gap-3 md:flex">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Loại đề</span>
              {providerOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setProviderFilter(option)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                    providerFilter === option
                      ? "border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200"
                      : "border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Kỹ năng</span>
              {skillOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSkillFilter(option)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                    skillFilter === option
                      ? "border-blue-200 bg-blue-500 text-white shadow-sm shadow-blue-200"
                      : "border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-500"
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end bg-gray-950/32 px-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] pt-12 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="exam-filter-title"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Bộ lọc đề thi</p>
                  <h3 id="exam-filter-title" className="mt-2 text-2xl font-black tracking-tight text-gray-900">Chọn đúng bộ đề muốn làm</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">Lọc theo nhà phát hành và kỹ năng để danh sách gọn hơn trên mobile.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm"
                  aria-label="Đóng bộ lọc đề thi"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Kết quả hiện tại</div>
                <div className="mt-2 text-lg font-black text-gray-900">{filteredExams.length} đề phù hợp</div>
                <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">{mobileFilterSummary === 'Tất cả' ? 'Chưa áp bộ lọc chi tiết.' : `Đang chọn: ${mobileFilterSummary}`}</p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Loại đề</div>
                  <div className="flex flex-wrap gap-2">
                    {providerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setProviderFilter(option)}
                        className={cn(
                          'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                          providerFilter === option
                            ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400">Kỹ năng</div>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSkillFilter(option)}
                        className={cn(
                          'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                          skillFilter === option
                            ? 'border-blue-200 bg-blue-500 text-white shadow-sm shadow-blue-200'
                            : 'border-gray-200 bg-white text-gray-500 hover:border-blue-200 hover:text-blue-500'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setProviderFilter('Tất cả');
                    setSkillFilter('Tất cả');
                  }}
                  className="flex-1 rounded-2xl border border-[#e1d8cb] bg-white px-4 py-3 text-sm font-black text-gray-600"
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)]"
                >
                  Xong
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {filteredExams.length > 0 ? filteredExams.map((exam) => (
          <motion.div
            key={exam.id}
            whileHover={{ y: -2 }}
            className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)] transition-all hover:border-[#dccfbe] hover:shadow-[0_24px_52px_-36px_rgba(180,138,91,0.14)] md:p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={cn(
                      "rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-white",
                      exam.type === 'Tokutei Mock' ? "bg-blue-600" : exam.type === 'JFT-Basic' ? "bg-emerald-600" : "bg-violet-600"
                    )}>
                      {exam.type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 size={12} />
                      Có đáp án
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-black tracking-tight text-gray-900">{exam.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} className="text-orange-400" />
                        165 phút
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={15} className="text-blue-400" />
                        Đúng format thi thật
                      </span>
                    </div>
                  </div>
                </div>

                <Link to={`/app/exams/${exam.id}/start`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform hover:scale-[1.02]">
                  Làm bài ngay <ChevronRight size={16} />
                </Link>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {exam.skills.map((skill) => {
                  const Icon = skillIcons[skill as keyof typeof skillIcons];
                  return (
                    <button
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/80 px-3 py-2 text-xs font-semibold text-gray-600 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Icon size={14} />
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )) : (
          <div className="rounded-[2rem] border border-dashed border-orange-200 bg-orange-50/60 px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
              <Search size={24} />
            </div>
            <h3 className="mt-4 text-lg font-black text-gray-800">Chưa thấy đề phù hợp</h3>
            <p className="mt-1 text-sm font-medium text-gray-500">Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm đề luyện.</p>
          </div>
        )}
      </div>
    </div>
  );
}
