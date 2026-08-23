import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ChevronRight, Flame, HelpCircle, LogOut, Settings, Trophy, Users, NotebookPen, Zap } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { fetchLearnerDashboard, type LearnerDashboardSnapshot } from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const weeklyXp = useProgressStore((state) => state.weeklyXp);
  const [profile, setProfile] = useState<LearnerProfileSnapshot | null>(null);
  const [dashboard, setDashboard] = useState<LearnerDashboardSnapshot | null>(null);
  const [stats, setStats] = useState<LearnerStatsSnapshot | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;
    let cancelled = false;
    Promise.all([fetchLearnerProfile(userId), fetchLearnerDashboard(), fetchLearnerStats()])
      .then(([nextProfile, nextDashboard, nextStats]) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setDashboard(nextDashboard);
        setStats(nextStats);
      })
      .catch((nextError: unknown) => { if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được hồ sơ.'); });
    return () => { cancelled = true; };
  }, [auth.user?.id]);

  async function handleSignOut() {
    setSigningOut(true);
    const result = await auth.signOut();
    if (result.ok) navigate('/login');
    else setError(result.error || 'Không thể đăng xuất.');
    setSigningOut(false);
  }

  const streak = stats?.currentStreak ?? dashboard?.streakDays ?? 0;
  const completedLessons = dashboard?.completedLessons ?? 0;
  const activeCourses = dashboard?.activeCourses ?? 0;
  const mastered = stats?.masteredVocabulary ?? 0;
  const levelLabel = profile?.targetLevel || 'Tokutei';

  const statItems = [
    { icon: Flame, value: streak, label: 'Chuỗi ngày', tone: 'text-[#ef7a55]' },
    { icon: Zap, value: weeklyXp, label: 'Tổng XP', tone: 'text-[#e3a51f]' },
    { icon: Trophy, value: Math.max(0, Math.floor(completedLessons / 10)), label: 'Huy hiệu', tone: 'text-[#d89f35]' },
    { icon: BookOpen, value: activeCourses, label: 'Khóa học', tone: 'text-[#6776d8]' },
    { icon: NotebookPen, value: completedLessons, label: 'Bài đã học', tone: 'text-[#5ca589]' },
    { icon: BookOpen, value: mastered, label: 'Từ vựng', tone: 'text-[#6f45d8]' },
  ];

  const menuItems = [
    { icon: Users, label: 'Cộng đồng', path: '/app/community' },
    { icon: NotebookPen, label: 'Nhật ký học tập', path: '/app/journal' },
    { icon: Bell, label: 'Thông báo', path: '/app/notifications' },
    { icon: Settings, label: 'Cài đặt', path: '/app/settings' },
    { icon: HelpCircle, label: 'Trợ giúp & Phản hồi', path: '/terms' },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6">
      <section className="rounded-[16px] border border-[#e8e8ef] bg-white p-4 shadow-[0_4px_14px_rgba(20,20,35,.04)]">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e8dc]">
            <img src={assets.shared.mascots.meow} alt="Ảnh đại diện" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[16px] font-extrabold text-[#1e1f24]">{profile?.displayName || 'Học viên'}</h1>
            <p className="mt-0.5 text-[10px] font-semibold text-[#838690]">{levelLabel}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[9px] font-bold text-[#777a84]">{weeklyXp.toLocaleString()} XP</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#eeeef3]"><div className="h-full w-[82%] rounded-full bg-[#6f45d8]" /></div>
              <span className="text-[9px] font-bold text-[#777a84]">82%</span>
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f0e9ff] text-[#6f45d8]"><Trophy size={17} /></span>
        </div>
      </section>

      {error && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-[10px] font-semibold text-red-700">{error}</div>}

      <section className="mt-5">
        <h2 className="mb-2.5 text-[10px] font-extrabold uppercase tracking-[.06em] text-[#3f4148]">Thành tích</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {statItems.map(({ icon: Icon, value, label, tone }) => (
            <div key={label} className="rounded-[13px] border border-[#e9e9ef] bg-white px-2 py-3 text-center shadow-[0_2px_8px_rgba(20,20,35,.03)]">
              <Icon size={15} className={`mx-auto ${tone}`} />
              <strong className="mt-1.5 block text-[15px] font-extrabold text-[#25262c]">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
              <span className="mt-0.5 block text-[9px] font-semibold text-[#8b8e98]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[15px] border border-[#e8e8ef] bg-white shadow-[0_3px_12px_rgba(20,20,35,.035)]">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.path} className={`flex min-h-[58px] items-center gap-3 px-3.5 ${index ? 'border-t border-[#eeeeF3]' : ''}`}>
              <Icon size={17} className="text-[#33353c]" />
              <span className="flex-1 text-[11px] font-bold text-[#34353b]">{item.label}</span>
              <ChevronRight size={15} className="text-[#a3a5ad]" />
            </Link>
          );
        })}
      </section>

      <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#e3e3ea] bg-white text-[11px] font-bold text-[#777a84] disabled:opacity-50">
        <LogOut size={15} /> {signingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
    </div>
  );
}
