import React from 'react';
import { Check } from 'lucide-react';

interface VocabularyDisplayToggleProps {
  showFurigana: boolean;
  showRomaji: boolean;
  onToggleFurigana: () => void;
  onToggleRomaji: () => void;
  compact?: boolean;
}

export function VocabularyDisplayToggle({
  showFurigana,
  showRomaji,
  onToggleFurigana,
  onToggleRomaji,
  compact = true,
}: VocabularyDisplayToggleProps) {
  return (
    <div className="inline-flex shrink-0 items-center gap-1.5">
      {!compact && <span className="text-xs font-bold text-[#717d8f]">Hiển thị</span>}

      {/* Furigana Chip */}
      <button
        type="button"
        aria-pressed={showFurigana}
        onClick={onToggleFurigana}
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          showFurigana
            ? 'border-[#d83a00] bg-[#d83a00] text-white shadow-2xs'
            : 'border-[#e4d8c8] bg-white text-[#5f6b7c] hover:border-orange-300 hover:text-[#172033]'
        }`}
      >
        {showFurigana && <Check size={12} strokeWidth={2.5} />}
        <span>Furigana</span>
      </button>

      {/* Romaji Chip */}
      <button
        type="button"
        aria-pressed={showRomaji}
        onClick={onToggleRomaji}
        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
          showRomaji
            ? 'border-[#d83a00] bg-[#d83a00] text-white shadow-2xs'
            : 'border-[#e4d8c8] bg-white text-[#5f6b7c] hover:border-orange-300 hover:text-[#172033]'
        }`}
      >
        {showRomaji && <Check size={12} strokeWidth={2.5} />}
        <span>Romaji</span>
      </button>
    </div>
  );
}
