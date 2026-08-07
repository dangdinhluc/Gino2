import React, { useRef, useState, useEffect } from 'react';
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
        className="no-scrollbar flex touch-pan-x gap-2 overflow-x-auto py-1 pr-10 w-full"
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
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                isActive
                  ? 'border-[#d83a00] bg-[#d83a00] text-white shadow-2xs'
                  : 'border-[#e4d8c8] bg-white text-[#475467] hover:border-orange-300 hover:text-[#d83a00]'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-extrabold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-orange-50 text-[#d83a00]'
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
          className="absolute right-0 flex h-8 w-8 items-center justify-center rounded-full border border-[#e4d8c8] bg-white/95 text-orange-600 shadow-xs transition-all hover:bg-orange-50 active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
}
