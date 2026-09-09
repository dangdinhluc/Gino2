import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BookOpen, ChevronRight, Flame, HelpCircle, LogOut, Settings, Trophy, Users, NotebookPen, Zap } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { fetchLearnerDashboard, type LearnerDashboardSnapshot } from '@/src/features/dashboard/repositories/learnerDashboardRepository';
import { fetchLearnerStats, type LearnerStatsSnapshot } from '@/src/features/dashboard/repositories/learnerStatsRepository';
import { listLearnerAchievements } from '@/src/features/rewards/repositories/rewardRepository';

export default function ProfilePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearnerProfileSnapshot | null>(null);
  const [dashboard, setDashboard] = useState<LearnerDashboardSnapshot | null>(null);
  const [stats, setStats] = useState<LearnerStatsSnapshot | null>(null);
  const [achievementCount, setAchievementCount] = useState<number | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;
    let cancelled = false;
    setError(null);
    Promise.all([fetchLearnerProfile(userId), fetchLearnerDashboard(), fetchLearnerStats(), listLearnerAchievements()])
      .then(([nextProfile, nextDashboard, nextStats, achievements]) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setDashboard(nextDashboard);
        setStats(nextStats);
        setAchievementCount(achievements.length);
      })
      .catch((nextError: unknown) => {
        if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được hồ sơ.');
      });
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
  const totalXp = stats?.totalXp ?? 0;
  const levelLabel = profile?.targetLevel || 'Tokutei';
  const vocabularyProgress = useMemo(() => {
    if (!stats?.topicMastery?.length) return null;
    const totals = stats.topicMastery.reduce(
      (acc, topic) => ({ mastered: acc.mastered + topic.mastered, total: acc.total + topic.total }),
      { mastered: 0, total: 0 },
    );
    return totals.total > 0 ? Math.round((totals.mastered / totals.total) * 100) : null;
  }, [stats]);

  const statItems = [
    { icon: Flame, value: streak, label: 'Chuỗi ngày', tone: 'text-[#6f45d8]' },
    { icon: Zap, value: totalXp, label: 'Tổng XP', tone: 'text-[#6f45d8]' },
    { icon: Trophy, value: achievementCount ?? '—', label: 'Huy hiệu', tone: 'text-[#6f45d8]' },
    { icon: BookOpen, value: activeCourses, label: 'Khóa học', tone: 'text-[#8a72c7]' },
    { icon: NotebookPen, value: completedLessons, label: 'Bài đã học', tone: 'text-[#8a72c7]' },
    { icon: BookOpen, value: mastered, label: 'Từ vựng', tone: 'text-[#8a72c7]' },
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
      <section className="rounded-[24px] border border-[#e5dcf2] bg-[#fffcff] p-4 shadow-[0_6px_18px_rgba(73,48,126,.06)] sm:p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f3eefb]">
            <img src={assets.shared.mascots.meow} alt="Ảnh đại diện" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-[var(--font-heading)] text-[18px] font-bold text-[#211b35]">{profile?.displayName || 'Học viên'}</h1>
            <p className="mt-0.5 text-[11px] font-medium text-[#6f6880]">{levelLabel}</p>
            <div className="mt-2.5 flex items-center gap-2">
              <span className="shrink-0 text-[11px] font-semibold text-[#6f6880]">{totalXp.toLocaleString()} XP</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ebe4f5]" aria-label="Tiến độ từ vựng">
                <div className="h-full rounded-full bg-[#6f45d8]" style={{ width: `${vocabularyProgress ?? 0}%` }} />
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-[#6f6880]">{vocabularyProgress === null ? '—' : `${vocabularyProgress}%`}</span>
            </div>
            <p className="mt-1 text-[10px] font-medium text-[#8a8298]">Tiến độ từ vựng trên các khóa có dữ liệu</p>
          </div>
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eee7ff] text-[#6f45d8]"><Trophy size={18} /></span>
        </div>
      </section>

      {error && <div className="mt-3 rounded-[14px] border border-[#e8c7c4] bg-[#fff2f0] px-3.5 py-3 text-[11px] font-semibold text-[#a94743]" role="alert">{error}</div>}

      <section className="mt-5">
        <h2 className="mb-2.5 text-[11px] font-bold uppercase tracking-[.08em] text-[#6f6880]">Thành tích</h2>
        <div className="grid grid-cols-2 gap-2.5 min-[420px]:grid-cols-3">
          {statItems.map(({ icon: Icon, value, label, tone }) => (
            <div key={label} className="rounded-[14px] border border-[#e5dcf2] bg-[#fffcff] px-2 py-3.5 text-center shadow-[0_2px_8px_rgba(73,48,126,.04)]">
              <Icon size={16} className={`mx-auto ${tone}`} />
              <strong className="mt-1.5 block text-[15px] font-bold text-[#211b35]">{typeof value === 'number' ? value.toLocaleString() : value}</strong>
              <span className="mt-0.5 block text-[11px] font-medium text-[#6f6880]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 overflow-hidden rounded-[24px] border border-[#e5dcf2] bg-[#fffcff] shadow-[0_6px_18px_rgba(73,48,126,.05)]">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Link key={item.label} to={item.path} className={`flex min-h-[64px] items-center gap-3 px-4 transition hover:bg-[#faf7ff] ${index ? 'border-t border-[#e5dcf2]' : ''}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[#f4effb] text-[#6f45d8]"><Icon size={17} /></span>
              <span className="flex-1 text-[12px] font-semibold text-[#211b35]">{item.label}</span>
              <ChevronRight size={16} className="text-[#9189a0]" />
            </Link>
          );
        })}
      </section>

      <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-[#e5dcf2] bg-[#fffcff] px-4 text-[12px] font-semibold text-[#6f6880] transition hover:bg-[#faf7ff] disabled:opacity-50">
        <LogOut size={16} /> {signingOut ? 'Đang đăng xuất…' : 'Đăng xuất'}
      </button>
    </div>
  );
}
