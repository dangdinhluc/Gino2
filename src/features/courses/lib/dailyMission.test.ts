import assert from 'node:assert';
import type { CourseVocabularyItem, VocabularyStatus } from '@/src/features/courses/mock/courseLearningMock';
import { buildDailyMission, countReviewedToday, sortVocabularyByPriority } from './dailyMission';

function makeVocabulary(id: string, status: VocabularyStatus): CourseVocabularyItem {
  return {
    id,
    word: id,
    article: '—',
    kana: '',
    kanji: '',
    meaning: `nghĩa ${id}`,
    pronunciation: id,
    module: 'Module 1',
    status,
    tags: [],
    example: { jp: `${id} desu`, kana: '', kanji: '', vi: `ví dụ ${id}` },
  } as CourseVocabularyItem;
}

// Xếp ưu tiên: cần ôn → đang học → từ mới → đã nhớ, giữ thứ tự gốc trong cùng nhóm.
{
  const sorted = sortVocabularyByPriority([
    makeVocabulary('a', 'remembered'),
    makeVocabulary('b', 'new'),
    makeVocabulary('c', 'due'),
    makeVocabulary('d', 'learning'),
    makeVocabulary('e', 'due'),
  ]);
  assert.deepEqual(sorted.map((item) => item.id), ['c', 'e', 'd', 'b', 'a'], 'Xếp đúng thứ tự ưu tiên và ổn định');
}

// Có từ cần ôn thì nhiệm vụ là ôn, nút mở tab Ôn tập.
{
  const mission = buildDailyMission({
    vocabulary: [makeVocabulary('a', 'due'), makeVocabulary('b', 'due'), makeVocabulary('c', 'new')],
    reviewedToday: 0,
  });
  assert.equal(mission.headline, 'Ôn 2 từ cần nhớ lại', 'Nói rõ số từ cần ôn');
  assert.equal(mission.target, 'review', 'Nút mở tab Ôn tập');
  assert.equal(mission.isComplete, false, 'Chưa xong mục tiêu');
}

// Không còn từ cần ôn thì chuyển sang học từ mới.
{
  const mission = buildDailyMission({
    vocabulary: [makeVocabulary('a', 'new'), makeVocabulary('b', 'remembered')],
    reviewedToday: 0,
  });
  assert.equal(mission.headline, 'Học 1 từ mới', 'Đếm đúng số từ mới');
  assert.equal(mission.target, 'vocabulary', 'Nút mở tab Từ vựng');
}

// Đủ mục tiêu thì báo xong và gợi ý thư giãn, không ép học thêm.
{
  const mission = buildDailyMission({
    vocabulary: [makeVocabulary('a', 'due')],
    reviewedToday: 6,
  });
  assert.equal(mission.isComplete, true, 'Đạt mục tiêu là xong');
  assert.equal(mission.headline, 'Xong mục tiêu hôm nay', 'Báo xong rõ ràng');
  assert.equal(mission.target, 'games', 'Gợi ý chơi game khi đã xong');
  assert.equal(mission.goalDone, 6, 'Không đếm vượt mục tiêu');
}

// Đã ôn vượt mục tiêu vẫn chỉ hiển thị bằng mục tiêu.
{
  const mission = buildDailyMission({ vocabulary: [], reviewedToday: 99, goalTotal: 4 });
  assert.equal(mission.goalDone, 4, 'Chặn trần ở mục tiêu');
  assert.equal(mission.goalTotal, 4, 'Tôn trọng mục tiêu truyền vào');
}

// Hết cả từ cần ôn lẫn từ mới thì vẫn có việc để làm.
{
  const mission = buildDailyMission({ vocabulary: [makeVocabulary('a', 'remembered')], reviewedToday: 1 });
  assert.equal(mission.headline, 'Ôn lại từ đã học', 'Có phương án dự phòng');
  assert.equal(mission.target, 'review', 'Vẫn mở tab Ôn tập');
}

// Đếm từ đã ôn hôm nay: chỉ tính đúng khóa, đúng ngày, không đếm trùng thẻ.
{
  const now = new Date('2026-07-26T15:00:00Z').getTime();
  const todayMorning = new Date('2026-07-26T15:00:00Z');
  todayMorning.setHours(1, 0, 0, 0);
  const yesterday = todayMorning.getTime() - 86400000;

  const log = [
    { at: todayMorning.getTime(), cardId: 'c1:v1' },
    { at: todayMorning.getTime() + 1000, cardId: 'c1:v1' },
    { at: todayMorning.getTime() + 2000, cardId: 'c1:v2' },
    { at: todayMorning.getTime() + 3000, cardId: 'c2:v9' },
    { at: yesterday, cardId: 'c1:v7' },
  ];

  assert.equal(countReviewedToday(log, 'c1', now), 2, 'Chỉ đếm thẻ khác nhau của khóa c1 trong hôm nay');
  assert.equal(countReviewedToday(log, 'c2', now), 1, 'Đếm đúng cho khóa khác');
  assert.equal(countReviewedToday([], 'c1', now), 0, 'Log rỗng trả 0');
}
