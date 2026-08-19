import { type FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { completeLearnerOnboarding } from '@/src/features/profile/repositories/learnerSettingsRepository';

const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Tokyo';

export default function OnboardingPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(auth.user?.user_metadata?.display_name ?? '');
  const [level, setLevel] = useState('Tokutei Gino');
  const [timezone, setTimezone] = useState(defaultTimezone);
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await completeLearnerOnboarding({ displayName: displayName.trim(), level, timezone, dailyGoalMinutes });
      navigate('/app/dashboard', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không lưu được thông tin học viên.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!auth.isLoading && !auth.isAuthenticated) return <Navigate to="/login/learner" replace />;
  return <main className="grid min-h-screen place-items-center bg-[#F7F1E8] px-4 py-10"><section className="w-full max-w-xl rounded-3xl border border-[#e4d8c9] bg-[#fffcf7] p-6 shadow-xl sm:p-8"><Link to="/" className="inline-block py-2 text-xs font-black uppercase tracking-[0.18em] text-[#c96a1b]">TOKUTEI GINO</Link><div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#c96a1b]"><Compass size={23} /></div><h1 className="mt-4 font-[var(--font-heading)] text-3xl font-black text-[#172033]">Thiết lập lộ trình học</h1><p className="mt-2 text-sm leading-6 text-[#5f6b7c]">Thông tin này lưu an toàn vào hồ sơ. Khi hoàn tất, gói Starter miễn phí sẽ được ghi danh tự động.</p><form onSubmit={(event) => void submit(event)} className="mt-6 grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold text-[#172033] sm:col-span-2">Tên hiển thị<input required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label><label className="block text-sm font-bold text-[#172033]">Mục tiêu<input value={level} onChange={(event) => setLevel(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label><label className="block text-sm font-bold text-[#172033]">Múi giờ<input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label><label className="block text-sm font-bold text-[#172033] sm:col-span-2">Mục tiêu mỗi ngày (phút)<input required min={5} max={240} type="number" value={dailyGoalMinutes} onChange={(event) => setDailyGoalMinutes(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-[#e4d8c9] bg-white px-3 py-3 outline-none focus:border-orange-500" /></label>{error && <p className="sm:col-span-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}<button disabled={isSaving} className="sm:col-span-2 rounded-xl bg-[#c96a1b] px-4 py-3 text-sm font-black text-white disabled:opacity-60">{isSaving ? 'Đang lưu…' : 'Hoàn tất và bắt đầu học'}</button></form></section></main>;
}
