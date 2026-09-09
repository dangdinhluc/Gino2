import { useEffect, useState } from 'react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { createAdminCourse, updateAdminCourse } from '@/src/features/admin/repositories/adminRepository';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { EditorField, EditorSelect, editorControlClass } from './EditorFields';

type Course = Tables<'courses'>;

interface CourseDraft {
  slug: string;
  title: string;
  level: string;
  category: string;
  description: string;
  orderIndex: string;
  themeColor: string;
  status: string;
}

function featureConfigRecord(value: Course['feature_config'] | null | undefined): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? { ...value } : {};
}

function courseCategory(course: Course): string {
  const category = featureConfigRecord(course.feature_config).category;
  return typeof category === 'string' && category.trim() ? category.trim() : course.level;
}

function draftFor(course: Course | null): CourseDraft {
  return course
    ? {
        slug: course.slug,
        title: course.title,
        level: course.level,
        category: courseCategory(course),
        description: course.description,
        orderIndex: String(course.order_index),
        themeColor: course.theme_color ?? '',
        status: course.status,
      }
    : { slug: '', title: '', level: '', category: 'Tokutei', description: '', orderIndex: '0', themeColor: '', status: 'draft' };
}

export function CourseEditorDrawer({ open, course, onClose, onSaved }: { open: boolean; course: Course | null; onClose: () => void; onSaved: () => Promise<void> | void }) {
  const [draft, setDraft] = useState<CourseDraft>(() => draftFor(course));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(draftFor(course));
      setError(null);
    }
  }, [course, open]);

  const set = (key: keyof CourseDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));

  async function save(): Promise<void> {
    const slug = draft.slug.trim();
    const title = draft.title.trim();
    const level = draft.level.trim();
    const category = draft.category.trim();
    const description = draft.description.trim();
    const orderIndex = Number(draft.orderIndex);
    if (!slug || !title || !level || !category || !description) {
      setError('Hãy nhập slug, tên, cấp độ, danh mục và mô tả của khóa học.');
      return;
    }
    if (!Number.isFinite(orderIndex) || orderIndex < 0) {
      setError('Thứ tự cần là số không âm.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const featureConfig = {
        ...featureConfigRecord(course?.feature_config),
        category,
      } as Course['feature_config'];
      const payload = {
        slug,
        title,
        level,
        description,
        order_index: Math.round(orderIndex),
        theme_color: draft.themeColor.trim() || null,
        feature_config: featureConfig,
        status: draft.status || 'draft',
      };
      if (course) await updateAdminCourse(course.id, payload);
      else await createAdminCourse({ id: crypto.randomUUID(), ...payload });
      await onSaved();
      onClose();
    } catch {
      setError('Không lưu được khóa học. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditorDrawer
      open={open}
      title={course ? 'Chỉnh sửa khóa học' : 'Tạo khóa học'}
      description="Thông tin này sẽ hiển thị cho học viên khi khóa học được xuất bản."
      onRequestClose={onClose}
      footer={<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] disabled:opacity-50">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu khóa học'}</button></div>}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <EditorField id="course-title" label="Tên khóa học" required><input id="course-title" value={draft.title} onChange={(event) => set('title', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-slug" label="Slug" required hint="Dùng cho đường dẫn nội bộ, ví dụ tokutei-kaigo."><input id="course-slug" value={draft.slug} onChange={(event) => set('slug', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-level" label="Cấp độ" required><input id="course-level" value={draft.level} onChange={(event) => set('level', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-category" label="Danh mục học viên" required hint="Dùng cho bộ lọc ngoài app, ví dụ Tokutei, Giao tiếp, Ngữ pháp, Kanji."><input id="course-category" value={draft.category} onChange={(event) => set('category', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-order" label="Thứ tự"><input id="course-order" type="number" min="0" value={draft.orderIndex} onChange={(event) => set('orderIndex', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-theme" label="Màu chủ đề" hint="Tùy chọn, ví dụ #315C73."><input id="course-theme" value={draft.themeColor} onChange={(event) => set('themeColor', event.target.value)} className={editorControlClass} /></EditorField>
        <EditorField id="course-status" label="Luồng duyệt"><EditorSelect id="course-status" value={draft.status} onChange={(value) => set('status', value)}><option value="draft">Nháp</option><option value="in_review">Chờ duyệt</option></EditorSelect></EditorField>
        <div className="sm:col-span-2"><EditorField id="course-description" label="Mô tả" required><textarea id="course-description" value={draft.description} onChange={(event) => set('description', event.target.value)} className={`${editorControlClass} min-h-32 resize-y`} /></EditorField></div>
      </div>
      {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}
    </EditorDrawer>
  );
}
