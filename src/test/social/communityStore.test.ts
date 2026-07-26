import { strict as assert } from 'node:assert';
import { getAutoReply, replyDelayMs, THREADS } from '@/src/features/social/lib/autoReply';
import { botWeeklyXp, getWeeklyLeaderboard } from '@/src/features/social/lib/leaderboard';
import {
  journalStreak,
  unreadCount,
  useCommunityStore,
} from '@/src/features/social/store/communityStore';

const NOW = new Date('2026-07-20T09:00:00').getTime();
const DAY = 86_400_000;

function resetStore() {
  useCommunityStore.setState({ journal: [], lastReadAt: {} });
}

// TC-COM-01: leaderboard chứa user + 5 bot, sắp xếp giảm dần theo XP
{
  const rows = getWeeklyLeaderboard({ weeklyXp: 120, streak: 3 }, NOW);
  assert.equal(rows.length, 6);
  assert.ok(rows.some((row) => row.isUser));
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].weeklyXp >= rows[i].weeklyXp, 'phải sắp xếp giảm dần');
  }
}

// TC-COM-02: leaderboard tất định trong cùng một ngày
{
  const first = getWeeklyLeaderboard({ weeklyXp: 50, streak: 1 }, NOW);
  const second = getWeeklyLeaderboard({ weeklyXp: 50, streak: 1 }, NOW + 60_000);
  assert.deepEqual(first.map((row) => `${row.id}:${row.weeklyXp}`), second.map((row) => `${row.id}:${row.weeklyXp}`));
}

// TC-COM-03: XP user cao vượt trội thì đứng hạng 1
{
  const rows = getWeeklyLeaderboard({ weeklyXp: 999_999, streak: 30 }, NOW);
  assert.equal(rows[0].isUser, true);
}

// TC-COM-04: botWeeklyXp không âm
{
  const rows = getWeeklyLeaderboard({ weeklyXp: 0, streak: 0 }, NOW);
  for (const row of rows) assert.ok(row.weeklyXp >= 0);
  assert.ok(botWeeklyXp !== undefined);
}

// TC-COM-05: autoReply trả câu không rỗng cho mọi kênh, khớp từ khóa phỏng vấn
{
  for (const thread of THREADS) {
    const reply = getAutoReply(thread.id, 'Em muốn luyện phỏng vấn');
    assert.ok(reply.length > 10, `kênh ${thread.id} phải có câu trả lời`);
  }
  const fallback = getAutoReply('mentor', 'xyz không khớp gì cả');
  assert.ok(fallback.length > 10);
  const delay = replyDelayMs('hello');
  assert.ok(delay >= 1200 && delay <= 2600);
}

// TC-COM-06: journal thêm / sửa / xóa
{
  resetStore();
  const id = useCommunityStore.getState().addJournalEntry({ title: 'Ngày 1', content: 'Học houkoku và renraku.', tags: ['daily'] });
  assert.equal(useCommunityStore.getState().journal.length, 1);
  useCommunityStore.getState().updateJournalEntry(id, { title: 'Ngày 1 (sửa)' });
  assert.equal(useCommunityStore.getState().journal[0].title, 'Ngày 1 (sửa)');
  useCommunityStore.getState().deleteJournalEntry(id);
  assert.equal(useCommunityStore.getState().journal.length, 0);
}

// TC-COM-07: journal không tiêu đề có fallback
{
  resetStore();
  useCommunityStore.getState().addJournalEntry({ title: '   ', content: 'nội dung' });
  assert.equal(useCommunityStore.getState().journal[0].title, 'Ghi chú không tiêu đề');
}

// TC-COM-08: sendMessage + receiveMessage nối vào đúng kênh
{
  const before = (useCommunityStore.getState().messages['mentor'] ?? []).length;
  useCommunityStore.getState().sendMessage('mentor', 'Chào mentor');
  useCommunityStore.getState().receiveMessage('mentor', 'Chào anh!');
  const after = useCommunityStore.getState().messages['mentor'];
  assert.equal(after.length, before + 2);
  assert.equal(after[after.length - 2].from, 'me');
  assert.equal(after[after.length - 1].from, 'them');
}

// TC-COM-09: unreadCount chỉ đếm tin "them" sau lastReadAt
{
  const messages = [
    { id: '1', from: 'them' as const, text: 'a', at: 100 },
    { id: '2', from: 'me' as const, text: 'b', at: 200 },
    { id: '3', from: 'them' as const, text: 'c', at: 300 },
  ];
  assert.equal(unreadCount(messages, undefined), 2);
  assert.equal(unreadCount(messages, 150), 1);
  assert.equal(unreadCount(messages, 400), 0);
  assert.equal(unreadCount(undefined, 0), 0);
}

// TC-COM-10: journalStreak đếm chuỗi ngày liên tục
{
  const entries = [
    { id: 'a', title: '', content: '', prompt: null, tags: [], createdAt: NOW, updatedAt: NOW },
    { id: 'b', title: '', content: '', prompt: null, tags: [], createdAt: NOW - DAY, updatedAt: NOW - DAY },
    { id: 'c', title: '', content: '', prompt: null, tags: [], createdAt: NOW - 3 * DAY, updatedAt: NOW - 3 * DAY },
  ];
  assert.equal(journalStreak(entries, NOW), 2);
  assert.equal(journalStreak([], NOW), 0);
  // hôm nay chưa viết nhưng hôm qua có → vẫn tính từ hôm qua
  assert.equal(journalStreak(entries.slice(1), NOW), 1);
}

// eslint-disable-next-line no-console
console.log('✓ communityStore.test passed');
