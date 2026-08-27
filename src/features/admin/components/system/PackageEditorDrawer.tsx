import { useEffect, useState } from 'react';
import { Check, Search } from 'lucide-react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { replaceAdminPackageCourses, saveAdminPackage } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type Package = Tables<'packages'>;
type Course = Tables<'courses'>;

interface PackageEditorDrawerProps {
  open: boolean;
  packageItem: Package | null;
  courses: Course[];
  linkedCourseIds: string[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function PackageEditorDrawer({ open, packageItem, courses, linkedCourseIds, onClose, onSaved }: PackageEditorDrawerProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('0');
  const [currency, setCurrency] = useState('VND');
  const [quota, setQuota] = useState('0');
  const [status, setStatus] = useState('draft');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [courseQuery, setCourseQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(packageItem?.name ?? '');
    setDescription(packageItem?.description ?? '');
    setPrice(String(packageItem?.price_cents ?? 0));
    setCurrency(packageItem?.currency ?? 'VND');
    setQuota(String(packageItem?.ai_monthly_quota ?? 0));
    setStatus(packageItem?.status ?? 'draft');
    setSelectedIds(new Set(linkedCourseIds));
    setCourseQuery('');
    setError(null);
  }, [linkedCourseIds, open, packageItem]);

  function toggleCourse(courseId: string): void {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  async function save(): Promise<void> {
    if (saving) return;
    const parsedPrice = Number(price);
    const parsedQuota = Number(quota);
    if (!name.trim() || !description.trim() || !currency.trim()) { setError('Hãy nhập tên, mô tả và đơn vị tiền tệ.'); return; }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0 || !Number.isFinite(parsedQuota) || parsedQuota < 0) { setError('Giá và quota AI phải là số không âm.'); return; }
    setSaving(true);
    setError(null);
    try {
      const saved = await saveAdminPackage({ id: packageItem?.id ?? crypto.randomUUID(), isNew: !packageItem, name: name.trim(), description: description.trim(), price_cents: parsedPrice, currency: currency.trim().toUpperCase(), ai_monthly_quota: parsedQuota, status });
      await replaceAdminPackageCourses(saved.id, [...selectedIds]);
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được gói học.');
    } finally {
      setSaving(false);
    }
  }

  const visibleCourses = courses.filter((course) => !courseQuery.trim() || course.title.toLocaleLowerCase('vi-VN').includes(courseQuery.trim().toLocaleLowerCase('vi-VN')));
  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return <EditorDrawer open={open} title={packageItem ? 'Chỉnh sửa gói học' : 'Tạo gói học'} description="Chọn khóa học bằng danh sách rõ ràng, không cần nhập ID kỹ thuật." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu gói học'}</button></div>}><div className="space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<label className="block text-sm font-semibold text-[#172033]">Tên gói<input value={name} onChange={(event) => setName(event.target.value)} className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Mô tả<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} className={fieldClass} /></label><div className="grid gap-4 sm:grid-cols-3"><label className="block text-sm font-semibold text-[#172033]">Giá<input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Tiền tệ<input value={currency} onChange={(event) => setCurrency(event.target.value)} maxLength={3} className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Quota AI/tháng<input value={quota} onChange={(event) => setQuota(event.target.value)} inputMode="numeric" className={fieldClass} /></label></div><label className="block text-sm font-semibold text-[#172033]">Trạng thái<select value={status} onChange={(event) => setStatus(event.target.value)} className={fieldClass}><option value="draft">Nháp</option><option value="active">Đang mở</option><option value="archived">Lưu trữ</option></select></label><section><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="font-semibold text-[#172033]">Khóa học trong gói</h3><p className="mt-1 text-xs text-[#5F6B7C]">Đã chọn {selectedIds.size} khóa học.</p></div><label className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8796]" size={15} /><input value={courseQuery} onChange={(event) => setCourseQuery(event.target.value)} placeholder="Tìm khóa học…" className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#315C73]" /></label></div><div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[#E4D8C9] bg-white p-2">{visibleCourses.map((course) => { const selected = selectedIds.has(course.id); return <label key={course.id} className={selected ? 'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg bg-[#F0E8DC] px-3 text-sm' : 'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 text-sm hover:bg-[#F8F2EA]'}><input type="checkbox" checked={selected} onChange={() => toggleCourse(course.id)} className="sr-only" /><span aria-hidden="true" className={selected ? 'grid size-5 place-items-center rounded border border-[#315C73] bg-[#315C73] text-white' : 'size-5 rounded border border-[#D9CBB9] bg-white'}>{selected && <Check size={14} />}</span><span className="min-w-0 flex-1 truncate font-medium">{course.title}</span><span className="text-xs text-[#7B8796]">{course.level}</span></label>; })}{visibleCourses.length === 0 && <p className="p-3 text-sm text-[#5F6B7C]">Không tìm thấy khóa học.</p>}</div></section></div></EditorDrawer>;
}
