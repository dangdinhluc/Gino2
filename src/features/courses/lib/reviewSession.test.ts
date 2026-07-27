import assert from 'node:assert';
import type { CourseReviewQuestion, CourseVocabularyItem, VocabularyStatus } from '@/src/features/courses/mock/courseLearningMock';
import { buildOptions, buildReviewSession, summarizeReviewSession } from './reviewSession';

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

function makeQuestion(id: string): CourseReviewQuestion {
  return {
    id,
    type: 'meaning',
    prompt: `câu ${id}?`,
    options: ['x', 'y'],
    answer: 'x',
    explanation: `giải thích ${id}`,
    source: 'test',
  } as CourseReviewQuestion;
}

// Phiên từ vựng: ưu tiên từ cần ôn và cắt đúng kích thước phiên.
{
  const session = buildReviewSession({
    courseId: 'c1',
    vocabulary: [
      makeVocabulary('a', 'remembered'),
      makeVocabulary('b', 'due'),
      makeVocabulary('c', 'new'),
      makeVocabulary('d', 'due'),
    ],
    questions: [],
    mode: 'vocabulary',
    size: 2,
  });

  assert.equal(session.length, 2, 'Cắt đúng số câu của phiên');
  assert.equal(session[0].cardId, 'c1:b', 'Từ cần ôn lên đầu');
  assert.equal(session[0].sourceId, 'b', 'Giữ id gốc để ghi tiến độ');
  assert.equal(session[1].cardId, 'c1:d', 'Từ cần ôn thứ hai kế tiếp');
  assert.ok(session[0].options.includes(session[0].answer), 'Đáp án đúng luôn nằm trong lựa chọn');
  assert.ok(session[0].prompt.includes('b'), 'Câu hỏi nhắc đúng từ');
}

// Phiên câu hỏi: giữ nguyên thứ tự đề, cardId vẫn gắn khóa để nối SRS.
{
  const session = buildReviewSession({
    courseId: 'c1',
    vocabulary: [],
    questions: [makeQuestion('q1'), makeQuestion('q2'), makeQuestion('q3')],
    mode: 'questions',
    size: 2,
  });

  assert.equal(session.length, 2, 'Cắt đúng số câu');
  assert.equal(session[0].cardId, 'c1:q1', 'cardId gắn khóa học');
  assert.equal(session[0].sourceId, 'q1', 'Giữ id câu hỏi gốc');
  assert.equal(session[0].prompt, 'câu q1?', 'Giữ nguyên thứ tự đề');
  assert.equal(session[0].hint, 'giải thích q1', 'Gợi ý lấy từ phần giải thích');
}

// Ít dữ liệu hơn kích thước phiên thì lấy hết, không lặp lại để bù.
{
  const session = buildReviewSession({
    courseId: 'c1',
    vocabulary: [makeVocabulary('a', 'due')],
    questions: [],
    mode: 'vocabulary',
    size: 6,
  });
  assert.equal(session.length, 1, 'Không nhân bản câu hỏi cho đủ phiên');
}

// Lựa chọn: tối đa 4, không trùng, luôn chứa đáp án.
{
  const options = buildOptions('đúng', ['đúng', 'sai1', 'sai1', 'sai2', 'sai3', 'sai4']);
  assert.equal(options.length, 4, 'Tối đa 4 lựa chọn');
  assert.equal(new Set(options).size, 4, 'Không có lựa chọn trùng');
  assert.ok(options.includes('đúng'), 'Có đáp án đúng');
  assert.deepEqual(options, [...options].sort((a, b) => a.localeCompare(b, 'vi')), 'Thứ tự ổn định');
}

// Tổng kết phiên: đúng 10 XP, sai 2 XP.
{
  const summary = summarizeReviewSession([true, true, false, true]);
  assert.equal(summary.total, 4, 'Đếm đủ số câu');
  assert.equal(summary.correct, 3, 'Đếm đúng số câu đúng');
  assert.equal(summary.accuracy, 75, 'Tính đúng phần trăm');
  assert.equal(summary.xp, 32, '3 đúng x10 + 1 sai x2 = 32 XP');
  assert.equal(summary.message, 'Khá ổn, vài từ nữa là chắc.', 'Lời kết theo mức 50-79%');
}

{
  const perfect = summarizeReviewSession([true, true]);
  assert.equal(perfect.accuracy, 100, 'Đúng hết là 100%');
  assert.equal(perfect.message, 'Đúng hết. Giữ nhịp này nhé!', 'Khen khi đúng hết');
}

{
  const empty = summarizeReviewSession([]);
  assert.equal(empty.accuracy, 0, 'Phiên rỗng không chia cho 0');
  assert.equal(empty.xp, 0, 'Phiên rỗng không có XP');
}
