import { strict as assert } from 'node:assert';
import { useGameStore } from '@/src/features/games/gameStore';

function reset() {
  useGameStore.getState().reset();
}

// TC-STORE-01: startGame initializes everything
{
  reset();
  useGameStore.getState().startGame('memory-match', 3);
  const s = useGameStore.getState();
  assert.equal(s.gameId, 'memory-match');
  assert.equal(s.status, 'playing');
  assert.equal(s.totalRounds, 3);
  assert.equal(s.score, 0);
  assert.equal(s.combo, 0);
  assert.equal(s.hintsUsed, 0);
}

// TC-STORE-02: answerCorrect builds combo with bonus capped at 5*20=100
{
  reset();
  const store = useGameStore.getState();
  store.startGame('vocab-sprint', 10);
  // 1st: 100 + 0 bonus
  useGameStore.getState().answerCorrect();
  assert.equal(useGameStore.getState().score, 100);
  assert.equal(useGameStore.getState().combo, 1);
  // 2nd: 100 + 20 bonus
  useGameStore.getState().answerCorrect();
  assert.equal(useGameStore.getState().score, 220);
  assert.equal(useGameStore.getState().combo, 2);
  // Bonus caps at combo-1=5 → +100
  for (let i = 0; i < 10; i++) useGameStore.getState().answerCorrect();
  assert.ok(useGameStore.getState().combo >= 5, 'combo should grow with consecutive correct');
}

// TC-STORE-03: answerWrong resets combo + adds wrongId
{
  reset();
  const store = useGameStore.getState();
  store.startGame('memory-match', 3);
  useGameStore.getState().answerCorrect();
  useGameStore.getState().answerCorrect();
  assert.equal(useGameStore.getState().combo, 2);
  useGameStore.getState().answerWrong('round-1');
  assert.equal(useGameStore.getState().combo, 0, 'answerWrong must reset combo');
  assert.deepEqual(useGameStore.getState().wrongIds, ['round-1']);
}

// TC-STORE-04: pushSrs adds wrongId WITHOUT resetting combo or status
{
  reset();
  const store = useGameStore.getState();
  store.startGame('word-builder', 3);
  useGameStore.getState().answerCorrect();
  useGameStore.getState().answerCorrect();
  const beforeCombo = useGameStore.getState().combo;
  const beforeStatus = useGameStore.getState().status;
  useGameStore.getState().pushSrs('vocab-tisch');
  const after = useGameStore.getState();
  assert.equal(after.combo, beforeCombo, 'pushSrs must NOT reset combo');
  assert.equal(after.status, beforeStatus, 'pushSrs must NOT change status');
  assert.deepEqual(after.wrongIds, ['vocab-tisch']);
}

// TC-STORE-05: pushSrs is idempotent (no duplicates)
{
  reset();
  const store = useGameStore.getState();
  store.startGame('word-builder', 3);
  useGameStore.getState().pushSrs('vocab-x');
  useGameStore.getState().pushSrs('vocab-x');
  useGameStore.getState().pushSrs('vocab-x');
  assert.deepEqual(useGameStore.getState().wrongIds, ['vocab-x'], 'pushSrs must dedupe');
}

// TC-STORE-06: registerHint deducts 50 + bumps hintsUsed
{
  reset();
  const store = useGameStore.getState();
  store.startGame('word-builder', 3);
  useGameStore.getState().answerCorrect(); // score 100
  useGameStore.getState().registerHint();
  assert.equal(useGameStore.getState().score, 50);
  assert.equal(useGameStore.getState().hintsUsed, 1);
}

// TC-STORE-07: deductPoints clamps at 0
{
  reset();
  const store = useGameStore.getState();
  store.startGame('word-builder', 3);
  useGameStore.getState().deductPoints(999);
  assert.equal(useGameStore.getState().score, 0, 'deductPoints must clamp at 0');
}

// TC-STORE-08: nextRound transitions to complete on last round
{
  reset();
  const store = useGameStore.getState();
  store.startGame('memory-match', 2);
  useGameStore.getState().nextRound();
  assert.equal(useGameStore.getState().roundIndex, 1);
  assert.equal(useGameStore.getState().status, 'playing');
  useGameStore.getState().nextRound();
  assert.equal(useGameStore.getState().status, 'complete');
}

// eslint-disable-next-line no-console
console.log('✓ gameStore.test passed');
