import React from 'react';
import { Gamepad2, Sparkles, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { assetPath } from '@/src/shared/lib/assets';

export function GameHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[26px] border border-[#fce2ce] bg-gradient-to-br from-[#fffdf9] via-[#fff4e8] to-[#ffead6] p-5 shadow-[0_8px_24px_rgba(217,74,19,0.06)] md:p-6">
      {/* Background Japanese Watermarks & Decorative Elements */}
      <div className="pointer-events-none absolute -right-6 -top-8 h-40 w-40 rounded-full bg-gradient-to-br from-orange-200/50 to-amber-100/30 blur-2xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -left-8 -bottom-10 h-36 w-36 rounded-full bg-orange-100/40 blur-xl" aria-hidden="true" />
      
      <div 
        className="pointer-events-none absolute left-5 top-2 select-none text-4xl font-black text-[#f7c297]/15 md:text-5xl"
        aria-hidden="true"
      >
        語
      </div>
      <div 
        className="pointer-events-none absolute left-1/3 bottom-2 select-none text-3xl font-black text-[#f7c297]/20 md:text-4xl"
        aria-hidden="true"
      >
        本
      </div>

      <div className="relative flex items-center justify-between gap-4">
        {/* Left Content */}
        <div className="min-w-0 flex-1 z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-orange-200/80 bg-white/80 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#d94a13] shadow-2xs backdrop-blur-xs">
            <Sparkles size={11} className="animate-pulse" aria-hidden="true" /> Mini Games
          </div>

          <div className="mt-1.5 flex items-center gap-2">
            <h1 className="font-[var(--font-heading)] text-2xl font-extrabold tracking-[-0.03em] text-[#172033] sm:text-3xl">
              Game luyện nhanh
            </h1>
            <motion.span 
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-[#d94a13] to-[#f27427] text-white shadow-xs"
            >
              <Gamepad2 size={16} />
            </motion.span>
          </div>

          <p className="mt-1.5 max-w-[240px] text-xs font-medium leading-relaxed text-[#5f6b7c] sm:max-w-sm sm:text-sm">
            Ôn từ vựng và phản xạ bằng các mini game tương tác vui nhộn.
          </p>
        </div>

        {/* Mascot / Tanuki Illustration with Animation */}
        <div className="relative shrink-0 z-10">
          {/* Glowing Aura Behind Mascot */}
          <div className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-amber-300/40 via-orange-300/50 to-orange-400/30 blur-xl animate-pulse" />

          {/* Floating Sparkles around Tanuki */}
          <motion.div
            animate={{ y: [-3, 3, -3], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="pointer-events-none absolute -left-3 top-2 text-amber-500"
          >
            <Sparkles size={16} />
          </motion.div>
          
          <motion.div
            animate={{ y: [3, -3, 3], scale: [0.9, 1.1, 0.9] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="pointer-events-none absolute -right-2 top-0 text-amber-600"
          >
            <Trophy size={14} />
          </motion.div>

          {/* Animated Tanuki Mascot */}
          <motion.div
            animate={{ 
              y: [0, -7, 0],
              rotate: [0, 1.5, -1.5, 0],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 3.5, 
              ease: "easeInOut" 
            }}
            whileHover={{ scale: 1.08, rotate: 3 }}
            className="cursor-pointer"
          >
            <img
              src={assetPath('assets/mascot_tanuki.png')}
              alt="Tanuki Mascot với Cúp Chiến Thắng"
              className="h-28 w-auto object-contain drop-shadow-[0_8px_16px_rgba(217,74,19,0.18)] sm:h-32"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
