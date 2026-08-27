import { useCallback, useMemo, useState } from 'react';
import { Archive, Bell, ExternalLink, Plus } from 'lucide-react';
import { AdminEmptyState, AdminErrorState, AdminPageSkeleton } from '@/src/features/admin/components/AdminState';
import { AdminPageHeader } from '@/src/features/admin/components/AdminPageHeader';
import { ConfirmDialog } from '@/src/features/admin/components/ConfirmDialog';
import { SearchFilterBar } from '@/src/features/admin/components/SearchFilterBar';
import { StatusBadge } from '@/src/features/admin/components/StatusBadge';
import { AnnouncementComposerDrawer } from '@/src/features/admin/components/communication/AnnouncementComposerDrawer';
import { useAdminQuery } from '@/src/features/admin/hooks/useAdminQuery';
import { useAdminLayoutContext } from '@/src/features/admin/layouts/AdminLayout';
import { archiveAdminAnnouncement, listAdminAnnouncements, listAdminCourses } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Announcement = Tables<'announcements'>;
type Course = Tables<'courses'>;

interface AnnouncementData {
  announcements: Announcement[];
  courses: Course[];
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function AdminAnnouncementsPage() {
  const { role } = useAdminLayoutContext();
  const canManage = role === 'owner' || role === 'instructor_support';
  const [query, setQuery] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<AnnouncementData> => {
    const [announcements, courses] = await Promise.all([listAdminAnnouncements(), listAdminCourses()]);
    return { announcements, courses };
  }, []);
  const { data, loading, error, refresh } = useAdminQuery<AnnouncementData>(load);
  const courseById = useMemo(() => new Map((data?.courses ?? []).map((course) => [course.id, course])), [data?.courses]);
  const rows = useMemo(() => (data?.announcements ?? []).filter((item) => !query.trim() || [item.title, item.body, item.audience].join(' ').toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN'))), [data?.announcements, query]);

  async function archive(): Promise<void> {
    if (!archiveTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await archiveAdminAnnouncement(archiveTarget.id);
      setArchiveTarget(null);
      await refresh();
      setNotice('Đã lưu trữ thông báo.');
    } catch {
      setActionError('Không lưu trữ được thông báo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader eyebrow="Giao tiếp" title="Thông báo" description="Gửi thông báo theo đúng đối tượng học viên, sau đó theo dõi trạng thái đã lưu trữ." actions={canManage ? <button type="button" onClick={() => setComposerOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"><Plus aria-hidden="true" size={17} />Soạn thông báo</button> : undefined} />
      <SearchFilterBar value={query} onChange={setQuery} placeholder="Tìm tiêu đề, nội dung hoặc đối tượng…" />
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{notice}</p>}
      {actionError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{actionError}</p>}
      {loading && !data ? <AdminPageSkeleton rows={5} /> : error || !data ? <AdminErrorState title="Không tải được thông báo" onRetry={() => void refresh()} /> : rows.length === 0 ? <AdminEmptyState title="Chưa có thông báo phù hợp" description={canManage ? 'Soạn thông báo mới để liên hệ với học viên.' : 'Chưa có thông báo nào để xem.'} action={canManage ? <button type="button" onClick={() => setComposerOpen(true)} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white">Soạn thông báo</button> : undefined} /> : <section className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"><div className="divide-y divide-[#EDE4D8]">{rows.map((item) => <article key={item.id} className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#F0E8DC] text-[#315C73]"><Bell aria-hidden="true" size={19} /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#172033]">{item.title}</h2><StatusBadge status={item.archived_at ? 'archived' : 'published'} /></div><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#5F6B7C]">{item.body}</p><p className="mt-2 text-xs text-[#7B8796]">{item.audience === 'course_learners' ? courseById.get(item.course_id ?? '')?.title ?? 'Học viên của khóa' : item.audience === 'active_learners' ? 'Học viên đang hoạt động' : 'Tất cả học viên'} · {formatDate(item.published_at)}</p></div></div><div className="flex shrink-0 flex-wrap gap-2">{item.action_url && <a href={item.action_url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><ExternalLink aria-hidden="true" size={15} />Mở liên kết</a>}{canManage && !item.archived_at && <button type="button" onClick={() => setArchiveTarget(item)} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><Archive aria-hidden="true" size={15} />Lưu trữ</button>}</div></article>)}</div></section>}
      <AnnouncementComposerDrawer open={composerOpen} courses={data?.courses ?? []} onClose={() => setComposerOpen(false)} onSaved={refresh} />
      <ConfirmDialog open={Boolean(archiveTarget)} title={'Lưu trữ “' + (archiveTarget?.title ?? '') + '”?'} description="Thông báo sẽ không còn hiển thị như nội dung đang hoạt động." confirmLabel="Lưu trữ thông báo" pending={saving} onCancel={() => setArchiveTarget(null)} onConfirm={() => void archive()} />
    </div>
  );
}
