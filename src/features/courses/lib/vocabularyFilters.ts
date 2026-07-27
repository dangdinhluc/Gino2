import type { CourseVocabularyItem, VocabularyStatus } from '@/src/features/courses/mock/courseLearningMock';

/**
 * Bốn nhóm theo việc học viên cần làm, thay cho 5 chip theo trạng thái kỹ thuật.
 * "Từ mới" và "Đang học" gộp thành "Chưa thuộc" vì học viên xử lý chúng như nhau.
 */
export type VocabularyFilter = 'all' | 'due' | 'unlearned' | 'remembered';

export const vocabularyFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'due', label: 'Cần ôn' },
  { id: 'unlearned', label: 'Chưa thuộc' },
  { id: 'remembered', label: 'Đã nhớ' },
] satisfies Array<{ id: VocabularyFilter; label: string }>;

const filterStatuses: Record<Exclude<VocabularyFilter, 'all'>, VocabularyStatus[]> = {
  due: ['due'],
  unlearned: ['new', 'learning'],
  remembered: ['remembered'],
};

export function matchesVocabularyFilter(status: VocabularyStatus, filter: VocabularyFilter): boolean {
  return filter === 'all' || filterStatuses[filter].includes(status);
}

/** Số từ trong mỗi nhóm — dùng để hiện số ngay trên chip, học viên biết chỗ nào đáng vào. */
export function countByFilter(vocabulary: CourseVocabularyItem[], filter: VocabularyFilter): number {
  return vocabulary.filter((item) => matchesVocabularyFilter(item.status, filter)).length;
}
