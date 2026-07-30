import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Clock, Download, Flame, Layers, Search, Users, X } from 'lucide-react';
import { dashboardTasks, dashboardTools, PRIMARY_TOOL_COUNT } from '@/src/data/dashboardMock';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e8]';

const heroStats = [
  { label: 'Hôm nay', value: "3'" },
  { label: 'Cụm đã khóa', value: '0' },
  { label: 'Streak', value: '0d' },
];

export default function Dashboard() {
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(true);
  const [areAllToolsVisible, setAreAllToolsVisible] = useState(false);

  const visibleTools = areAllToolsVisible ? dashboardTools : dashboardTools.slice(0, PRIMARY_TOOL_COUNT);
  const hiddenToolCount = dashboardTools.length - PRIMARY_TOOL_COUNT;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-4">
      {/* Hero: mot khoi duy nhat, responsive. Truoc day co hai phien ban mobile va
          desktop viet rieng, moi ban mot he bo goc va bong khac nhau. */}
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0 space-y-2">
            <span className="inline-flex rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">
              Track Tokutei · JFT + Core
            </span>
            <h1 className="font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] text-[#172033] md:text-3xl">
              Sẵn sàng vào nhịp, anh
            </h1>
            <p className="text-sm text-[#5f6b7c]">Mỗi ngày một phiên ngắn nhưng đúng việc.</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 md:w-auto">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-3 py-2.5 text-center md:min-w-[5rem]">
                <div className="font-[var(--font-heading)] text-xl font-bold text-[#172033]">{stat.value}</div>
                <div className="mt-0.5 text-[11px] text-[#7b8796]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto] gap-2.5">
          <Link
            to="/app/review/flashcards"
            className={`inline-flex min-h-12 items-center justify-center rounded-xl bg-orange-700 px-4 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
          >
            Vào phiên ưu tiên
          </Link>
          <Link
            to="/app/courses"
            className={`inline-flex min-h-12 items-center justify-center rounded-xl border border-[#e8dccb] bg-[#fffdf8] px-4 text-sm font-bold text-[#172033] transition-colors hover:bg-[#f6efe6] ${focusRing}`}
          >
            Khóa học
          </Link>
        </div>
      </section>

      {/* Thanh tim kiem */}
      <Link
        to="/app/search"
        className={`group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-4 py-3.5 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
      >
        <Search size={18} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate text-sm text-[#5f6b7c]">Tìm lộ trình, hồ sơ hoặc mock test</span>
        <ChevronRight size={17} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
      </Link>

      {/* Cong cu */}
      <section className="space-y-2.5">
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTools.map((tool) => (
            <Link
              key={tool.label}
              to={tool.path}
              className={`group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-3.5 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <tool.icon size={19} strokeWidth={1.8} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold text-[#172033]">{tool.label}</span>
                <span className="mt-0.5 block truncate text-xs text-[#7b8796]">{tool.sub}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
            </Link>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setAreAllToolsVisible((value) => !value)}
          aria-expanded={areAllToolsVisible}
          className={`flex w-full items-center justify-center gap-1.5 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
        >
          {areAllToolsVisible ? 'Thu gọn' : `Xem tất cả (${hiddenToolCount} công cụ khác)`}
          <ChevronDown size={16} className={areAllToolsVisible ? 'rotate-180 transition-transform' : 'transition-transform'} />
        </button>
      </section>

      {/* Nhiem vu hang ngay */}
      <section className="rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 md:p-5">
        <header className="mb-3 flex items-center justify-between">
          <h2 className="font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">Nhiệm vụ hôm nay</h2>
          <span className="rounded-lg bg-orange-50 px-2.5 py-1 text-sm font-bold text-orange-700">0/{dashboardTasks.length}</span>
        </header>

        <ul className="divide-y divide-[#efe5d7] overflow-hidden rounded-xl border border-[#e8dccb] bg-[#fffdf8]">
          {dashboardTasks.map((task) => (
            <li key={task.title}>
              <Link
                to={task.path}
                className={`group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-[#fffaf3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-500`}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <task.icon size={17} strokeWidth={1.8} />
                </span>
                <span className="min-w-0 flex-1 truncate font-bold text-[#172033]">{task.title}</span>
                <span className="shrink-0 text-xs font-bold text-orange-700">{task.xp}</span>
                <span className="shrink-0 rounded-lg bg-[#f0f2f5] px-2 py-1 text-[11px] font-bold text-[#5f6b7c]">{task.status}</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/app/stats"
          className={`mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#e8dccb] bg-[#fffdf8] py-2.5 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-orange-700 ${focusRing}`}
        >
          Xem chi tiết thống kê
          <ChevronRight size={16} />
        </Link>
      </section>

      {/* Nhac cai dat */}
      {isInstallPromptVisible && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
            <Download size={19} strokeWidth={1.8} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-[#172033]">Cài đặt TOKUTEI GINO</p>
            <p className="mt-0.5 text-xs text-[#7b8796]">Ghim lối tắt để mở nhanh dashboard mỗi ngày.</p>
          </div>
          <Link
            to="/app/settings"
            className={`shrink-0 rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-800 ${focusRing}`}
          >
            Cài đặt
          </Link>
          <button
            type="button"
            aria-label="Ẩn nhắc cài đặt"
            onClick={() => setIsInstallPromptVisible(false)}
            className="shrink-0 rounded-lg p-1.5 text-[#95a0af] transition-colors hover:text-[#5f6b7c]"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Cong dong */}
      <section className="space-y-3">
        <div className="flex items-end justify-between px-1">
          <h2 className="font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-[#172033]">Cộng đồng</h2>
          <Link to="/app/messages" className="text-sm font-bold text-orange-700 hover:underline">
            Mở tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
          <Link
            to="/app/messages"
            className={`group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Users size={19} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-[#172033]">Zalo · Nhóm chính</span>
              <span className="mt-0.5 block truncate text-xs text-[#7b8796]">Trao đổi nhanh, hỏi bài, nhắc lịch học.</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
          </Link>

          <Link
            to="/app/messages"
            className={`group flex items-center gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] p-4 transition-colors hover:bg-[#fffdf8] ${focusRing}`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
              <Flame size={19} strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold text-[#172033]">Facebook · Cộng đồng</span>
              <span className="mt-0.5 block truncate text-xs text-[#7b8796]">Cập nhật đề mới và chia sẻ kinh nghiệm.</span>
            </span>
            <ChevronRight size={16} className="shrink-0 text-[#95a0af] transition-colors group-hover:text-orange-700" />
          </Link>
        </div>
      </section>

      {/* Clock giu de tuong thich import cu neu can; dung o day cho nhip hoc */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-[#95a0af]">
        <Clock size={13} strokeWidth={1.8} /> Nhịp đề xuất: 15-20 phút mỗi phiên
      </p>
    </div>
  );
}
