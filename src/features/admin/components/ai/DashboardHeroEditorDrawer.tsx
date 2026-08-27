import { useEffect, useState } from 'react';
import { EditorDrawer } from '@/src/features/admin/components/EditorDrawer';
import { DASHBOARD_HERO_ASSET_OPTIONS, resolveDashboardHeroAsset } from '@/src/features/dashboard/lib/dashboardHero';
import { saveAdminDashboardHeroSlot } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

type HeroSlot = Tables<'dashboard_hero_slots'>;

interface DashboardHeroEditorDrawerProps {
  open: boolean;
  slot: HeroSlot | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function DashboardHeroEditorDrawer({ open, slot, onClose, onSaved }: DashboardHeroEditorDrawerProps) {
  const [label, setLabel] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('00:00');
  const [assetKey, setAssetKey] = useState(DASHBOARD_HERO_ASSET_OPTIONS[0].key);
  const [altText, setAltText] = useState(DASHBOARD_HERO_ASSET_OPTIONS[0].alt);
  const [sortOrder, setSortOrder] = useState('0');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const fallback = DASHBOARD_HERO_ASSET_OPTIONS[0];
    const asset = resolveDashboardHeroAsset(slot?.asset_key ?? fallback.key);
    setLabel(slot?.label ?? '');
    setStartTime((slot?.start_time ?? '00:00').slice(0, 5));
    setEndTime((slot?.end_time ?? '00:00').slice(0, 5));
    setAssetKey(asset.key);
    setAltText(slot?.alt_text ?? asset.alt);
    setSortOrder(String(slot?.sort_order ?? 0));
    setActive(slot?.is_active ?? true);
    setError(null);
  }, [open, slot]);

  function changeAsset(nextKey: string): void {
    const asset = resolveDashboardHeroAsset(nextKey);
    setAssetKey(asset.key);
    setAltText(asset.alt);
  }

  async function save(): Promise<void> {
    if (saving) return;
    const order = Number(sortOrder);
    if (!label.trim() || !altText.trim()) { setError('Hãy nhập tên khung giờ và mô tả ảnh.'); return; }
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) { setError('Giờ phải có định dạng HH:MM.'); return; }
    if (!Number.isFinite(order) || order < 0) { setError('Thứ tự phải là số không âm.'); return; }
    setSaving(true);
    setError(null);
    try {
      await saveAdminDashboardHeroSlot({ id: slot?.id ?? crypto.randomUUID(), isNew: !slot, label: label.trim(), start_time: startTime + ':00', end_time: endTime + ':00', asset_key: assetKey, alt_text: altText.trim(), sort_order: order, is_active: active });
      await onSaved();
      onClose();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được mascot dashboard.');
    } finally {
      setSaving(false);
    }
  }

  const currentAsset = resolveDashboardHeroAsset(assetKey);
  const fieldClass = 'mt-1 min-h-11 w-full rounded-xl border border-[#D9CBB9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73] focus:ring-2 focus:ring-[#315C73]/15';
  return <EditorDrawer open={open} title={slot ? 'Chỉnh sửa mascot dashboard' : 'Thêm mascot dashboard'} description="Chọn mascot thực tế đã có trong hệ thống và khung giờ hiển thị cho người học." onRequestClose={onClose} footer={<div className="flex justify-end gap-2"><button type="button" onClick={onClose} disabled={saving} className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]">Hủy</button><button type="button" onClick={() => void save()} disabled={saving} className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu…' : 'Lưu lịch mascot'}</button></div>}><div className="space-y-5">{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</p>}<label className="block text-sm font-semibold text-[#172033]">Tên khung giờ<input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="Ví dụ: Buổi sáng" className={fieldClass} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#172033]">Bắt đầu<input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={fieldClass} /></label><label className="block text-sm font-semibold text-[#172033]">Kết thúc<input type="time" value={endTime} onChange={(event) => setEndTime(event.target.value)} className={fieldClass} /></label></div><label className="block text-sm font-semibold text-[#172033]">Mascot<select value={assetKey} onChange={(event) => changeAsset(event.target.value)} className={fieldClass}>{DASHBOARD_HERO_ASSET_OPTIONS.map((asset) => <option key={asset.key} value={asset.key}>{asset.label}</option>)}</select></label><div className="flex items-center gap-4 rounded-xl border border-[#E4D8C9] bg-white p-3"><img src={currentAsset.src} alt={currentAsset.alt} className="size-16 object-contain" /><p className="text-sm text-[#5F6B7C]">Xem trước mascot hiển thị trên dashboard.</p></div><label className="block text-sm font-semibold text-[#172033]">Mô tả ảnh<input value={altText} onChange={(event) => setAltText(event.target.value)} className={fieldClass} /></label><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#172033]">Thứ tự ưu tiên<input value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} inputMode="numeric" className={fieldClass} /></label><label className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-[#172033]"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-[#315C73]" />Đang hiển thị</label></div></div></EditorDrawer>;
}
