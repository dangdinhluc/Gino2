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
    { icon: Flame, value: streak, label: 'Chuỗi ngày', tone: 'text-[#c96a1b]' },
    { icon: Zap, value: weeklyXp, label: 'Tổng XP', tone: 'text-[#c96a1b]' },
    { icon: Trophy, value: Math.max(0, Math.floor(completedLessons / 10)), label: 'Huy hiệu', tone: 'text-[#c96a1b]' },
    { icon: BookOpen, value: activeCourses, label: 'Khóa học', tone: 'text-[#6f4aa8]' },
    { icon: NotebookPen, value: completedLessons, label: 'Bài đã học', tone: 'text-[#6f4aa8]' },
    { icon: BookOpen, value: mastered, label: 'Từ vựng', tone: 'text-[#6f4aa8]' },
  ];

  const menuItems = [
    { icon: Users, label: 'Cộng đồng', path: '/app/community' },
    { icon: NotebookPen, label: 'Nhật ký học tập', path: '/app/journal' },
    { icon: Bell, label: 'Thông báo', path: '/app/notifications' },
    { icon: Settings, label: 'Cài đặt', path: '/app/settings' },
    { icon: HelpCircle, label: 'Trợ giúp & Phản hồi', path: '/terms' },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-28 pt-5 sm:px-6 sm:pt-7">
      <section className="rounded-[24px] border border-[#e8dccb] bg-[#fff9f2] p-4 shadow-[0_6px_18px_rgba(92,61,35,.06)] sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3e8dc]">
            <img src={assets.shared.mascots.meow} alt="Ảnh đại diện" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-heading)] text-[18px] font-bold text-[#172033]">{profile?.displayName || 'Học viên'}</h1>
            <p className="mt-0.5 text-[11px] font-medium text-[#5f6b7c]">{levelLabel}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#5f6b7c]">{weeklyXp.toLocaleString()} XP</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#efe4d5]"><div className="h-full w-[82%] rounded-full bg-[#c96a1b]" /></div>
              <span className="text-[11px] font-semibold text-[#5f6b7c]">82%</span>
            </div>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f9eadb] text-[#c96a1b]"><Trophy size={18} /></span>
        </div>
      </section>

      {error && <div className="mt-3 rounded-[14px] border border-[#e8c7c4] bg-[#fff2f0] px-3.5 py-3 text-[11px] font-semibold text-[#a94743]" role="alert">{error}</div>}

      <section className="mt-5">
        <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#5f6b7c]">Thành tích</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {statItems.map(({ icon: Icon, value, label, tone }) => (
            <div key={label} className="rounded-[14px] border border-[#e8dccb] bg-[#fff9f2] px-2 py-3.5 text-center shadow-[0_2px_8px_rgba(92,61,35,.04)]">
              <Icon size={16} className={`mx-auto ${tone}`} />
              <strong className="mt-1.5 block text-[15px] font-bold text-[#172033]">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
              <span className="mt-0.5 block text-[11px] font-medium text-[#5f6b7c]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#e8dccb] bg-[#fff9f2] shadow-[0_6px_18px_rgba(92,61,35,.05)]">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.path} className={`flex min-h-[64px] items-center gap-3 px-4 transition hover:bg-[#fffdf9] ${index ? 'border-t border-[#e8dccb]' : ''}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[#f8f2e8] text-[#5f6b7c]"><Icon size={17} /></span>
              <span className="flex-1 text-[12px] font-semibold text-[#172033]">{item.label}</span>
              <ChevronRight size={16} className="text-[#8a94a3]" />
            </Link>
          );
        })}
      </section>

      <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#e8dccb] bg-[#fff9f2] px-4 text-[12px] font-semibold text-[#5f6b7c] transition hover:bg-[#fffdf9] disabled:opacity-50">
        <LogOut size={16} /> {signingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
    </div>
  );
}
