// Dữ liệu mẫu cho dashboard học tập gamified (tham khảo bố cục brottin.quest).
// Giữ dạng mock thuần để UI hiển thị sống động; có thể thay bằng dữ liệu thật sau.

export interface LeaderboardPeer {
  id: string;
  name: string;
  xp: number;
  /** Tổng số phút đã học trong tháng. */
  minutes: number;
}

// Những người học khác (chưa gồm người dùng hiện tại — sẽ được chèn động ở trang).
export const leaderboardPeers: LeaderboardPeer[] = [
  { id: 'u1', name: 'Dương ở Tokyo', xp: 1860, minutes: 204 },
  { id: 'u2', name: 'Phạm Nguyên Thảo', xp: 1740, minutes: 189 },
  { id: 'u3', name: 'Somebody', xp: 1560, minutes: 175 },
  { id: 'u4', name: 'Anh Mai', xp: 1180, minutes: 88 },
  { id: 'u5', name: 'Dung Ngọc', xp: 940, minutes: 70 },
  { id: 'u6', name: 'ryp weiwei', xp: 620, minutes: 57 },
  { id: 'u7', name: 'bears', xp: 540, minutes: 49 },
  { id: 'u8', name: 'Schatou Le', xp: 480, minutes: 48 },
  { id: 'u9', name: 'ngọc ngọc', xp: 430, minutes: 46 },
  { id: 'u10', name: 'Minh Trần', xp: 260, minutes: 28 },
];

export interface LearningTrack {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1';
  learned: number;
  total: number;
  path: string;
}

// Tiến trình học theo module (từ vựng đã học / tổng), có tag trình độ.
export const learningTracks: LearningTrack[] = [
  { id: 'core-a1', title: 'Từ vựng cốt lõi N5', level: 'A1', learned: 128, total: 299, path: '/app/courses' },
  { id: 'greeting', title: 'Chào hỏi & Hằng ngày', level: 'A1', learned: 20, total: 20, path: '/app/courses' },
  { id: 'adv-a1', title: 'Từ vựng nâng cao N5', level: 'A1', learned: 46, total: 224, path: '/app/courses' },
  { id: 'workplace', title: 'Hội thoại công xưởng', level: 'A2', learned: 8, total: 25, path: '/app/courses' },
  { id: 'interview', title: 'Phỏng vấn Tokutei', level: 'B1', learned: 0, total: 27, path: '/app/courses' },
];

export interface SpellingDrill {
  id: string;
  title: string;
  sub: string;
  sample: string;
  path: string;
}

// Mục "Chính tả": luyện viết đúng mặt chữ.
export const spellingDrills: SpellingDrill[] = [
  { id: 'hiragana', title: 'Hiragana', sub: 'Nghe và viết lại âm cơ bản', sample: 'あいう', path: '/app/hub' },
  { id: 'katakana', title: 'Katakana', sub: 'Từ ngoại lai thường gặp', sample: 'アイウ', path: '/app/hub' },
  { id: 'kanji-n5', title: 'Kanji N5', sub: 'Viết đúng nét và âm đọc', sample: '日本語', path: '/app/hub' },
];

// Mỗi cấp độ cần bao nhiêu XP.
export const XP_PER_LEVEL = 500;

// Mục tiêu XP mỗi ngày.
export const DAILY_GOAL_XP = 50;

// Mục tiêu số phút học mỗi ngày.
export const DAILY_GOAL_MINUTES = 15;
