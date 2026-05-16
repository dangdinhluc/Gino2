import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, RotateCcw, Sparkles, Trophy, Volume2 } from 'lucide-react';
import { flashcards } from '@/src/data/phaseOneMock';
import { cn } from '@/src/lib/utils';

type RatingLabel = 'Quên' | 'Khó' | 'Nhớ' | 'Rất nhớ';

const ratingOptions: { label: RatingLabel; className: string }[] = [
  { label: 'Quên', className: 'border-red-200 bg-red-50 text-red-600' },
  { label: 'Khó', className: 'border-amber-200 bg-amber-50 text-amber-600' },
  { label: 'Nhớ', className: 'border-blue-200 bg-blue-50 text-blue-600' },
  { label: 'Rất nhớ', className: 'border-emerald-200 bg-emerald-50 text-emerald-600' },
];

export default function FlashcardSession() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [ratings, setRatings] = useState<RatingLabel[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const hintPopoverRef = useRef<HTMLDivElement>(null);

  const card = flashcards[activeIndex];
  const progress = Math.round(((activeIndex + 1) / flashcards.length) * 100);
  const rememberedCount = ratings.filter((rating) => rating === 'Nhớ' || rating === 'Rất nhớ').length;

  const handleRate = (rating: RatingLabel) => {
    const nextRatings = [...ratings, rating];
    setRatings(nextRatings);
    setIsHintOpen(false);

    if (activeIndex === flashcards.length - 1) {
      setIsComplete(true);
      return;
    }

    setActiveIndex((currentIndex) => currentIndex + 1);
    setIsRevealed(false);
  };

  const handleRestart = () => {
    setActiveIndex(0);
    setIsRevealed(false);
    setRatings([]);
    setIsComplete(false);
    setIsHintOpen(false);
  };

  useEffect(() => {
    if (!isHintOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      if (hintPopoverRef.current?.contains(target)) {
        return;
      }

      setIsHintOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsHintOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHintOpen]);

  if (isComplete) {
    return (
      <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl items-center justify-center pb-16">
        <motion.section
          initial={{ opacity: 0, scale: 0.96, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,#fffaf3_0%,#fff3df_100%)] p-7 text-center shadow-[0_32px_80px_-48px_rgba(180,138,91,0.34)] md:p-10"
        >
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-100">
            <Trophy size={44} />
          </div>
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-500">Review Complete</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">Xong phiên thẻ nhớ</h1>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Nhớ tốt</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{rememberedCount}</div>
            </div>
            <div className="rounded-[1.5rem] border border-amber-100 bg-amber-50/70 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-500">Cần ôn lại</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{flashcards.length - rememberedCount}</div>
            </div>
            <div className="rounded-[1.5rem] border border-orange-100 bg-white/80 px-4 py-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">XP mock</div>
              <div className="mt-2 text-2xl font-black text-orange-600">+20</div>
            </div>
          </div>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <button onClick={handleRestart} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-3 text-sm font-black text-orange-600 transition-all hover:bg-orange-50">
              <RotateCcw size={16} /> Ôn lại
            </button>
            <Link to="/app/review" className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200">
              Về Review Center
            </Link>
          </div>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <section className="sticky top-0 z-40 -mx-4 border-b border-[#e6ddd1] bg-[#f8f4ee]/92 px-4 py-3 backdrop-blur-md md:static md:mx-0 md:rounded-[2rem] md:border md:bg-[#fffaf3]/92 md:p-4 md:shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
        <div className="flex items-center justify-between gap-4">
          <Link to="/app/review" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#e1d8cb] bg-[#fffaf3] text-gray-700">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Flashcard SRS</p>
            <h1 className="truncate text-base font-black text-gray-900 md:text-xl">Thẻ nhớ tới hạn</h1>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-black text-blue-600">
            {activeIndex + 1}/{flashcards.length}
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#efe5d7]">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400" animate={{ width: `${progress}%` }} />
        </div>
      </section>

      <section className="mx-auto max-w-3xl">
        <div className="rounded-[2.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 text-center shadow-[0_28px_60px_-42px_rgba(148,163,184,0.22)] md:p-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
              <Volume2 size={26} />
            </div>

            <div ref={hintPopoverRef} className="relative">
              <button
                type="button"
                onClick={() => setIsHintOpen((currentValue) => !currentValue)}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-orange-600 shadow-sm transition-colors hover:bg-orange-50"
                aria-label={isHintOpen ? 'Ẩn gợi ý SRS' : 'Mở gợi ý SRS'}
                aria-expanded={isHintOpen}
                aria-controls="flashcard-srs-hint"
              >
                <Sparkles size={16} />
                Gợi ý
              </button>

              <AnimatePresence>
                {isHintOpen && (
                  <motion.div
                    id="flashcard-srs-hint"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-72 max-w-[calc(100vw-4rem)] rounded-[1.5rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 text-left shadow-[0_24px_50px_-30px_rgba(148,163,184,0.28)]"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Gợi ý SRS</p>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-gray-600">Chỉ tự chấm sau khi anh đã thử nhớ nghĩa trước. Không cần đúng tuyệt đối, ưu tiên nhịp ôn đều.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{card.level} · due {card.dueDate}</p>
          <h2 className="mt-3 text-5xl font-black tracking-tight text-gray-900 md:text-7xl">{card.front}</h2>

          <AnimatePresence mode="wait">
            {isRevealed ? (
              <motion.div
                key="back"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="mx-auto mt-8 max-w-xl rounded-[2rem] border border-emerald-100 bg-emerald-50/70 p-5"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-500">Nghĩa</p>
                <div className="mt-2 text-3xl font-black text-gray-900">{card.back}</div>
                <p className="mt-3 text-sm font-medium leading-relaxed text-gray-600">{card.example}</p>
              </motion.div>
            ) : (
              <motion.div key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
                <button onClick={() => setIsRevealed(true)} className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-4 text-sm font-black text-white shadow-lg shadow-orange-200">
                  Lật thẻ
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {isRevealed && (
            <div className="mt-8 grid gap-3 sm:grid-cols-4">
              {ratingOptions.map((option) => (
                <button key={option.label} onClick={() => handleRate(option.label)} className={cn('rounded-2xl border px-4 py-3 text-sm font-black transition-transform hover:scale-[1.02]', option.className)}>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
