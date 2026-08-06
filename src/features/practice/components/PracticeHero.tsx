import React from 'react';
import { ArrowRight, Flame } from 'lucide-react';
import { assetPath } from '@/src/shared/lib/assets';

interface PracticeHeroProps {
  onStart?: () => void;
}

export function PracticeHero({ onStart }: PracticeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#f3ddc5] bg-[#fff4e8] px-5 py-5 shadow-[0_12px_28px_rgba(145,76,20,0.08)] sm:px-7 sm:py-6">
      <div className="pointer-events-none absolute -left-7 -top-10 h-32 w-32 rounded-full bg-[#ffe0bc]/75 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute right-10 top-0 h-20 w-20 rounded-full bg-[#fffaf2]" aria-hidden="true" />

      <div className="relative flex items-center gap-3 sm:gap-6">
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f6c995] bg-white/70 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#c84b16]">
            <Flame size={12} aria-hidden="true" />
            Hôm nay
          </div>
          <h1 className="mt-2 font-[var(--font-heading)] text-[1.55rem] font-extrabold tracking-[-0.035em] text-[#172033] sm:text-3xl">
            Luyện một chút,<br />nhớ thật lâu.
          </h1>
          <p className="mt-1.5 max-w-md text-xs font-medium leading-relaxed text-[#5f6b7c] sm:text-sm">
            Chọn bài ngắn phù hợp để biến từ vựng và mẫu câu thành phản xạ khi đi làm.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#d94a13] px-3.5 text-xs font-extrabold text-white shadow-[0_5px_0_#ad3309] transition hover:bg-[#c9400d] active:translate-y-[2px] active:shadow-[0_3px_0_#ad3309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d94a13] focus-visible:ring-offset-2"
          >
            Bắt đầu bài đề xuất
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>

        <img
          src={assetPath('assets/practice-icons/hero-workbook.webp')}
          alt="Sách bài tập, mục tiêu và bút chì"
          className="w-[42%] max-w-[270px] shrink-0 object-contain sm:w-[38%]"
        />
      </div>
    </section>
  );
}
