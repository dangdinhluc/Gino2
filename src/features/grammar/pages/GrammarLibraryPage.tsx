import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { GRAMMAR } from '@/src/features/grammar/mock/grammar';
import { BookOpen, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function GrammarLibrary() {
  const levels = ['Tất cả', ...Array.from(new Set(GRAMMAR.map((item) => item.level)))];
  const [activeLevel, setActiveLevel] = useState('Tất cả');
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return GRAMMAR.filter((item) => {
      const matchesLevel = activeLevel === 'Tất cả' || item.level === activeLevel;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.level.toLowerCase().includes(normalizedQuery);

      return matchesLevel && matchesQuery;
    });
  }, [activeLevel, query]);

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 pb-16">
      <header className="space-y-1">
        <h2 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033]">
          Từ vựng của tôi
        </h2>
        <p className="text-sm text-[#5f6b7c]">
          {filteredItems.length} mục
          {activeLevel !== 'Tất cả' ? ` · cấp độ ${activeLevel}` : ''}
        </p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#95a0af]" size={17} />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo tên, chủ điểm hoặc cấp độ"
            className="w-full rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 pl-10 pr-3 text-sm text-[#172033] outline-none transition-colors placeholder:text-[#95a0af] focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-500/25"
          />
        </div>

        {/* Mot hang chip duy nhat, cuon ngang tren dien thoai. Truoc day dien thoai
            phai mo mot sheet loc rieng dai gan 90 dong cho cung viec nay. */}
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-0.5">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              aria-pressed={activeLevel === level}
              className={cn(
                'shrink-0 rounded-xl border px-3 py-1.5 text-sm transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]',
                activeLevel === level
                  ? 'border-orange-300 bg-orange-50 font-bold text-orange-700'
                  : 'border-[#e8dccb] bg-[#fffdf8] text-[#5f6b7c] hover:text-[#172033]'
              )}
            >
              {level === 'Tất cả' ? level : `Cấp độ ${level}`}
            </button>
          ))}
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-4 py-10 text-center text-sm text-[#5f6b7c]">
          Không có mục nào khớp với tìm kiếm.
        </p>
      ) : (
        <ul className="divide-y divide-[#efe5d7] overflow-hidden rounded-2xl border border-[#e8dccb] bg-[#fffaf3]">
          {filteredItems.map((item) => (
            <li key={item.id}>
              <Link
                to={`/app/grammar/${item.id}`}
                className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fffdf8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <BookOpen size={17} strokeWidth={1.8} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-[#172033]">{item.title}</span>
                  <span className="mt-0.5 block truncate text-xs text-[#7b8796]">
                    {item.category} · Cấp độ {item.level}
                  </span>
                </span>

                <ChevronRight
                  size={17}
                  className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
