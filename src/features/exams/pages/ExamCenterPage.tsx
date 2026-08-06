import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { EXAMS } from '@/src/features/exams/mock/exams';
import { Award, BriefcaseBusiness, ChevronRight, Clock3, FileText, GraduationCap, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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
  const activeFilterSummary = [providerFilter !== 'Tất cả' ? providerFilter : null, skillFilter !== 'Tất cả' ? skillFilter : null].filter(Boolean).join(' · ') || 'Tất cả';

  return (
    <div className="exam-center-page space-y-5">
      <section className="exam-center-hero">
        <div className="exam-center-hero-copy">
          <div className="exam-center-eyebrow"><Sparkles size={15} /> Phòng thi Tokutei <span>✦</span></div>
          <h1>Chọn đề để bắt đầu</h1>
          <p>Chọn một đề phù hợp rồi vào thi ngay. Mỗi đề giúp anh kiểm tra phản xạ trước giờ làm.</p>
          <div className="exam-center-hero-pills">
            <span><FileText size={15} /> {filteredExams.length} đề phù hợp</span>
            <span><Clock3 size={15} /> 165 phút mỗi đề</span>
            <span><Award size={15} /> Sẵn sàng thử sức</span>
          </div>
        </div>
        <div className="exam-center-hero-emblem" aria-hidden="true">
          <GraduationCap size={34} strokeWidth={1.6} />
          <span>Vào thi<br />ngay</span>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-3 md:p-4">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af]" size={18} strokeWidth={1.8} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm tên đề..."
              className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 pl-11 pr-4 text-sm text-[#172033] outline-none transition-colors placeholder:text-[#95a0af] focus-visible:border-orange-400 focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className={cn(
              'relative inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border px-3 text-sm font-bold transition-colors',
              hasActiveFilters ? 'border-orange-200 bg-orange-50 text-orange-700' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:border-orange-300 hover:text-orange-700'
            )}
            aria-label="Mở bộ lọc đề thi"
            aria-haspopup="dialog"
            aria-expanded={isFilterSheetOpen}
          >
            <SlidersHorizontal size={18} strokeWidth={1.8} />
            <span>Bộ lọc</span>
            {hasActiveFilters && <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-700 px-1.5 text-[10px] text-white">{[providerFilter, skillFilter].filter((value) => value !== 'Tất cả').length}</span>}
          </button>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-[#7b8796]">
          <span>{filteredExams.length} đề phù hợp</span>
          {hasActiveFilters && <span className="font-semibold text-orange-700">{activeFilterSummary}</span>}
          {hasActiveFilters && (
            <button type="button" onClick={() => { setProviderFilter('Tất cả'); setSkillFilter('Tất cả'); }} className="font-bold text-[#5f6b7c] underline-offset-2 hover:text-orange-700 hover:underline">
              Xóa lọc
            </button>
          )}
        </div>
      </section>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-gray-950/32 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="exam-filter-title"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="max-h-[min(40rem,calc(100vh-2rem))] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 shadow-2xl shadow-[#34221f]/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-700">Bộ lọc đề thi</p>
                  <h3 id="exam-filter-title" className="mt-2 font-[var(--font-heading)] text-xl font-bold tracking-[-0.02em] text-[#172033]">Lọc danh sách đề</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5f6b7c]">Chọn loại đề hoặc kỹ năng. Danh sách sẽ cập nhật ngay.</p>
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
                <p className="mt-1 text-sm text-[#5f6b7c]">{activeFilterSummary === 'Tất cả' ? 'Đang hiển thị tất cả đề.' : `Đang chọn: ${activeFilterSummary}`}</p>
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

      <div className="exam-list space-y-3">
        {filteredExams.length > 0 ? filteredExams.map((exam) => (
          <motion.div
            key={exam.id}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className="exam-card"
          >
            <div className="exam-card-icon" aria-hidden="true">
              {exam.type === 'Interview' ? <BriefcaseBusiness size={22} /> : exam.type === 'JFT-Basic' ? <GraduationCap size={22} /> : <FileText size={22} />}
            </div>
            <div className="exam-card-body">
              <div className="flex flex-wrap items-center gap-2">
                <span className="exam-card-type">{exam.type}</span>
                <span className="exam-card-status"><span /> Sẵn sàng</span>
              </div>
              <h3>{exam.title}</h3>
              <div className="exam-card-meta">
                <span><Clock3 size={15} /> 165 phút</span>
                <span><Award size={15} /> {exam.skills.length} kỹ năng</span>
              </div>
              <div className="exam-card-skills">
                {exam.skills.slice(0, 3).map((skill) => <span key={skill}>{skill}</span>)}
              </div>
            </div>
            <div className="exam-card-cta">
              <span>Chinh phục đề này</span>
              <Link to={`/app/exams/${exam.id}/start`}>
                Làm bài ngay <ChevronRight size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </motion.div>
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
