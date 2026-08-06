import React from 'react';
import { ChevronRight, Volume2 } from 'lucide-react';
import type { CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';
import { VocabularyHeadword } from '@/src/features/courses/components/CourseVocabularyPanel';

interface VocabularyListItemRowProps {
  key?: React.Key;
  item: CourseVocabularyItem;
  showFurigana: boolean;
  showRomaji: boolean;
  isPlayingAudio: boolean;
  onAudio: (vocabularyId: string) => void;
  onToggleDetail: (vocabularyId: string) => void;
}

export function VocabularyListItemRow({
  item,
  showFurigana,
  showRomaji,
  isPlayingAudio,
  onAudio,
  onToggleDetail,
}: VocabularyListItemRowProps) {
  const subtitle = showRomaji
    ? `${item.pronunciation} · ${item.meaning}`
    : item.meaning;

  return (
    <li className="group relative flex items-center justify-between gap-3 py-3.5 px-3 transition-colors hover:bg-orange-50/40 rounded-xl">
      {/* Left Main Content Clickable */}
      <button
        type="button"
        onClick={() => onToggleDetail(item.id)}
        aria-haspopup="dialog"
        className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
      >
        {/* Furigana + Kanji / Japanese Headword */}
        <div className="min-w-0">
          <VocabularyHeadword
            item={item}
            showFurigana={showFurigana}
            className="block text-lg font-extrabold text-[#172033] leading-tight tracking-[-0.01em]"
            rtClassName="text-[0.6em] font-semibold text-orange-600"
          />
        </div>

        {/* Romaji & Vietnamese Subtitle */}
        <p className="mt-1 truncate text-xs font-semibold text-[#5f6b7c]">
          {subtitle}
        </p>
      </button>

      {/* Right Actions: Audio Button + Chevron */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Audio Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAudio(item.id);
          }}
          aria-label={`Nghe phát âm ${item.word}`}
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
            isPlayingAudio
              ? 'bg-[#d83a00] text-white shadow-sm scale-105 animate-pulse'
              : 'bg-orange-50/80 text-orange-600 hover:bg-orange-100/90 active:scale-95'
          }`}
        >
          <Volume2 size={20} strokeWidth={2} />
        </button>

        {/* Chevron Right */}
        <button
          type="button"
          onClick={() => onToggleDetail(item.id)}
          aria-label={`Xem chi tiết ${item.word}`}
          className="flex h-9 w-7 items-center justify-center text-[#95a0af] hover:text-[#172033]"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </li>
  );
}
