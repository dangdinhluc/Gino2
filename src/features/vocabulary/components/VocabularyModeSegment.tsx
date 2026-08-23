import { Layers3, List } from 'lucide-react';

export type VocabularyViewMode = 'list' | 'flashcard';

interface VocabularyModeSegmentProps {
  mode: VocabularyViewMode;
  onModeChange: (mode: VocabularyViewMode) => void;
  compact?: boolean;
}

export function VocabularyModeSegment({ mode, onModeChange, compact = false }: VocabularyModeSegmentProps) {
  const buttonClass = (active: boolean) => `flex h-full items-center justify-center gap-1 rounded-lg px-2 text-[10px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8] ${active ? 'bg-[#6f45d8] text-white' : 'text-[#747782] hover:bg-white'}`;
  return (
    <div className={`inline-flex shrink-0 items-center gap-0.5 rounded-[10px] border border-[#e8e5ef] bg-[#f7f6f9] p-0.5 ${compact ? 'h-9' : 'h-10 w-full'}`} role="tablist" aria-label="Chọn chế độ xem từ vựng">
      <button type="button" role="tab" aria-selected={mode === 'list'} onClick={() => onModeChange('list')} className={`${buttonClass(mode === 'list')} ${compact ? '' : 'flex-1'}`}>
        <List size={14} /><span>Danh sách</span>
      </button>
      <button type="button" role="tab" aria-selected={mode === 'flashcard'} onClick={() => onModeChange('flashcard')} className={`${buttonClass(mode === 'flashcard')} ${compact ? '' : 'flex-1'}`}>
        <Layers3 size={14} /><span>Thẻ</span>
      </button>
    </div>
  );
}
