import React from 'react';

export interface DocumentCategoryItem {
  id: string;
  label: string;
  count: number;
}

interface DocumentCategoryBarProps {
  categories: DocumentCategoryItem[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function DocumentCategoryBar({
  categories,
  selectedCategory,
  onSelectCategory,
}: DocumentCategoryBarProps) {
  return (
    <div
      className="no-scrollbar flex w-full touch-pan-x flex-nowrap gap-2 overflow-x-auto py-1"
      role="group"
      aria-label="Phân loại tài liệu"
    >
      {categories.map((cat) => {
        const isActive = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            aria-pressed={isActive}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6f45d8] ${
              isActive
                ? 'border-[#6f45d8] bg-[#6f45d8] text-white shadow-2xs'
                : 'border-[#e8e3f2] bg-white text-[#475467] hover:border-[#b8a5e8] hover:text-[#6f45d8]'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                isActive ? 'bg-white/20 text-white' : 'bg-[#f3efff] text-[#6f45d8]'
              }`}
            >
              {cat.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
