import React from 'react';
import { BookOpen } from 'lucide-react';

interface DocumentHeroProps {
  totalCount: number;
}

export function DocumentHero({ totalCount }: DocumentHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 shadow-2xs sm:p-6">
      {/* Background Japanese Watermark */}
      <div
        className="pointer-events-none absolute left-4 top-2 select-none text-4xl font-extrabold text-[#f7c297]/20"
        aria-hidden="true"
      >
        書
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-[var(--font-heading)] text-xl font-extrabold tracking-[-0.02em] text-[#172033] sm:text-2xl">
              Tài liệu
            </h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs">
              <BookOpen size={14} />
            </span>
          </div>
          <p className="text-xs font-semibold text-[#5f6b7c] sm:text-sm">
            {totalCount} tài liệu học tập & hướng dẫn
          </p>
        </div>

        {/* Right Illustration */}
        <div className="relative shrink-0">
          <img
            src="/assets/game-icons/icon_books.png"
            alt="Document Books Illustration"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-24"
          />
        </div>
      </div>
    </section>
  );
}
