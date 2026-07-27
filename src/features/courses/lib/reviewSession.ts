import type { CourseReviewQuestion, CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';
import { sortVocabularyByPriority } from '@/src/features/courses/lib/dailyMission';
import type { ReviewMode } from '@/src/features/courses/lib/courseWorkspacePreferences';

export interface ReviewSessionQuestion {
  /** Khóa nối vào SRS store dùng chung: `${courseId}:${vocabularyId}`. */
  cardId: string;
  /** Id gốc của từ hoặc câu hỏi — dùng khi ghi tiến độ lên Supabase. */
  sourceId: string;
  prompt: string;
  options: string[];
  answer: string;
  /** Câu nhắc ngắn hiện sau khi trả lời. */
  hint: string;
}

/** Một phiên ngắn để học viên luôn thấy điểm dừng, thay vì danh sách câu hỏi chạy vòng vô tận. */
export const REVIEW_SESSION_SIZE = 6;

const XP_CORRECT = 10;
const XP_WRONG = 2;

function getDisplayName(item: CourseVocabularyItem): string {
  return item.article !== '—' ? `${item.article} ${item.word}` : item.word;
}

/** Bốn lựa chọn, đáp án đúng luôn nằm trong đó, sắp xếp ổn định theo alphabet tiếng Việt. */
export function buildOptions(answer: string, pool: string[], limit = 4): string[] {
  const distractors = pool.filter((option, index, options) => option !== answer && options.indexOf(option) === index);
  return [answer, ...distractors].slice(0, limit).sort((a, b) => a.localeCompare(b, 'vi'));
}

/**
 * Dựng danh sách câu hỏi cho một phiên. Chế độ từ vựng ưu tiên từ cần ôn trước;
 * chế độ câu hỏi lấy theo thứ tự đề đã soạn. Không dùng random để test ổn định.
 */
export function buildReviewSession(input: {
  courseId: string;
  vocabulary: CourseVocabularyItem[];
  questions: CourseReviewQuestion[];
  mode: ReviewMode;
  size?: number;
}): ReviewSessionQuestion[] {
  const size = input.size ?? REVIEW_SESSION_SIZE;

  if (input.mode === 'questions') {
    return input.questions.slice(0, size).map((question) => ({
      cardId: `${input.courseId}:${question.id}`,
      sourceId: question.id,
      prompt: question.prompt,
      options: question.options,
      answer: question.answer,
      hint: question.explanation,
    }));
  }

  const meaningPool = input.vocabulary.map((item) => item.meaning);

  return sortVocabularyByPriority(input.vocabulary)
    .slice(0, size)
    .map((item) => ({
      cardId: `${input.courseId}:${item.id}`,
      sourceId: item.id,
      prompt: `"${getDisplayName(item)}" nghĩa là gì?`,
      options: buildOptions(item.meaning, meaningPool),
      answer: item.meaning,
      hint: `${getDisplayName(item)} — ${item.example.jp}`,
    }));
}

export interface ReviewSessionSummary {
  total: number;
  correct: number;
  /** Phần trăm đúng, làm tròn. */
  accuracy: number;
  xp: number;
  /** Lời kết ấm và ngắn, đổi theo kết quả. */
  message: string;
}

/** Tổng kết phiên: đúng bao nhiêu, được bao nhiêu XP, nói một câu cho học viên thấy đáng. */
export function summarizeReviewSession(answers: boolean[]): ReviewSessionSummary {
  const total = answers.length;
  const correct = answers.filter(Boolean).length;
  const accuracy = total === 0 ? 0 : Math.round((correct / total) * 100);
  const xp = correct * XP_CORRECT + (total - correct) * XP_WRONG;

  let message = 'Làm lại phiên này để nhớ chắc hơn nhé.';
  if (accuracy === 100) message = 'Đúng hết. Giữ nhịp này nhé!';
  else if (accuracy >= 80) message = 'Rất tốt, gần như nhớ hết rồi.';
  else if (accuracy >= 50) message = 'Khá ổn, vài từ nữa là chắc.';

  return { total, correct, accuracy, xp, message };
}
