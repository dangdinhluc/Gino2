import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookMarked,
  Brain,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  Mic,
  Search,
  SlidersHorizontal,
  Volume2,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const focusFilters = ['Tất cả', 'Tới hạn', 'Dễ quên', 'AI sửa', 'Nghe nói'] as const;
type FocusFilter = (typeof focusFilters)[number];

type ReviewCard = {
  title: string;
  sub: string;
  icon: LucideIcon;
  tone: 'orange' | 'blue' | 'violet' | 'amber' | 'sky' | 'emerald';
  filter: Exclude<FocusFilter, 'Tất cả'>;
  level: string;
  due: string;
  status: string;
  path: string;
};

const reviewCards: ReviewCard[] = [
  {
    title: 'Thẻ nhớ đầu ca',
    sub: 'Một lượt ôn nhanh để giữ nhịp cụm từ và phản xạ Tokutei.',
    icon: Volume2,
    tone: 'orange',
    filter: 'Tới hạn',
    level: 'JFT Basic',
    due: '12 phút',
    status: 'Ôn ngay',
    path: '/app/review/flashcards',
  },
  {
    title: 'Mục dễ quên trong thư viện',
    sub: 'Checklist hồ sơ và tác phong cần lặp lại trước khi quên.',
    icon: BookMarked,
    tone: 'blue',
    filter: 'Dễ quên',
    level: 'Tokutei Core',
    due: 'Hôm nay',
    status: '3 mục',
    path: '/app/grammar',
  },
  {
    title: 'Câu trả lời cần AI sửa tiếp',
    sub: 'Mở lại phần writing để chốt các lỗi đang lặp trong câu trả lời phỏng vấn.',
    icon: FileText,
    tone: 'amber',
    filter: 'AI sửa',
    level: 'Interview',
    due: '18 phút',
    status: '1 draft',
    path: '/app/ai-lab',
  },
  {
    title: 'Speaking mock room',
    sub: 'Nghe lại câu mẫu rồi nói theo một lượt ngắn cho HR mock.',
    icon: Mic,
    tone: 'emerald',
    filter: 'Nghe nói',
    level: 'Tokutei',
    due: '25 phút',
    status: 'AI feedback',
    path: '/app/ai-speak',
  },
  {
    title: 'Mock test đang dở',
    sub: 'Quay lại một phần ngắn để giữ phản xạ làm đề Tokutei.',
    icon: GraduationCap,
    tone: 'sky',
    filter: 'Tới hạn',
    level: 'Tokutei Mock',
    due: 'Tối nay',
    status: '2 phần',
    path: '/app/exams',
  },
  {
    title: 'Module nên xem lại',
    sub: 'Một module đang giảm nhịp, nên xem lại trước khi sang bài mới.',
    icon: Brain,
    tone: 'violet',
    filter: 'Dễ quên',
    level: 'Workplace',
    due: 'Ngày mai',
    status: 'Khóa học',
    path: '/app/courses',
  },
];

const toneStyles = {
  orange: {
    icon: 'border-orange-100 bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600',
    chip: 'border-orange-200 bg-orange-50 text-orange-600',
  },
  blue: {
    icon: 'border-blue-100 bg-gradient-to-br from-blue-100 to-cyan-50 text-blue-600',
    chip: 'border-blue-200 bg-blue-50 text-blue-600',
  },
  violet: {
    icon: 'border-violet-100 bg-gradient-to-br from-violet-100 to-fuchsia-50 text-violet-600',
    chip: 'border-violet-200 bg-violet-50 text-violet-600',
  },
  amber: {
    icon: 'border-amber-100 bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-600',
    chip: 'border-amber-200 bg-amber-50 text-amber-600',
  },
  sky: {
    icon: 'border-sky-100 bg-gradient-to-br from-sky-100 to-cyan-50 text-sky-600',
    chip: 'border-sky-200 bg-sky-50 text-sky-600',
  },
  emerald: {
    icon: 'border-emerald-100 bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600',
    chip: 'border-emerald-200 bg-emerald-50 text-emerald-600',
  },
} as const;

export default function ReviewCenter() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FocusFilter>('Tất cả');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reviewCards.filter((card) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        card.title.toLowerCase().includes(normalizedQuery) ||
        card.sub.toLowerCase().includes(normalizedQuery) ||
        card.level.toLowerCase().includes(normalizedQuery);
      const matchesFilter = activeFilter === 'Tất cả' || card.filter === activeFilter;

      return matchesQuery && matchesFilter;
    });
  }, [activeFilter, query]);

  const hasActiveFocusFilter = activeFilter !== 'Tất cả';
  const dueCount = reviewCards.filter((card) => card.filter === 'Tới hạn').length;
  const easyForgetCount = reviewCards.filter((card) => card.filter === 'Dễ quên').length;

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(24rem,27rem)] lg:items-center lg:gap-8">
          <div className="flex min-h-[5.75rem] items-center">
            <div className="flex flex-wrap items-end gap-2">
              <h2 className="text-[2rem] font-black tracking-[-0.08em] text-[#172033] md:text-4xl">Ôn</h2>
              <span className="rounded-[1rem] bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[1.9rem] font-black leading-none tracking-[-0.08em] text-white shadow-[0_18px_34px_-20px_rgba(249,115,22,0.42)] md:px-4 md:text-4xl">
                tập
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="flex min-h-[5.75rem] min-w-0 flex-col justify-center rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Tới hạn</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{dueCount}</div>
            </div>
            <div className="flex min-h-[5.75rem] min-w-0 flex-col justify-center rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Dễ quên</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{easyForgetCount}</div>
            </div>
            <div className="flex min-h-[5.75rem] min-w-0 flex-col justify-center rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Nhịp hôm nay</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{filteredCards.length}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.14fr_0.86fr]">
        <motion.div
          whileHover={{ y: -2 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff5e8_58%,#f6ecdf_100%)] p-6 text-gray-900 shadow-[0_26px_58px_-44px_rgba(180,138,91,0.24)]"
        >
          <div className="absolute -right-10 top-0 h-36 w-36 rounded-full bg-orange-100/55 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-28 rounded-full bg-amber-100/45 blur-2xl" />
          <div className="relative z-10 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500 shadow-sm">
              <CheckCircle2 size={12} />
              Hàng chờ ưu tiên
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">3 chạm để giữ nhịp ôn tập</h3>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-500">Bắt đầu từ thẻ nhớ, chuyển sang mục dễ quên, rồi chốt bằng AI writing để phiên ôn ngắn nhưng đúng việc.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-[#e6ddd1] bg-white/70 px-4 py-4 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Bước 1</div>
                <div className="mt-2 text-base font-black">Thẻ nhớ</div>
                <div className="text-xs font-medium text-gray-500">12 phút tới hạn</div>
              </div>
              <div className="rounded-[1.5rem] border border-[#e6ddd1] bg-white/70 px-4 py-4 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Bước 2</div>
                <div className="mt-2 text-base font-black">Mục dễ quên</div>
                <div className="text-xs font-medium text-gray-500">3 mục dễ quên</div>
              </div>
              <div className="rounded-[1.5rem] border border-[#e6ddd1] bg-white/70 px-4 py-4 backdrop-blur-sm">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Bước 3</div>
                <div className="mt-2 text-base font-black">AI sửa</div>
                <div className="text-xs font-medium text-gray-500">1 bài viết đang chờ</div>
              </div>
            </div>

            <Link
              to="/app/review/flashcards"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)] transition-transform hover:scale-[1.02]"
            >
              Vào phiên thẻ nhớ
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-500">
              <Clock3 size={14} />
              Nhắc nhanh
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-gray-600">Ưu tiên mục sắp tới hạn trước khi vào game để không vỡ nhịp ôn.</div>
              <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-gray-600">Giữ phiên 8-12 phút là vừa đẹp để quay lại nhiều lần trong ngày.</div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-5 shadow-[0_20px_48px_-36px_rgba(180,138,91,0.18)]">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">
              <Brain size={14} />
              Trạng thái mock
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">AI sửa</div>
                <div className="mt-1 text-xl font-black text-gray-900">2</div>
              </div>
              <div className="rounded-2xl border border-[#e6ddd1] bg-[#fffaf3]/92 px-4 py-3 shadow-[0_14px_30px_-26px_rgba(148,163,184,0.14)]">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Nghe nói</div>
                <div className="mt-1 text-xl font-black text-gray-900">1</div>
              </div>
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
                  placeholder="Tìm nội dung cần ôn theo level hoặc trạng thái..."
                  className="w-full rounded-2xl border border-[#e1d8cb] bg-[#f5efe6]/80 py-3 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-200 focus:bg-[#fffaf3] focus:ring-2 focus:ring-orange-100/70"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white transition-all md:hidden',
                  hasActiveFocusFilter ? 'border-orange-200 bg-orange-50 text-orange-500 shadow-sm shadow-orange-100' : 'border-[#e1d8cb] text-gray-500'
                )}
                aria-label="Mở bộ lọc ôn tập"
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
              >
                <SlidersHorizontal size={18} />
                {hasActiveFocusFilter && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#fffaf3]" />}
              </button>
            </div>

            <div className="hidden items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-orange-500 md:flex">
              <Clock3 size={16} />
              {filteredCards.length} mục cần ôn
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 md:flex">
            {focusFilters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold transition-all',
                  activeFilter === filter
                    ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isFilterSheetOpen && (
          <motion.div
            className="fixed inset-0 z-[90] flex items-end bg-gray-950/28 px-3 pb-[calc(5.8rem+env(safe-area-inset-bottom))] pt-12 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsFilterSheetOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="review-filter-title"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Bộ lọc ôn tập</p>
                  <h3 id="review-filter-title" className="mt-2 text-2xl font-black tracking-tight text-gray-900">Chọn nhóm mục cần xem</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">Giữ danh sách gọn hơn trên mobile để anh vào đúng phần cần ôn nhanh hơn.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm"
                  aria-label="Đóng bộ lọc ôn tập"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Kết quả hiện tại</div>
                <div className="mt-2 text-lg font-black text-gray-900">{filteredCards.length} mục cần ôn</div>
                <p className="mt-1 text-sm font-semibold text-[#5f6b7c]">{hasActiveFocusFilter ? `Đang chọn: ${activeFilter}` : 'Chưa áp bộ lọc chi tiết.'}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {focusFilters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => {
                      setActiveFilter(filter);
                      setIsFilterSheetOpen(false);
                    }}
                    className={cn(
                      'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                      activeFilter === filter
                        ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilter('Tất cả');
                    setIsFilterSheetOpen(false);
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
                  Đóng
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredCards.map((card, index) => {
          const tone = toneStyles[card.tone];
          return (
            <Link key={card.title} to={card.path} className="block h-full">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{ y: -4 }}
                className="group relative h-full overflow-hidden rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_52px_-40px_rgba(148,163,184,0.16)] ring-1 ring-[#f6efe3] transition-all hover:border-[#dccfbe] hover:shadow-[0_26px_56px_-38px_rgba(180,138,91,0.14)]"
              >
                <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent transition-opacity group-hover:via-orange-200" />
                <div className="flex h-full flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm', tone.icon)}>
                      <card.icon size={22} />
                    </div>
                    <div className={cn('rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]', tone.chip)}>
                      {card.filter}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black tracking-tight text-gray-900">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{card.sub}</p>
                  </div>

                  <div className="mt-auto space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">{card.level}</span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-blue-500">{card.due}</span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">{card.status}</span>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-black text-orange-500">
                      Ôn ngay
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
