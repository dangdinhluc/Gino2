import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import type { PracticeQuestion } from './types';

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

export function buildVocabularyQuestions(vocabulary: CourseVocabularyItem[]): PracticeQuestion[] {
  const validVocabulary = vocabulary.filter((item) => item.meaning.trim());
  const meanings = uniqueValues(validVocabulary.map((item) => item.meaning));

  return validVocabulary.flatMap((item) => {
    const distractors = meanings.filter((meaning) => meaning !== item.meaning).slice(0, 3);
    if (distractors.length < 1) return [];
    return [{
      id: `vocabulary-${item.id}`,
      kind: 'vocabulary' as const,
      prompt: `“${item.kanji || item.word}” có nghĩa là gì?`,
      options: shuffle([item.meaning, ...distractors]),
      explanation: item.example.jp ? `Ví dụ: ${item.example.jp}` : `Từ này thuộc chủ đề ${item.module}.`,
      source: item.module,
      correctAnswer: item.meaning,
      vocabularyId: item.id,
      pronunciation: item.pronunciation,
    } satisfies PracticeQuestion];
  });
}

export function buildReviewQuestions(reviewQuestions: CourseReviewQuestion[]): PracticeQuestion[] {
  return reviewQuestions.flatMap((question) => {
    if (question.options.length < 2 || !question.optionIds) return [];
    return [{
      id: `question-${question.id}`,
      kind: 'question' as const,
      prompt: question.prompt,
      options: shuffle(question.options),
      explanation: question.explanation,
      source: question.source,
      optionIds: question.optionIds,
    } satisfies PracticeQuestion];
  });
}

export function getCountOptions(total: number): number[] {
  if (total <= 0) return [];
  return Array.from(new Set([5, 10, 15, 20].filter((value) => value <= total).concat(total))).sort((a, b) => a - b);
}

export { shuffle };
