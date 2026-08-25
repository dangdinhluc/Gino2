import { useCallback, useEffect, useState } from 'react';
import { Bell, BellRing, Check, Mail, Moon, Palette, RotateCcw, Settings, Sparkles, Volume2, Zap } from 'lucide-react';
import { registerPush, unregisterPush } from '@/src/features/notifications/repositories/pushRepository';
import { APP_BACKGROUNDS, useAppTheme } from '@/src/app/theme/AppThemeProvider';
import { getLearnerSettings, updateLearnerSettings, type LearnerSettings } from '@/src/features/profile/repositories/learnerSettingsRepository';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

type SettingKey = 'ttsEnabled' | 'inAppNotifications' | 'emailNotifications' | 'pushNotifications' | 'aiConcise';

const toggleDefinitions: Array<{ key: SettingKey; title: string; description: string; icon: typeof Bell }> = [
  { key: 'ttsEnabled', title: 'Tự động phát âm', description: 'Dùng giọng nói của thiết bị cho từ và câu tiếng Nhật.', icon: Volume2 },
  { key: 'inAppNotifications', title: 'Thông báo trong ứng dụng', description: 'Nhận nhắc học và thông báo khóa học trong Notification Center.', icon: Bell },
  { key: 'emailNotifications', title: 'Thông báo qua email', description: 'Nhận email khi có thông báo quan trọng theo tùy chọn của anh.', icon: Mail },
  { key: 'pushNotifications', title: 'Thông báo đẩy trên điện thoại', description: 'Nhận nhắc ôn tập ngay cả khi anh không mở app.', icon: BellRing },
  { key: 'aiConcise', title: 'Phản hồi AI ngắn gọn', description: 'Ưu tiên gợi ý cô đọng trong AI Chat và AI Writing.', icon: Sparkles },
];

export default function SettingsPage() {
  const { background, setBackground } = useAppTheme();
  const [settings, setSettings] = useState<LearnerSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<string | null>(null);

  const load = useCallback(async () => { setIsLoading(true); setError(null); try { setSettings(await getLearnerSettings()); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không tải được cài đặt.'); } finally { setIsLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);

  const save = async (update: Partial<LearnerSettings>) => {
    if (!settings || isSaving) return;
    setIsSaving(true); setError(null);
    try {
      if (update.pushNotifications === true) {
        const status = await registerPush();
        if (status !== 'enabled') throw new Error(status === 'denied' ? 'Trình duyệt đã chặn thông báo. Hãy bật lại quyền thông báo trong cài đặt trình duyệt.' : 'Thiết bị hoặc trình duyệt này chưa hỗ trợ thông báo đẩy.');
      }
      if (update.pushNotifications === false) await unregisterPush();
      setSettings(await updateLearnerSettings(update));
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được cài đặt.');
    } finally { setIsSaving(false); }
  };

  const clearCache = async () => {
    if (!window.confirm('Xóa bộ nhớ đệm giao diện? Phiên đăng nhập và dữ liệu Cloud của anh sẽ không bị xóa.')) return;
    try {
      if ('caches' in window) await Promise.all((await window.caches.keys()).map((key) => window.caches.delete(key)));
      Object.keys(window.localStorage).filter((key) => key.startsWith('gino-')).forEach((key) => window.localStorage.removeItem(key));
      setCacheStatus('Đã xóa bộ nhớ đệm giao diện.');
    } catch { setCacheStatus('Không thể xóa toàn bộ cache trên trình duyệt này.'); }
  };

  if (isLoading) return <PageLoading />;
  if (!settings) return <section className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center"><h1 className="text-xl font-black text-red-800">Không tải được cài đặt</h1><p className="mt-2 text-sm text-red-700">{error}</p><button type="button" onClick={() => void load()} className="mt-5 rounded-xl bg-red-700 px-4 py-2 text-sm font-bold text-white">Thử lại</button></section>;

  return <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-20 md:px-8"><header className="rounded-3xl border border-orange-100 bg-gradient-to-br from-[#fff9f3] to-[#ffeedd] p-6"><p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-orange-700"><Settings size={14} /> Cài đặt tài khoản</p><h1 className="mt-3 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Tùy chọn học tập</h1><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Các tùy chọn học được lưu trên Cloud theo tài khoản; giao diện nền giữ riêng trên thiết bị này.</p></header>{error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}<section className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><Palette size={19} /></span><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Nền ứng dụng</h2><p className="text-xs text-[#7b8796]">Lưu cục bộ trên thiết bị.</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-3">{APP_BACKGROUNDS.map((option) => <button type="button" key={option.id} onClick={() => setBackground(option.id)} className={`overflow-hidden rounded-2xl border p-3 text-left ${background === option.id ? 'border-orange-500 ring-2 ring-orange-300' : 'border-[#e8dccb]'}`}><div className="h-20 rounded-xl" style={{ background: option.preview }} /><p className="mt-3 font-black text-[#172033]">{option.label}</p><p className="mt-1 text-xs text-[#7b8796]">{option.description}</p></button>)}</div></section><section className="grid gap-4 lg:grid-cols-2"><article className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Mục tiêu và nhắc học</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold text-[#172033]">Mục tiêu mỗi ngày (phút)<input type="number" min={5} max={240} value={settings.dailyGoalMinutes} onChange={(event) => void save({ dailyGoalMinutes: Number(event.target.value) })} disabled={isSaving} className="mt-1.5 w-full rounded-xl border border-[#e8dccb] px-3 py-2.5 outline-none focus:border-orange-400" /></label><label className="text-sm font-bold text-[#172033]">Giờ nhắc<input type="time" value={settings.reminderTime ?? ''} onChange={(event) => void save({ reminderTime: event.target.value || null })} disabled={isSaving} className="mt-1.5 w-full rounded-xl border border-[#e8dccb] px-3 py-2.5 outline-none focus:border-orange-400" /></label><label className="text-sm font-bold text-[#172033] sm:col-span-2">Múi giờ<input value={settings.timezone} onChange={(event) => void save({ timezone: event.target.value })} disabled={isSaving} className="mt-1.5 w-full rounded-xl border border-[#e8dccb] px-3 py-2.5 outline-none focus:border-orange-400" /></label></div></article><article className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Phản hồi và thông báo</h2><div className="mt-4 space-y-3">{toggleDefinitions.map((definition) => { const Icon = definition.icon; const checked = settings[definition.key]; return <button type="button" key={definition.key} role="switch" aria-checked={checked} disabled={isSaving} onClick={() => void save({ [definition.key]: !checked })} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-[#f0e5d9] bg-[#fffdf8] p-3 text-left disabled:opacity-50"><span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Icon size={17} /></span><span><strong className="block text-sm text-[#172033]">{definition.title}</strong><small className="mt-0.5 block text-xs leading-4 text-[#7b8796]">{definition.description}</small></span></span><span className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 ${checked ? 'bg-orange-700' : 'bg-slate-200'}`}><span className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : ''}`} /></span></button>; })}</div></article></section><section className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Bộ nhớ đệm</h2><p className="mt-1 text-sm text-[#5f6b7c]">Xóa cache giao diện, không xóa phiên đăng nhập hoặc dữ liệu học trên Cloud.</p></div><button type="button" onClick={() => void clearCache()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700"><RotateCcw size={15} /> Xóa cache</button></div>{cacheStatus && <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><Check size={15} /> {cacheStatus}</p>}</section></div>;
}
