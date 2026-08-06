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
      className="no-scrollbar flex touch-pan-x gap-2 overflow-x-auto py-1 w-full"
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
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
              isActive
                ? 'border-[#d83a00] bg-[#d83a00] text-white shadow-2xs'
                : 'border-[#e4d8c8] bg-white text-[#475467] hover:border-orange-300 hover:text-[#d83a00]'
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-extrabold ${
                isActive ? 'bg-white/25 text-white' : 'bg-orange-50 text-[#d83a00]'
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
