import { strict as assert } from 'node:assert';
import { generateBuilderRounds } from '@/src/features/games/generators/fromCourseVocabBuilder';
import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';

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

// TC-WB-G-01: empty vocabulary → []
{
  const rounds = generateBuilderRounds([]);
  assert.deepEqual(rounds, [], 'empty vocabulary should produce no rounds');
}

// TC-WB-G-02: word > 4 chars → 1 decoy, pool = word.length + 1
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'houkoku', meaning: 'báo cáo' }),
  ]);
  assert.equal(rounds.length, 1);
  assert.equal(rounds[0].data.word, 'houkoku');
  // houkoku = 7 chars, > 4 → 1 decoy → pool = 8
  assert.equal(rounds[0].data.letterPool.length, 8, 'words >4 chars get 1 decoy → pool 8');
}

// TC-WB-G-03: word ≤ 4 chars → 2 decoys
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'anzn', meaning: 'placeholder ngắn' }),
  ]);
  assert.equal(rounds.length, 1);
  // anzn = 4 chars, ≤ 4 → 2 decoy → pool = 6
  assert.equal(rounds[0].data.letterPool.length, 6, 'short words get 2 decoys → pool 6');
}

// TC-WB-G-04: decoys do not duplicate any character already in the word (case-insensitive)
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'kyukei', meaning: 'giờ nghỉ' }),
  ]);
  const round = rounds[0];
  const wordChars = new Set(Array.from('kyukei').map((c) => c.toLowerCase()));
  const decoyChars = round.data.letterPool
    .filter((c) => c.id.startsWith('wb-course-v1-d-'))
    .map((c) => c.char.toLowerCase());
  for (const decoy of decoyChars) {
    assert.ok(!wordChars.has(decoy), `decoy '${decoy}' must not collide with existing chars`);
  }
}

// TC-WB-G-05: words longer than 12 chars are filtered out
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'kenkouhokengoshoumeisho', meaning: 'giấy chứng nhận bảo hiểm y tế' }),
    makeVocab({ id: 'v2', word: 'anzen', meaning: 'an toàn' }),
  ]);
  assert.equal(rounds.length, 1, 'words > 12 chars must be skipped');
  assert.equal(rounds[0].data.word, 'anzen');
}

// TC-WB-G-06: multi-word entries are skipped (cannot fit single-slot UI)
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'zairyu card', meaning: 'thẻ cư trú' }),
    makeVocab({ id: 'v2', word: 'mensetsu', meaning: 'phỏng vấn' }),
  ]);
  assert.equal(rounds.length, 1, 'multi-word vocabulary should be filtered');
  assert.equal(rounds[0].data.word, 'mensetsu');
}

// TC-WB-G-07: sourceVocabId mapped through to round
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'tenchou', word: 'tenchou', meaning: 'quản lý cửa hàng' }),
  ]);
  assert.equal(rounds[0].data.sourceVocabId, 'tenchou');
}

// TC-WB-G-08: items with empty meaning are filtered
{
  const rounds = generateBuilderRounds([
    makeVocab({ id: 'v1', word: 'houkoku', meaning: '' }),
    makeVocab({ id: 'v2', word: 'anzen', meaning: 'an toàn' }),
  ]);
  assert.equal(rounds.length, 1);
  assert.equal(rounds[0].data.word, 'anzen');
}

// eslint-disable-next-line no-console
console.log('✓ builderGenerator.test passed');
