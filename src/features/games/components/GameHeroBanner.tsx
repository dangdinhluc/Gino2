import React from 'react';
import { Gamepad2 } from 'lucide-react';
import { assetPath } from '@/src/shared/lib/assets';

export function GameHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[#fde6d2] bg-gradient-to-r from-[#fff9f3] via-[#fff5eb] to-[#ffeedd] p-5 md:p-6 shadow-sm">
      {/* Decorative Japanese kanji watermark */}
      <div 
        className="pointer-events-none absolute left-4 top-2 select-none text-4xl font-extrabold text-[#f7c297]/20 md:text-5xl"
        aria-hidden="true"
      >
        語
      </div>
      <div 
        className="pointer-events-none absolute right-24 bottom-2 select-none text-3xl font-bold text-[#f7c297]/25 md:text-4xl"
        aria-hidden="true"
      >
        本
      </div>

      {/* Confetti & Japanese Torii accent elements */}
      <div className="pointer-events-none absolute right-32 top-3 text-xs opacity-60" aria-hidden="true">
        ⛩️
      </div>
      <div className="pointer-events-none absolute left-1/2 top-4 text-xs opacity-50" aria-hidden="true">
        ✨
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 z-10">
          <div className="flex items-center gap-1.5">
            <h1 className="font-[var(--font-heading)] text-xl font-extrabold tracking-[-0.02em] text-[#172033] sm:text-2xl">
              Game luyện nhanh
            </h1>
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500 text-white shadow-xs">
              <Gamepad2 size={14} />
            </span>
          </div>

          <p className="mt-1.5 max-w-[240px] text-xs leading-relaxed text-[#5f6b7c] sm:max-w-sm sm:text-sm">
            Ôn từ vựng và phản xạ bằng các mini game thú vị.
          </p>
        </div>

        {/* Mascot / Illustration */}
        <div className="relative shrink-0">
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-orange-200/40 blur-xl" />
          <img
            src={assetPath('assets/mascot_tanuki.png')}
            alt="Mascot Tanuki"
            className="h-24 w-auto object-contain transition-transform duration-300 hover:scale-105 sm:h-28"
          />
        </div>
      </div>
    </section>
  );
}
