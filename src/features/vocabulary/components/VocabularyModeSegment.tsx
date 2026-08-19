import React from 'react';
import { Layers3, List } from 'lucide-react';

export type VocabularyViewMode = 'list' | 'flashcard';

interface VocabularyModeSegmentProps {
  mode: VocabularyViewMode;
  onModeChange: (mode: VocabularyViewMode) => void;
  compact?: boolean;
}

export function VocabularyModeSegment({ mode, onModeChange, compact = false }: VocabularyModeSegmentProps) {
  return (
    <div
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-xl border border-[#e4d8c8] bg-[#f8f3ec] p-0.5 ${
        compact ? 'h-9 lg:h-10' : 'h-10 w-full'
      }`}
      role="tablist"
      aria-label="Chọn chế độ xem từ vựng"
    >
      {/* Tab 1: Danh sách */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'list'}
        onClick={() => onModeChange('list')}
        className={`flex h-full items-center justify-center gap-1.5 rounded-[10px] px-2.5 text-xs font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          mode === 'list'
            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-2xs'
            : 'bg-transparent text-[#5f6b7c] hover:text-[#172033]'
        } ${compact ? '' : 'flex-1'}`}
      >
        <List size={compact ? 15 : 16} strokeWidth={mode === 'list' ? 2.5 : 2} />
        <span>Danh sách</span>
      </button>

      {/* Tab 2: Flashcard */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'flashcard'}
        onClick={() => onModeChange('flashcard')}
        className={`flex h-full items-center justify-center gap-1.5 rounded-[10px] px-2.5 text-xs font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          mode === 'flashcard'
            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-2xs'
            : 'bg-transparent text-[#5f6b7c] hover:text-[#172033]'
        } ${compact ? '' : 'flex-1'}`}
      >
        <Layers3 size={compact ? 15 : 16} strokeWidth={mode === 'flashcard' ? 2.5 : 2} />
        <span>Flashcard</span>
      </button>
    </div>
  );
}
