import { useEffect, useState } from 'react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { createAdminAnnouncement } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Course = Tables<'courses'>;
type Audience = 'all_learners' | 'active_learners' | 'course_learners';

interface AnnouncementComposerDrawerProps {
  open: boolean;
  courses: Course[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

function optionalHttpUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const url = new URL(trimmed);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Liên kết phải bắt đầu bằng http:// hoặc https://.');
  return url.toString();
}

export function AnnouncementComposerDrawer({ open, courses, onClose, onSaved }: AnnouncementComposerDrawerProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('all_learners');
  const [courseId, setCourseId] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setBody('');
    setAudience('all_learners');
    setCourseId('');
    setActionUrl('');
    setError(null);
  }, [open]);

  async function save(): Promise<void> {
    if (saving) return;
    if (!title.trim() || !body.trim()) { setError('Hãy nhập tiêu đề và nội dung thông báo.'); return; }
    if (audience === 'course_learners' && !courseId) { setError('Hãy chọn khóa học cho đối tượng học theo khóa.'); return; }
    setSaving(true);
    setError(null);
    try {
      await createAdminAnnouncement({ title: title.trim(), body: body.trim(), audience, ...(courseId ? { courseId } : {}), ...(optionalHttpUrl(actionUrl) ? { actionUrl: optionalHttpUrl(actionUrl) } : {}) });
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không tạo được thông báo.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return (
    <EditorDrawer open={open} title="Soạn thông báo" description="Thông báo được gửi theo đối tượng đã chọn. Kiểm tra kỹ trước khi đăng." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang đăng…' : 'Đăng thông báo'}</button></div>}>
      <div className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-[#172033]">Tiêu đề<input value={title} onChange={(event) => setTitle(event.target.value)} className={fieldClass} /></label>
        <label className="block text-sm font-semibold text-[#172033]">Nội dung<textarea value={body} onChange={(event) => setBody(event.target.value)} rows={7} className={fieldClass} /></label>
        <label className="block text-sm font-semibold text-[#172033]">Đối tượng<select value={audience} onChange={(event) => setAudience(event.target.value as Audience)} className={fieldClass}><option value="all_learners">Tất cả học viên</option><option value="active_learners">Học viên đang hoạt động</option><option value="course_learners">Học viên của một khóa</option></select></label>
        {audience === 'course_learners' && <label className="block text-sm font-semibold text-[#172033]">Khóa học<select value={courseId} onChange={(event) => setCourseId(event.target.value)} className={fieldClass}><option value="">Chọn khóa học…</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>}
        <label className="block text-sm font-semibold text-[#172033]">Liên kết hành động (không bắt buộc)<input value={actionUrl} onChange={(event) => setActionUrl(event.target.value)} placeholder="https://…" inputMode="url" className={fieldClass} /></label>
      </div>
    </EditorDrawer>
  );
}
