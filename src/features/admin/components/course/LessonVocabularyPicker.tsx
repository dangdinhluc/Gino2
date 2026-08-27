import { useEffect, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { listAdminVocabularyPicker, replaceAdminLessonVocabulary } from '@/src/features/admin/repositories/adminRepository';
import { useDebouncedValue } from '@/src/features/admin/hooks/useDebouncedValue';

export function LessonVocabularyPicker({ lessonId, links, onUpdated }: { lessonId: string; links: Tables<'lesson_vocabulary'>[]; onUpdated: () => Promise<void> | void }) {
  const originalIds = useMemo(() => links.map((link) => link.vocabulary_item_id), [links]);
  const [selectedIds, setSelectedIds] = useState<string[]>(originalIds);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [items, setItems] = useState<Tables<'vocabulary_items'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setSelectedIds(originalIds); }, [originalIds]);
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAdminVocabularyPicker(debouncedQuery, selectedIds)
      .then((nextItems) => { if (!cancelled) setItems(nextItems); })
      .catch(() => { if (!cancelled) setError('Không tải được từ vựng. Vui lòng thử lại.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedQuery, selectedIds]);

  const changed = selectedIds.length !== originalIds.length || selectedIds.some((id) => !originalIds.includes(id));
  function toggle(id: string): void {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }
  async function save(): Promise<void> {
    if (!changed || saving) return;
    setSaving(true); setError(null);
    try {
      await replaceAdminLessonVocabulary(lessonId, selectedIds);
      await onUpdated();
    } catch {
      setError('Không lưu được danh sách từ vựng. Vui lòng thử lại.');
    } finally { setSaving(false); }
  }

  return <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-bold text-[#172033]">Từ vựng của bài học</h3><p className="mt-1 text-sm text-[#5F6B7C]">Chọn theo tên tiếng Nhật, cách đọc hoặc nghĩa tiếng Việt. Danh sách chỉ hiển thị kết quả liên quan.</p></div><strong className="text-sm text-[#315C73]">Đã chọn: {selectedIds.length}</strong></div><label className="relative block"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8796]" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm từ vựng…" className="min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15" /></label><div className="max-h-80 overflow-y-auto rounded-xl border border-[#E4D8C9] bg-white">{loading ? <p className="p-4 text-sm text-[#5F6B7C]">Đang tải từ vựng…</p> : items.map((item) => { const selected = selectedIds.includes(item.id); return <label key={item.id} className={`flex min-h-14 cursor-pointer items-center gap-3 border-b border-[#F0E8DC] px-3 last:border-b-0 ${selected ? 'bg-[#F8F2EA]' : 'hover:bg-[#FFFCF7]'}`}><input type="checkbox" checked={selected} onChange={() => toggle(item.id)} className="sr-only" /><span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded border ${selected ? 'border-[#315C73] bg-[#315C73] text-white' : 'border-[#B7A891] bg-white text-transparent'}`}><Check size={13} /></span><span className="min-w-0"><strong className="block truncate text-sm text-[#172033]">{item.term}</strong><span className="mt-0.5 block truncate text-xs text-[#5F6B7C]">{[item.reading, item.translation].filter(Boolean).join(' · ')}</span></span></label>; })}{!loading && items.length === 0 && <p className="p-4 text-sm text-[#5F6B7C]">Không tìm thấy từ vựng phù hợp.</p>}</div>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<div className="flex justify-end"><button type="button" onClick={() => void save()} disabled={!changed || saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Đang lưu…' : `Lưu ${selectedIds.length} từ vựng`}</button></div></section>;
}
