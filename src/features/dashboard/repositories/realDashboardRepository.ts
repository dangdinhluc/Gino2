import { fetchPublishedCourseForLearner, type CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { fetchDailyLearningPlan, type DailyLearningPlan } from './learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from './learnerStatsRepository';

export type DashboardWarning = 'profile' | 'stats' | 'plan';

export interface RealDashboardData {
  profile: {
    name: string;
    avatar?: string;
  };
  activeCourse: {
    id: string;
    title: string;
    progress: number;
    nextLesson: { id: string; title: string } | null;
  } | null;
  courses: Array<{
    id: string;
    title: string;
    progress: number;
    image: string;
    totalLessons: number;
  }>;
  today: {
    vocabularyDue: number;
    exercises: number;
    lessons: number;
  };
  stats: {
    streak: number;
    xp: number;
    learnedWords: number;
    studyMinutes: number | null;
  };
  weakPoints: Array<{
    title: string;
    accuracy: number;
  }>;
  warnings?: DashboardWarning[];
}

interface RealDashboardSources {
  profile: LearnerProfileSnapshot;
  stats: LearnerStatsSnapshot;
  plan: DailyLearningPlan;
  courses: CourseListEntry[];
  warnings?: DashboardWarning[];
}

export interface RealDashboardCacheEntry {
  data: RealDashboardData;
  fetchedAt: number;
}

interface SettledValue<T> {
  ok: boolean;
  value?: T;
}

export const REAL_DASHBOARD_CACHE_STALE_TIME_MS = 45_000;
const dashboardCache = new Map<string, RealDashboardCacheEntry>();
const dashboardRequests = new Map<string, Promise<RealDashboardData>>();

function dashboardCacheKey(userId: string, activeCourseId: string): string {
  return `${userId}:${activeCourseId}`;
}

function settle<T>(promise: Promise<T>): Promise<SettledValue<T>> {
  return promise.then(
    (value) => ({ ok: true, value }),
    () => ({ ok: false }),
  );
}

export function readRealDashboardCache(userId: string, activeCourseId: string): RealDashboardCacheEntry | null {
  return dashboardCache.get(dashboardCacheKey(userId, activeCourseId)) ?? null;
}

export function clearRealDashboardCache(userId?: string): void {
  if (!userId) {
    dashboardCache.clear();
    return;
  }

  for (const key of dashboardCache.keys()) {
    if (key.startsWith(`${userId}:`)) dashboardCache.delete(key);
  }
}

function emptyProfile(): LearnerProfileSnapshot {
  return {
    displayName: 'Học viên',
    email: '',
    targetLevel: 'Tokutei Gino',
  };
}

function emptyStats(): LearnerStatsSnapshot {
  return {
    totalXp: 0,
    weeklyXp: 0,
    dailyXp: 0,
    reviewedToday: 0,
    totalReviews: 0,
    currentStreak: 0,
    masteredVocabulary: 0,
    dueVocabulary: 0,
    weeklyActivity: [],
    topicMastery: [],
  };
}

function emptyPlan(dueVocabulary = 0): DailyLearningPlan {
  return { goalMinutes: 20, dueVocabulary, nextLesson: null, weakAssessment: null };
}

export function mapRealDashboardData({ profile, stats, plan, courses, warnings = [] }: RealDashboardSources, activeCourseId?: string): RealDashboardData {
  const enrolledCourses = courses.filter((course) => course.isEnrolled === true);
  const activeCourseEntry = activeCourseId
    ? enrolledCourses.find((course) => course.id === activeCourseId) ?? null
    : enrolledCourses.find((course) => course.id === plan.nextLesson?.courseId)
      ?? enrolledCourses.find((course) => course.progress > 0 && course.progress < 100)
      ?? enrolledCourses[0]
      ?? null;
  const nextLesson = activeCourseEntry && plan.nextLesson?.courseId === activeCourseEntry.id
    ? { id: plan.nextLesson.id, title: plan.nextLesson.title }
    : null;

  return {
    profile: { name: profile.displayName },
    activeCourse: activeCourseEntry
      ? {
          id: activeCourseEntry.id,
          title: activeCourseEntry.title,
          progress: activeCourseEntry.progress,
          nextLesson,
        }
      : null,
    courses: activeCourseEntry ? [activeCourseEntry].map((course) => ({
      id: course.id,
      title: course.title,
      progress: course.progress,
      image: course.image,
      totalLessons: course.totalLessons,
    })) : [],
    today: {
      vocabularyDue: plan.dueVocabulary,
      exercises: stats.reviewedToday,
      lessons: nextLesson ? 1 : 0,
    },
    stats: {
      streak: stats.currentStreak,
      xp: stats.dailyXp,
      learnedWords: stats.masteredVocabulary,
      studyMinutes: null,
    },
    weakPoints: plan.weakAssessment
      ? [{ title: plan.weakAssessment.title, accuracy: plan.weakAssessment.score }]
      : [],
    warnings,
  };
}

export async function fetchRealDashboardData(
  userId: string,
  activeCourseId: string,
  options: { force?: boolean } = {},
): Promise<RealDashboardData> {
  const key = dashboardCacheKey(userId, activeCourseId);
  const cached = readRealDashboardCache(userId, activeCourseId);
  if (!options.force && cached && Date.now() - cached.fetchedAt < REAL_DASHBOARD_CACHE_STALE_TIME_MS) {
    return cached.data;
  }

  const inFlight = dashboardRequests.get(key);
  if (inFlight) return inFlight;

  const request = (async () => {
    // Start every Home source at the same time. Only the active course is
    // critical; profile/stats/plan failures must not blank an otherwise usable Home.
    const profilePromise = settle(fetchLearnerProfile(userId));
    const statsPromise = settle(fetchLearnerStats());
    const planPromise = settle(fetchDailyLearningPlan());
    const activeCourse = await fetchPublishedCourseForLearner(userId, activeCourseId);

    if (!activeCourse) {
      throw new Error('Khóa học đang học không còn khả dụng. Vui lòng chọn lại khóa học.');
    }

    const [profileResult, statsResult, planResult] = await Promise.all([
      profilePromise,
      statsPromise,
      planPromise,
    ]);

    const warnings: DashboardWarning[] = [];
    const profile = profileResult.ok && profileResult.value ? profileResult.value : emptyProfile();
    const stats = statsResult.ok && statsResult.value ? statsResult.value : emptyStats();
    const plan = planResult.ok && planResult.value ? planResult.value : emptyPlan(stats.dueVocabulary);
    if (!profileResult.ok) warnings.push('profile');
    if (!statsResult.ok) warnings.push('stats');
    if (!planResult.ok) warnings.push('plan');

    const data = mapRealDashboardData({ profile, stats, plan, courses: [activeCourse], warnings }, activeCourseId);
    dashboardCache.set(key, { data, fetchedAt: Date.now() });
    return data;
  })();

  dashboardRequests.set(key, request);
  try {
    return await request;
  } finally {
    dashboardRequests.delete(key);
  }
}
