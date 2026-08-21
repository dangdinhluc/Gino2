import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '@/src/shared/lib/assets';
import { useAuth } from '@/src/features/auth/lib/AuthProvider';
import { fetchLearnerProfile, type LearnerProfileSnapshot } from '@/src/features/profile/repositories/profileRepository';
import { fetchLearningActivityHeatmap, type StudyHeatmapDay } from '@/src/features/profile/repositories/learningActivityRepository';
import { StudyHeatmap } from '@/src/features/profile/components/StudyHeatmap';
import { listLearnerAchievements, listLearnerCertificates, rewardDate, type LearnerAchievement, type LearnerCertificate } from '@/src/features/rewards/repositories/rewardRepository';
import { Award, GraduationCap } from 'lucide-react';
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  LogOut,
  Settings,
  Shield,
  Sparkles,
  Target,
  User,
  Zap,
} from 'lucide-react';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

export default function Profile() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<LearnerProfileSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [heatmap, setHeatmap] = useState<StudyHeatmapDay[]>([]);
  const [achievements, setAchievements] = useState<LearnerAchievement[]>([]);
  const [certificates, setCertificates] = useState<LearnerCertificate[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchLearnerProfile()
      .then((snapshot) => { if (!cancelled) setProfile(snapshot); })
      .catch((nextError: unknown) => { if (!cancelled) setError(nextError instanceof Error ? nextError.message : 'Không tải được hồ sơ.'); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchLearningActivityHeatmap(30)
      .then((days) => { if (!cancelled) setHeatmap(days); })
      .catch(() => { /* heatmap chỉ là phụ trợ — thất bại không chặn hồ sơ */ });
    Promise.all([listLearnerAchievements(), listLearnerCertificates()])
      .then(([nextAchievements, nextCertificates]) => { if (!cancelled) { setAchievements(nextAchievements); setCertificates(nextCertificates); } })
      .catch(() => { /* reward panels chỉ là phụ trợ */ });
    return () => { cancelled = true; };
  }, []);

  async function handleSignOut(): Promise<void> {
    setSigningOut(true);
    const result = await auth.signOut();
    if (result.ok) navigate('/login');
    else setError(result.error || 'Không thể đăng xuất.');
    setSigningOut(false);
  }

  const menuItems = [
    { icon: Bell, label: 'Thông báo học tập', hint: 'Chọn cách nhận nhắc học mỗi ngày', path: '/app/settings', tone: 'orange' },
    { icon: Shield, label: 'Bảo mật tài khoản', hint: 'Quản lý quyền truy cập và an toàn', path: '/privacy', tone: 'green' },
    { icon: HelpCircle, label: 'Trung tâm trợ giúp', hint: 'Tìm câu trả lời nhanh khi cần', path: '/terms', tone: 'purple' },
    { icon: Settings, label: 'Cài đặt ứng dụng', hint: 'Điều chỉnh trải nghiệm Tokutei Gino', path: '/app/settings', tone: 'red' },
  ] as const;

  const streakDays = profile?.streakDays ?? 0;
  const streakProgress = Math.min(100, Math.round((streakDays / 7) * 100));
  const profileStatus = profile ? (streakDays > 0 ? 'Đang học đều' : 'Sẵn sàng bắt đầu') : 'Đang đồng bộ…';
  const rhythmMessage = streakDays >= 7
    ? 'Tuần này anh đã đạt mục tiêu giữ nhịp học.'
    : streakDays > 0
      ? `Còn ${7 - streakDays} ngày để hoàn thành nhịp học tuần này.`
      : 'Bắt đầu một phiên học hôm nay để tạo ngày streak đầu tiên.';

  const stats = [
    { icon: Flame, label: 'Ngày streak', value: profile ? String(streakDays) : '—', note: 'liên tiếp', tone: 'orange' },
    { icon: CheckCircle2, label: 'Bài học', value: profile ? String(profile.completedLessons) : '—', note: 'đã hoàn thành', tone: 'amber' },
    { icon: BookOpen, label: 'Từ mastery', value: profile ? String(profile.masteredVocabulary) : '—', note: 'đã ghi nhận', tone: 'green' },
  ];

  return (
    <div className="profile-page mx-auto w-full max-w-[1440px] space-y-5 px-4 py-4 pb-16 md:px-8">
      <section className="profile-hero">
        <div className="profile-hero-main">
          <div className="profile-mascot-wrap">
            <img src={assets.shared.mascots.brand} alt="Mascot Tokutei Gino đồng hành học tập" className="profile-mascot" />
            <span className="profile-mascot-status" aria-hidden="true"><Sparkles size={12} /></span>
          </div>
          <div className="profile-identity-details">
            <div className="profile-kicker"><User size={13} /> Hồ sơ học viên</div>
            <h1>{profile?.displayName || 'Đang tải hồ sơ…'}</h1>
            <p className="profile-email">{profile?.email || auth.user?.email || '—'}</p>
            <div className="profile-identity-meta">
              <span className={`profile-active-pill ${streakDays > 0 ? 'profile-active-pill-positive' : 'profile-active-pill-ready'}`}><span /> {profileStatus}</span>
              <span className="profile-level-chip"><Target size={13} /> {profile?.targetLevel || 'Tokutei Gino'}</span>
            </div>
          </div>
        </div>

        <div className="profile-hero-actions">
          <span className="profile-sync-badge"><CheckCircle2 size={14} /> Đồng bộ Cloud</span>
          <Link to="/app/settings" className={`profile-settings-link ${focusRing}`}>
            <Settings size={15} /> Cài đặt <ChevronRight size={15} />
          </Link>
        </div>

        <div className="profile-stats-grid" aria-label="Tổng quan hồ sơ">
          {stats.map(({ icon: Icon, label, value, note, tone }) => (
            <div key={label} className="profile-stat">
              <span className={`profile-stat-icon profile-stat-icon-${tone}`}><Icon size={17} strokeWidth={1.9} /></span>
              <div>
                <strong>{value}</strong>
                <span>{label}</span>
                <small>{note}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

      <section className="profile-content-grid">
        <div className="profile-rhythm-card">
          <div className="profile-section-heading">
            <span className="profile-heading-icon profile-heading-icon-orange"><Flame size={17} /></span>
            <div><span>Nhịp học hiện tại</span><small>Giữ đà nhỏ mỗi ngày</small></div>
          </div>

          <div className="profile-streak-hero">
            <div className="profile-streak-topline">
              <div className="profile-streak-number"><strong>{profile?.streakDays ?? '—'}</strong><span>ngày liên tiếp</span></div>
              <span className="profile-streak-badge"><Zap size={13} /> {streakDays >= 7 ? 'Đủ mục tiêu' : streakDays > 0 ? 'Đang giữ nhịp' : 'Bắt đầu ngay'}</span>
            </div>
            <div className="profile-progress-meta"><span>Tiến độ mục tiêu tuần</span><strong>{profile ? `${streakProgress}%` : '—'}</strong></div>
            <div className="profile-streak-track" role="progressbar" aria-label="Tiến độ mục tiêu streak trong tuần" aria-valuemin={0} aria-valuemax={100} aria-valuenow={profile ? streakProgress : 0}><span style={{ width: `${streakProgress}%` }} /></div>
            <p>{rhythmMessage}</p>
          </div>

          <div className="profile-mini-status-list">
            <div className="profile-mini-status">
              <span className="profile-mini-icon profile-mini-icon-green"><BookOpen size={16} /></span>
              <div><strong>Khóa học đang theo dõi</strong><small>{profile?.activeCourses ?? '—'} khóa học trên Cloud</small></div>
              <CheckCircle2 size={17} className="profile-mini-check" />
            </div>
            <div className="profile-mini-status">
              <span className="profile-mini-icon profile-mini-icon-blue"><Target size={16} /></span>
              <div><strong>Đang theo {profile?.targetLevel || 'Tokutei'}</strong><small>{profile?.masteredVocabulary ?? '—'} từ vựng đã mastery</small></div>
              <Link to="/app/courses" className={`profile-mini-action ${focusRing}`} aria-label="Mở danh sách khóa học"><ChevronRight size={17} /></Link>
            </div>
          </div>
        </div>

        <div className="profile-menu-card">
          <div className="profile-menu-heading"><div><h2>Trung tâm tài khoản</h2><p>Mọi thiết lập học tập ở một chỗ.</p></div><Settings size={18} /></div>
          <ul>
            {menuItems.map(({ icon: Icon, label, hint, path, tone }) => (
              <li key={label}>
                <Link to={path} className={`profile-menu-link profile-menu-link-${tone} ${focusRing}`}>
                  <span className="profile-menu-icon"><Icon size={18} strokeWidth={1.8} /></span>
                  <span className="profile-menu-copy"><strong>{label}</strong><small>{hint}</small></span>
                  <ChevronRight size={18} className="profile-menu-arrow" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {heatmap.length > 0 && <StudyHeatmap days={heatmap} />}

      {(achievements.length > 0 || certificates.length > 0) && <section className="grid gap-5 lg:grid-cols-2"><article className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700"><Award size={19} /></span><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Huy hiệu</h2><p className="text-xs text-[#7b8796]">Thành tích đã mở khóa bằng dữ liệu thật.</p></div></div><div className="mt-4 grid gap-2">{achievements.map((item) => <div key={item.achievementId} className="rounded-2xl border border-amber-100 bg-amber-50/50 p-3"><p className="text-sm font-black text-[#172033]">{item.title}</p><p className="mt-1 text-xs text-[#7b8796]">{item.description} · {rewardDate(item.earnedAt)}</p></div>)}{achievements.length === 0 && <p className="text-sm text-[#7b8796]">Chưa có huy hiệu. Giữ nhịp học để mở khóa.</p>}</div></article><article className="rounded-3xl border border-[#f0e5d9] bg-white p-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><GraduationCap size={19} /></span><div><h2 className="font-[var(--font-heading)] text-lg font-black text-[#172033]">Chứng nhận</h2><p className="text-xs text-[#7b8796]">Mã xác nhận hoàn thành khóa học.</p></div></div><div className="mt-4 space-y-2">{certificates.map((item) => <div key={item.id} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3"><p className="text-sm font-black text-[#172033]">{item.courseTitle}</p><p className="mt-1 font-mono text-xs font-bold text-emerald-700">{item.certificateCode}</p><p className="mt-1 text-xs text-[#7b8796]">Cấp ngày {rewardDate(item.issuedAt)}</p></div>)}{certificates.length === 0 && <p className="text-sm text-[#7b8796]">Hoàn thành toàn bộ bài học để nhận chứng nhận.</p>}</div></article></section>}

      <button type="button" onClick={() => void handleSignOut()} disabled={signingOut} className={`profile-logout-button ${focusRing} disabled:cursor-not-allowed disabled:opacity-60`}>
        <LogOut size={18} strokeWidth={1.8} /> Đăng xuất
      </button>
    </div>
  );
}
