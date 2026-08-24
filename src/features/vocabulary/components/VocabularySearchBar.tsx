import { Search, X } from 'lucide-react';

interface VocabularySearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  compact?: boolean;
}

export function VocabularySearchBar({ query, onQueryChange, compact = true }: VocabularySearchBarProps) {
  return (
    <label className={`flex w-full items-center gap-2 rounded-xl border border-[#e8e3f2] bg-[#f8f7fc] px-3 text-xs text-[#858091] shadow-2xs transition-colors focus-within:border-[#8d70dc] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#8d70dc]/20 ${
      compact ? 'h-11' : 'h-11'
    }`}>
      <Search size={16} className="shrink-0 text-[#7655d9]" aria-hidden="true" />
      <span className="sr-only">Tìm từ vựng</span>
      <input
        type="search"
        aria-label="Tìm từ vựng"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Tìm từ, cách đọc hoặc nghĩa…"
        className="min-w-0 flex-1 bg-transparent py-1.5 text-xs font-semibold text-[#252333] outline-none placeholder:font-normal placeholder:text-[#858091]"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#eee9fa] text-[#7655d9] transition-colors hover:bg-[#e4dbf8] hover:text-[#5f37c6]"
          aria-label="Xóa tìm kiếm"
        >
          <X size={12} />
        </button>
      )}
    </label>
  );
}
