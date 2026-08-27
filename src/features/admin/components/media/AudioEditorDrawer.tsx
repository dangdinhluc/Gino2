import { useEffect, useState } from 'react';
import { FileUp } from 'lucide-react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { listAdminLessons, saveAdminAudio, uploadAdminCourseAsset } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Audio = Tables<'podcast_episodes'>;
type Course = Tables<'courses'>;
type Lesson = Tables<'lessons'>;

interface AudioEditorDrawerProps {
  open: boolean;
  audio: Audio | null;
  courses: Course[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

interface AudioForm {
  courseId: string;
  lessonId: string;
  title: string;
  summary: string;
  duration: string;
  externalUrl: string;
}

function optionalHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const url = new URL(trimmed);
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error('Liên kết ngoài phải bắt đầu bằng http:// hoặc https://.');
  return url.toString();
}

export function AudioEditorDrawer({ open, audio, courses, onClose, onSaved }: AudioEditorDrawerProps) {
  const defaultCourseId = courses[0]?.id ?? '';
  const [form, setForm] = useState<AudioForm>({ courseId: '', lessonId: '', title: '', summary: '', duration: '0', externalUrl: '' });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      courseId: audio?.course_id ?? defaultCourseId,
      lessonId: audio?.lesson_id ?? '',
      title: audio?.title ?? '',
      summary: audio?.summary ?? '',
      duration: String(audio?.duration_minutes ?? 0),
      externalUrl: audio?.external_url ?? '',
    });
    setAssetFile(null);
    setError(null);
  }, [audio, defaultCourseId, open]);

  useEffect(() => {
    if (!open || !form.courseId) { setLessons([]); return; }
    let cancelled = false;
    setLoadingLessons(true);
    listAdminLessons(form.courseId)
      .then((nextLessons) => { if (!cancelled) setLessons(nextLessons); })
      .catch(() => { if (!cancelled) setLessons([]); })
      .finally(() => { if (!cancelled) setLoadingLessons(false); });
    return () => { cancelled = true; };
  }, [form.courseId, open]);

  function update<K extends keyof AudioForm>(key: K, value: AudioForm[K]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(): Promise<void> {
    if (saving) return;
    const title = form.title.trim();
    const summary = form.summary.trim();
    const duration = Number(form.duration);
    if (!form.courseId) { setError('Hãy chọn khóa học.'); return; }
    if (!title || !summary) { setError('Hãy nhập tên và tóm tắt audio.'); return; }
    if (!Number.isFinite(duration) || duration < 0) { setError('Thời lượng phải là số không âm.'); return; }

    setSaving(true);
    setError(null);
    try {
      const saved = await saveAdminAudio({
        id: audio?.id ?? crypto.randomUUID(),
        isNew: !audio,
        course_id: form.courseId,
        lesson_id: form.lessonId || null,
        title,
        summary,
        duration_minutes: duration,
        external_url: optionalHttpUrl(form.externalUrl),
        status: audio?.status ?? 'draft',
      });
      if (assetFile) {
        const storagePath = await uploadAdminCourseAsset(saved.course_id, saved.id, assetFile);
        await saveAdminAudio({ id: saved.id, storage_path: storagePath });
      }
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được audio.');
    } finally {
      setSaving(false);
    }
  }

  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';

  return (
    <EditorDrawer
      open={open}
      title={audio ? 'Chỉnh sửa audio' : 'Tạo audio'}
      description="Tệp audio được lưu riêng tư; chỉ metadata được hiển thị trong CMS."
      onRequestClose={onClose}
      footer={<div className="flex flex-wrap justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu audio'}</button></div>}
    >
      <div className="space-y-5">
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
        <label className="block text-sm font-semibold text-[#172033]">Khóa học<select value={form.courseId} onChange={(event) => { update('courseId', event.target.value); update('lessonId', ''); }} className={fieldClass}>{courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select></label>
        <label className="block text-sm font-semibold text-[#172033]">Bài học liên kết (nếu có)<select value={form.lessonId} onChange={(event) => update('lessonId', event.target.value)} disabled={loadingLessons} className={fieldClass}><option value="">Không gắn bài học</option>{lessons.map((lesson) => <option key={lesson.id} value={lesson.id}>{lesson.title}</option>)}</select></label>
        <label className="block text-sm font-semibold text-[#172033]">Tên audio<input value={form.title} onChange={(event) => update('title', event.target.value)} className={fieldClass} /></label>
        <label className="block text-sm font-semibold text-[#172033]">Tóm tắt<textarea value={form.summary} onChange={(event) => update('summary', event.target.value)} rows={3} className={fieldClass} /></label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-[#172033]">Thời lượng (phút)<input value={form.duration} onChange={(event) => update('duration', event.target.value)} inputMode="numeric" className={fieldClass} /></label>
          <label className="block text-sm font-semibold text-[#172033]">Liên kết ngoài (nếu có)<input value={form.externalUrl} onChange={(event) => update('externalUrl', event.target.value)} placeholder="https://…" inputMode="url" className={fieldClass} /></label>
        </div>
        <div className="rounded-xl border border-[#E4D8C9] bg-[#F8F2EA] p-3">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"><FileUp aria-hidden="true" size={16} />{assetFile ? assetFile.name : audio?.storage_path ? 'Thay tệp audio riêng tư' : 'Tải tệp audio riêng tư'}<input type="file" accept="audio/*" className="sr-only" onChange={(event) => setAssetFile(event.target.files?.[0] ?? null)} /></label>
          <p className="mt-2 text-xs leading-5 text-[#5F6B7C]">{assetFile ? 'Tệp mới sẽ thay thế tệp đính kèm sau khi lưu.' : audio?.storage_path ? 'Đã có tệp riêng tư đính kèm.' : 'Bạn có thể dùng tệp riêng tư hoặc liên kết ngoài.'}</p>
        </div>
      </div>
    </EditorDrawer>
  );
}
