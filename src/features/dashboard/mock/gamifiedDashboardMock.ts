// Dữ liệu mẫu cho dashboard học tập gamified (tham khảo bố cục brottin.quest).
// Giữ dạng mock thuần để UI hiển thị sống động; có thể thay bằng dữ liệu thật sau.

export interface LeaderboardPeer {
  id: string;
  name: string;
  xp: number;
}

// Những người học khác (chưa gồm người dùng hiện tại — sẽ được chèn động ở trang).
export const leaderboardPeers: LeaderboardPeer[] = [
  { id: 'u1', name: 'Somebody', xp: 1860 },
  { id: 'u2', name: 'Dương ở Berlin', xp: 1740 },
  { id: 'u3', name: 'Anh Mai', xp: 1320 },
  { id: 'u4', name: 'Phạm Nguyên Thảo', xp: 1180 },
  { id: 'u5', name: 'Dung Ngọc', xp: 640 },
  { id: 'u6', name: 'ryp weiwei', xp: 420 },
  { id: 'u7', name: 'bears', xp: 360 },
  { id: 'u8', name: 'Schatou Le', xp: 300 },
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
  { id: 'core-a1', title: 'Từ vựng cốt lõi A1', level: 'A1', learned: 128, total: 299, path: '/app/courses' },
  { id: 'greeting', title: 'Chào hỏi & Hằng ngày', level: 'A1', learned: 20, total: 20, path: '/app/courses' },
  { id: 'adv-a1', title: 'Từ vựng nâng cao A1', level: 'A1', learned: 46, total: 224, path: '/app/courses' },
  { id: 'workplace', title: 'Hội thoại công xưởng', level: 'A2', learned: 8, total: 25, path: '/app/courses' },
  { id: 'interview', title: 'Phỏng vấn Tokutei', level: 'B1', learned: 0, total: 27, path: '/app/courses' },
];

// Mỗi cấp độ cần bao nhiêu XP.
export const XP_PER_LEVEL = 500;

// Mục tiêu XP mỗi ngày.
export const DAILY_GOAL_XP = 50;
