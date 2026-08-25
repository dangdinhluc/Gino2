import React from 'react';
import { BookOpen } from 'lucide-react';

interface DocumentEmptyStateProps {
  onClearSearch?: () => void;
}

export function DocumentEmptyState({ onClearSearch }: DocumentEmptyStateProps) {
  return (
    <div className="my-4 flex flex-col items-center justify-center rounded-[18px] border border-dashed border-[#e8e3f2] bg-white p-8 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3efff] text-[#6f45d8]">
        <BookOpen size={26} strokeWidth={1.8} />
      </div>
      <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#252333]">
        Không tìm thấy tài liệu
      </h3>
      <p className="mt-1 max-w-xs text-xs text-[#858091]">
        Thử thay đổi từ khóa hoặc chọn bộ lọc danh mục khác.
      </p>
      {onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#f3efff] px-4 py-2 text-xs font-bold text-[#6f45d8] transition-colors hover:bg-[#e8e3f2]"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
