import { strict as assert } from 'node:assert';
import {
  SRS_CONFIG,
  cardStrength,
  createNewCardState,
  endOfDay,
  isDue,
  previewIntervals,
  rateCard,
  startOfDay,
  xpForRating,
} from '@/src/features/review/lib/srs';

const NOW = new Date('2026-07-20T09:00:00').getTime();
const MINUTE = 60_000;
const DAY = 86_400_000;

// TC-SRS-01: thẻ mới + good → sang learning step 2 (10 phút)
{
  const state = createNewCardState(NOW);
  const next = rateCard(state, 'good', NOW);
  assert.equal(next.phase, 'learning');
  assert.equal(next.stepIndex, 1);
  assert.equal(next.due, NOW + 10 * MINUTE);
}

// TC-SRS-02: thẻ mới + again → learning step 1 (1 phút)
{
  const state = createNewCardState(NOW);
  const next = rateCard(state, 'again', NOW);
  assert.equal(next.phase, 'learning');
  assert.equal(next.stepIndex, 0);
  assert.equal(next.due, NOW + 1 * MINUTE);
}

// TC-SRS-03: thẻ mới + easy → nhảy thẳng review với interval 4 ngày
{
  const state = createNewCardState(NOW);
  const next = rateCard(state, 'easy', NOW);
  assert.equal(next.phase, 'review');
  assert.equal(next.intervalDays, SRS_CONFIG.easyIntervalDays);
  assert.equal(next.due, startOfDay(NOW) + 4 * DAY);
  assert.equal(next.reps, 1);
}

// TC-SRS-04: learning step cuối + good → tốt nghiệp review 1 ngày
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'good', NOW); // step 1 → 2
  const next = rateCard(state, 'good', NOW + 10 * MINUTE);
  assert.equal(next.phase, 'review');
  assert.equal(next.intervalDays, SRS_CONFIG.graduatingIntervalDays);
  assert.equal(next.reps, 1);
}

// TC-SRS-05: review + good → interval x ease (1 → 3 ngày với ease 2.5)
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'good', NOW);
  state = rateCard(state, 'good', NOW + 10 * MINUTE); // graduate: interval 1
  const next = rateCard(state, 'good', NOW + DAY);
  assert.equal(next.phase, 'review');
  assert.equal(next.intervalDays, Math.round(1 * 2.5));
  assert.equal(next.reps, 2);
}

// TC-SRS-06: review + again → relearning, lapse++, ease giảm, interval bị cắt
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'easy', NOW); // review, interval 4
  const next = rateCard(state, 'again', NOW + 4 * DAY);
  assert.equal(next.phase, 'relearning');
  assert.equal(next.lapses, 1);
  assert.equal(next.ease, 2.3);
  assert.equal(next.intervalDays, 2); // 4 * 0.5
}

// TC-SRS-07: relearning + good → quay lại review giữ interval đã cắt
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'easy', NOW);
  state = rateCard(state, 'again', NOW + 4 * DAY); // relearning, interval 2
  const next = rateCard(state, 'good', NOW + 4 * DAY + 10 * MINUTE);
  assert.equal(next.phase, 'review');
  assert.equal(next.intervalDays, 2);
}

// TC-SRS-08: ease không bao giờ xuống dưới sàn 1.3
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'easy', NOW);
  let at = NOW;
  for (let i = 0; i < 12; i++) {
    at += DAY;
    state = rateCard(state, 'again', at); // relearning
    at += 10 * MINUTE;
    state = rateCard(state, 'good', at); // back to review
  }
  assert.equal(state.ease, SRS_CONFIG.minEase);
}

// TC-SRS-09: review + hard → interval x1.2, ease -0.15
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'easy', NOW); // interval 4, ease 2.5
  const next = rateCard(state, 'hard', NOW + 4 * DAY);
  assert.equal(next.ease, 2.35);
  assert.equal(next.intervalDays, Math.round(4 * 1.2));
}

// TC-SRS-10: isDue — thẻ review tới hạn theo ngày, thẻ learning theo phút
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'good', NOW); // learning, due +10p
  assert.equal(isDue(state, NOW + 5 * MINUTE), false);
  assert.equal(isDue(state, NOW + 11 * MINUTE), true);

  let review = createNewCardState(NOW);
  review = rateCard(review, 'easy', NOW); // due +4 ngày (đầu ngày)
  assert.equal(isDue(review, NOW + 3 * DAY), false);
  assert.equal(isDue(review, startOfDay(NOW) + 4 * DAY + 60_000), true);
  // thẻ review tới hạn trong ngày được tính due cả ngày hôm đó
  assert.equal(isDue(review, endOfDay(startOfDay(NOW) + 4 * DAY)), true);
}

// TC-SRS-11: thẻ mới không bao giờ "due"
{
  const state = createNewCardState(NOW);
  assert.equal(isDue(state, NOW + 100 * DAY), false);
}

// TC-SRS-12: preview interval cho thẻ mới
{
  const preview = previewIntervals(createNewCardState(NOW));
  assert.equal(preview.again, '1 p');
  assert.equal(preview.hard, '1 p');
  assert.equal(preview.good, '10 p');
  assert.equal(preview.easy, '4 ng');
}

// TC-SRS-13: preview interval cho thẻ review
{
  let state = createNewCardState(NOW);
  state = rateCard(state, 'easy', NOW); // interval 4, ease 2.5
  const preview = previewIntervals(state);
  assert.equal(preview.again, '10 p');
  assert.equal(preview.hard, '5 ng'); // 4*1.2 = 4.8 → 5
  assert.equal(preview.good, '10 ng'); // 4*2.5
  assert.equal(preview.easy, '14 ng'); // 4*2.65*1.3 = 13.78 → 14
}

// TC-SRS-14: cardStrength tăng dần theo tiến độ
{
  const fresh = createNewCardState(NOW);
  assert.equal(cardStrength(undefined), 0);
  assert.equal(cardStrength(fresh), 0);
  const learning = rateCard(fresh, 'good', NOW);
  assert.ok(cardStrength(learning) > 0);
  const review = rateCard(fresh, 'easy', NOW);
  assert.ok(cardStrength(review) > cardStrength(learning));
}

// TC-SRS-15: XP theo rating
{
  assert.equal(xpForRating('again'), 2);
  assert.equal(xpForRating('hard'), 5);
  assert.equal(xpForRating('good'), 10);
  assert.equal(xpForRating('easy'), 10);
}

// eslint-disable-next-line no-console
console.log('✓ srs.test passed');
