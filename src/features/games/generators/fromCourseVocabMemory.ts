import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import type { MemoryPair, MemoryRound } from '@/src/features/games/types';

/**
 * Generator: CourseVocabularyItem[] → MemoryRound[]
 *
 * Logic:
 * - Filter vocab có word + meaning hợp lệ
 * - Chunk theo `PAIRS_PER_ROUND`, tối đa `MAX_ROUNDS` round
 * - Mỗi pair giữ `sourceVocabId` để push SRS khi miss
 * - `< 2` cặp khả dụng → return [] để GameScreen hiển thị trạng thái thiếu nội dung
 *
 * Spec: docs/design/new-games-mvp.md §2.4 + §2.6
 */

const PAIRS_PER_ROUND = 6;
const MAX_ROUNDS = 3;

function getVocabularyLabel(item: CourseVocabularyItem): string {
  return item.word.trim();
}

export function generateMemoryRounds(vocabulary: CourseVocabularyItem[]): MemoryRound[] {
  const usable = vocabulary.filter((item) => item.word.trim() && item.meaning.trim());
  if (usable.length < 2) return [];

  const rounds: MemoryRound[] = [];
  let cursor = 0;

  while (cursor < usable.length && rounds.length < MAX_ROUNDS) {
    const chunk = usable.slice(cursor, cursor + PAIRS_PER_ROUND);
    if (chunk.length < 2) break;

    const roundIndex = rounds.length + 1;
    const pairs: MemoryPair[] = chunk.map((item, idx) => ({
      id: `mem-course-r${roundIndex}-${item.id || idx}`,
      word: getVocabularyLabel(item),
      meaning: item.meaning.trim(),
      sourceVocabId: item.id,
    }));

    rounds.push({
      id: `mem-course-r${roundIndex}`,
      prompt: `Cặp từ vòng ${roundIndex}`,
      data: {
        pairs,
        gridCols: pairs.length <= 3 ? 3 : 4,
        timeLimitSec: 90,
      },
    });

    cursor += PAIRS_PER_ROUND;
  }

  return rounds;
}
