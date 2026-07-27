import assert from 'node:assert';
import type { CourseVocabularyItem, VocabularyStatus } from '@/src/features/courses/mock/courseLearningMock';
import { countByFilter, matchesVocabularyFilter, vocabularyFilters } from './vocabularyFilters';

function makeVocabulary(id: string, status: VocabularyStatus): CourseVocabularyItem {
  return { id, word: id, article: '—', status } as CourseVocabularyItem;
}

// "Tất cả" nhận mọi trạng thái.
for (const status of ['new', 'learning', 'due', 'remembered'] satisfies VocabularyStatus[]) {
  assert.equal(matchesVocabularyFilter(status, 'all'), true, `Tất cả nhận trạng thái ${status}`);
}

assert.equal(matchesVocabularyFilter('due', 'due'), true, 'Cần ôn nhận từ due');
assert.equal(matchesVocabularyFilter('new', 'due'), false, 'Cần ôn không nhận từ mới');

// "Chưa thuộc" gộp từ mới và đang học — đây là điểm gộp chính của thiết kế.
assert.equal(matchesVocabularyFilter('new', 'unlearned'), true, 'Chưa thuộc nhận từ mới');
assert.equal(matchesVocabularyFilter('learning', 'unlearned'), true, 'Chưa thuộc nhận từ đang học');
assert.equal(matchesVocabularyFilter('due', 'unlearned'), false, 'Chưa thuộc không nhận từ cần ôn');
assert.equal(matchesVocabularyFilter('remembered', 'unlearned'), false, 'Chưa thuộc không nhận từ đã nhớ');

assert.equal(matchesVocabularyFilter('remembered', 'remembered'), true, 'Đã nhớ nhận từ remembered');

// Không trạng thái nào rơi ra ngoài cả bốn nhóm — bỏ chip không được làm mất từ.
for (const status of ['new', 'learning', 'due', 'remembered'] satisfies VocabularyStatus[]) {
  const reachable = vocabularyFilters.some((filter) => filter.id !== 'all' && matchesVocabularyFilter(status, filter.id));
  assert.equal(reachable, true, `Trạng thái ${status} vẫn vào được ít nhất một nhóm`);
}

{
  const vocabulary = [
    makeVocabulary('a', 'due'),
    makeVocabulary('b', 'new'),
    makeVocabulary('c', 'learning'),
    makeVocabulary('d', 'remembered'),
    makeVocabulary('e', 'due'),
  ];

  assert.equal(countByFilter(vocabulary, 'all'), 5, 'Đếm tất cả');
  assert.equal(countByFilter(vocabulary, 'due'), 2, 'Đếm cần ôn');
  assert.equal(countByFilter(vocabulary, 'unlearned'), 2, 'Đếm chưa thuộc gộp new + learning');
  assert.equal(countByFilter(vocabulary, 'remembered'), 1, 'Đếm đã nhớ');
  assert.equal(countByFilter([], 'due'), 0, 'Danh sách rỗng trả 0');
}
