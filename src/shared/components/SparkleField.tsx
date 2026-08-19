/**
 * Lớp ngôi sao lấp lánh ✦ dùng chung cho hero (Dashboard, Landing).
 * Tự đặt `position: relative` cho container cha và để lớp này phủ `inset: 0`.
 */
import type { CSSProperties } from 'react';

const sparkles = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 59) % 100}%`,
  top: `${(i * 37) % 100}%`,
  size: 8 + ((i * 17) % 12),
  delay: `${-((i * 41) % 18) / 4}s`,
  duration: `${2.4 + ((i * 19) % 16) / 10}s`,
  color: ['#f6a05a', '#fbbf24', '#fda4af', '#f97316'][i % 4],
}));

export function SparkleField({ className = '' }: { className?: string }) {
  return (
    <div className={`anime-sparkle-layer ${className}`} aria-hidden="true">
      {sparkles.map((s, i) => (
        <span
          key={`sparkle-${i}`}
          className="anime-sparkle"
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
            animationDuration: s.duration,
            '--sparkle-color': s.color,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
