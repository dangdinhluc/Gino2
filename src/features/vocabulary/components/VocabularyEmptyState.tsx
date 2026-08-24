import { Search } from 'lucide-react';

interface VocabularyEmptyStateProps {
  onClearSearch?: () => void;
}

export function VocabularyEmptyState({ onClearSearch }: VocabularyEmptyStateProps) {
  return (
    <div className="my-4 flex flex-col items-center justify-center rounded-[20px] border border-dashed border-[#e8e3f2] bg-white p-8 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efff] text-[#7655d9]">
        <Search size={26} strokeWidth={1.8} />
      </div>
      <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#172033]">
        Không tìm thấy từ phù hợp
      </h3>
      <p className="mt-1 max-w-xs text-xs text-[#717d8f]">
        Thử tìm bằng Kanji, cách đọc hoặc nghĩa tiếng Việt.
      </p>
      {onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#efeaff] px-4 py-2 text-xs font-bold text-[#6f45d8] transition-colors hover:bg-[#e4dbf8]"
        >
          Xóa tìm kiếm
        </button>
      )}
    </div>
  );
}
