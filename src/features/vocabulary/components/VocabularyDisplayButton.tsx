import { cn } from '@/src/lib/utils';

interface VocabularyDisplayButtonProps {
  onClick: () => void;
}

export function VocabularyDisplayButton({ onClick }: VocabularyDisplayButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Cài đặt hiển thị từ vựng"
      title="Cài đặt hiển thị từ vựng"
      className={cn(
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dcd1f4] bg-[#f5f0ff] text-[13px] font-black text-[#6f45d8] transition-colors hover:bg-[#eee7ff]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
      )}
    >
      Aa
    </button>
  );
}
