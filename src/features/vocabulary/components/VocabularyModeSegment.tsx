import React from 'react';
import { Layers3, List } from 'lucide-react';

export type VocabularyViewMode = 'list' | 'flashcard';

interface VocabularyModeSegmentProps {
  mode: VocabularyViewMode;
  onModeChange: (mode: VocabularyViewMode) => void;
}

export function VocabularyModeSegment({ mode, onModeChange }: VocabularyModeSegmentProps) {
  return (
    <div
      className="flex min-h-[44px] w-full gap-1 rounded-[16px] border border-[#e4d8c8] bg-white p-1 shadow-2xs"
      role="tablist"
      aria-label="Chọn chế độ xem từ vựng"
    >
      {/* Tab 1: Danh sách */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'list'}
        onClick={() => onModeChange('list')}
        className={`flex flex-1 min-h-[38px] items-center justify-center gap-2 rounded-[12px] text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          mode === 'list'
            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-sm'
            : 'bg-transparent text-[#5f6b7c] hover:text-[#172033]'
        }`}
      >
        <List size={18} strokeWidth={mode === 'list' ? 2.5 : 2} />
        <span>Danh sách</span>
      </button>

      {/* Tab 2: Flashcard */}
      <button
        type="button"
        role="tab"
        aria-selected={mode === 'flashcard'}
        onClick={() => onModeChange('flashcard')}
        className={`flex flex-1 min-h-[38px] items-center justify-center gap-2 rounded-[12px] text-sm font-extrabold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          mode === 'flashcard'
            ? 'bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-sm'
            : 'bg-transparent text-[#5f6b7c] hover:text-[#172033]'
        }`}
      >
        <Layers3 size={18} strokeWidth={mode === 'flashcard' ? 2.5 : 2} />
        <span>Flashcard</span>
      </button>
    </div>
  );
}
