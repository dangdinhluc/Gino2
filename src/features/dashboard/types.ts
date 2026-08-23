export interface RealDashboardData {
  profile: {
    name: string;
    avatar?: string | null;
  };
  course: {
    id: string;
    title: string;
    progress: number;
    nextLesson?: string | null;
  } | null;
  today: {
    vocabularyDue: number;
    reviewCount: number;
    studyMinutes: number;
  };
  stats: {
    streak: number;
    xp: number;
    learnedWords: number;
  };
  weakPoints: Array<{
    title: string;
    score: number;
  }>;
}
