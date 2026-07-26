import assert from 'node:assert';
import {
  parseReviewMode,
  parseVocabularyScript,
  readStoredReviewMode,
  readStoredVocabularyScript,
} from './courseWorkspacePreferences';

assert.equal(parseVocabularyScript('kanji'), 'kanji', 'Giữ nguyên kiểu chữ hợp lệ kanji');
assert.equal(parseVocabularyScript('kana'), 'kana', 'Giữ nguyên kiểu chữ hợp lệ kana');
assert.equal(parseVocabularyScript('romaji'), 'romaji', 'Giữ nguyên kiểu chữ hợp lệ romaji');
assert.equal(parseVocabularyScript('hangul'), 'romaji', 'Giá trị lạ rơi về romaji');
assert.equal(parseVocabularyScript(null), 'romaji', 'Chưa lưu gì thì mặc định romaji');
assert.equal(parseVocabularyScript(undefined), 'romaji', 'Undefined cũng rơi về romaji');

assert.equal(parseReviewMode('vocabulary'), 'vocabulary', 'Giữ nguyên chế độ ôn từ vựng');
assert.equal(parseReviewMode('questions'), 'questions', 'Giữ nguyên chế độ ôn câu hỏi');
assert.equal(parseReviewMode('grammar'), 'vocabulary', 'Giá trị lạ rơi về ôn từ vựng');
assert.equal(parseReviewMode(null), 'vocabulary', 'Chưa lưu gì thì mặc định ôn từ vựng');
assert.equal(parseReviewMode(undefined), 'vocabulary', 'Undefined cũng rơi về ôn từ vựng');

// Chạy trong node không có window: hàm đọc phải trả mặc định thay vì ném lỗi.
assert.equal(readStoredVocabularyScript(), 'romaji', 'Không có localStorage vẫn đọc được kiểu chữ mặc định');
assert.equal(readStoredReviewMode(), 'vocabulary', 'Không có localStorage vẫn đọc được chế độ mặc định');
