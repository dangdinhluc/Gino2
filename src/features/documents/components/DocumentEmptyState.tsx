import React from 'react';
import { BookOpen } from 'lucide-react';

interface DocumentEmptyStateProps {
  onClearSearch?: () => void;
}

export function DocumentEmptyState({ onClearSearch }: DocumentEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-[#e4d8c8] bg-white p-8 text-center my-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-3">
        <BookOpen size={26} strokeWidth={1.8} />
      </div>
      <h3 className="font-[var(--font-heading)] text-base font-extrabold text-[#172033]">
        Không tìm thấy tài liệu
      </h3>
      <p className="mt-1 max-w-xs text-xs text-[#717d8f]">
        Thử thay đổi từ khóa hoặc chọn bộ lọc danh mục khác.
      </p>
      {onClearSearch && (
        <button
          type="button"
          onClick={onClearSearch}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700 transition-colors hover:bg-orange-200"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
}
