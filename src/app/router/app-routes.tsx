import { Navigate, Route } from 'react-router-dom';
import { MainLayout } from '@/src/app/layouts/MainLayout';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import DashboardPage from '@/src/features/dashboard/pages/DashboardPage';
import SearchPage from '@/src/features/dashboard/pages/SearchPage';
import StatsAchievementsPage from '@/src/features/dashboard/pages/StatsAchievementsPage';
import CourseListPage from '@/src/features/courses/pages/CourseListPage';
import CourseDetailPage from '@/src/features/courses/pages/CourseDetailPage';
import CourseLearningPage from '@/src/features/courses/pages/CourseLearningPage';
import LessonPlayerPage from '@/src/features/courses/pages/LessonPlayerPage';
import ExamCenterPage from '@/src/features/exams/pages/ExamCenterPage';
import ExamRunnerPage from '@/src/features/exams/pages/ExamRunnerPage';
import ExamResultPage from '@/src/features/exams/pages/ExamResultPage';
import GrammarLibraryPage from '@/src/features/grammar/pages/GrammarLibraryPage';
import GrammarTopicDetailPage from '@/src/features/grammar/pages/GrammarTopicDetailPage';
import VocabularyDetailPage from '@/src/features/grammar/pages/VocabularyDetailPage';
import ReviewCenterPage from '@/src/features/review/pages/ReviewCenterPage';
import FlashcardSessionPage from '@/src/features/review/pages/FlashcardSessionPage';
import AIWritingLabPage from '@/src/features/ai/pages/AIWritingLabPage';
import WritingHistoryPage from '@/src/features/ai/pages/WritingHistoryPage';
import AISprechenLabPage from '@/src/features/ai/pages/AISprechenLabPage';
import SpeakingHistoryPage from '@/src/features/ai/pages/SpeakingHistoryPage';
import AITutorChatPage from '@/src/features/ai/pages/AITutorChatPage';
import LearningHubPage from '@/src/features/hub/pages/LearningHubPage';
import GameDetailPage from '@/src/features/hub/pages/GameDetailPage';
import ProfilePage from '@/src/features/profile/pages/ProfilePage';
import SettingsPage from '@/src/features/profile/pages/SettingsPage';
import FriendsPage from '@/src/features/social/pages/FriendsPage';
import MessagesPage from '@/src/features/social/pages/MessagesPage';
import JournalPage from '@/src/features/social/pages/JournalPage';

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
      <Route index element={<Navigate to="/app/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="courses" element={<CourseListPage />} />
      <Route path="courses/:id" element={<CourseDetailPage />} />
      <Route path="courses/:id/learn" element={<CourseLearningPage />} />
      <Route path="courses/:id/lessons/:lessonId" element={<LessonPlayerPage />} />
      <Route path="exams" element={<ExamCenterPage />} />
      <Route path="exams/:id/start" element={<ExamRunnerPage />} />
      <Route path="exams/:id/result" element={<ExamResultPage />} />
      <Route path="grammar" element={<GrammarLibraryPage />} />
      <Route path="grammar/:id" element={<GrammarTopicDetailPage />} />
      <Route path="vocabulary/:wordId" element={<VocabularyDetailPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="ai-lab" element={<AIWritingLabPage />} />
      <Route path="ai-lab/history" element={<WritingHistoryPage />} />
      <Route path="ai-speak" element={<AISprechenLabPage />} />
      <Route path="ai-speak/history" element={<SpeakingHistoryPage />} />
      <Route path="ai-chat" element={<AITutorChatPage />} />
      <Route path="journal" element={<JournalPage />} />
      <Route path="friends" element={<FriendsPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="review" element={<ReviewCenterPage />} />
      <Route path="review/flashcards" element={<FlashcardSessionPage />} />
      <Route path="hub" element={<LearningHubPage />} />
      <Route path="hub/:gameId" element={<GameDetailPage />} />
      <Route path="stats" element={<StatsAchievementsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  );
}
