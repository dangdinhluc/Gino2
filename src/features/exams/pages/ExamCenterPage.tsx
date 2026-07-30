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
    { label: 'Đề sẵn sàng', value: EXAMS.length },
    { label: 'Định dạng', value: examTypeCount },
    { label: 'Kỹ năng', value: skillCount },
  ] as const;

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)] lg:items-center lg:gap-8">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">Luyện thi</h2>
              <span className="inline-flex items-center rounded-full border border-[#e8dccb] bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                {filteredExams.length} đề phù hợp
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#5f6b7c]">
              Chọn đúng đề và vào làm ngay, không mất thời gian lọc lại nhiều lần.
            </p>
          </div>

          <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-1">
            <div className="grid grid-cols-3 divide-x divide-[#efe5d7]">
              {overviewStats.map((stat) => (
                <div key={stat.label} className="min-w-0 px-3 py-3 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">
                    {stat.label}
                  </div>
                  <div className="mt-1.5 font-[var(--font-heading)] text-2xl font-bold leading-none text-[#172033]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl flex-1 items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af]" size={18} strokeWidth={1.8} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm theo tên đề, loại hoặc nhóm kỹ năng..."
                  className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-3 pl-11 pr-4 text-sm text-[#172033] outline-none transition-colors placeholder:text-[#95a0af] focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors md:hidden',
                  hasActiveFilters ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]'
                )}
                aria-label="Mở bộ lọc đề thi"
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
              >
                <SlidersHorizontal size={18} strokeWidth={1.8} />
                {hasActiveFilters && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-700 ring-2 ring-[#fffaf3]" />}
              </button>
            </div>
            <div className="hidden items-center gap-2 rounded-xl border border-[#e8dccb] bg-orange-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-orange-700 md:flex">
              <SlidersHorizontal size={16} strokeWidth={1.8} />
              {filteredExams.length} đề phù hợp
            </div>
          </div>

          <div className="hidden flex-col gap-3 md:flex">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">Loại đề</span>
              {providerOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setProviderFilter(option)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                    providerFilter === option
                      ? 'border-orange-700 bg-orange-700 text-white'
                      : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
                  )}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">Kỹ năng</span>
              {skillOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setSkillFilter(option)}
                  className={cn(
                    'rounded-full border px-4 py-2 text-xs font-semibold transition-colors',
                    skillFilter === option
                      ? 'border-orange-700 bg-orange-700 text-white'
                      : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
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
              className="w-full rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">Bộ lọc đề thi</p>
                  <h3 id="exam-filter-title" className="mt-2 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Chọn đúng bộ đề muốn làm</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f6b7c]">Lọc theo loại đề và kỹ năng để danh sách gọn hơn trên mobile.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c]"
                  aria-label="Đóng bộ lọc đề thi"
                >
                  <X size={18} strokeWidth={1.8} />
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-[#e8dccb] bg-orange-50/60 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">Kết quả hiện tại</div>
                <div className="mt-1.5 font-[var(--font-heading)] text-lg font-bold text-[#172033]">{filteredExams.length} đề phù hợp</div>
                <p className="mt-1 text-sm text-[#5f6b7c]">{mobileFilterSummary === 'Tất cả' ? 'Chưa áp bộ lọc chi tiết.' : `Đang chọn: ${mobileFilterSummary}`}</p>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">Loại đề</div>
                  <div className="flex flex-wrap gap-2">
                    {providerOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setProviderFilter(option)}
                        className={cn(
                          'rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
                          providerFilter === option
                            ? 'border-orange-700 bg-orange-700 text-white'
                            : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#95a0af]">Kỹ năng</div>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setSkillFilter(option)}
                        className={cn(
                          'rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors',
                          skillFilter === option
                            ? 'border-orange-700 bg-orange-700 text-white'
                            : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
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
                  className="flex-1 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 py-3 text-sm font-semibold text-[#5f6b7c]"
                >
                  Xóa lọc
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex-1 rounded-xl bg-orange-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800"
                >
                  Xong
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {filteredExams.length > 0 ? filteredExams.map((exam) => (
          <div
            key={exam.id}
            className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 transition-colors hover:border-orange-300 md:p-6"
          >
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-[#e8dccb] bg-[#fffdf8] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f6b7c]">
                      {exam.type}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle2 size={12} strokeWidth={1.8} />
                      Có đáp án
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">{exam.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#7b8796]">
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={15} strokeWidth={1.8} className="text-[#95a0af]" />
                        165 phút
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Sparkles size={15} strokeWidth={1.8} className="text-[#95a0af]" />
                        Đúng format thi thật
                      </span>
                    </div>
                  </div>
                </div>

                <Link to={`/app/exams/${exam.id}/start`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-orange-800">
                  Làm bài ngay <ChevronRight size={16} strokeWidth={1.8} />
                </Link>
              </div>

              <div className="flex flex-wrap gap-2">
                {exam.skills.map((skill) => {
                  const Icon = skillIcons[skill as keyof typeof skillIcons];
                  return (
                    <button
                      key={skill}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#e8dccb] bg-[#fffdf8] px-3 py-2 text-xs font-medium text-[#5f6b7c] transition-colors hover:border-orange-300 hover:text-orange-700"
                    >
                      {Icon ? <Icon size={14} strokeWidth={1.8} /> : null}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-[#e8dccb] bg-[#fffdf8] px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Search size={24} strokeWidth={1.8} />
            </div>
            <h3 className="mt-4 font-[var(--font-heading)] text-lg font-bold text-[#172033]">Chưa thấy đề phù hợp</h3>
            <p className="mt-1 text-sm text-[#5f6b7c]">Thử đổi từ khóa hoặc bỏ bớt bộ lọc để xem thêm đề luyện.</p>
          </div>
        )}
      </div>
    </div>
  );
}
