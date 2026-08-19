import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import { type VocabRound } from '@/src/features/games/data/vocabData';

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function getVocabularyLabel(item: CourseVocabularyItem): string {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

function buildOptions(answer: string, pool: string[]): string[] {
  const courseDistractors = uniqueValues(pool).filter((option) => option !== answer);
  const distractors = shuffle(courseDistractors).slice(0, 3);
  return shuffle([answer, ...distractors]);
}

function generateCourseVocabRounds(vocabulary: CourseVocabularyItem[], prefix: string): VocabRound[] {
  const usableVocabulary = vocabulary.filter((item) => item.word.trim() && item.meaning.trim());
  const meaningPool = usableVocabulary.map((item) => item.meaning);

  return shuffle(usableVocabulary).map((item, index) => {
    const word = getVocabularyLabel(item);

    return {
      id: `${prefix}-${item.id || index}`,
      prompt: `"${word}" nghĩa là gì?`,
      data: {
        word,
        meaning: item.meaning,
        options: buildOptions(item.meaning, meaningPool),
      },
    };
  });
}

export function generateVocabRounds(vocabulary: CourseVocabularyItem[]): VocabRound[] {
  return generateCourseVocabRounds(vocabulary, 'course-vocab');
}

export function generateFlappyRounds(vocabulary: CourseVocabularyItem[]): VocabRound[] {
  return generateCourseVocabRounds(vocabulary, 'course-flappy');
}
