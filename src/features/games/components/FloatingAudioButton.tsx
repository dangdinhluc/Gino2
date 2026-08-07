import React from 'react';
import { assetPath } from '@/src/shared/lib/assets';
import { motion } from 'motion/react';

interface FloatingAudioButtonProps {
  onClick?: () => void;
}

export function FloatingAudioButton({ onClick }: FloatingAudioButtonProps) {
  return (
    <div className="fixed bottom-20 right-4 z-40 sm:bottom-22 sm:right-6 md:bottom-8">
      {/* Outer Glow & Pulse Ring */}
      <div className="pointer-events-none absolute -inset-1.5 rounded-[22px] bg-gradient-to-tr from-orange-500/40 to-amber-400/40 blur-sm animate-pulse" />

      {/* Main Floating 3D Button */}
      <motion.button
        type="button"
        onClick={onClick}
        aria-label="Hỗ trợ âm thanh & luyện nghe"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="relative flex h-13 w-13 items-center justify-center rounded-[20px] border border-white/50 bg-gradient-to-tr from-[#d94a13] via-[#e85b19] to-[#fa7728] p-2 text-white shadow-[0_8px_22px_rgba(217,74,19,0.38)] backdrop-blur-xs transition-shadow hover:shadow-[0_12px_28px_rgba(217,74,19,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <img
          src={assetPath('assets/practice-icons/listening.webp')}
          alt="Âm thanh"
          className="h-full w-full object-contain drop-shadow-xs"
        />
      </motion.button>
    </div>
  );
}
