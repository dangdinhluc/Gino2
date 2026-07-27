import type { CourseVocabularyItem, VocabularyStatus } from '@/src/features/courses/mock/courseLearningMock';

/** Tab mà nút chính của nhiệm vụ sẽ mở. */
export type MissionTarget = 'vocabulary' | 'review' | 'games';

export interface DailyMission {
  /** Câu nói thẳng hôm nay làm gì. */
  headline: string;
  /** Chữ trên nút chính. */
  actionLabel: string;
  target: MissionTarget;
  /** Số từ đặt mục tiêu cho hôm nay. */
  goalTotal: number;
  /** Số từ đã ôn hôm nay. */
  goalDone: number;
  isComplete: boolean;
}

/** Mặc định 6 từ/ngày — vừa một phiên ngắn, học viên đi làm vẫn theo được. */
export const DEFAULT_DAILY_GOAL = 6;

const statusPriority: Record<VocabularyStatus, number> = {
  due: 0,
  learning: 1,
  new: 2,
  remembered: 3,
};

/**
 * Xếp từ theo thứ tự nên học: cần ôn trước, rồi đang học, từ mới, cuối cùng là đã nhớ.
 * Giữ nguyên thứ tự gốc trong cùng nhóm để kết quả ổn định (test không phụ thuộc random).
 */
export function sortVocabularyByPriority(vocabulary: CourseVocabularyItem[]): CourseVocabularyItem[] {
  return vocabulary
    .map((item, index) => ({ item, index }))
    .sort((a, b) => {
      const byStatus = statusPriority[a.item.status] - statusPriority[b.item.status];
      return byStatus !== 0 ? byStatus : a.index - b.index;
    })
    .map((entry) => entry.item);
}

/** Đếm số từ của khóa này đã ôn trong ngày, lấy từ log SRS có sẵn. */
export function countReviewedToday(
  log: Array<{ at: number; cardId: string }>,
  courseId: string,
  now: number
): number {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const dayStart = startOfDay.getTime();
  const prefix = `${courseId}:`;

  const reviewedCardIds = new Set(
    log.filter((entry) => entry.at >= dayStart && entry.cardId.startsWith(prefix)).map((entry) => entry.cardId)
  );

  return reviewedCardIds.size;
}

/**
 * Một nhiệm vụ duy nhất cho hôm nay. Học viên mở app là biết ngay phải làm gì,
 * không phải tự chọn giữa 5 tab.
 */
export function buildDailyMission(input: {
  vocabulary: CourseVocabularyItem[];
  reviewedToday: number;
  goalTotal?: number;
}): DailyMission {
  const goalTotal = input.goalTotal ?? DEFAULT_DAILY_GOAL;
  const goalDone = Math.min(input.reviewedToday, goalTotal);
  const dueCount = input.vocabulary.filter((item) => item.status === 'due').length;
  const newCount = input.vocabulary.filter((item) => item.status === 'new').length;

  if (goalDone >= goalTotal) {
    return {
      headline: 'Xong mục tiêu hôm nay',
      actionLabel: 'Chơi game',
      target: 'games',
      goalTotal,
      goalDone,
      isComplete: true,
    };
  }

  if (dueCount > 0) {
    return {
      headline: `Ôn ${dueCount} từ cần nhớ lại`,
      actionLabel: 'Ôn ngay',
      target: 'review',
      goalTotal,
      goalDone,
      isComplete: false,
    };
  }

  if (newCount > 0) {
    return {
      headline: `Học ${newCount} từ mới`,
      actionLabel: 'Học ngay',
      target: 'vocabulary',
      goalTotal,
      goalDone,
      isComplete: false,
    };
  }

  return {
    headline: 'Ôn lại từ đã học',
    actionLabel: 'Ôn ngay',
    target: 'review',
    goalTotal,
    goalDone,
    isComplete: false,
  };
}
