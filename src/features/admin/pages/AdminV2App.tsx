import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';
import { canAccessAdminPath, getAdminDefaultPath } from '@/src/features/admin/lib/adminNavigation';
import { AdminLayout, useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';

const AdminV2OverviewPage = lazy(() => import('./AdminV2OverviewPage'));
const AdminCoursesPage = lazy(() => import('./content/AdminCoursesPage'));
const AdminCourseDetailPage = lazy(() => import('./content/AdminCourseDetailPage'));
const AdminVocabularyPage = lazy(() => import('./content/AdminVocabularyPage'));
const AdminAssessmentsPage = lazy(() => import('./content/AdminAssessmentsPage'));
const AdminGrammarPage = lazy(() => import('./content/AdminGrammarPage'));
const AdminMediaPage = lazy(() => import('./content/AdminMediaPage'));
const AdminLearnersPage = lazy(() => import('./learners/AdminLearnersPage'));
const AdminLearnerDetailPage = lazy(() => import('./learners/AdminLearnerDetailPage'));
const AdminAnnouncementsPage = lazy(() => import('./communication/AdminAnnouncementsPage'));
const AdminAlertsPage = lazy(() => import('./communication/AdminAlertsPage'));
const AdminPromptsPage = lazy(() => import('./ai/AdminPromptsPage'));
const AdminMascotPage = lazy(() => import('./ai/AdminMascotPage'));
const AdminStaffPage = lazy(() => import('./system/AdminStaffPage'));
const AdminPackagesPage = lazy(() => import('./system/AdminPackagesPage'));
const AdminPagesPage = lazy(() => import('./system/AdminPagesPage'));
const AdminRevisionPage = lazy(() => import('./system/AdminRevisionPage'));
const AdminAuditPage = lazy(() => import('./system/AdminAuditPage'));
const AdminApiMetadataPage = lazy(() => import('./system/AdminApiMetadataPage'));

function AdminRoute({ path, children }: { path: string; children: ReactNode }) {
  const { role } = useAdminLayoutContext();
  return canAccessAdminPath(role, path) ? <>{children}</> : <Navigate to={getAdminDefaultPath(role)} replace />;
}

export default function AdminV2App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminRoute path="/admin"><AdminV2OverviewPage /></AdminRoute>} />
          <Route path="content/courses" element={<AdminRoute path="/admin/content/courses"><AdminCoursesPage /></AdminRoute>} />
          <Route path="content/courses/:courseId" element={<AdminRoute path="/admin/content/courses"><AdminCourseDetailPage /></AdminRoute>} />
          <Route path="content/vocabulary" element={<AdminRoute path="/admin/content/vocabulary"><AdminVocabularyPage /></AdminRoute>} />
          <Route path="content/grammar" element={<AdminRoute path="/admin/content/grammar"><AdminGrammarPage /></AdminRoute>} />
          <Route path="content/exams" element={<AdminRoute path="/admin/content/exams"><AdminAssessmentsPage /></AdminRoute>} />
          <Route path="content/media" element={<AdminRoute path="/admin/content/media"><AdminMediaPage /></AdminRoute>} />
          <Route path="learners" element={<AdminRoute path="/admin/learners"><AdminLearnersPage /></AdminRoute>} />
          <Route path="learners/:userId" element={<AdminRoute path="/admin/learners"><AdminLearnerDetailPage /></AdminRoute>} />
          <Route path="communication/announcements" element={<AdminRoute path="/admin/communication/announcements"><AdminAnnouncementsPage /></AdminRoute>} />
          <Route path="communication/alerts" element={<AdminRoute path="/admin/communication/alerts"><AdminAlertsPage /></AdminRoute>} />
          <Route path="ai/prompts" element={<AdminRoute path="/admin/ai/prompts"><AdminPromptsPage /></AdminRoute>} />
          <Route path="ai/mascot" element={<AdminRoute path="/admin/ai/mascot"><AdminMascotPage /></AdminRoute>} />
          <Route path="system/staff" element={<AdminRoute path="/admin/system/staff"><AdminStaffPage /></AdminRoute>} />
          <Route path="system/packages" element={<AdminRoute path="/admin/system/packages"><AdminPackagesPage /></AdminRoute>} />
          <Route path="system/pages" element={<AdminRoute path="/admin/system/pages"><AdminPagesPage /></AdminRoute>} />
          <Route path="system/revisions" element={<AdminRoute path="/admin/system/revisions"><AdminRevisionPage /></AdminRoute>} />
          <Route path="system/audit" element={<AdminRoute path="/admin/system/audit"><AdminAuditPage /></AdminRoute>} />
          <Route path="system/api-metadata" element={<AdminRoute path="/admin/system/api-metadata"><AdminApiMetadataPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
