import { strict as assert } from 'node:assert';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';

// TC-DAILY-01: phiên mặc định luôn là một lộ trình ngắn, có thứ tự học rõ ràng.
{
  const session = buildDailySession(12);
  assert.equal(session.totalMinutes, 17);
  assert.deepEqual(session.steps.map((step) => step.id), ['review', 'lesson', 'speaking']);
  assert.equal(session.steps[0].path, '/app/review/flashcards?focus=1');
  assert.match(session.steps[0].title, /8 thẻ tới hạn/);
}

// TC-DAILY-02: khi không có thẻ tới hạn, bước đầu chuyển sang học từ mới thay vì phiên ôn rỗng.
{
  const session = buildDailySession(0);
  assert.equal(session.steps[0].path, '/app/review/flashcards?mode=new&focus=1');
  assert.match(session.steps[0].title, /8 từ mới/);
}

// eslint-disable-next-line no-console
console.log('✓ dailySession.test passed');
