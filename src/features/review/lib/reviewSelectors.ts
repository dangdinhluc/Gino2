/**
 * Selector thuần cho hệ SRS — nhận states + deck + now, trả dữ liệu cho UI.
 * Tách khỏi store để test được trong node và tránh logic lẫn vào component.
 */
import type { TokuteiTopicId, TokuteiVocabCard } from '@/src/data/tokutei/vocabDeck';
import { TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import type { SrsCardState } from '@/src/features/review/lib/srs';
import { endOfDay, isDue, startOfDay } from '@/src/features/review/lib/srs';
import type { ReviewLogEntry } from '@/src/features/review/store/reviewStore';

const DAY_MS = 86_400_000;

export type SessionMode = 'due' | 'new' | 'cram' | `topic:${TokuteiTopicId}`;

export interface DeckCounts {
  total: number;
  newCount: number;
  learning: number;
  review: number;
  dueNow: number;
  /** Số thẻ mới còn được phép học hôm nay (theo newPerDay) */
  newAvailableToday: number;
}

/** Random ổn định theo seed — để thứ tự cram/new không đổi loạn trong một ngày. */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed || 1;
  for (let i = result.length - 1; i > 0; i--) {
    state = (state * 48271) % 2147483647;
    const j = state % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function collectDueCards(
  states: Record<string, SrsCardState>,
  now: number,
  deck: TokuteiVocabCard[] = TOKUTEI_VOCAB,
): TokuteiVocabCard[] {
  const due = deck.filter((card) => {
    const state = states[card.id];
    return state ? isDue(state, now) : false;
  });
  // Thẻ đang học (learning/relearning) lên trước, sau đó theo due sớm nhất
  return due.sort((a, b) => {
    const sa = states[a.id];
    const sb = states[b.id];
    const learnA = sa.phase === 'learning' || sa.phase === 'relearning' ? 0 : 1;
    const learnB = sb.phase === 'learning' || sb.phase === 'relearning' ? 0 : 1;
    if (learnA !== learnB) return learnA - learnB;
    return sa.due - sb.due;
  });
}

export function collectNewCards(
  states: Record<string, SrsCardState>,
  limit: number,
  deck: TokuteiVocabCard[] = TOKUTEI_VOCAB,
): TokuteiVocabCard[] {
  if (limit <= 0) return [];
  const fresh = deck.filter((card) => {
    const state = states[card.id];
    return !state || state.phase === 'new';
  });
  return fresh.slice(0, limit);
}

export function newRemainingToday(
  newPerDay: number,
  newDay: string,
  newIntroducedToday: number,
  now: number,
): number {
  const d = new Date(now);
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const usedToday = newDay === today ? newIntroducedToday : 0;
  return Math.max(0, newPerDay - usedToday);
}

export function buildSessionQueue(
  mode: SessionMode,
  states: Record<string, SrsCardState>,
  now: number,
  newRemaining: number,
  deck: TokuteiVocabCard[] = TOKUTEI_VOCAB,
): TokuteiVocabCard[] {
  if (mode === 'due') {
    const due = collectDueCards(states, now, deck);
    const fillNew = collectNewCards(states, Math.max(0, newRemaining), deck);
    return [...due, ...fillNew];
  }
  if (mode === 'new') {
    return collectNewCards(states, Math.max(0, newRemaining), deck);
  }
  if (mode === 'cram') {
    const daySeed = Math.floor(now / DAY_MS);
    return seededShuffle(deck, daySeed).slice(0, 20);
  }
  const topicId = mode.slice('topic:'.length) as TokuteiTopicId;
  return deck.filter((card) => card.topicId === topicId);
}

export function computeDeckCounts(
  states: Record<string, SrsCardState>,
  now: number,
  newPerDay: number,
  newDay: string,
  newIntroducedToday: number,
  deck: TokuteiVocabCard[] = TOKUTEI_VOCAB,
): DeckCounts {
  let newCount = 0;
  let learning = 0;
  let review = 0;
  let dueNow = 0;
  for (const card of deck) {
    const state = states[card.id];
    if (!state || state.phase === 'new') {
      newCount += 1;
      continue;
    }
    if (state.phase === 'review') review += 1;
    else learning += 1;
    if (isDue(state, now)) dueNow += 1;
  }
  const remaining = newRemainingToday(newPerDay, newDay, newIntroducedToday, now);
  return {
    total: deck.length,
    newCount,
    learning,
    review,
    dueNow,
    newAvailableToday: Math.min(remaining, newCount),
  };
}

export interface ForecastDay {
  /** Nhãn: 'Hôm nay', 'Mai', 'T4'... */
  label: string;
  date: string;
  count: number;
}

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function forecastDue(
  states: Record<string, SrsCardState>,
  now: number,
  days = 7,
  deck: TokuteiVocabCard[] = TOKUTEI_VOCAB,
): ForecastDay[] {
  const result: ForecastDay[] = [];
  const todayStart = startOfDay(now);
  for (let i = 0; i < days; i++) {
    const dayStart = todayStart + i * DAY_MS;
    const dayEnd = dayStart + DAY_MS - 1;
    let count = 0;
    for (const card of deck) {
      const state = states[card.id];
      if (!state || state.phase === 'new') continue;
      if (i === 0) {
        if (isDue(state, now)) count += 1;
      } else if (state.due >= dayStart && state.due <= dayEnd) {
        count += 1;
      }
    }
    const date = new Date(dayStart);
    result.push({
      label: i === 0 ? 'Nay' : i === 1 ? 'Mai' : WEEKDAY_LABELS[date.getDay()],
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      count,
    });
  }
  return result;
}

/** Retention: tỉ lệ nhớ (hard/good/easy) trên các lượt ôn thẻ review, N ngày gần nhất. */
export function computeRetention(log: ReviewLogEntry[], now: number, days = 30): number | null {
  const cutoff = now - days * DAY_MS;
  const reviews = log.filter((entry) => entry.at >= cutoff && entry.phase === 'review');
  if (reviews.length === 0) return null;
  const remembered = reviews.filter((entry) => entry.rating !== 'again').length;
  return Math.round((remembered / reviews.length) * 100);
}

export interface HeatmapDay {
  date: string;
  count: number;
  /** 0-4: cường độ để tô màu */
  intensity: number;
}

/** Heatmap số lượt ôn mỗi ngày trong `days` ngày gần nhất (cũ → mới). */
export function reviewHeatmap(log: ReviewLogEntry[], now: number, days = 84): HeatmapDay[] {
  const todayStart = startOfDay(now);
  const counts = new Map<number, number>();
  for (const entry of log) {
    const day = startOfDay(entry.at);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  const result: HeatmapDay[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const dayStart = todayStart - i * DAY_MS;
    const count = counts.get(dayStart) ?? 0;
    const date = new Date(dayStart);
    result.push({
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      count,
      intensity: count === 0 ? 0 : count < 5 ? 1 : count < 15 ? 2 : count < 30 ? 3 : 4,
    });
  }
  return result;
}

/** Số lượt ôn hôm nay + XP hôm nay từ log. */
export function todayActivity(log: ReviewLogEntry[], now: number): { reviews: number } {
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const reviews = log.filter((entry) => entry.at >= dayStart && entry.at <= dayEnd).length;
  return { reviews };
}
