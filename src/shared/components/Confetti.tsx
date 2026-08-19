const confettiPieces = Array.from({ length: 22 }, (_, index) => ({
  left: `${(index * 47) % 100}%`,
  delay: `${-((index * 137) % 30) / 10}s`,
  duration: `${2.2 + ((index * 53) % 14) / 10}s`,
  size: 6 + ((index * 29) % 7),
  color: ['#d83a00', '#f26522', '#ffc53d', '#34d399', '#f472b6'][index % 5],
}));

/** Confetti rơi khi hoàn thành phiên học. Tôn trọng prefers-reduced-motion qua CSS. */
export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {confettiPieces.map((piece, index) => (
        <span
          key={index}
          className="gino-confetti-piece"
          style={{
            left: piece.left,
            width: piece.size,
            height: piece.size * 1.6,
            backgroundColor: piece.color,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}
