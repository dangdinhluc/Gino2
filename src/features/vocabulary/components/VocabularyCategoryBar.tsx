import { useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';

export interface CategoryOption {
  id: string;
  label: string;
  count: number;
}

interface VocabularyCategoryBarProps {
  categories: CategoryOption[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function VocabularyCategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: VocabularyCategoryBarProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [categories]);

  const handleScrollRight = () => {
    scrollRef.current?.scrollBy({ left: 160, behavior: 'smooth' });
  };

  return (
    <div className="relative flex items-center w-full">
      {/* Category Chips Container */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="no-scrollbar flex w-full touch-pan-x gap-2 overflow-x-auto py-1 pr-12"
        role="group"
        aria-label="Danh mục từ vựng"
      >
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              aria-pressed={isActive}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1 rounded-full border px-3 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d70dc] ${
                isActive
                  ? 'border-[#6f45d8] bg-[#6f45d8] text-white shadow-2xs'
                  : 'border-[#e8e3f2] bg-[#f8f7fc] text-[#4e4c5a] hover:border-[#cfc3ea] hover:bg-white hover:text-[#6f45d8]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-[#efeaff] text-[#6f45d8]'
                }`}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Fade Gradient on Right Edge */}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-8 top-0 bottom-0 w-8 bg-gradient-to-l from-white/90 to-transparent" />
      )}

      {/* Right Scroll Arrow Button */}
      {canScrollRight && (
        <button
          type="button"
          onClick={handleScrollRight}
          aria-label="Cuộn sang phải xem thêm danh mục"
          className="absolute right-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e3f2] bg-white/95 text-[#6f45d8] shadow-xs transition-all hover:bg-[#f5f0ff] active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
