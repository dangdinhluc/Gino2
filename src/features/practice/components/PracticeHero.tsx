import React from 'react';
import { Target } from 'lucide-react';

export function PracticeHero() {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 shadow-2xs sm:p-6">
      {/* Background Watermark */}
      <div
        className="pointer-events-none absolute left-4 top-2 select-none text-4xl font-extrabold text-[#f7c297]/20"
        aria-hidden="true"
      >
        練
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-[var(--font-heading)] text-xl font-extrabold tracking-[-0.02em] text-[#172033] sm:text-2xl">
              Luyện tập
            </h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs">
              <Target size={14} />
            </span>
          </div>
          <p className="text-xs font-semibold text-[#5f6b7c] sm:text-sm">
            Củng cố kiến thức bằng các bài luyện ngắn mỗi ngày.
          </p>
          <p className="text-[11px] font-medium text-orange-600">
            Luyện đều mỗi ngày để ghi nhớ lâu hơn.
          </p>
        </div>

        {/* Right Illustration */}
        <div className="relative shrink-0">
          <img
            src="/assets/practice_target.png"
            alt="Practice Target Illustration"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-24"
          />
        </div>
      </div>
    </section>
  );
}
