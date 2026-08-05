import { type KeyboardEvent, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Lightbulb, Search, Volume2, X } from 'lucide-react';
import {
  dividerListClass,
  emptyStateClass,
  focusRing,
  panelClass,
  panelSubtitleClass,
  panelTitleClass,
  searchFieldClass,
  searchInputClass,
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
  heardVocabularyId: string | null;
  searchQuery: string;
  showFurigana: boolean;
  showRomaji: boolean;
  totalCount: number;
  onAudio: (vocabularyId: string) => void;
  onSearchChange: (query: string) => void;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  onToggleVocabulary: (vocabularyId: string) => void;
}

export function VocabularyPanel({
  expandedVocabularyId,
  filteredVocabulary,
  heardVocabularyId,
  searchQuery,
  showFurigana,
  showRomaji,
  totalCount,
  onAudio,
  onSearchChange,
  onToggleFurigana,
  onToggleRomaji,
  onToggleVocabulary,
}: VocabularyPanelProps) {
  const [view, setView] = useState<VocabularyView>('list');
  const isSearching = searchQuery.trim().length > 0;
  const selectedVocabulary = expandedVocabularyId
    ? filteredVocabulary.find((item) => item.id === expandedVocabularyId) ?? null
    : null;

  const toggleChipClass = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
      active ? 'border-orange-700 bg-orange-700 text-white' : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]',
      focusRing
    );

  const segmentClass = (active: boolean) =>
    cn(
      'flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
      active ? 'bg-orange-700 text-white' : 'text-[#5f6b7c] hover:text-[#172033]',
      focusRing
    );

  const viewOptions = [
    { id: 'list' as VocabularyView, label: 'Danh sách' },
    { id: 'flashcard' as VocabularyView, label: 'Flashcard' },
  ];

  return (
    <section className={panelClass}>
      <h2 className={panelTitleClass}>Từ vựng</h2>
      <p className={cn('mt-1', panelSubtitleClass)}>
        {totalCount} từ
        {view === 'list' && isSearching ? ` · đang xem ${filteredVocabulary.length}` : ''}
      </p>

      <div className="mt-4 flex gap-1 rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-1" role="group" aria-label="Chọn cách học từ vựng">
        {viewOptions.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setView(option.id)}
            aria-pressed={view === option.id}
            className={segmentClass(view === option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#95a0af]">Hiển thị</span>
        <button type="button" onClick={onToggleFurigana} aria-pressed={showFurigana} className={toggleChipClass(showFurigana)}>
          Furigana
        </button>
        <button type="button" onClick={onToggleRomaji} aria-pressed={showRomaji} className={toggleChipClass(showRomaji)}>
          Romaji
        </button>
      </div>

      {view === 'flashcard' ? (
        <VocabularyFlashcards
          items={filteredVocabulary}
          showFurigana={showFurigana}
          showRomaji={showRomaji}
          heardVocabularyId={heardVocabularyId}
          onAudio={onAudio}
        />
      ) : (
        <>
          <label className={cn(searchFieldClass, 'mt-4')}>
            <Search size={18} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
            <span className="sr-only">Tìm từ vựng</span>
            <input
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Tìm từ hoặc nghĩa..."
              className={searchInputClass}
            />
            {searchQuery && (
              <button type="button" onClick={() => onSearchChange('')} className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#95a0af] hover:text-[#172033]', focusRing)} aria-label="Xóa tìm kiếm">
                <X size={15} aria-hidden="true" focusable="false" />
              </button>
            )}
          </label>

          {filteredVocabulary.length > 0 ? (
            <ul className={cn('mt-2', dividerListClass)}>
              {filteredVocabulary.map((item) => (
                <li key={item.id}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleVocabulary(item.id)}
                      aria-haspopup="dialog"
                      className={cn('flex min-w-0 flex-1 items-center gap-3 rounded-xl py-3.5 text-left', focusRing)}
                    >
                      <span className="min-w-0 flex-1">
                        <VocabularyHeadword
                          item={item}
                          showFurigana={showFurigana}
                          className="block text-base font-semibold text-[#172033]"
                          rtClassName="text-[0.55em]"
                        />
                        <span className="mt-1 block truncate text-sm text-[#5f6b7c]">
                          {showRomaji ? `${item.pronunciation} · ${item.meaning}` : item.meaning}
                        </span>
                      </span>
                      <ChevronRight size={16} className="shrink-0 text-[#95a0af]" aria-hidden="true" focusable="false" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onAudio(item.id)}
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                        heardVocabularyId === item.id ? 'bg-orange-700 text-white' : 'text-[#95a0af] hover:text-orange-700',
                        focusRing
                      )}
                      aria-label={`Nghe phát âm ${item.word}`}
                    >
                      <Volume2 size={18} aria-hidden="true" focusable="false" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={cn(emptyStateClass, 'mt-4')}>
              <p className="text-sm font-semibold text-[#172033]">Không tìm thấy từ phù hợp</p>
              <p className="mt-1 text-xs text-[#95a0af]">Thử nhập từ khóa ngắn hơn.</p>
            </div>
          )}
        </>
      )}

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

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button type="button" onClick={onToggleFurigana} aria-pressed={showFurigana} className={toggleChipClass(showFurigana)}>
                  Furigana
                </button>
                <button type="button" onClick={onToggleRomaji} aria-pressed={showRomaji} className={toggleChipClass(showRomaji)}>
                  Romaji
                </button>
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
    </section>
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
    <div className="mt-4">
      <div
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label="Chạm để lật thẻ từ vựng"
        onClick={() => setIsFlipped((value) => !value)}
        onKeyDown={handleCardKeyDown}
        className={cn('flex min-h-[17rem] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-6 text-center', focusRing)}
      >
        <div className="w-full" style={{ perspective: '1000px' }}>
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative min-h-[13rem] w-full"
          >
            <div aria-hidden={isFlipped} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }} className="absolute inset-0 flex w-full flex-col items-center justify-center">
              <VocabularyHeadword item={card} showFurigana={showFurigana} className="text-4xl font-bold text-[#172033]" rtClassName="text-[0.38em]" />
              {showRomaji && <p className="mt-3 text-sm text-orange-700">/{card.pronunciation}/</p>}
              <p className="mt-6 text-xs text-[#95a0af]">Chạm để lật thẻ</p>
            </div>
            <div aria-hidden={!isFlipped} style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }} className="absolute inset-0 flex w-full flex-col items-center justify-center">
              <VocabularyHeadword item={card} showFurigana={showFurigana} className="text-lg font-semibold text-[#7b8796]" rtClassName="text-[0.5em]" />
              <p className="mt-2 text-2xl font-bold text-[#172033]">{card.meaning}</p>
              <div className="mx-auto mt-4 max-w-sm rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-3 text-left">
                <p lang="ja" className="text-sm font-semibold leading-relaxed text-[#172033]">{card.example.jp}</p>
                <p className="mt-1 text-sm leading-relaxed text-[#5f6b7c]">{card.example.vi}</p>
              </div>
              {card.mnemonic && <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#4d5a6b]">💡 {card.mnemonic}</p>}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => goTo(safeIndex - 1)}
          className={cn('flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
          aria-label="Từ trước"
        >
          <ChevronLeft size={20} aria-hidden="true" focusable="false" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onAudio(card.id)}
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] transition-colors',
              heardVocabularyId === card.id ? 'bg-orange-700 text-white' : 'bg-[#fffdf8] text-orange-700 hover:bg-orange-50',
              focusRing
            )}
            aria-label={`Nghe phát âm ${card.word}`}
          >
            <Volume2 size={18} aria-hidden="true" focusable="false" />
          </button>
          <span className="text-sm font-semibold text-[#5f6b7c]">{safeIndex + 1} / {total}</span>
        </div>

        <button
          type="button"
          onClick={() => goTo(safeIndex + 1)}
          className={cn('flex h-11 w-11 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] transition-colors hover:text-[#172033]', focusRing)}
          aria-label="Từ sau"
        >
          <ChevronRight size={20} aria-hidden="true" focusable="false" />
        </button>
      </div>
    </div>
  );
}
