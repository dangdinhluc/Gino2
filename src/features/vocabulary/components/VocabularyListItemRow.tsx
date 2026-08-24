import React from 'react';
import { CheckCircle2, RotateCcw, Volume2 } from 'lucide-react';
import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
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
  const isLearned = item.status === 'remembered';
  const needsReview = item.status === 'learning' || item.status === 'due';
  const statusLabel = isLearned ? 'Đã học' : needsReview ? 'Ôn lại' : 'Chưa học';
  const statusClass = isLearned
    ? 'text-[#42a36c]'
    : needsReview
      ? 'text-[#5c80d3]'
      : 'text-[#e26868]';

  return (
    <li className="flex min-h-[68px] items-center gap-3 px-3.5 py-2.5 transition-colors hover:bg-[#faf9fd] lg:rounded-xl lg:border lg:border-[#e8e3f2] lg:bg-white">
      <button
        type="button"
        onClick={() => onToggleDetail(item.id)}
        aria-haspopup="dialog"
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8]"
      >
        <VocabularyHeadword
          item={item}
          showFurigana={showFurigana}
          align="left"
          className="text-[15px] font-extrabold leading-tight text-[#27282e]"
          rtClassName="text-[0.56em] font-bold text-[#8a6ec8]"
        />
        <p className="mt-1 truncate text-[10px] font-medium text-[#8d9099]">
          {showRomaji ? `${item.pronunciation} · ${item.meaning}` : item.meaning}
        </p>
      </button>

      <span className={`hidden shrink-0 items-center gap-1 text-[9px] font-bold sm:inline-flex ${statusClass}`}>
        {isLearned ? <CheckCircle2 size={12} /> : needsReview ? <RotateCcw size={12} /> : null}
        {statusLabel}
      </span>

      <button
        type="button"
        onClick={() => onAudio(item.id)}
        aria-label={`Nghe phát âm ${item.word}`}
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc] ${
          isPlayingAudio
            ? 'bg-[#6f45d8] text-white'
            : 'bg-[#f3efff] text-[#7655d9] hover:bg-[#eae2fb]'
        }`}
      >
        <Volume2 size={14} />
      </button>
    </li>
  );
}
