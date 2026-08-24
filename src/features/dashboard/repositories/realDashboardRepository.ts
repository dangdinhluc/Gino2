import { fetchPublishedCourses, type CourseListEntry } from '@/src/features/courses/repositories/coursesRepository';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { fetchDailyLearningPlan, type DailyLearningPlan } from './learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from './learnerStatsRepository';

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
}

interface RealDashboardSources {
  profile: LearnerProfileSnapshot;
  stats: LearnerStatsSnapshot;
  plan: DailyLearningPlan;
  courses: CourseListEntry[];
}

export function mapRealDashboardData({ profile, stats, plan, courses }: RealDashboardSources, activeCourseId?: string): RealDashboardData {
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
  };
}

export async function fetchRealDashboardData(userId: string, activeCourseId: string): Promise<RealDashboardData> {
  const [profile, stats, plan, courses] = await Promise.all([
    fetchLearnerProfile(userId),
    fetchLearnerStats(),
    fetchDailyLearningPlan(),
    fetchPublishedCourses(),
  ]);

  return mapRealDashboardData({ profile, stats, plan, courses }, activeCourseId);
}
