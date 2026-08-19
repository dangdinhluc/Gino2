import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import type { BuilderRound, LetterChip } from '@/src/features/games/types';

/**
 * Generator: CourseVocabularyItem[] → BuilderRound[]
 *
 * Logic (spec docs/design/new-games-mvp.md §2.4):
 * - Mỗi vocab item → 1 round
 * - Filter word có > 12 ký tự (slot không vừa container 360px) → skip
 * - Filter word có space (multi-word) → skip
 * - letterPool = chars trong word + 1-2 decoy ngẫu nhiên (decoy không trùng char đã có)
 */

const MAX_WORD_LEN = 12;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

function pickDecoys(word: string, count: number, seed: string): string[] {
  const used = new Set(Array.from(word.toLowerCase()));
  const candidates = ALPHABET.split('').filter((c) => !used.has(c));
  // Deterministic shuffle dựa trên seed (id + index) để test ổn định
  const shuffled = candidates.sort((a, b) => {
    const ha = `${seed}${a}`.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const hb = `${seed}${b}`.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return ha - hb;
  });
  return shuffled.slice(0, count);
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

export function generateBuilderRounds(vocabulary: CourseVocabularyItem[]): BuilderRound[] {
  const rounds: BuilderRound[] = [];

  for (const item of vocabulary) {
    const word = item.word.trim();
    if (!word) continue;
    if (word.includes(' ')) continue;       // skip multi-word
    if (word.length > MAX_WORD_LEN) continue; // skip quá dài
    if (!item.meaning.trim()) continue;

    const seedId = `wb-course-${item.id}`;
    const decoyCount = word.length <= 4 ? 2 : 1;
    const decoys = pickDecoys(word, decoyCount, seedId);

    const wordChips: LetterChip[] = Array.from(word).map((char, idx) => ({
      id: `${seedId}-w-${idx}`,
      char,
    }));
    const decoyChips: LetterChip[] = decoys.map((char, idx) => ({
      id: `${seedId}-d-${idx}`,
      char,
    }));

    rounds.push({
      id: seedId,
      prompt: item.meaning.trim(),
      data: {
        word,
        meaning: item.meaning.trim(),
        letterPool: shuffle([...wordChips, ...decoyChips]),
        sourceVocabId: item.id,
      },
    });
  }

  return rounds;
}
