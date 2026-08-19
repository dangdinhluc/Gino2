import type { CSSProperties } from 'react';

/**
 * Nền huyền ảo kiểu anime cho toàn app:
 * - Các khối màu sakura/cam dịu trôi chậm (bokeh / bầu trời hoàng hôn)
 * - Hạt ánh sáng bay lên như đom đóm
 *
 * Chỉ dùng transform/opacity (GPU-friendly), pointer-events: none,
 * tôn trọng prefers-reduced-motion qua CSS.
 */

const motes = Array.from({ length: 16 }, (_, i) => ({
  left: `${(i * 53) % 100}%`,
  top: `${18 + ((i * 37) % 80)}%`,
  size: 3 + ((i * 17) % 5),
  drift: 24 + ((i * 31) % 56),
  delay: `${-((i * 61) % 20) / 4}s`,
  duration: `${9 + ((i * 23) % 10)}s`,
  hue: ['#ffd7dd', '#ffe0c0', '#fff0d8', '#ffc9a3'][i % 4],
}));

export function AnimeBackdrop() {
  return (
    <div className="anime-backdrop" aria-hidden="true">
      <div className="anime-blob anime-blob-a" />
      <div className="anime-blob anime-blob-b" />
      <div className="anime-blob anime-blob-c" />

      {motes.map((m, i) => (
        <span
          key={`mote-${i}`}
          className="anime-mote"
          style={
            {
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              background: m.hue,
              animationDelay: m.delay,
              animationDuration: m.duration,
              '--drift': `${m.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
