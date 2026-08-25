import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { MainLayout } from '@/src/app/layouts/MainLayout';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import { CourseEntryRedirect } from '@/src/features/courses/components/CourseEntryRedirect';
import { ActiveCourseGuard } from '@/src/features/courses/components/ActiveCourseGuard';
import { DashboardLoading } from '@/src/features/dashboard/components/DashboardLoading';

const TodayPage = lazy(() => import('@/src/features/dashboard/pages/TodayPage'));
const DashboardPage = lazy(() => import('@/src/features/dashboard/pages/DashboardPage'));
const CourseListPage = lazy(() => import('@/src/features/courses/pages/CourseListPage'));
const CourseHomePage = lazy(() => import('@/src/features/courses/pages/CourseHomePage'));
const CourseLearningPage = lazy(() => import('@/src/features/courses/pages/CourseLearningPage'));
const PackageCatalogPage = lazy(() => import('@/src/features/enrollments/pages/PackageCatalogPage'));
const ExamRunnerPage = lazy(() => import('@/src/features/exams/pages/ExamRunnerPage'));
const ExamResultPage = lazy(() => import('@/src/features/exams/pages/ExamResultPage'));
const GrammarLibraryPage = lazy(() => import('@/src/features/grammar/pages/GrammarLibraryPage'));
const GrammarTopicDetailPage = lazy(() => import('@/src/features/grammar/pages/GrammarTopicDetailPage'));
const VocabularyDetailPage = lazy(() => import('@/src/features/grammar/pages/VocabularyDetailPage'));
const PracticeHubPage = lazy(() => import('@/src/features/review/pages/PracticeHubPage'));
const ReviewCenterPage = lazy(() => import('@/src/features/review/pages/ReviewCenterPage'));
const FlashcardSessionPage = lazy(() => import('@/src/features/review/pages/FlashcardSessionPage'));
const AIWritingLabPage = lazy(() => import('@/src/features/ai/pages/AIWritingLabPage'));
const WritingHistoryPage = lazy(() => import('@/src/features/ai/pages/WritingHistoryPage'));
const AISprechenLabPage = lazy(() => import('@/src/features/ai/pages/AISprechenLabPage'));
const SpeakingHistoryPage = lazy(() => import('@/src/features/ai/pages/SpeakingHistoryPage'));
const LearningHubPage = lazy(() => import('@/src/features/hub/pages/LearningHubPage'));
const ProfilePage = lazy(() => import('@/src/features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('@/src/features/profile/pages/SettingsPage'));
const JournalPage = lazy(() => import('@/src/features/social/pages/JournalPage'));
const CommunityPage = lazy(() => import('@/src/features/social/pages/CommunityPage'));
const NotificationCenterPage = lazy(() => import('@/src/features/notifications/pages/NotificationCenterPage'));

const routeLoading = <main className="grid min-h-[45vh] place-items-center text-sm font-bold text-[#5F6B7C]">Đang mở màn hình…</main>;
const screen = (content: ReactNode, fallback: ReactNode = routeLoading) => <Suspense fallback={fallback}>{content}</Suspense>;

export function AppRoutes() {
  return (
    <Route
      path="/app"
      element={
        <ProtectedRoute area="learner">
          <MainLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<CourseEntryRedirect />} />
      <Route path="dashboard" element={screen(<TodayPage />, <DashboardLoading />)} />
      <Route path="progress" element={screen(<DashboardPage />)} />
      <Route path="courses" element={screen(<CourseListPage />)} />
      <Route path="enrollments" element={screen(<PackageCatalogPage />)} />
      <Route path="courses/:id" element={<Navigate to="learn" replace />} />
      <Route path="courses/:id/learn" element={<ActiveCourseGuard>{screen(<CourseHomePage />)}</ActiveCourseGuard>} />
      <Route path="courses/:id/workspace" element={<ActiveCourseGuard>{screen(<CourseLearningPage />)}</ActiveCourseGuard>} />
      <Route path="exams" element={<CourseEntryRedirect destination="exams" />} />
      <Route path="exams/:id/start" element={screen(<ExamRunnerPage />)} />
      <Route path="exams/:id/result" element={screen(<ExamResultPage />)} />
      <Route path="grammar" element={screen(<GrammarLibraryPage />)} />
      <Route path="grammar/:id" element={screen(<GrammarTopicDetailPage />)} />
      <Route path="vocabulary/:wordId" element={screen(<VocabularyDetailPage />)} />
      <Route path="ai-lab" element={screen(<AIWritingLabPage />)} />
      <Route path="ai-lab/history" element={screen(<WritingHistoryPage />)} />
      <Route path="ai-speak" element={screen(<AISprechenLabPage />)} />
      <Route path="ai-speak/history" element={screen(<SpeakingHistoryPage />)} />
      <Route path="journal" element={screen(<JournalPage />)} />
      <Route path="community" element={screen(<CommunityPage />)} />
      <Route path="notifications" element={screen(<NotificationCenterPage />)} />
      <Route path="search" element={<Navigate to="/app/dashboard" replace />} />
      <Route path="friends" element={<Navigate to="/app/community" replace />} />
      <Route path="messages" element={<Navigate to="/app/community" replace />} />
      <Route path="settings" element={screen(<SettingsPage />)} />
      <Route path="review" element={<Navigate to="/app/practice" replace />} />
      <Route path="review/flashcards" element={screen(<FlashcardSessionPage />)} />
      <Route path="practice" element={screen(<PracticeHubPage />)} />
      <Route path="practice/review" element={screen(<ReviewCenterPage />)} />
      <Route path="practice/custom" element={<Navigate to="/app/practice/review" replace />} />
      <Route path="hub" element={screen(<LearningHubPage />)} />
      <Route path="profile" element={screen(<ProfilePage />)} />
    </Route>
  );
}
