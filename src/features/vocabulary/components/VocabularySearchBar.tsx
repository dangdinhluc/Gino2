import React from 'react';
import { Search, X } from 'lucide-react';

interface VocabularySearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export function VocabularySearchBar({ query, onQueryChange }: VocabularySearchBarProps) {
  return (
    <label className="flex h-12 w-full items-center gap-3 rounded-[16px] border border-[#e4d8c8] bg-white px-4 text-sm text-[#5f6b7c] shadow-2xs transition-colors focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-400/20">
      <Search size={19} className="shrink-0 text-[#95a0af]" aria-hidden="true" />
      <span className="sr-only">Tìm từ vựng</span>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm từ, cách đọc hoặc nghĩa…"
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
  );
}
