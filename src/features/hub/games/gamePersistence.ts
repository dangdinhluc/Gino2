const BEST_KEY = (gameId: string): string => `tokutei.hub.best.${gameId}`;

export function readBestScore(gameId: string): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(BEST_KEY(gameId));
    if (!raw) return null;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeBestScore(gameId: string, score: number): number {
  if (typeof window === 'undefined') return score;
  try {
    const previous = readBestScore(gameId);
    if (previous === null || score > previous) {
      window.localStorage.setItem(BEST_KEY(gameId), String(score));
      return score;
    }
    return previous;
  } catch {
    return score;
  }
}

export function shuffle<T>(items: readonly T[]): T[] {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
