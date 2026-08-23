import type { Tables } from '@/src/features/supabase/lib/database.types';
import type { AdminAnalytics } from '@/src/features/admin/repositories/adminRepository';
import { formatDate } from '@/src/features/admin/lib/adminProductionHelpers';
import { Metric } from './AdminFieldControl';

export function Overview({ analytics, alerts, activity }: { analytics: AdminAnalytics | null; alerts: Tables<'admin_alerts'>[]; activity: Tables<'admin_activity_logs'>[] }) {
  if (!analytics) return <section className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-sm font-semibold text-[#5F6B7C]">Không có quyền đọc analytics.</section>;
  const readinessRows = [
    { label: 'Khóa học', published: analytics.contentReadiness.publishedCourses, total: analytics.contentReadiness.totalCourses },
    { label: 'Bài học', published: analytics.contentReadiness.publishedLessons, total: analytics.contentReadiness.totalLessons },
    { label: 'Tài liệu', published: analytics.contentReadiness.publishedDocuments, total: analytics.contentReadiness.totalDocuments },
    { label: 'Đề thi', published: analytics.contentReadiness.publishedAssessments, total: analytics.contentReadiness.totalAssessments },
  ];
  return <>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Học viên xác thực" value={analytics.verifiedUsers} />
      <Metric label="Đang học" value={analytics.activeLearners} />
      <Metric label="Hoạt động 7 ngày" value={analytics.weeklyActiveLearners} />
      <Metric label="Enrollment active" value={analytics.activeEnrollments} />
      <Metric label="Completion" value={`${analytics.courseCompletion}%`} />
      <Metric label="Streak 3 ngày" value={analytics.currentStreakLearners} />
      <Metric label="Từ đã master" value={analytics.masteredVocabulary} />
      <Metric label="Từ đến hạn" value={analytics.dueVocabulary} />
      <Metric label="Lượt thi" value={analytics.examAttempts} />
      <Metric label="Tỷ lệ đỗ" value={`${analytics.examPassRate}%`} />
      <Metric label="AI tháng này" value={`${analytics.aiRequestsThisMonth} / ${analytics.aiQuotaCapacity}`} />
      <Metric label="Lỗi AI tháng này" value={analytics.aiErrorsThisMonth} />
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm xl:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-black">Content readiness</h2><p className="mt-1 text-sm text-[#5F6B7C]">Tỷ lệ nội dung đã publish cho học viên.</p></div><strong className="text-2xl font-black text-[#C96A1B]">{analytics.contentReadiness.percent}%</strong></div>
        <div className="mt-5 space-y-4">{readinessRows.map((row) => { const percent = row.total ? Math.round((row.published / row.total) * 100) : 0; return <div key={row.label}><div className="mb-1 flex justify-between text-sm font-bold"><span>{row.label}</span><span className="text-[#5F6B7C]">{row.published}/{row.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#EFE5D7]"><div className="h-full rounded-full bg-[#C96A1B]" style={{ width: `${percent}%` }} /></div></div>; })}</div>
      </article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Retention cohort</h2><p className="mt-1 text-sm text-[#5F6B7C]">Học viên có hoạt động sau mốc ghi danh.</p><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-[#F8F2EA] p-4"><p className="text-xs font-bold text-[#7B8796]">D+7</p><strong className="mt-1 block text-2xl font-black">{analytics.cohortRetention.day7}%</strong></div><div className="rounded-2xl bg-[#F8F2EA] p-4"><p className="text-xs font-bold text-[#7B8796]">D+30</p><strong className="mt-1 block text-2xl font-black">{analytics.cohortRetention.day30}%</strong></div></div></article>
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Chủ đề cần ôn lại</h2><div className="mt-4 space-y-3">{analytics.weakTopics.map((topic) => <div key={`${topic.courseId}-${topic.title}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8F2EA] p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{topic.title}</p><p className="mt-1 text-xs text-[#7B8796]">{topic.attempts} lượt thi</p></div><strong className="shrink-0 text-sm text-[#C96A1B]">{topic.passRate}%</strong></div>)}{analytics.weakTopics.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có lượt thi để phân tích.</p>}</div></article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Email delivery</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-amber-50 p-3"><span className="text-[#7B8796]">Chờ xử lý</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.pending + analytics.emailDelivery.processing}</strong></div><div className="rounded-2xl bg-emerald-50 p-3"><span className="text-[#7B8796]">Đã gửi</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.sent}</strong></div><div className="rounded-2xl bg-red-50 p-3"><span className="text-[#7B8796]">Lỗi</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.failed}</strong></div><div className="rounded-2xl bg-slate-50 p-3"><span className="text-[#7B8796]">Quota AI</span><strong className="mt-1 block text-xl">{analytics.aiQuotaConsumed}/{analytics.aiQuotaCapacity}</strong></div></div></article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Cảnh báo mở</h2><div className="mt-4 space-y-3">{alerts.filter((alert) => alert.status === 'open').slice(0, 5).map((alert) => <div key={alert.id} className="rounded-2xl bg-[#F8F2EA] p-3"><p className="font-bold">{alert.title}</p><p className="mt-1 text-sm text-[#5F6B7C]">{alert.body}</p></div>)}{alerts.every((alert) => alert.status !== 'open') && <p className="text-sm text-[#5F6B7C]">Không có cảnh báo mở.</p>}</div></article>
    </section>
    <section className="rounded-3xl border border-[#E4D8C9] bg-[#172033] p-5 text-white shadow-sm"><h2 className="font-black">Audit gần nhất</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{activity.slice(0, 5).map((item) => <div key={item.id}><p className="text-sm font-bold">{item.action}</p><p className="text-xs text-white/60">{item.entity_type} · {formatDate(item.occurred_at)}</p></div>)}{activity.length === 0 && <p className="text-sm text-white/60">Chưa có audit.</p>}</div></section>
  </>;
}
