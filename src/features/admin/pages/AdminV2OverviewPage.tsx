import { useCallback } from "react";
import {
  AlertCircle,
  ArrowRight,
  BookOpenCheck,
  GraduationCap,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  AdminErrorState,
  AdminPageSkeleton,
} from "@/src/features/admin/components/AdminState";
import { AdminPageHeader } from "@/src/features/admin/components/AdminPageHeader";
import { StatusBadge } from "@/src/features/admin/components/StatusBadge";
import { useAdminQuery } from "@/src/features/admin/hooks/useAdminQuery";
import {
  fetchAdminAnalytics,
  listAdminActivityLogs,
  listAdminAlerts,
  type AdminAnalytics,
} from "@/src/features/admin/repositories/adminRepository";
import type { Tables } from "@/src/features/supabase/lib/database.types";
import { formatAdminDate } from "@/src/features/admin/lib/adminFormat";

interface OverviewData {
  analytics: AdminAnalytics;
  alerts: Tables<"admin_alerts">[];
  activity: Tables<"admin_activity_logs">[];
}

function MetricCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4">
      <span className="grid size-10 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]">
        <Icon aria-hidden="true" size={19} />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#5F6B7C]">{label}</p>
      <strong className="mt-1 block text-2xl font-bold text-[#172033]">
        {value}
      </strong>
      <p className="mt-1 text-xs text-[#7B8796]">{hint}</p>
    </article>
  );
}

export default function AdminV2OverviewPage() {
  const load = useCallback(async (): Promise<OverviewData> => {
    const [analytics, alerts, activity] = await Promise.all([
      fetchAdminAnalytics(),
      listAdminAlerts(),
      listAdminActivityLogs(8),
    ]);
    return { analytics, alerts, activity };
  }, []);
  const { data, loading, error, refresh } = useAdminQuery<OverviewData>(load);

  if (loading && !data)
    return (
      <>
        <AdminPageHeader
          eyebrow="Admin V2"
          title="Tổng quan"
          description="Đang chuẩn bị tình hình học viên và nội dung."
        />
        <div className="mt-6">
          <AdminPageSkeleton />
        </div>
      </>
    );
  if (error || !data)
    return (
      <>
        <AdminPageHeader
          eyebrow="Admin V2"
          title="Tổng quan"
          description="Theo dõi công việc cần xử lý trong ngày."
        />
        <div className="mt-6">
          <AdminErrorState onRetry={() => void refresh()} />
        </div>
      </>
    );

  const { analytics, alerts, activity } = data;
  const unpublished =
    Math.max(
      0,
      analytics.contentReadiness.totalLessons -
        analytics.contentReadiness.publishedLessons,
    ) +
    Math.max(
      0,
      analytics.contentReadiness.totalAssessments -
        analytics.contentReadiness.publishedAssessments,
    );
  const openAlerts = alerts.filter((alert) => alert.status === "open");
  const needsAttention = unpublished + openAlerts.length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin V2"
        title="Tổng quan"
        description="Ưu tiên những việc cần xử lý, rồi đi thẳng vào khóa học hoặc học viên liên quan."
        actions={
          <Link
            to="/admin/content/courses"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white hover:bg-[#274D61]"
          >
            Quản lý khóa học
            <ArrowRight aria-hidden="true" size={16} />
          </Link>
        }
      />
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Học viên đang học"
          value={analytics.activeLearners}
          hint={`${analytics.weeklyActiveLearners} hoạt động trong 7 ngày`}
        />
        <MetricCard
          icon={GraduationCap}
          label="Enrollment active"
          value={analytics.activeEnrollments}
          hint={`${analytics.courseCompletion}% hoàn thành khóa`}
        />
        <MetricCard
          icon={BookOpenCheck}
          label="Content readiness"
          value={`${analytics.contentReadiness.percent}%`}
          hint={`${analytics.contentReadiness.publishedLessons}/${analytics.contentReadiness.totalLessons} bài đã xuất bản`}
        />
        <MetricCard
          icon={AlertCircle}
          label="Cần chú ý"
          value={needsAttention}
          hint={`${openAlerts.length} cảnh báo đang mở`}
        />
      </section>
      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-bold">Việc cần chú ý</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Dữ liệu đã được xác nhận từ analytics và alerts hiện có.
              </p>
            </div>
            <Link
              to="/admin/content/courses"
              className="text-sm font-semibold text-[#315C73] hover:underline"
            >
              Mở nội dung
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {unpublished > 0 && (
              <div className="flex gap-3 rounded-xl border border-[#E9C98C] bg-[#FFF7E5] p-3">
                <BookOpenCheck
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[#8A5C13]"
                  size={18}
                />
                <p className="text-sm leading-6 text-[#5C4415]">
                  <strong>{unpublished} nội dung</strong> chưa được xuất bản
                  hoặc vẫn cần hoàn tất.
                </p>
              </div>
            )}
            {openAlerts.slice(0, 3).map((alert) => (
              <div
                key={alert.id}
                className="rounded-xl border border-[#E4D8C9] bg-white p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-sm">{alert.title}</strong>
                  <StatusBadge status={alert.status} />
                </div>
                <p className="mt-1 text-sm leading-6 text-[#5F6B7C]">
                  {alert.body}
                </p>
              </div>
            ))}
            {needsAttention === 0 && (
              <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                Không có việc cần can thiệp ngay.
              </p>
            )}
          </div>
        </article>
        <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Hoạt động admin gần đây</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Các thay đổi đã được ghi audit.
              </p>
            </div>
            <Link
              to="/admin/system/audit"
              className="text-sm font-semibold text-[#315C73] hover:underline"
            >
              Xem audit
            </Link>
          </div>
          <div className="mt-4 divide-y divide-[#EDE4D8]">
            {activity.slice(0, 6).map((item) => (
              <div key={item.id} className="py-3">
                <p className="text-sm font-semibold text-[#172033]">
                  {item.action}
                </p>
                <p className="mt-1 text-xs text-[#7B8796]">
                    {item.entity_type} · {formatAdminDate(item.occurred_at)}
                </p>
              </div>
            ))}
            {activity.length === 0 && (
              <p className="py-4 text-sm text-[#5F6B7C]">
                Chưa có hoạt động quản trị.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
