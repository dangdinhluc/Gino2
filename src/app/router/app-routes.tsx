import { Navigate, Route } from 'react-router-dom';
import { MainLayout } from '@/src/app/layouts/MainLayout';
import { ProtectedRoute } from '@/src/features/auth/components/ProtectedRoute';
import DashboardPage from '@/src/features/dashboard/pages/DashboardPage';
import StatsAchievementsPage from '@/src/features/dashboard/pages/StatsAchievementsPage';
import CourseListPage from '@/src/features/courses/pages/CourseListPage';
import CourseLearningPage from '@/src/features/courses/pages/CourseLearningPage';
import ExamCenterPage from '@/src/features/exams/pages/ExamCenterPage';
import ExamRunnerPage from '@/src/features/exams/pages/ExamRunnerPage';
import ExamResultPage from '@/src/features/exams/pages/ExamResultPage';
import GrammarLibraryPage from '@/src/features/grammar/pages/GrammarLibraryPage';
import GrammarTopicDetailPage from '@/src/features/grammar/pages/GrammarTopicDetailPage';
import VocabularyDetailPage from '@/src/features/grammar/pages/VocabularyDetailPage';
import ReviewCenterPage from '@/src/features/review/pages/ReviewCenterPage';
import PracticePage from '@/src/features/review/pages/PracticePage';
import FlashcardSessionPage from '@/src/features/review/pages/FlashcardSessionPage';
import AIWritingLabPage from '@/src/features/ai/pages/AIWritingLabPage';
import WritingHistoryPage from '@/src/features/ai/pages/WritingHistoryPage';
import AISprechenLabPage from '@/src/features/ai/pages/AISprechenLabPage';
import SpeakingHistoryPage from '@/src/features/ai/pages/SpeakingHistoryPage';
import AITutorChatPage from '@/src/features/ai/pages/AITutorChatPage';
import LearningHubPage from '@/src/features/hub/pages/LearningHubPage';
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
      <Route path="courses/:id" element={<Navigate to="learn" replace />} />
      <Route path="courses/:id/learn" element={<CourseLearningPage />} />
      <Route path="exams" element={<ExamCenterPage />} />
      <Route path="exams/:id/start" element={<ExamRunnerPage />} />
      <Route path="exams/:id/result" element={<ExamResultPage />} />
      <Route path="grammar" element={<GrammarLibraryPage />} />
      <Route path="grammar/:id" element={<GrammarTopicDetailPage />} />
      <Route path="vocabulary/:wordId" element={<VocabularyDetailPage />} />
      <Route path="ai-lab" element={<AIWritingLabPage />} />
      <Route path="ai-lab/history" element={<WritingHistoryPage />} />
      <Route path="ai-speak" element={<AISprechenLabPage />} />
      <Route path="ai-speak/history" element={<SpeakingHistoryPage />} />
      <Route path="ai-chat" element={<AITutorChatPage />} />
      <Route path="journal" element={<JournalPage />} />
      <Route path="friends" element={<FriendsPage />} />
      <Route path="messages" element={<MessagesPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="review" element={<Navigate to="/app/practice" replace />} />
      <Route path="review/flashcards" element={<FlashcardSessionPage />} />
      <Route path="practice" element={<ReviewCenterPage />} />
      <Route path="practice/custom" element={<PracticePage />} />
      <Route path="hub" element={<LearningHubPage />} />
      <Route path="stats" element={<StatsAchievementsPage />} />
      <Route path="profile" element={<ProfilePage />} />
    </Route>
  );
}
