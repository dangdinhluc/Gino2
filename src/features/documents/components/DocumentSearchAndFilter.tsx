import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface DocumentSearchAndFilterProps {
  query: string;
  onQueryChange: (query: string) => void;
  onToggleFilter?: () => void;
  isFilterActive?: boolean;
}

export function DocumentSearchAndFilter({
  query,
  onQueryChange,
  onToggleFilter,
  isFilterActive = false,
}: DocumentSearchAndFilterProps) {
  return (
    <div className="flex w-full items-center gap-2">
      {/* Search Input Field */}
      <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-[16px] border border-[#e8e3f2] bg-white px-4 text-sm text-[#858091] shadow-2xs transition-colors focus-within:border-[#6f45d8] focus-within:ring-2 focus-within:ring-[#6f45d8]/15">
        <Search size={19} className="shrink-0 text-[#858091]" aria-hidden="true" />
        <span className="sr-only">Tìm tài liệu</span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm tài liệu, bài đọc, hướng dẫn..."
          className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-[#252333] outline-none placeholder:font-normal placeholder:text-[#858091]"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#f3efff] text-[#6f45d8] transition-colors hover:bg-[#e8e3f2] hover:text-[#5f37c6]"
            aria-label="Xóa tìm kiếm"
          >
            <X size={14} />
          </button>
        )}
      </label>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onToggleFilter}
        aria-label="Mở bộ lọc tài liệu"
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8] active:scale-95 ${
          isFilterActive
            ? 'border-[#6f45d8] bg-[#f3efff] text-[#6f45d8] shadow-2xs'
            : 'border-[#e8e3f2] bg-white text-[#6f45d8] shadow-2xs hover:bg-[#f3efff]'
        }`}
      >
        <SlidersHorizontal size={19} strokeWidth={2.2} />
        {isFilterActive && (
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-[#6f45d8] ring-2 ring-white" />
        )}
      </button>
    </div>
  );
}
