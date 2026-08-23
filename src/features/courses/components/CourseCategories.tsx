interface CourseCategoriesProps {
  categories: string[];
  activeCategory: string;
  onSelect: (category: string) => void;
}

export function CourseCategories({ categories, activeCategory, onSelect }: CourseCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="course-categories-title">
      <h2 id="course-categories-title" className="text-[18px] font-black tracking-[-.025em] text-[#202129]">Danh mục</h2>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar" role="list" aria-label="Danh mục khóa học">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              aria-pressed={active}
              className={`shrink-0 rounded-full border px-4 py-2 text-[10px] font-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6f45d8] ${active ? 'border-[#bca8ee] bg-[#f0ebff] text-[#6840ce]' : 'border-[#e5e1ec] bg-white text-[#6d7079] hover:border-[#cfc3eb]'}`}
            >
              {category}
            </button>
          );
        })}
      </div>
    </section>
  );
}
