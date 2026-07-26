/**
 * Leaderboard tuần — kết hợp XP thật của người học với các "bạn học đồng hành"
 * được mô phỏng tất định theo ngày (không random loạn giữa các lần render).
 */

export interface LeaderboardRow {
  id: string;
  name: string;
  level: string;
  weeklyXp: number;
  streak: number;
  status: string;
  isUser: boolean;
}

interface BotSeed {
  id: string;
  name: string;
  level: string;
  /** XP kiếm được trung bình mỗi ngày trong tuần */
  perDay: number;
  baseStreak: number;
  statusPool: string[];
}

const BOTS: BotSeed[] = [
  {
    id: 'hana',
    name: 'Hana Le',
    level: 'Interview',
    perDay: 96,
    baseStreak: 18,
    statusPool: ['Vừa xong HR mock room', 'Đang luyện shibou douki', 'Ôn 40 thẻ sáng nay'],
  },
  {
    id: 'nam',
    name: 'Nam Pham',
    level: 'Workplace',
    perDay: 74,
    baseStreak: 12,
    statusPool: ['Đang luyện nhà hàng Tokutei', 'Word Builder 3 vòng liền', 'Học nhóm tối thứ 4'],
  },
  {
    id: 'mai',
    name: 'Mai Tran',
    level: 'JFT Basic',
    perDay: 58,
    baseStreak: 6,
    statusPool: ['Vừa xong mini mock đầu ca', 'Ôn chủ đề an toàn', 'Nghe podcast bài 2'],
  },
  {
    id: 'tuan',
    name: 'Tuan Vo',
    level: 'Hồ sơ',
    perDay: 41,
    baseStreak: 4,
    statusPool: ['Đang soạn rirekisho', 'Check lại giấy tờ zairyuu', 'Học 10 từ mới hôm qua'],
  },
  {
    id: 'lan',
    name: 'Lan Nguyen',
    level: 'Tokutei Core',
    perDay: 33,
    baseStreak: 9,
    statusPool: ['Luyện phát âm aisatsu', 'Cram 20 thẻ giờ nghỉ', 'Mới lên Level 3'],
  },
];

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return result;
}

/** Thứ trong tuần theo kiểu "tuần học": T2 = 0 ... CN = 6 */
function weekdayIndex(now: number): number {
  const day = new Date(now).getDay();
  return (day + 6) % 7;
}

/** Số ngày kể từ epoch — làm seed thay đổi theo ngày. */
function dayNumber(now: number): number {
  return Math.floor(now / 86_400_000);
}

export function botWeeklyXp(bot: BotSeed, now: number): number {
  const daysElapsed = weekdayIndex(now) + 1;
  const variance = (hash(`${bot.id}-${dayNumber(now)}`) % 41) - 20; // ±20
  return Math.max(0, bot.perDay * daysElapsed + variance);
}

export function botStatus(bot: BotSeed, now: number): string {
  return bot.statusPool[hash(`${bot.id}-${dayNumber(now)}`) % bot.statusPool.length];
}

export function botStreak(bot: BotSeed, now: number): number {
  // Streak bot tăng chậm theo tuần để bảng luôn "sống"
  return bot.baseStreak + (dayNumber(now) % 7 === 0 ? 1 : 0);
}

export interface UserLeaderboardInput {
  weeklyXp: number;
  streak: number;
  name?: string;
}

export function getWeeklyLeaderboard(user: UserLeaderboardInput, now: number = Date.now()): LeaderboardRow[] {
  const rows: LeaderboardRow[] = BOTS.map((bot) => ({
    id: bot.id,
    name: bot.name,
    level: bot.level,
    weeklyXp: botWeeklyXp(bot, now),
    streak: botStreak(bot, now),
    status: botStatus(bot, now),
    isUser: false,
  }));

  rows.push({
    id: 'me',
    name: user.name ?? 'Anh',
    level: 'Tokutei Track',
    weeklyXp: Math.max(0, Math.round(user.weeklyXp)),
    streak: user.streak,
    status: user.weeklyXp > 0 ? 'Đang giữ nhịp học tuần này' : 'Bắt đầu phiên ôn đầu tiên nào!',
    isUser: true,
  });

  return rows.sort((a, b) => b.weeklyXp - a.weeklyXp);
}
