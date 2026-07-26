import { strict as assert } from 'node:assert';
import { generateMemoryRounds } from '@/src/features/games/generators/fromCourseVocabMemory';
import type { CourseVocabularyItem } from '@/src/features/courses/mock/courseLearningMock';

function makeVocab(overrides: Partial<CourseVocabularyItem> & { id: string; word: string; meaning: string }): CourseVocabularyItem {
  return {
    article: '—',
    pronunciation: '',
    example: { jp: '', vi: '' },
    status: 'new',
    module: 'test',
    strength: 0,
    tags: [],
    ...overrides,
  };
}

// TC-MM-G-01: empty input → []
{
  const rounds = generateMemoryRounds([]);
  assert.deepEqual(rounds, [], 'empty vocabulary should produce no rounds');
}

// TC-MM-G-02: 1 item < 2 pairs → []
{
  const rounds = generateMemoryRounds([makeVocab({ id: 'v1', word: 'houkoku', meaning: 'báo cáo' })]);
  assert.deepEqual(rounds, [], 'single vocabulary item cannot form a memory round');
}

// TC-MM-G-03: 3 items → 1 round, gridCols=3 (<=3 pairs), pairs=3
{
  const vocab = [
    makeVocab({ id: 'v1', word: 'houkoku', meaning: 'báo cáo' }),
    makeVocab({ id: 'v2', word: 'kyukei', meaning: 'giờ nghỉ' }),
    makeVocab({ id: 'v3', word: 'anzen', meaning: 'an toàn' }),
  ];
  const rounds = generateMemoryRounds(vocab);
  assert.equal(rounds.length, 1, '3 vocabulary items should produce exactly 1 round');
  assert.equal(rounds[0].data.pairs.length, 3, 'round should hold 3 pairs');
  assert.equal(rounds[0].data.gridCols, 3, '<= 3 pairs collapse to gridCols=3 for mobile-friendly layout');
  assert.equal(rounds[0].data.timeLimitSec, 90, 'default timeLimitSec should be 90');
}

// TC-MM-G-04: 14 items → max 3 rounds (PAIRS_PER_ROUND=6, MAX_ROUNDS=3)
{
  const vocab = Array.from({ length: 14 }, (_, i) =>
    makeVocab({ id: `v${i}`, word: `word${i}`, meaning: `nghĩa${i}` }),
  );
  const rounds = generateMemoryRounds(vocab);
  assert.equal(rounds.length, 3, '14 items should chunk into 3 rounds (6+6+2)');
  assert.equal(rounds[0].data.pairs.length, 6);
  assert.equal(rounds[1].data.pairs.length, 6);
  assert.equal(rounds[2].data.pairs.length, 2);
}

// TC-MM-G-05: pair.sourceVocabId maps back to original vocab id
{
  const vocab = [
    makeVocab({ id: 'tenchou', word: 'tenchou', meaning: 'quản lý' }),
    makeVocab({ id: 'houkoku', word: 'houkoku', meaning: 'báo cáo' }),
  ];
  const rounds = generateMemoryRounds(vocab);
  assert.equal(rounds.length, 1);
  assert.equal(rounds[0].data.pairs[0].sourceVocabId, 'tenchou', 'first pair must trace back to source vocab id');
  assert.equal(rounds[0].data.pairs[1].sourceVocabId, 'houkoku', 'second pair must trace back to source vocab id');
}

// TC-MM-G-06: displayed pair word matches vocab word verbatim (no article prefix logic anymore)
{
  const vocab = [
    makeVocab({ id: 'v1', word: 'aisatsu', meaning: 'chào hỏi' }),
    makeVocab({ id: 'v2', word: 'zairyu card', meaning: 'thẻ cư trú' }),
  ];
  const rounds = generateMemoryRounds(vocab);
  assert.equal(rounds[0].data.pairs[0].word, 'aisatsu');
  assert.equal(rounds[0].data.pairs[1].word, 'zairyu card');
}

// TC-MM-G-07: items with empty word/meaning are filtered out
{
  const vocab = [
    makeVocab({ id: 'v1', word: '', meaning: 'no word' }),
    makeVocab({ id: 'v2', word: 'OK', meaning: '' }),
    makeVocab({ id: 'v3', word: 'mensetsu', meaning: 'phỏng vấn' }),
    makeVocab({ id: 'v4', word: 'rirekisho', meaning: 'hồ sơ' }),
  ];
  const rounds = generateMemoryRounds(vocab);
  assert.equal(rounds.length, 1, 'invalid items must be filtered before round chunking');
  assert.equal(rounds[0].data.pairs.length, 2);
  assert.equal(rounds[0].data.pairs[0].sourceVocabId, 'v3');
}

// eslint-disable-next-line no-console
console.log('✓ memoryGenerator.test passed');
