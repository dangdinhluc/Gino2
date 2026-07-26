import type { CourseReviewQuestion } from '@/src/features/courses/mock/courseLearningMock';
import { SITUATION_ROUNDS, type SituationRound } from '@/src/features/games/data/situationData';

const fallbackOptions = Array.from(new Set(SITUATION_ROUNDS.flatMap((round) => round.data.options)));

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function buildOptions(answer: string, options: string[]): string[] {
  const sourceDistractors = uniqueValues(options).filter((option) => option !== answer);
  const fallbackDistractors = fallbackOptions.filter((option) => option !== answer && !sourceDistractors.includes(option));
  const distractors = [...sourceDistractors, ...shuffle(fallbackDistractors)].slice(0, 3);
  return shuffle([answer, ...distractors]);
}

export function generateSituationRounds(questions: CourseReviewQuestion[]): SituationRound[] {
  return shuffle(questions.filter((question) => question.prompt.trim() && question.answer.trim())).map((question, index) => ({
    id: `course-situation-${question.id || index}`,
    prompt: question.prompt,
    data: {
      situation: question.source,
      options: buildOptions(question.answer, question.options),
      answer: question.answer,
      explanation: question.explanation,
    },
  }));
}
