import React from 'react';
import { Headphones } from 'lucide-react';

interface FloatingAudioButtonProps {
  onClick?: () => void;
}

export function FloatingAudioButton({ onClick }: FloatingAudioButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Hỗ trợ & âm thanh"
      className="fixed bottom-20 right-4 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-r from-[#d83a00] to-[#e65100] text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:bottom-22 sm:right-6 md:bottom-8"
    >
      <Headphones size={24} strokeWidth={2.2} />
    </button>
  );
}
