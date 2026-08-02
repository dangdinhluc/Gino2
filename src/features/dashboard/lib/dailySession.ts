export interface DailySessionStep {
  id: 'review' | 'lesson' | 'speaking';
  title: string;
  detail: string;
  minutes: number;
  xp: number;
  path: string;
}

export interface DailySession {
  totalMinutes: number;
  track: string;
  steps: DailySessionStep[];
}

export function buildDailySession(dueCount: number): DailySession {
  const hasDueCards = dueCount > 0;

  return {
    totalMinutes: 17,
    track: 'Tokutei Foundation · Workplace',
    steps: [
      {
        id: 'review',
        title: hasDueCards ? `Ôn ${Math.min(dueCount, 8)} thẻ tới hạn` : 'Học 8 từ mới',
        detail: hasDueCards ? 'Củng cố cụm từ cần nhớ hôm nay' : 'Xây nền từ vựng cho ca làm',
        minutes: 5,
        xp: 12,
        path: hasDueCards ? '/app/review/flashcards?focus=1' : '/app/review/flashcards?mode=new&focus=1',
      },
      {
        id: 'lesson',
        title: 'Workplace: báo cáo đầu ca',
        detail: '1 bài ngắn theo lộ trình Tokutei',
        minutes: 8,
        xp: 18,
        path: '/app/courses',
      },
      {
        id: 'speaking',
        title: 'Nói 1 câu tự giới thiệu',
        detail: 'Luyện phản xạ, nhận 1 lỗi chính',
        minutes: 4,
        xp: 12,
        path: '/app/ai-speak',
      },
    ],
  };
}
