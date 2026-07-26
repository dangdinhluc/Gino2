import { strict as assert } from 'node:assert';
import { TOKUTEI_VOCAB } from '@/src/data/tokutei/vocabDeck';
import {
  buildSessionQueue,
  collectDueCards,
  collectNewCards,
  computeDeckCounts,
  computeRetention,
  forecastDue,
  newRemainingToday,
  reviewHeatmap,
} from '@/src/features/review/lib/reviewSelectors';
import { createNewCardState, rateCard } from '@/src/features/review/lib/srs';
import { useReviewStore } from '@/src/features/review/store/reviewStore';

const NOW = new Date('2026-07-20T09:00:00').getTime();
const DAY = 86_400_000;

function resetStore() {
  useReviewStore.setState({
    states: {},
    log: [],
    settings: { newPerDay: 10 },
    newDay: '2026-07-20',
    newIntroducedToday: 0,
    totalReviewXp: 0,
    totalSessions: 0,
  });
}

// TC-DECK-01: bộ từ vựng đủ lớn, id không trùng, đủ 8 chủ đề
{
  assert.ok(TOKUTEI_VOCAB.length >= 90, `deck có ${TOKUTEI_VOCAB.length} thẻ, cần >= 90`);
  const ids = new Set(TOKUTEI_VOCAB.map((card) => card.id));
  assert.equal(ids.size, TOKUTEI_VOCAB.length, 'id thẻ không được trùng');
  const topics = new Set(TOKUTEI_VOCAB.map((card) => card.topicId));
  assert.equal(topics.size, 8);
  for (const card of TOKUTEI_VOCAB) {
    assert.ok(card.word && card.reading && card.romaji && card.meaning, `thẻ ${card.id} thiếu trường`);
    assert.ok(card.exampleJp && card.exampleVi && card.exampleRomaji, `thẻ ${card.id} thiếu ví dụ`);
  }
}

// TC-SEL-01: collectNewCards trả đúng limit và chỉ thẻ chưa học
{
  const states = { [TOKUTEI_VOCAB[0].id]: rateCard(createNewCardState(NOW), 'good', NOW) };
  const fresh = collectNewCards(states, 5);
  assert.equal(fresh.length, 5);
  assert.ok(!fresh.some((card) => card.id === TOKUTEI_VOCAB[0].id));
  assert.equal(collectNewCards(states, 0).length, 0);
}

// TC-SEL-02: collectDueCards xếp thẻ learning trước thẻ review
{
  const learningCard = TOKUTEI_VOCAB[0];
  const reviewCard = TOKUTEI_VOCAB[1];
  const states = {
    [reviewCard.id]: rateCard(createNewCardState(NOW - 5 * DAY), 'easy', NOW - 5 * DAY), // review, due quá hạn
    [learningCard.id]: rateCard(createNewCardState(NOW), 'again', NOW - 10 * 60_000), // learning, due rồi
  };
  const due = collectDueCards(states, NOW);
  assert.equal(due.length, 2);
  assert.equal(due[0].id, learningCard.id);
}

// TC-SEL-03: buildSessionQueue mode 'due' = due + new lấp chỗ
{
  const states = {
    [TOKUTEI_VOCAB[0].id]: rateCard(createNewCardState(NOW - 3 * DAY), 'easy', NOW - 5 * DAY),
  };
  const queue = buildSessionQueue('due', states, NOW, 3);
  assert.equal(queue[0].id, TOKUTEI_VOCAB[0].id);
  assert.equal(queue.length, 1 + 3);
}

// TC-SEL-04: buildSessionQueue mode 'topic:' chỉ trả thẻ chủ đề đó
{
  const queue = buildSessionQueue('topic:anzen', {}, NOW, 10);
  assert.ok(queue.length >= 10);
  assert.ok(queue.every((card) => card.topicId === 'anzen'));
}

// TC-SEL-05: cram trả 20 thẻ, ổn định trong cùng một ngày
{
  const first = buildSessionQueue('cram', {}, NOW, 0);
  const second = buildSessionQueue('cram', {}, NOW + 60_000, 0);
  assert.equal(first.length, 20);
  assert.deepEqual(first.map((c) => c.id), second.map((c) => c.id));
}

// TC-SEL-06: newRemainingToday reset khi sang ngày mới
{
  assert.equal(newRemainingToday(10, '2026-07-20', 4, NOW), 6);
  assert.equal(newRemainingToday(10, '2026-07-19', 9, NOW), 10);
  assert.equal(newRemainingToday(10, '2026-07-20', 15, NOW), 0);
}

// TC-SEL-07: computeDeckCounts đếm đúng theo phase
{
  const cardA = TOKUTEI_VOCAB[0];
  const cardB = TOKUTEI_VOCAB[1];
  const states = {
    [cardA.id]: rateCard(createNewCardState(NOW), 'good', NOW), // learning
    [cardB.id]: rateCard(createNewCardState(NOW - 10 * DAY), 'easy', NOW - 10 * DAY), // review, quá hạn
  };
  const counts = computeDeckCounts(states, NOW, 10, '2026-07-20', 2);
  assert.equal(counts.total, TOKUTEI_VOCAB.length);
  assert.equal(counts.newCount, TOKUTEI_VOCAB.length - 2);
  assert.equal(counts.learning, 1);
  assert.equal(counts.review, 1);
  assert.ok(counts.dueNow >= 1);
  assert.equal(counts.newAvailableToday, 8);
}

// TC-SEL-08: forecastDue trả đúng 7 ngày và đếm thẻ tương lai
{
  const card = TOKUTEI_VOCAB[2];
  const states = { [card.id]: rateCard(createNewCardState(NOW), 'easy', NOW) }; // due +4 ngày
  const forecast = forecastDue(states, NOW, 7);
  assert.equal(forecast.length, 7);
  assert.equal(forecast[4].count, 1);
  assert.equal(forecast[0].count, 0);
}

// TC-SEL-09: computeRetention chỉ tính lượt review
{
  const log = [
    { at: NOW - DAY, cardId: 'a', rating: 'good' as const, phase: 'review' as const },
    { at: NOW - DAY, cardId: 'b', rating: 'again' as const, phase: 'review' as const },
    { at: NOW - DAY, cardId: 'c', rating: 'again' as const, phase: 'new' as const },
    { at: NOW - DAY, cardId: 'd', rating: 'easy' as const, phase: 'review' as const },
  ];
  assert.equal(computeRetention(log, NOW), Math.round((2 / 3) * 100));
  assert.equal(computeRetention([], NOW), null);
}

// TC-SEL-10: reviewHeatmap trả đủ số ngày, đếm đúng hôm nay
{
  const log = [
    { at: NOW, cardId: 'a', rating: 'good' as const, phase: 'review' as const },
    { at: NOW - 60_000, cardId: 'b', rating: 'good' as const, phase: 'new' as const },
  ];
  const heatmap = reviewHeatmap(log, NOW, 14);
  assert.equal(heatmap.length, 14);
  assert.equal(heatmap[13].count, 2);
  assert.ok(heatmap[13].intensity >= 1);
}

// TC-STORE-R-01: rate tạo state, tăng XP, đếm thẻ mới trong ngày, ghi log
{
  resetStore();
  const card = TOKUTEI_VOCAB[0];
  useReviewStore.getState().rate(card.id, 'good', NOW);
  const state = useReviewStore.getState();
  assert.equal(state.states[card.id].phase, 'learning');
  assert.equal(state.newIntroducedToday, 1);
  assert.equal(state.totalReviewXp, 10);
  assert.equal(state.log.length, 1);
  assert.equal(state.log[0].phase, 'new');
}

// TC-STORE-R-02: rate lần hai KHÔNG tăng số thẻ mới
{
  resetStore();
  const card = TOKUTEI_VOCAB[0];
  useReviewStore.getState().rate(card.id, 'good', NOW);
  useReviewStore.getState().rate(card.id, 'good', NOW + 10 * 60_000);
  assert.equal(useReviewStore.getState().newIntroducedToday, 1);
  assert.equal(useReviewStore.getState().states[card.id].phase, 'review');
}

// TC-STORE-R-03: sang ngày mới thì bộ đếm thẻ mới reset
{
  resetStore();
  useReviewStore.getState().rate(TOKUTEI_VOCAB[0].id, 'good', NOW);
  useReviewStore.getState().rate(TOKUTEI_VOCAB[1].id, 'good', NOW + DAY);
  assert.equal(useReviewStore.getState().newIntroducedToday, 1);
}

// TC-STORE-R-04: restoreCardState hoàn tác đúng state + log
{
  resetStore();
  const card = TOKUTEI_VOCAB[0];
  useReviewStore.getState().rate(card.id, 'again', NOW);
  useReviewStore.getState().restoreCardState(card.id, undefined, 0);
  const state = useReviewStore.getState();
  assert.equal(state.states[card.id], undefined);
  assert.equal(state.log.length, 0);
}

// TC-STORE-R-05: resetCard xóa tiến độ một thẻ
{
  resetStore();
  const card = TOKUTEI_VOCAB[0];
  useReviewStore.getState().rate(card.id, 'good', NOW);
  useReviewStore.getState().resetCard(card.id);
  assert.equal(useReviewStore.getState().states[card.id], undefined);
}

// eslint-disable-next-line no-console
console.log('✓ reviewStore.test passed');
