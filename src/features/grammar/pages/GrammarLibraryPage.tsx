import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GRAMMAR } from '@/src/features/grammar/mock/grammar';
import { ArrowLeft, ArrowRight, BookOpen, Search, Bookmark, ChevronRight, LayoutGrid, Rows3, SquareStack, SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

type ViewMode = 'grid' | 'list' | 'flash';

export default function GrammarLibrary() {
  const levels = ['Tất cả', ...Array.from(new Set(GRAMMAR.map((item) => item.level)))];
  const [activeLevel, setActiveLevel] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [flashIndex, setFlashIndex] = useState(0);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return GRAMMAR.filter((item) => {
      const matchesLevel = activeLevel === 'Tất cả' || item.level === activeLevel;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.level.toLowerCase().includes(normalizedQuery);

      return matchesLevel && matchesQuery;
    });
  }, [activeLevel, query]);

  const safeFlashIndex = filteredItems.length > 0 ? Math.min(flashIndex, filteredItems.length - 1) : 0;
  const flashItem = filteredItems[safeFlashIndex];

  const handleViewModeChange = (nextViewMode: ViewMode) => {
    setViewMode(nextViewMode);
    if (nextViewMode === 'flash') {
      setFlashIndex(0);
    }
  };

  const goToPreviousCard = () => {
    setFlashIndex((currentIndex) => (filteredItems.length === 0 ? 0 : (currentIndex - 1 + filteredItems.length) % filteredItems.length));
  };

  const goToNextCard = () => {
    setFlashIndex((currentIndex) => (filteredItems.length === 0 ? 0 : (currentIndex + 1) % filteredItems.length));
  };

  const hasActiveLevelFilter = activeLevel !== 'Tất cả';

  return (
    <div className="space-y-6 pb-16">
      <section className="overflow-hidden rounded-[2rem] border border-[#e7ddcf] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(247,243,236,0.98)_100%)] p-4 shadow-[0_30px_70px_-48px_rgba(180,138,91,0.22)] md:rounded-[2.5rem] md:p-7">
        <div className="flex flex-col gap-4 md:gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-end gap-2">
              <h2 className="text-[2rem] font-black tracking-[-0.08em] text-[#172033] md:text-4xl">Từ vựng</h2>
              <span className="rounded-[1rem] bg-gradient-to-r from-orange-500 to-amber-400 px-3 py-1 text-[1.25rem] font-black leading-none tracking-[-0.05em] text-white shadow-[0_18px_34px_-20px_rgba(249,115,22,0.42)] md:px-4 md:text-[1.75rem]">
                của tôi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="min-w-0 rounded-[1.15rem] border border-[#e6ddd1] bg-[#fffaf3]/92 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.24)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-gray-400 md:text-[10px] md:tracking-[0.18em]">Mục đang lưu</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{filteredItems.length}</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-blue-100/70 bg-blue-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-blue-400 md:text-[10px] md:tracking-[0.18em]">Track</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">{activeLevel}</div>
            </div>
            <div className="min-w-0 rounded-[1.15rem] border border-emerald-100/70 bg-emerald-50/45 px-3 py-2.5 shadow-[0_16px_32px_-26px_rgba(148,163,184,0.2)] md:rounded-[1.5rem] md:px-4 md:py-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-400 md:text-[10px] md:tracking-[0.18em]">Trạng thái</div>
              <div className="mt-1.5 text-lg font-black leading-none text-gray-900 md:mt-2 md:text-2xl">Theo dõi</div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-xl items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm chủ điểm, track hoặc loại ghi chú..."
                  className="w-full rounded-2xl border border-[#e1d8cb] bg-[#f5efe6]/80 py-3 pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-orange-200 focus:bg-[#fffaf3] focus:ring-2 focus:ring-orange-100/70"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className={cn(
                  'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border bg-white transition-all md:hidden',
                  hasActiveLevelFilter ? 'border-orange-200 bg-orange-50 text-orange-500 shadow-sm shadow-orange-100' : 'border-[#e1d8cb] text-gray-500'
                )}
                aria-label="Mở bộ lọc cấp độ"
                aria-haspopup="dialog"
                aria-expanded={isFilterSheetOpen}
              >
                <SlidersHorizontal size={18} />
                {hasActiveLevelFilter && <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-[#fffaf3]" />}
              </button>
            </div>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50/80 p-1.5 shadow-sm">
              <button
                onClick={() => handleViewModeChange('list')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  viewMode === 'list' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-orange-500'
                )}
              >
                <Rows3 size={15} />
                List
              </button>
              <button
                onClick={() => handleViewModeChange('grid')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  viewMode === 'grid' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-orange-500'
                )}
              >
                <LayoutGrid size={15} />
                Grid
              </button>
              <button
                onClick={() => handleViewModeChange('flash')}
                className={cn(
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition-all',
                  viewMode === 'flash' ? 'bg-white text-orange-500 shadow-sm' : 'text-gray-500 hover:text-orange-500'
                )}
              >
                <SquareStack size={15} />
                Flashcard
              </button>
            </div>
          </div>

          <div className="hidden flex-wrap gap-2 md:flex">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveLevel(level)}
                className={cn(
                  'rounded-full border px-4 py-2 text-xs font-bold transition-all',
                  activeLevel === level
                    ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                )}
              >
                {level === 'Tất cả' ? level : `Cấp độ ${level}`}
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
              aria-labelledby="grammar-filter-title"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_30px_80px_-36px_rgba(17,24,39,0.42)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-700">Bộ lọc thư viện</p>
                  <h3 id="grammar-filter-title" className="mt-2 text-2xl font-black tracking-tight text-gray-900">Chọn cấp độ muốn xem</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-[#5f6b7c]">Lọc nhanh danh sách từ vựng đã lưu theo level.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterSheetOpen(false)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm"
                  aria-label="Đóng bộ lọc thư viện"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-orange-50/70 p-4">
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Đang lọc</div>
                <div className="mt-2 text-lg font-black text-gray-900">{activeLevel === 'Tất cả' ? 'Tất cả cấp độ' : `Cấp độ ${activeLevel}`}</div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {levels.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      setActiveLevel(level);
                      setIsFilterSheetOpen(false);
                    }}
                    className={cn(
                      'rounded-full border px-4 py-2.5 text-sm font-bold transition-all',
                      activeLevel === level
                        ? 'border-orange-200 bg-orange-500 text-white shadow-sm shadow-orange-200'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-500'
                    )}
                  >
                    {level === 'Tất cả' ? level : `Cấp độ ${level}`}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveLevel('Tất cả');
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

      {viewMode === 'flash' ? (
        <section className="rounded-[2.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_28px_60px_-42px_rgba(148,163,184,0.2)] md:p-7">
          {flashItem ? (
            <div className="mx-auto max-w-4xl">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Flashcard view</p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-900">Di chuyển giữa các mục đã lưu</h3>
                </div>
                <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-black text-orange-600">
                  {safeFlashIndex + 1}/{filteredItems.length}
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[2.5rem] border border-orange-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_58%,#f7efe4_100%)] p-8 text-center shadow-[0_26px_56px_-44px_rgba(180,138,91,0.22)] md:p-10">
                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-orange-100/60 blur-3xl" />
                <div className="absolute -bottom-20 -left-12 h-52 w-52 rounded-full bg-amber-100/45 blur-3xl" />
                <div className="relative z-10">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] border border-orange-200 bg-white text-orange-500 shadow-sm">
                    <BookOpen size={30} />
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.22em] text-orange-500">{flashItem.category} · {flashItem.level}</p>
                  <h2 className="mx-auto mt-3 max-w-2xl text-4xl font-black tracking-tight text-gray-900 md:text-6xl">{flashItem.title}</h2>
                  <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-relaxed text-gray-500">
                    Ghi chú cá nhân đang lưu. Anh dùng nút trái/phải để lướt nhanh từng mục như flashcard trước khi mở lại chi tiết.
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  onClick={goToPreviousCard}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700 transition-all hover:border-orange-200 hover:text-orange-500"
                >
                  <ArrowLeft size={16} />
                  Mục trước
                </button>
                <Link to={`/app/grammar/${flashItem.id}`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)]">
                  Mở lại
                  <ChevronRight size={16} />
                </Link>
                <button
                  onClick={goToNextCard}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e6ddd1] bg-white px-5 py-3 text-sm font-black text-gray-700 transition-all hover:border-orange-200 hover:text-orange-500"
                >
                  Mục sau
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-sm font-bold text-gray-400">Chưa có mục phù hợp với bộ lọc hiện tại.</div>
          )}
        </section>
      ) : viewMode === 'grid' ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/app/grammar/${item.id}`}
              className="group flex cursor-pointer flex-col justify-between rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_48px_-36px_rgba(148,163,184,0.2)] transition-all hover:border-orange-200 hover:shadow-lg"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                    <BookOpen size={22} />
                  </div>
                  <span className="rounded-xl border border-gray-200 bg-white p-2 text-gray-400 transition-colors group-hover:text-orange-500">
                    <Bookmark size={16} />
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-black tracking-tight text-gray-900">{item.title}</h4>
                  <p className="text-sm font-medium text-gray-500">Ghi chú đang lưu trong thư viện cá nhân để anh quay lại ôn bất cứ lúc nào.</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold text-blue-500">{item.category}</span>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-bold text-orange-500">{item.level}</span>
                </div>
                <ChevronRight size={18} className="text-orange-300 transition-colors group-hover:text-orange-500" />
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <section className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-sm shadow-orange-50">
          {filteredItems.map((item) => (
            <Link
              key={item.id}
              to={`/app/grammar/${item.id}`}
              className="group flex items-center gap-3 border-b border-gray-100 px-4 py-4 transition-colors last:border-0 hover:bg-orange-50/30 md:px-5 md:py-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1.15rem] border border-orange-200 bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white">
                <BookOpen size={20} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-[1.05rem] font-black tracking-tight text-gray-900">{item.title}</h4>
                    <p className="mt-1 hidden text-sm font-medium text-gray-500 md:block">
                      Ghi chú cá nhân để anh mở lại nhanh khi cần ôn.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-500">{item.category}</span>
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-bold text-orange-500">{item.level}</span>
                    </div>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] text-orange-300 transition-all group-hover:bg-orange-500 group-hover:text-white">
                    <ChevronRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}
    </div>
  );
}
