interface CourseCategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CourseCategoryFilter({ categories, activeCategory, onSelect }: CourseCategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar" role="list" aria-label="Lọc danh mục khóa học">
      {categories.map((category) => {
        const active = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            aria-pressed={active}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7041dc] ${active ? 'border-[#7041dc] bg-[#7041dc] text-white' : 'border-[#e1d9ed] bg-white text-[#81798e] hover:border-[#bca8e9] hover:text-[#7041dc]'}`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
