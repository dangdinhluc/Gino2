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
    <div className="flex items-center gap-2.5 w-full">
      {/* Search Input Field */}
      <label className="flex h-12 flex-1 items-center gap-3 rounded-[16px] border border-[#e4d8c8] bg-white px-4 text-sm text-[#5f6b7c] shadow-2xs transition-colors focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20">
        <Search size={19} className="shrink-0 text-[#95a0af]" aria-hidden="true" />
        <span className="sr-only">Tìm tài liệu</span>
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm tài liệu..."
          className="min-w-0 flex-1 bg-transparent py-2 text-sm font-semibold text-[#172033] outline-none placeholder:text-[#95a0af] placeholder:font-normal"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[#95a0af] transition-colors hover:bg-gray-200 hover:text-[#172033]"
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
        className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-95 ${
          isFilterActive
            ? 'border-[#d83a00] bg-orange-50 text-[#d83a00] shadow-2xs'
            : 'border-[#e4d8c8] bg-white text-orange-600 hover:bg-orange-50/50 shadow-2xs'
        }`}
      >
        <SlidersHorizontal size={19} strokeWidth={2.2} />
        {isFilterActive && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-[#d83a00] ring-2 ring-white" />
        )}
      </button>
    </div>
  );
}
