import { type KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lightbulb, Volume2, X } from 'lucide-react';
import {
  emptyStateClass,
  focusRing,
} from '@/src/features/courses/components/CourseLearningResourcePanels';
import { type CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';
import { cn } from '@/src/lib/utils';

type VocabularyView = 'list' | 'flashcard';

export function getVocabularyDisplayName(item: CourseVocabularyItem) {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

function getVocabularyJapanese(item: CourseVocabularyItem) {
  return item.kanji ?? item.kana ?? getVocabularyDisplayName(item);
}

// Quan trọng: KHÔNG đặt display:block (class "block") lên chính thẻ <ruby>, vì nó phá
// display:ruby khiến furigana không nổi lên trên kanji. Block để ở span bọc ngoài.
export function VocabularyHeadword({
  item,
  showFurigana,
  rtClassName,
  className,
}: {
  item: CourseVocabularyItem;
  showFurigana: boolean;
  rtClassName?: string;
  className?: string;
}) {
  return (
    <span className={className}>
      {showFurigana && item.kanji && item.kana ? (
        <ruby lang="ja">
          {item.kanji}
          <rp>(</rp>
          <rt className={cn('font-medium text-[#7b8796]', rtClassName)}>{item.kana}</rt>
          <rp>)</rp>
        </ruby>
      ) : (
        <span lang="ja">{getVocabularyJapanese(item)}</span>
      )}
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
  const selectedVocabulary = expandedVocabularyId
    ? filteredVocabulary.find((item) => item.id === expandedVocabularyId) ?? null
    : null;

  const currentCategoryObj = categoryOptions.find((c) => c.id === selectedCategory);
  const categoryCount = currentCategoryObj ? currentCategoryObj.count : filteredVocabulary.length;

  const stats = {
    learnedCount: 8,
    categoryCount: categoryCount,
    progressPercent: 46,
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
      {/* 1. Vocabulary Overview Card */}
      <VocabularyOverviewCard stats={stats} />

      {/* 2. Segmented Control "Danh sách / Flashcard" */}
      <VocabularyModeSegment mode={view} onModeChange={setView} />

      {/* 3. Category Chips with Badge & Scroll Arrow */}
      <VocabularyCategoryBar
        categories={categoryOptions}
        selectedCategory={selectedCategory}
        onSelectCategory={onCategoryChange}
      />

      {/* 4. Display Options (Furigana & Romaji) */}
      <VocabularyDisplayToggle
        showFurigana={showFurigana}
        showRomaji={showRomaji}
        onToggleFurigana={onToggleFurigana}
        onToggleRomaji={onToggleRomaji}
      />

      {/* 5. Search Bar */}
      {view === 'list' && (
        <VocabularySearchBar query={searchQuery} onQueryChange={onSearchChange} />
      )}

      {/* 6. List / Flashcard view */}
      {view === 'flashcard' ? (
        <VocabularyFlashcards
          items={filteredVocabulary}
          showFurigana={showFurigana}
          showRomaji={showRomaji}
          heardVocabularyId={heardVocabularyId}
          onAudio={onAudio}
        />
      ) : (
        <div className="rounded-[22px] border border-[#efe5d7] bg-white p-2 shadow-2xs">
          {filteredVocabulary.length > 0 ? (
            <ul className="divide-y divide-[#efe5d7]/60">
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

      {/* 7. Floating audio button */}
      <FloatingAudioButton />

      <AnimatePresence>
        {selectedVocabulary && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-end justify-center bg-gray-950/30 p-3 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onToggleVocabulary(selectedVocabulary.id)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vocab-detail-title"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Chi tiết từ vựng</span>
                  <h3 id="vocab-detail-title" className="mt-2 font-[var(--font-heading)] text-2xl font-bold leading-tight tracking-[-0.02em] text-[#172033]">
                    <VocabularyHeadword item={selectedVocabulary} showFurigana={showFurigana} rtClassName="text-[0.4em]" />
                  </h3>
                  {showRomaji && (
                    <p className="mt-1 text-sm text-orange-700">/{selectedVocabulary.pronunciation}/</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleVocabulary(selectedVocabulary.id)}
                  className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]', focusRing)}
                  aria-label="Đóng chi tiết từ vựng"
                >
                  <X size={18} aria-hidden="true" focusable="false" />
                </button>
              </div>

              <div className="mt-3">
                <VocabularyDisplayToggle
                  showFurigana={showFurigana}
                  showRomaji={showRomaji}
                  onToggleFurigana={onToggleFurigana}
                  onToggleRomaji={onToggleRomaji}
                />
              </div>

              <p className="mt-4 text-lg font-semibold text-[#172033]">{selectedVocabulary.meaning}</p>

              <button
                type="button"
                onClick={() => onAudio(selectedVocabulary.id)}
                className={cn(
                  'mt-4 inline-flex items-center gap-2 rounded-xl border border-[#e8dccb] px-4 py-2.5 text-sm font-bold transition-colors',
                  heardVocabularyId === selectedVocabulary.id ? 'bg-orange-700 text-white' : 'bg-[#fffdf8] text-orange-700 hover:bg-orange-50',
                  focusRing
                )}
              >
                <Volume2 size={16} aria-hidden="true" focusable="false" /> Nghe phát âm
              </button>

              <div className="mt-4 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#95a0af]">Ví dụ</span>
                <p lang="ja" className="mt-2 text-base font-semibold leading-relaxed text-[#172033]">{selectedVocabulary.example.jp}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{selectedVocabulary.example.vi}</p>
              </div>

              {selectedVocabulary.mnemonic && (
                <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50/60 p-4">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">
                    <Lightbulb size={13} aria-hidden="true" focusable="false" /> Mẻo nhớ
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-[#4d5a6b]">{selectedVocabulary.mnemonic}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{selectedVocabulary.module}</span>
                {selectedVocabulary.tags.map((tag) => (
                  <span key={tag} className="rounded-md border border-[#e8dccb] bg-[#fffdf8] px-3 py-1 text-xs font-medium text-[#5f6b7c]">{tag}</span>
                ))}
              </div>
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
  onAudio: (vocabularyId: string) => void;
}

function VocabularyFlashcards({ items, showFurigana, showRomaji, heardVocabularyId, onAudio }: VocabularyFlashcardsProps) {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const total = items.length;
  const safeIndex = total > 0 ? Math.min(index, total - 1) : 0;
  const card = items[safeIndex];

  const goTo = (nextIndex: number) => {
    if (total === 0) return;
    setIsFlipped(false);
    setIndex(((nextIndex % total) + total) % total);
  };

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

  return (
    <div className="mt-4 pb-20">
      <div className="mb-3 flex items-center justify-between gap-3 px-1">
        <button
          type="button"
          onClick={() => onAudio(card.id)}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] transition-colors',
            heardVocabularyId === card.id ? 'bg-orange-700 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100',
            focusRing
          )}
          aria-label={`Nghe phát âm ${card.word}`}
        >
          <Volume2 size={21} strokeWidth={1.8} aria-hidden="true" focusable="false" />
        </button>
        <span className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2 text-xs font-bold text-[#7b8796]">Flashcard khóa học</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={isFlipped ? 'Ẩn nghĩa và quay lại mặt trước' : 'Lật thẻ để xem nghĩa'}
        onClick={() => setIsFlipped((value) => !value)}
        onKeyDown={handleCardKeyDown}
        className={cn('group block w-full cursor-pointer rounded-2xl text-left', focusRing)}
      >
        <div style={{ perspective: '1200px' }}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative min-h-[25rem] md:min-h-[22rem]"
          >
            <div aria-hidden={isFlipped} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} className="absolute inset-0 flex h-full flex-col rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-transform group-hover:-translate-y-0.5 md:p-8">
              <div className="flex min-h-[13rem] flex-1 flex-col items-center justify-center text-center md:min-h-[16rem]">
                <VocabularyHeadword item={card} showFurigana={showFurigana} className="mt-5 max-w-full break-words text-center text-5xl font-bold tracking-[-0.02em] text-[#172033] md:text-7xl" rtClassName="text-[0.38em]" />
                {showRomaji && <p className="mt-3 text-base font-bold italic text-orange-700/90 md:text-lg">{card.pronunciation}</p>}
                <span className="mt-6 inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-bold text-orange-800 shadow-sm">
                  Lật thẻ <span className="rounded-md bg-orange-100 px-1.5 py-0.5 text-[11px]">Space</span>
                </span>
              </div>
            </div>
            <div aria-hidden={!isFlipped} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 flex h-full flex-col rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 md:p-8">
              <div className="flex min-h-0 flex-1 flex-col justify-start overflow-y-auto pt-4 text-center md:min-h-[16rem] md:justify-center md:overflow-visible md:pt-0">
                <h3 className="mt-2 break-words font-[var(--font-heading)] text-3xl font-bold tracking-[-0.02em] text-[#172033] md:text-4xl">{card.meaning}</h3>
                <div className="mx-auto mt-6 w-full max-w-lg rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-4 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700">Ví dụ</p>
                  <p lang="ja" className="mt-2 break-words text-base font-bold leading-relaxed text-[#172033] md:text-lg">{card.example.jp}</p>
                  <p className="mt-2 break-words text-sm font-medium leading-relaxed text-[#4d5a6b]">{card.example.vi}</p>
                </div>
                {card.mnemonic && <p className="mx-auto mt-3 max-w-lg break-words text-left text-sm leading-relaxed text-[#4d5a6b]">💡 {card.mnemonic}</p>}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="course-vocabulary-flashcard-navigation flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3.5 text-xs font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 disabled:cursor-not-allowed disabled:opacity-35', focusRing)}
          aria-label="Thẻ trước"
          disabled={safeIndex === 0}
        >
          <ChevronLeft size={16} aria-hidden="true" focusable="false" /> Thẻ trước
        </button>

        <span className="text-[11px] font-bold text-[#95a0af]">{safeIndex + 1} / {total}</span>

        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          className={cn('inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-orange-700 px-3.5 text-xs font-bold text-white transition-colors hover:bg-orange-800 disabled:cursor-not-allowed disabled:opacity-35', focusRing)}
          aria-label="Thẻ tiếp"
          disabled={safeIndex >= total - 1}
        >
          Thẻ tiếp <ChevronRight size={16} aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}
