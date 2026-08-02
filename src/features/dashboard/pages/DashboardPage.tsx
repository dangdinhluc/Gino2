import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Download,
  Flame,
  Headphones,
  MessageSquareText,
  Search,
  Sparkles,
  Target,
  Users,
  X,
} from 'lucide-react';
import { dashboardTools, PRIMARY_TOOL_COUNT } from '@/src/data/dashboardMock';
import { buildDailySession } from '@/src/features/dashboard/lib/dailySession';
import { collectDueCards } from '@/src/features/review/lib/reviewSelectors';
import { useReviewStore } from '@/src/features/review/store/reviewStore';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const readinessTracks = [
  { label: 'JFT Basic', detail: 'Từ vựng & nghe hiểu', className: 'bg-orange-500' },
  { label: 'Workplace', detail: '5S & báo cáo ca', className: 'bg-[#315C73]' },
  { label: 'Interview', detail: 'Phản xạ trả lời HR', className: 'bg-emerald-600' },
  { label: 'Documents', detail: 'Hồ sơ trước lịch hẹn', className: 'bg-[#6F4AA8]' },
] as const;

export default function Dashboard() {
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(true);
  const [areAllToolsVisible, setAreAllToolsVisible] = useState(false);
  const reviewStates = useReviewStore((state) => state.states);
  const reviewLog = useReviewStore((state) => state.log);
  const streak = useProgressStore((state) => state.streak);
  const weeklyXp = useProgressStore((state) => state.weeklyXp);

  const dueCount = useMemo(() => collectDueCards(reviewStates, Date.now()).length, [reviewStates]);
  const dailySession = useMemo(() => buildDailySession(dueCount), [dueCount]);
  const reviewedToday = useMemo(() => {
    const now = new Date();
    const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return reviewLog.filter((entry) => entry.at >= dayStart).length;
  }, [reviewLog]);
  const visibleTools = areAllToolsVisible ? dashboardTools : dashboardTools.slice(0, PRIMARY_TOOL_COUNT);
  const hiddenToolCount = dashboardTools.length - PRIMARY_TOOL_COUNT;
  const completedSteps = reviewedToday >= 8 ? 1 : 0;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-4">
      <section className="rounded-2xl border border-[#e0d2bf] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-800">
              {dailySession.track}
            </span>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">
              Kế hoạch học hôm nay
            </h1>
            <p className="text-sm text-[#4d5a6b]">Một phiên ngắn, đi từ nhớ từ đến phản xạ khi đi làm.</p>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 text-center">
              <div className="font-[var(--font-heading)] text-xl font-bold text-[#172033]">{dailySession.totalMinutes}'</div>
              <div className="mt-0.5 text-[11px] text-[#5f6b7c]">Hôm nay</div>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 text-center">
              <div className="font-[var(--font-heading)] text-xl font-bold text-[#172033]">{streak}d</div>
              <div className="mt-0.5 text-[11px] text-[#5f6b7c]">Streak</div>
            </div>
            <div className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 text-center">
              <div className="font-[var(--font-heading)] text-xl font-bold text-[#172033]">+{weeklyXp}</div>
              <div className="mt-0.5 text-[11px] text-[#5f6b7c]">XP tuần</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-orange-200 bg-[linear-gradient(125deg,#fff4e8_0%,#fffaf3_65%)] p-4 md:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-800">Phiên hôm nay · {completedSteps}/3 bước</p>
              <p className="mt-1 text-sm text-[#4d5a6b]">Hoàn thành theo thứ tự để giữ đúng nhịp Tokutei.</p>
            </div>
            <Link
              to={dailySession.steps[completedSteps]?.path ?? '/app/stats'}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
            >
              <Sparkles size={16} /> {completedSteps === 0 ? 'Bắt đầu phiên' : 'Tiếp tục phiên'}
            </Link>
          </div>

          <ol className="mt-4 grid gap-2.5 md:grid-cols-3">
            {dailySession.steps.map((step, index) => {
              const isDone = index < completedSteps;
              const isCurrent = index === completedSteps;
              const StepIcon = step.id === 'review' ? Headphones : step.id === 'lesson' ? Target : MessageSquareText;
              return (
                <li key={step.id}>
                  <Link
                    to={step.path}
                    aria-current={isCurrent ? 'step' : undefined}
                    className={`group flex min-h-28 gap-3 rounded-xl border p-3.5 transition-colors ${focusRing} ${
                      isDone
                        ? 'border-emerald-200 bg-emerald-50/70'
                        : isCurrent
                          ? 'border-orange-300 bg-white shadow-sm'
                          : 'border-[#e8dccb] bg-[#fffdf8] hover:border-orange-200'
                    }`}
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isDone ? 'bg-emerald-600 text-white' : isCurrent ? 'bg-orange-700 text-white' : 'bg-[#f0f2f5] text-[#5f6b7c]'}`}>
                      {isDone ? <CheckCircle2 size={18} /> : <StepIcon size={18} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#5f6b7c]">
                        Bước {index + 1}<span>{step.minutes}' · +{step.xp}</span>
                      </span>
                      <span className="mt-1 block text-sm font-bold text-[#172033]">{step.title}</span>
                      <span className="mt-1 block text-xs leading-relaxed text-[#5f6b7c]">{step.detail}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-[1fr_11rem]">
        <div className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-orange-700" />
            <h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Sẵn sàng Tokutei</h2>
          </div>
          <p className="mt-1 text-sm text-[#5f6b7c]">4 trục để biết mình đang học vì mục tiêu nào.</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {readinessTracks.map((track) => (
              <div key={track.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] p-3">
                <span className={`block h-1.5 rounded-full ${track.className}`} />
                <p className="mt-2 text-sm font-bold text-[#172033]">{track.label}</p>
                <p className="mt-0.5 text-[11px] leading-snug text-[#5f6b7c]">{track.detail}</p>
              </div>
            ))}
          </div>
        </div>
        <Link
          to="/app/stats"
          className={`group flex min-h-28 flex-col justify-between rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-4 transition-colors hover:border-orange-200 hover:bg-orange-50/50 ${focusRing}`}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Flame size={18} /></span>
          <span><span className="block text-sm font-bold text-[#172033]">Xem readiness</span><span className="mt-0.5 flex items-center gap-1 text-xs text-orange-800">Theo kỹ năng <ChevronRight size={14} /></span></span>
        </Link>
      </section>

      <Link
        to="/app/search"
        className={`group flex items-center gap-3 rounded-2xl border border-[#e0d2bf] bg-[#fffaf3] px-4 py-3.5 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
      >
        <Search size={18} className="shrink-0 text-[#5f6b7c] transition-colors group-hover:text-orange-700" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-sm text-[#4d5a6b]">Tìm lộ trình, hồ sơ hoặc mock test</span>
        <ChevronRight size={17} className="shrink-0 text-[#5f6b7c] transition-colors group-hover:text-orange-700" />
      </Link>

      <section className="space-y-2.5">
        <div className="flex items-end justify-between px-1">
          <div><h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Công cụ bổ trợ</h2><p className="mt-0.5 text-xs text-[#5f6b7c]">Dùng khi cần luyện sâu hơn ngoài phiên hôm nay.</p></div>
        </div>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <Link key={tool.label} to={tool.path} className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-3.5 transition-colors hover:border-orange-200 hover:bg-[#fffdf8] ${focusRing}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><tool.icon size={19} strokeWidth={1.8} /></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">{tool.label}</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">{tool.sub}</span></span>
              <ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" />
            </Link>
          ))}
        </div>
        <button type="button" onClick={() => setAreAllToolsVisible((value) => !value)} aria-expanded={areAllToolsVisible} className={`flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 text-sm font-bold text-[#4d5a6b] transition-colors hover:text-orange-700 ${focusRing}`}>
          {areAllToolsVisible ? 'Thu gọn công cụ' : `Xem thêm ${hiddenToolCount} công cụ`}<ChevronDown size={16} className={areAllToolsVisible ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </section>

      {isInstallPromptVisible && (
        <div className="flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Download size={19} strokeWidth={1.8} /></span>
          <div className="min-w-0 flex-1"><p className="font-bold text-[#172033]">Cài đặt TOKUTEI GINO</p><p className="mt-0.5 text-xs text-[#5f6b7c]">Ghim lối tắt để mở nhanh dashboard mỗi ngày.</p></div>
          <Link to="/app/settings" className={`shrink-0 rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}>Cài đặt</Link>
          <button type="button" aria-label="Ẩn nhắc cài đặt" onClick={() => setIsInstallPromptVisible(false)} className="shrink-0 rounded-lg p-1.5 text-[#7b8796] transition-colors hover:text-[#4d5a6b]"><X size={18} /></button>
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-end justify-between px-1"><h2 className="font-[var(--font-heading)] text-lg font-bold text-[#172033]">Cộng đồng</h2><Link to="/app/messages" className="text-sm font-bold text-orange-800 hover:underline">Mở tất cả →</Link></div>
        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Link to="/app/messages" className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><Users size={19} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">Zalo · Nhóm chính</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">Trao đổi nhanh, hỏi bài, nhắc lịch học.</span></span><ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" /></Link>
          <Link to="/app/messages" className={`group flex items-center gap-3 rounded-xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700"><MessageSquareText size={19} strokeWidth={1.8} /></span><span className="min-w-0 flex-1"><span className="block truncate font-bold text-[#172033]">Facebook · Cộng đồng</span><span className="mt-0.5 block truncate text-xs text-[#5f6b7c]">Cập nhật đề mới và chia sẻ kinh nghiệm.</span></span><ChevronRight size={16} className="shrink-0 text-[#7b8796] transition-colors group-hover:text-orange-700" /></Link>
        </div>
      </section>

      <p className="flex items-center justify-center gap-1.5 text-xs text-[#5f6b7c]"><Clock size={13} strokeWidth={1.8} /> Nhịp đề xuất: 15–20 phút mỗi phiên</p>
    </div>
  );
}
