import React from 'react';
import { Search, X } from 'lucide-react';

interface VocabularySearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  compact?: boolean;
}

export function VocabularySearchBar({ query, onQueryChange, compact = true }: VocabularySearchBarProps) {
  return (
    <label className={`flex w-full items-center gap-2 rounded-xl border border-[#e4d8c8] bg-[#fffaf5] px-3 text-xs text-[#5f6b7c] shadow-2xs transition-colors focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/20 ${
      compact ? 'h-9' : 'h-11'
    }`}>
      <Search size={16} className="shrink-0 text-[#8c98a8]" aria-hidden="true" />
      <span className="sr-only">Tìm từ vựng</span>
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm từ, cách đọc hoặc nghĩa…"
        className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-semibold text-[#172033] outline-none placeholder:text-[#8c98a8] placeholder:font-normal"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[#8c98a8] transition-colors hover:bg-gray-200 hover:text-[#172033]"
          aria-label="Xóa tìm kiếm"
        >
          <X size={12} />
        </button>
      )}
    </label>
  );
}
