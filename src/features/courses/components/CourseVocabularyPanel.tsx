import { type KeyboardEvent, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Lightbulb, RotateCcw, Shuffle, Volume2, X } from 'lucide-react';
import {
  emptyStateClass,
  focusRing,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { type CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import { submitVocabularyRating, type VocabularyRating } from '@/src/features/courses/repositories/learningProgressRepository';
import { Confetti } from '@/src/shared/components/Confetti';
import { cn, vibrate } from '@/src/lib/utils';

type VocabularyView = 'list' | 'flashcard';

export function getVocabularyDisplayName(item: CourseVocabularyItem) {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

function getVocabularyJapanese(item: CourseVocabularyItem) {
  return item.kanji ?? item.kana ?? getVocabularyDisplayName(item);
}

export function VocabularyHeadword({
  item,
  showFurigana,
  rtClassName,
  className,
  align = 'center',
}: {
  item: CourseVocabularyItem;
  showFurigana: boolean;
  rtClassName?: string;
  className?: string;
  align?: 'left' | 'center' | 'right';
}) {
  const kanjiText = item.kanji;
  const furiganaText = (item as any).furigana ?? item.kana;

  const alignClass = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

  if (showFurigana && kanjiText && furiganaText) {
    return (
      <span className={cn('inline-flex flex-col leading-tight', alignClass, className)}>
        <span className={cn('text-[0.6em] font-extrabold text-[#c2410c] leading-none mb-1 select-none', rtClassName)}>
          {furiganaText}
        </span>
        <span className="font-black text-[#0f172a] leading-none">
          {kanjiText}
        </span>
      </span>
    );
  }

  return (
    <span className={cn('font-black text-[#0f172a]', className)}>
      {getVocabularyJapanese(item)}
    </span>
  );
}

interface VocabularyPanelProps {
  expandedVocabularyId: string | null;
  filteredVocabulary: CourseVocabularyItem[];
  categoryOptions: VocabularyCategoryOption[];
  selectedCategory: string;
  heardVocabularyId: string | null;
  searchQuery: string;
  showFurigana: boolean;
  showRomaji: boolean;
  onAudio: (vocabularyId: string) => void;
  onCategoryChange: (categoryId: string) => void;
  onSearchChange: (query: string) => void;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleVocabulary: (vocabularyId: string) => void;
}

import { VocabularyOverviewCard } from '@/src/features/vocabulary/components/VocabularyOverviewCard';
import { VocabularyModeSegment } from '@/src/features/vocabulary/components/VocabularyModeSegment';
import { VocabularyCategoryBar } from '@/src/features/vocabulary/components/VocabularyCategoryBar';
import { VocabularyDisplayToggle } from '@/src/features/vocabulary/components/VocabularyDisplayToggle';
import { VocabularySearchBar } from '@/src/features/vocabulary/components/VocabularySearchBar';
import { VocabularyListItemRow } from '@/src/features/vocabulary/components/VocabularyListItemRow';
import { VocabularyEmptyState } from '@/src/features/vocabulary/components/VocabularyEmptyState';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';

export interface VocabularyCategoryOption {
  id: string;
  label: string;
  count: number;
}

export function VocabularyPanel({
  expandedVocabularyId,
  filteredVocabulary,
  categoryOptions,
  selectedCategory,
  heardVocabularyId,
  searchQuery,
  showFurigana,
  showRomaji,
  onAudio,
  onCategoryChange,
  onSearchChange,
  onToggleFurigana,
  onToggleRomaji,
  onToggleVocabulary,
}: VocabularyPanelProps) {
  const [view, setView] = useState<VocabularyView>('list');
  const [isShuffle, setIsShuffle] = useState(false);

  const selectedVocabulary = useMemo(
    () => filteredVocabulary.find((item) => item.id === expandedVocabularyId) ?? null,
    [filteredVocabulary, expandedVocabularyId]
  );

  const stats = useMemo(() => {
    const totalCount = filteredVocabulary.length;
    const learnedCount = filteredVocabulary.filter((item) => item.status !== 'new').length;
    const categoryCount = new Set(filteredVocabulary.map((item) => item.module)).size;
    return {
      learnedCount,
      categoryCount,
      progressPercent: totalCount > 0 ? Math.round((learnedCount / totalCount) * 100) : 0,
    };
  }, [filteredVocabulary]);

  return (
    <div className="mx-auto w-full max-w-xl space-y-2.5 pb-28 sm:pb-32 lg:max-w-none lg:space-y-4">
      <VocabularyOverviewCard stats={stats} />

      <div className="sticky top-[68px] z-30 space-y-2 rounded-[20px] border border-[#eee3d5] bg-white/95 p-2.5 shadow-2xs backdrop-blur-md lg:space-y-3 lg:rounded-[24px] lg:p-4">
        <div className="flex items-center gap-2">
          <VocabularyModeSegment mode={view} onModeChange={setView} compact />
          {view === 'list' ? (
            <div className="min-w-0 flex-1">
              <VocabularySearchBar query={searchQuery} onQueryChange={onSearchChange} compact />
            </div>
          ) : (
            <div className="flex items-center justify-end min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setIsShuffle((prev) => !prev)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition-all duration-200 shadow-2xs active:scale-95',
                  isShuffle
                    ? 'border-[#d83a00] bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-xs'
                    : 'border-orange-200/90 bg-[#fffaf5] text-[#c2410c] hover:bg-orange-100/60'
                )}
                title={isShuffle ? 'Đang bật học ngẫu nhiên (Bấm để trở về học tuần tự)' : 'Bấm để bật học ngẫu nhiên'}
              >
                <Shuffle size={14} />
                <span>{isShuffle ? 'Ngẫu nhiên: Bật' : 'Ngẫu nhiên'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-[#f5ece1] pt-2">
          <div className="min-w-0 flex-1">
            <VocabularyCategoryBar
              categories={categoryOptions}
              selectedCategory={selectedCategory}
              onSelectCategory={onCategoryChange}
            />
          </div>

          <VocabularyDisplayToggle
            showFurigana={showFurigana}
            showRomaji={showRomaji}
            onToggleFurigana={onToggleFurigana}
            onToggleRomaji={onToggleRomaji}
            compact
          />
        </div>
      </div>

      {view === 'flashcard' ? (
        <VocabularyFlashcards
          items={filteredVocabulary}
          showFurigana={showFurigana}
          showRomaji={showRomaji}
          heardVocabularyId={heardVocabularyId}
          isShuffle={isShuffle}
          onAudio={onAudio}
          onToggleShuffle={setIsShuffle}
        />
      ) : (
        <div className="rounded-[22px] border border-[#efe5d7] bg-white p-2 shadow-2xs lg:p-3">
          {filteredVocabulary.length > 0 ? (
            <ul className="divide-y divide-[#efe5d7]/60 lg:grid lg:grid-cols-2 lg:gap-2 lg:divide-y-0">
              {filteredVocabulary.map((item) => (
                <VocabularyListItemRow
                  key={item.id}
                  item={item}
                  showFurigana={showFurigana}
                  showRomaji={showRomaji}
                  isPlayingAudio={heardVocabularyId === item.id}
                  onAudio={onAudio}
                  onToggleDetail={onToggleVocabulary}
                />
              ))}
            </ul>
          ) : (
            <VocabularyEmptyState onClearSearch={() => onSearchChange('')} />
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedVocabulary && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onToggleVocabulary(selectedVocabulary.id)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vocab-detail-title"
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md max-h-[85dvh] overflow-y-auto rounded-[28px] border border-orange-200/90 bg-white p-5 shadow-[0_24px_50px_rgba(15,23,42,0.2)] sm:p-6"
            >
              {/* Modal Top Header */}
              <div className="flex items-start justify-between gap-3 border-b border-orange-100/70 pb-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100/70 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#d83a00]">
                    Chi tiết từ vựng
                  </span>
                  <h3 id="vocab-detail-title" className="mt-1.5 font-[var(--font-heading)] text-3xl font-black leading-tight tracking-[-0.02em] text-[#0f172a] sm:text-4xl">
                    <VocabularyHeadword item={selectedVocabulary} showFurigana={showFurigana} rtClassName="text-[0.42em] font-extrabold text-[#c2410c]" />
                  </h3>
                  {showRomaji && (
                    <p className="mt-0.5 text-xs font-bold italic text-[#d97706]">/{selectedVocabulary.pronunciation}/</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleVocabulary(selectedVocabulary.id)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-slate-50 text-gray-500 transition-colors hover:bg-slate-100 hover:text-gray-900"
                  aria-label="Đóng chi tiết từ vựng"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Display Controls */}
              <div className="mt-3">
                <VocabularyDisplayToggle
                  showFurigana={showFurigana}
                  showRomaji={showRomaji}
                  onToggleFurigana={onToggleFurigana}
                  onToggleRomaji={onToggleRomaji}
                  compact
                />
              </div>

              {/* Vietnamese Meaning & Audio */}
              <div className="mt-3.5 flex items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-[#fffaf5] p-3.5">
                <p className="text-xl font-black text-[#0f172a] min-w-0 flex-1">{selectedVocabulary.meaning}</p>
                <button
                  type="button"
                  onClick={() => onAudio(selectedVocabulary.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all duration-200 shadow-2xs',
                    heardVocabularyId === selectedVocabulary.id
                      ? 'bg-[#d83a00] text-white ring-2 ring-orange-400/40'
                      : 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white hover:opacity-95'
                  )}
                >
                  <Volume2 size={16} className={heardVocabularyId === selectedVocabulary.id ? 'animate-bounce' : ''} />
                  <span>Phát âm</span>
                </button>
              </div>

              {/* Example Sentence Box */}
              <div className="mt-3.5 rounded-2xl border border-slate-200/80 bg-[#f8fafc] p-3.5 space-y-1 text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#047857]">Ví dụ câu</span>
                <p lang="ja" className="text-base font-bold leading-snug text-[#0f172a]">{selectedVocabulary.example.jp}</p>
                <p className="text-xs font-semibold leading-snug text-[#334155]">{selectedVocabulary.example.vi}</p>
              </div>

              {/* Mnemonic Box */}
              {selectedVocabulary.mnemonic && (
                <div className="mt-3 rounded-2xl border border-[#fef08a] bg-[#fffbe6] p-3 text-left">
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.1em] text-[#78350f]">
                    <Lightbulb size={13} aria-hidden="true" /> Mẹo nhớ
                  </span>
                  <p className="mt-1 text-xs font-semibold leading-relaxed text-[#78350f]">{selectedVocabulary.mnemonic}</p>
                </div>
              )}

              {/* Tags */}
              <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
                <span className="rounded-lg bg-orange-100/80 border border-orange-200/60 px-2.5 py-0.5 text-[11px] font-extrabold text-[#9a3412]">{selectedVocabulary.module}</span>
                {selectedVocabulary.tags.map((tag) => (
                  <span key={tag} className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-bold text-[#475467]">{tag}</span>
                ))}
              </div>

              {/* Primary Bottom Close Button */}
              <button
                type="button"
                onClick={() => onToggleVocabulary(selectedVocabulary.id)}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] text-sm font-extrabold text-white shadow-xs transition-all duration-200 hover:shadow-md active:scale-98"
              >
                Đóng chi tiết
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface VocabularyFlashcardsProps {
  items: CourseVocabularyItem[];
  showFurigana: boolean;
  showRomaji: boolean;
  heardVocabularyId: string | null;
  isShuffle: boolean;
  onAudio: (vocabularyId: string) => void;
  onToggleShuffle: (shuffle: boolean) => void;
}

function VocabularyFlashcards({
  items,
  showFurigana,
  showRomaji,
  heardVocabularyId,
  isShuffle,
  onAudio,
  onToggleShuffle,
}: VocabularyFlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [rated, setRated] = useState<Record<string, VocabularyRating>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Generate shuffled deck if isShuffle is enabled
  const displayItems = useMemo(() => {
    if (!isShuffle) return items;
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [items, isShuffle]);

  const total = displayItems.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const card = displayItems[safeIndex];

  const goTo = (nextIndex: number) => {
    if (total === 0) return;
    setIsFlipped(false);
    setIndex(((nextIndex % total) + total) % total);
  };

  const handleRate = async (rating: VocabularyRating) => {
    if (!card || rated[card.id] || isSaving) return;
    setIsSaving(true);
    setSaveError(null);
    vibrate(rating === 'again' ? [60, 30, 60] : [20, 40, 60]);
    try {
      await submitVocabularyRating(card.id, rating);
      setRated((current) => ({ ...current, [card.id]: rating }));
    } catch (reason) {
      setSaveError(reason instanceof Error ? reason.message : 'Không lưu được kết quả ôn từ.');
    } finally {
      setIsSaving(false);
    }
  };

  const ratedCount = total > 0 ? displayItems.filter((item) => rated[item.id]).length : 0;
  const allRated = total > 0 && ratedCount >= total;
  const rememberedCount = displayItems.filter((item) => rated[item.id] && rated[item.id] !== 'again').length;

  if (allRated) {
    return (
      <div className="relative mt-2 space-y-4 pb-20">
        <Confetti />
        <div className="relative rounded-[28px] border-2 border-emerald-200 bg-white p-6 text-center shadow-[0_14px_36px_rgba(16,185,129,0.08)] sm:p-9">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white"><CheckCircle2 size={28} /></span>
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700">Đã ôn xong</p>
          <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-black tracking-[-0.03em] text-[#172033]">Ôn từ hoàn tất</h2>
          <div className="mx-auto mt-5 grid max-w-xs grid-cols-2 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
              <strong className="block text-2xl font-black text-emerald-700">{rememberedCount}</strong>
              <span className="text-xs font-bold text-emerald-800">từ đã nhớ</span>
            </div>
            <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-3">
              <strong className="block text-2xl font-black text-orange-700">{total - rememberedCount}</strong>
              <span className="text-xs font-bold text-orange-800">cần ôn lại</span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#5f6b7c]">Lịch ôn đã được cập nhật theo mức độ nhớ của anh.</p>
          <button
            type="button"
            onClick={() => { setRated({}); setIndex(0); setIsFlipped(false); }}
            className={cn('mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-5 text-sm font-bold text-white hover:bg-orange-800', focusRing)}
          >
            <RotateCcw size={16} /> Ôn lại lượt nữa
          </button>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className={cn(emptyStateClass, 'mt-4')}>
        <p className="text-sm font-semibold text-[#172033]">Chưa có từ để học</p>
        <p className="mt-1 text-xs text-[#95a0af]">Danh sách từ vựng đang trống.</p>
      </div>
    );
  }

  const handleCardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsFlipped((value) => !value);
    }
  };

  const progressPercent = total > 0 ? Math.round(((safeIndex + 1) / total) * 100) : 0;

  return (
    <div className="mt-2 space-y-4 pb-20">
      {/* Top Header Bar & Progress Line */}
      <div className="space-y-1.5 px-1">
        <div className="flex items-center justify-between text-xs font-bold text-[#748092]">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#d83a00] animate-pulse" />
            <span>Chế độ Flashcard</span>
            <span className="rounded-md border border-orange-200 bg-orange-50 px-1.5 py-0.2 text-[10px] font-extrabold text-[#c2410c]">
              {isShuffle ? '🔀 Ngẫu nhiên: Bật' : '➡️ Tuần tự (Mặc định)'}
            </span>
          </span>
          <span className="font-extrabold text-[#d83a00]">{safeIndex + 1} / {total} ({progressPercent}%)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#eee5da]">
          <div
            className="h-full bg-gradient-to-r from-[#d83a00] to-[#f27427] transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Interactive 3D Card Container */}
      <motion.div
        drag={total > 1 ? 'x' : false}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.12}
        onDragEnd={(_, info) => {
          if (info.offset.x <= -80) goTo(safeIndex + 1);
          else if (info.offset.x >= 80) goTo(safeIndex - 1);
        }}
        className="w-full"
      >
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? 'Ẩn nghĩa và quay lại mặt trước' : 'Lật thẻ để xem nghĩa'}
        onClick={() => setIsFlipped((value) => !value)}
        onKeyDown={handleCardKeyDown}
        className={cn('group block w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-[28px]')}
      >
        <div style={{ perspective: '1200px' }}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative min-h-[24rem] md:min-h-[22rem]"
          >
            {/* FRONT OF CARD */}
            <div
              aria-hidden={isFlipped}
              style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
              className="absolute inset-0 flex h-full flex-col justify-between rounded-[28px] border-2 border-[#fed7aa] bg-white p-5 sm:p-7 shadow-[0_14px_36px_rgba(217,74,19,0.08)] transition-shadow group-hover:shadow-[0_18px_44px_rgba(217,74,19,0.14)]"
            >
              {/* Front Top Bar */}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAudio(card.id);
                  }}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 shadow-2xs',
                    heardVocabularyId === card.id
                      ? 'bg-[#d83a00] text-white ring-4 ring-orange-400/30'
                      : 'bg-orange-50 text-[#d83a00] hover:bg-orange-100 border border-orange-200'
                  )}
                  aria-label={`Nghe phát âm ${card.word}`}
                >
                  <Volume2 size={20} strokeWidth={2} className={heardVocabularyId === card.id ? 'animate-bounce' : ''} />
                </button>

                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-extrabold text-[#9a3412] shadow-2xs">
                  {card.module || 'Từ vựng'}
                </span>
              </div>

              {/* Front Center Headword */}
              <div className="flex min-h-[11rem] flex-1 flex-col items-center justify-center text-center my-2">
                <VocabularyHeadword
                  item={card}
                  showFurigana={showFurigana}
                  className="max-w-full break-words text-center text-5xl font-black tracking-[-0.02em] text-[#0f172a] sm:text-6xl md:text-7xl"
                  rtClassName="text-[0.42em] font-extrabold text-[#c2410c]"
                />
                {showRomaji && (
                  <p className="mt-3 text-base font-bold italic text-[#d97706] sm:text-lg">
                    {card.pronunciation}
                  </p>
                )}
              </div>

              {/* Front Bottom Flip Prompt */}
              <div className="flex justify-center pt-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-extrabold text-[#c2410c] shadow-2xs transition-transform group-hover:scale-105">
                  Chạm để lật thẻ 🔄
                </span>
              </div>
            </div>

            {/* BACK OF CARD */}
            <div
              aria-hidden={!isFlipped}
              style={{
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
              className="absolute inset-0 flex h-full flex-col justify-between rounded-[28px] border-2 border-[#bbf7d0] bg-white p-5 sm:p-7 shadow-[0_14px_36px_rgba(16,185,129,0.09)]"
            >
              {/* Back Top Tag */}
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-[#059669] px-3.5 py-1 text-[11px] font-extrabold text-white shadow-2xs">
                  Ý nghĩa & Ví dụ
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAudio(card.id);
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800 shadow-2xs border border-emerald-200 hover:bg-emerald-100"
                  aria-label="Nghe phát âm"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Back Main Meaning */}
              <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto my-2 text-center">
                <h3 className="font-[var(--font-heading)] text-3xl font-black tracking-[-0.02em] text-[#0f172a] sm:text-4xl">
                  {card.meaning}
                </h3>

                {/* Example Box */}
                <div className="mt-3.5 w-full rounded-2xl border border-slate-200 bg-[#f8fafc] p-3.5 text-left shadow-2xs space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.1em] text-[#047857]">Ví dụ câu</div>
                  <p lang="ja" className="text-base sm:text-lg font-bold text-[#0f172a] leading-snug">
                    {card.example.jp}
                  </p>
                  <p className="text-xs font-semibold text-[#334155] leading-snug">
                    {card.example.vi}
                  </p>
                </div>

                {card.mnemonic && (
                  <p className="mt-2.5 text-xs font-semibold leading-relaxed text-[#78350f] bg-[#fffbe6] rounded-xl p-2.5 text-left border border-[#fef08a]">
                    💡 <strong>Mẹo nhớ:</strong> {card.mnemonic}
                  </p>
                )}
              </div>

              {/* Back Bottom: rating + quay lại mặt trước */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Đánh giá mức nhớ">
                  {([
                    { id: 'again' as const, label: 'Quên', className: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' },
                    { id: 'hard' as const, label: 'Khó', className: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' },
                    { id: 'good' as const, label: 'Nhớ', className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
                    { id: 'easy' as const, label: 'Rất nhớ', className: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100' },
                  ]).map((option) => {
                    const isRated = rated[card.id] === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); void handleRate(option.id); }}
                        disabled={Boolean(rated[card.id]) || isSaving}
                        className={cn(
                          'flex min-h-11 flex-col items-center justify-center gap-0.5 rounded-xl border text-[11px] font-black transition-all duration-150 active:scale-95 disabled:opacity-60',
                          option.className,
                          isRated && 'ring-2 ring-offset-1',
                          focusRing,
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                {saveError && <p className="text-center text-[11px] font-semibold text-red-700">{saveError}</p>}
                <div className="flex justify-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-bold text-[#334155]">
                    Chạm để quay lại mặt trước
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </motion.div>

      {/* Navigation Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          className={cn(
            'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl border border-[#e4d8c8] bg-white px-4 text-xs font-extrabold text-[#475467] transition-all duration-200 hover:border-orange-300 hover:text-[#d83a00] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 shadow-2xs',
            focusRing
          )}
          aria-label="Thẻ trước"
          disabled={safeIndex === 0}
        >
          <ChevronLeft size={17} aria-hidden="true" /> Thẻ trước
        </button>

        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          className={cn(
            'inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:shadow-md hover:from-[#c23400] hover:to-[#d84800] active:scale-95 disabled:cursor-not-allowed disabled:opacity-35',
            focusRing
          )}
          aria-label="Thẻ tiếp"
          disabled={safeIndex >= total - 1}
        >
          Thẻ tiếp <ChevronRight size={17} aria-hidden="true" />
        </button>
      </div>

      {total > 1 && (
        <p className="text-center text-[11px] font-bold text-[#95a0af]">Vuốt ← → chuyển thẻ · Chạm để lật</p>
      )}
    </div>
  );
}
