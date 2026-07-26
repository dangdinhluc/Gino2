/**
 * SRS engine — thuật toán lặp lại ngắt quãng kiểu Anki (SM-2 cải tiến).
 *
 * Thẻ mới đi qua các "learning steps" tính bằng phút, sau đó "tốt nghiệp"
 * sang phase review với interval tính bằng ngày. Mỗi lần chấm:
 *   - Quên (again): quay lại học lại, interval giảm mạnh, ease -0.20
 *   - Khó (hard):   interval x1.2, ease -0.15
 *   - Nhớ (good):   interval x ease
 *   - Rất nhớ (easy): interval x ease x 1.3, ease +0.15
 *
 * Toàn bộ hàm là pure function (nhận `now` từ ngoài) để dễ test.
 */

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';
export type SrsPhase = 'new' | 'learning' | 'review' | 'relearning';

export interface SrsCardState {
  phase: SrsPhase;
  /** Vị trí trong learning/relearning steps */
  stepIndex: number;
  /** Hệ số dễ (ease factor), khởi đầu 2.5, sàn 1.3 */
  ease: number;
  /** Interval hiện tại (ngày) — chỉ có nghĩa ở phase review */
  intervalDays: number;
  /** Thời điểm tới hạn (epoch ms) */
  due: number;
  /** Số lần trả lời thành công */
  reps: number;
  /** Số lần quên khi đang review */
  lapses: number;
  lastReviewedAt: number | null;
}

export const SRS_CONFIG = {
  learningStepsMinutes: [1, 10],
  relearningStepsMinutes: [10],
  graduatingIntervalDays: 1,
  easyIntervalDays: 4,
  startingEase: 2.5,
  minEase: 1.3,
  easeAgainDelta: -0.2,
  easeHardDelta: -0.15,
  easeEasyDelta: 0.15,
  hardIntervalMultiplier: 1.2,
  easyBonus: 1.3,
  lapseIntervalMultiplier: 0.5,
  maxIntervalDays: 365,
} as const;

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

export function createNewCardState(now: number = Date.now()): SrsCardState {
  return {
    phase: 'new',
    stepIndex: 0,
    ease: SRS_CONFIG.startingEase,
    intervalDays: 0,
    due: now,
    reps: 0,
    lapses: 0,
    lastReviewedAt: null,
  };
}

/** Đầu ngày (00:00 local) của một thời điểm. */
export function startOfDay(timestamp: number): number {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

/** Cuối ngày (23:59:59.999 local). */
export function endOfDay(timestamp: number): number {
  return startOfDay(timestamp) + DAY_MS - 1;
}

function clampEase(ease: number): number {
  return Math.max(SRS_CONFIG.minEase, Math.round(ease * 100) / 100);
}

function clampInterval(days: number): number {
  return Math.min(SRS_CONFIG.maxIntervalDays, Math.max(1, Math.round(days)));
}

/** Due cho thẻ review: đầu ngày thứ `intervalDays` kể từ hôm nay. */
function reviewDue(now: number, intervalDays: number): number {
  return startOfDay(now) + intervalDays * DAY_MS;
}

/**
 * Chấm một thẻ. Trả về state mới (không mutate state cũ).
 */
export function rateCard(state: SrsCardState, rating: SrsRating, now: number = Date.now()): SrsCardState {
  const next: SrsCardState = { ...state, lastReviewedAt: now };

  if (state.phase === 'new' || state.phase === 'learning') {
    const steps = SRS_CONFIG.learningStepsMinutes;
    if (rating === 'again') {
      next.phase = 'learning';
      next.stepIndex = 0;
      next.due = now + steps[0] * MINUTE_MS;
      return next;
    }
    if (rating === 'easy') {
      // Nhảy thẳng sang review với easy interval
      next.phase = 'review';
      next.stepIndex = 0;
      next.intervalDays = SRS_CONFIG.easyIntervalDays;
      next.due = reviewDue(now, next.intervalDays);
      next.reps = state.reps + 1;
      return next;
    }
    // hard: lặp lại step hiện tại; good: sang step kế / tốt nghiệp
    const currentStep = state.phase === 'new' ? 0 : state.stepIndex;
    const targetStep = rating === 'hard' ? currentStep : currentStep + 1;
    if (targetStep >= steps.length) {
      next.phase = 'review';
      next.stepIndex = 0;
      next.intervalDays = SRS_CONFIG.graduatingIntervalDays;
      next.due = reviewDue(now, next.intervalDays);
      next.reps = state.reps + 1;
      return next;
    }
    next.phase = 'learning';
    next.stepIndex = targetStep;
    next.due = now + steps[targetStep] * MINUTE_MS;
    return next;
  }

  if (state.phase === 'relearning') {
    const steps = SRS_CONFIG.relearningStepsMinutes;
    if (rating === 'again') {
      next.stepIndex = 0;
      next.due = now + steps[0] * MINUTE_MS;
      return next;
    }
    const targetStep = rating === 'hard' ? state.stepIndex : state.stepIndex + 1;
    if (rating === 'easy' || targetStep >= steps.length) {
      next.phase = 'review';
      next.stepIndex = 0;
      next.intervalDays = clampInterval(state.intervalDays);
      next.due = reviewDue(now, next.intervalDays);
      next.reps = state.reps + 1;
      return next;
    }
    next.stepIndex = targetStep;
    next.due = now + steps[targetStep] * MINUTE_MS;
    return next;
  }

  // phase === 'review'
  if (rating === 'again') {
    next.phase = 'relearning';
    next.stepIndex = 0;
    next.lapses = state.lapses + 1;
    next.ease = clampEase(state.ease + SRS_CONFIG.easeAgainDelta);
    next.intervalDays = clampInterval(state.intervalDays * SRS_CONFIG.lapseIntervalMultiplier);
    next.due = now + SRS_CONFIG.relearningStepsMinutes[0] * MINUTE_MS;
    return next;
  }

  let interval: number;
  if (rating === 'hard') {
    next.ease = clampEase(state.ease + SRS_CONFIG.easeHardDelta);
    interval = state.intervalDays * SRS_CONFIG.hardIntervalMultiplier;
  } else if (rating === 'good') {
    interval = state.intervalDays * state.ease;
  } else {
    next.ease = clampEase(state.ease + SRS_CONFIG.easeEasyDelta);
    interval = state.intervalDays * state.ease * SRS_CONFIG.easyBonus;
  }

  next.intervalDays = clampInterval(interval);
  next.due = reviewDue(now, next.intervalDays);
  next.reps = state.reps + 1;
  return next;
}

/** Thẻ có tới hạn ôn tại thời điểm `now` không? */
export function isDue(state: SrsCardState, now: number = Date.now()): boolean {
  if (state.phase === 'new') return false;
  if (state.phase === 'review') return state.due <= endOfDay(now);
  return state.due <= now;
}

function formatIntervalDays(days: number): string {
  if (days >= 30) {
    const months = Math.round((days / 30) * 10) / 10;
    return `${months % 1 === 0 ? months.toFixed(0) : months.toFixed(1)} th`;
  }
  return `${Math.round(days)} ng`;
}

/**
 * Preview interval hiển thị trên 4 nút chấm (giống Anki).
 * Ví dụ: { again: '1 p', hard: '10 p', good: '1 ng', easy: '4 ng' }
 */
export function previewIntervals(state: SrsCardState): Record<SrsRating, string> {
  const minuteLabel = (minutes: number) => `${minutes} p`;

  if (state.phase === 'new' || state.phase === 'learning') {
    const steps = SRS_CONFIG.learningStepsMinutes;
    const currentStep = state.phase === 'new' ? 0 : state.stepIndex;
    const nextStep = currentStep + 1;
    return {
      again: minuteLabel(steps[0]),
      hard: minuteLabel(steps[currentStep]),
      good: nextStep >= steps.length ? formatIntervalDays(SRS_CONFIG.graduatingIntervalDays) : minuteLabel(steps[nextStep]),
      easy: formatIntervalDays(SRS_CONFIG.easyIntervalDays),
    };
  }

  if (state.phase === 'relearning') {
    const steps = SRS_CONFIG.relearningStepsMinutes;
    return {
      again: minuteLabel(steps[0]),
      hard: minuteLabel(steps[state.stepIndex]),
      good: formatIntervalDays(clampInterval(state.intervalDays)),
      easy: formatIntervalDays(clampInterval(state.intervalDays)),
    };
  }

  return {
    again: minuteLabel(SRS_CONFIG.relearningStepsMinutes[0]),
    hard: formatIntervalDays(clampInterval(state.intervalDays * SRS_CONFIG.hardIntervalMultiplier)),
    good: formatIntervalDays(clampInterval(state.intervalDays * state.ease)),
    easy: formatIntervalDays(clampInterval(state.intervalDays * clampEase(state.ease + SRS_CONFIG.easeEasyDelta) * SRS_CONFIG.easyBonus)),
  };
}

/** Độ "chắc" của thẻ, 0-100, dùng cho progress bar khi duyệt bộ thẻ. */
export function cardStrength(state: SrsCardState | undefined): number {
  if (!state || state.phase === 'new') return 0;
  if (state.phase === 'learning') return 15 + state.stepIndex * 15;
  if (state.phase === 'relearning') return 35;
  // review: interval càng dài càng chắc (21 ngày ≈ trưởng thành)
  return Math.min(100, 40 + Math.round((state.intervalDays / 21) * 60));
}

/** XP thưởng cho một lần chấm. */
export function xpForRating(rating: SrsRating): number {
  if (rating === 'again') return 2;
  if (rating === 'hard') return 5;
  return 10;
}
