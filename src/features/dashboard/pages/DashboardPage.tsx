import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronDown,
  ChevronRight,
  Search,
  Flame,
  BookOpen,
  Clock,
  Download,
  X,
  Send,
  Users,
  Sparkles,
} from 'lucide-react';
import { dashboardTasks, dashboardTools, PRIMARY_TOOL_COUNT } from '@/src/data/dashboardMock';

export default function Dashboard() {
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(true);
  const [areAllToolsVisible, setAreAllToolsVisible] = useState(false);

  const visibleTools = areAllToolsVisible ? dashboardTools : dashboardTools.slice(0, PRIMARY_TOOL_COUNT);
  const hiddenToolCount = dashboardTools.length - PRIMARY_TOOL_COUNT;

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] space-y-6 pb-4 md:space-y-8 md:pt-2">
      <div className="space-y-3 md:hidden">
        <section className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3]/94 px-4 py-4 shadow-[0_16px_36px_-30px_rgba(180,138,91,0.2)] backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-3">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.28 }}
              className="h-11 w-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-[0_16px_32px_-22px_rgba(180,138,91,0.3)]"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-xl font-black text-transparent">T</span>
              </div>
            </motion.div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight text-gray-900">Vào nhịp Tokutei, anh</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">Mỗi ngày một phiên ngắn nhưng đúng việc</p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#e2d7c7] bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_58%,#f3eadf_100%)] p-4 shadow-[0_20px_46px_-34px_rgba(96,70,42,0.22)]">
          <div className="relative z-10 space-y-4">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-gray-900">Bắt đầu 1 phiên sẵn sàng</h2>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-500">
                Đi thẳng vào cụm việc quan trọng nhất: tự giới thiệu, hồ sơ, phản xạ đầu ca hoặc mock test.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <BookOpen size={16} className="text-blue-500" />
                <p className="mt-2 text-lg font-black text-gray-900">0</p>
                <p className="text-[11px] font-bold text-gray-500">Cụm đã khóa</p>
              </div>
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <Clock size={16} className="text-emerald-500" />
                <p className="mt-2 text-lg font-black text-gray-900">3'</p>
                <p className="text-[11px] font-bold text-gray-500">Hôm nay</p>
              </div>
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <Flame size={16} className="fill-orange-500 text-orange-500" />
                <p className="mt-2 text-lg font-black text-gray-900">0d</p>
                <p className="text-[11px] font-bold text-gray-500">Streak</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Link to="/app/review/flashcards" className="inline-flex min-h-12 items-center justify-center rounded-[1.35rem] bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.62)] transition-transform hover:scale-[1.01]">
                Vào phiên ưu tiên
              </Link>
              <Link to="/app/courses" className="inline-flex min-h-12 items-center justify-center rounded-[1.35rem] border border-orange-200 bg-white px-4 py-3 text-sm font-black text-orange-700 transition-colors hover:bg-orange-50">
                Khóa học
              </Link>
            </div>
          </div>
        </section>

        <Link to="/app/search" className="group flex items-center gap-3 rounded-[1.6rem] border border-[#e6ddd1] bg-[#fffaf3]/96 px-4 py-4 shadow-[0_18px_38px_-34px_rgba(148,163,184,0.2)] transition-all hover:border-orange-200 hover:bg-white">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#e6ddd1] bg-white text-gray-500 transition-colors group-hover:text-orange-600">
            <Search size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-gray-900">Tìm lộ trình, hồ sơ hoặc mock test</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-orange-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
        </Link>
      </div>

      <div className="relative hidden overflow-hidden rounded-[2.25rem] border border-[#e2d7c7] bg-[#fffaf3] p-6 shadow-[0_18px_48px_-38px_rgba(96,70,42,0.22)] md:block lg:p-7">
        <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-orange-100/35 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-5 lg:gap-6">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="relative h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-[0_20px_40px_-22px_rgba(180,138,91,0.3)]"
            >
              <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-3xl font-black text-transparent">T</span>
              </div>
            </motion.div>

            <div className="min-w-0 space-y-2">
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-600">Track Tokutei · JFT + Core</span>
              <h2 className="text-3xl font-black tracking-tight text-gray-800 lg:text-4xl">
                Sẵn sàng vào nhịp, <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">anh!</span>
              </h2>
            </div>
          </div>

          <div className="grid w-full grid-cols-3 gap-3 xl:w-auto">
            <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
              <div className="text-[11px] font-bold text-gray-500">Hôm nay</div>
              <div className="mt-2 text-2xl font-black text-gray-900">3'</div>
            </div>
            <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
              <div className="text-[11px] font-bold text-gray-500">Cụm đã khóa</div>
              <div className="mt-2 text-2xl font-black text-gray-900">0</div>
            </div>
            <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
              <div className="text-[11px] font-bold text-gray-500">Streak</div>
              <div className="mt-2 text-2xl font-black text-gray-900">0d</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8">
        <section className="space-y-3 rounded-[2.25rem] border border-[#e2d7c7] bg-[#fffaf3] p-3 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTools.map((tool) => (
              <motion.div key={tool.label} whileHover={{ y: -3 }} className="h-full">
                <Link
                  to={tool.path}
                  className="group relative flex h-full cursor-pointer items-center gap-3 rounded-[1.35rem] border border-[#e8ded0] bg-[#fffdf8] p-3.5 text-left shadow-[0_12px_28px_-24px_rgba(96,70,42,0.22)] transition-all hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_34px_-26px_rgba(249,115,22,0.28)]"
                >
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-2 transition-transform group-hover:scale-105">
                    <img src={tool.icon} className="h-full w-full object-contain" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-black leading-tight text-gray-800">{tool.label}</h4>
                    <p className="mt-0.5 truncate text-xs font-semibold text-gray-500">{tool.sub}</p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-orange-300 transition-colors group-hover:text-orange-500" />
                </Link>
              </motion.div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAreAllToolsVisible((value) => !value)}
            aria-expanded={areAllToolsVisible}
            className="flex w-full items-center justify-center gap-1.5 rounded-[1.35rem] border border-[#e8ded0] bg-[#fffdf8] py-3 text-sm font-black text-gray-600 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            {areAllToolsVisible ? 'Thu gọn' : `Xem tất cả (${hiddenToolCount} công cụ khác)`}
            <ChevronDown
              size={16}
              className={areAllToolsVisible ? 'rotate-180 transition-transform' : 'transition-transform'}
            />
          </button>
        </section>

        <section className="rounded-[2.5rem] border border-[#e2d7c7] bg-[#fffaf3] p-5 shadow-[0_22px_50px_-38px_rgba(148,163,184,0.18)] md:p-6">
          <header className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-800">Nhiệm vụ hàng ngày</h3>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-500">0/{dashboardTasks.length}</span>
          </header>

          <div className="space-y-3">
            {dashboardTasks.map((task) => (
              <motion.div key={task.title} whileHover={{ y: -2 }}>
                <Link
                  to={task.path}
                  className="group relative flex items-center gap-4 rounded-[1.7rem] border border-[#e8ded0] bg-[#fffdf8] px-4 py-4 transition-colors hover:border-orange-200 hover:bg-white"
                >
                  <div className={`absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b ${task.gradient}`} />
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-[#fffaf3] p-2">
                    <img src={task.icon} className="h-full w-full object-contain" alt="" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-gray-700">{task.title}</span>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <span className="text-xs font-black text-orange-500">{task.xp}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-500">{task.status}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <Link
          to="/app/stats"
          className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] py-3.5 text-sm font-bold text-gray-600 transition-all hover:border-orange-200 hover:text-orange-600"
        >
          <Sparkles size={16} className="text-orange-400" />
          Xem chi tiết thống kê
          <ChevronRight size={16} />
        </Link>

        {isInstallPromptVisible && (
          <div className="flex flex-col gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_46px_-36px_rgba(148,163,184,0.16)] md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-500 shadow-sm">
                <Download size={22} />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-black text-gray-800">Cài đặt TOKUTEI GINO</h4>
                <p className="text-xs font-medium leading-tight text-gray-500">Ghim lối tắt để mở nhanh dashboard mỗi ngày.</p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 md:justify-end">
              <Link to="/app/settings" className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-black text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.62)] transition-transform hover:scale-[1.02]">
                Cài đặt
              </Link>
              <button
                type="button"
                aria-label="Ẩn nhắc cài đặt"
                onClick={() => setIsInstallPromptVisible(false)}
                className="text-gray-400 transition-colors hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        )}

        <section className="space-y-4 pb-10">
          <div className="flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-lg font-black text-gray-800">Cộng đồng TOKUTEI GINO</h3>
              <p className="mt-1 text-sm font-medium text-gray-500">Hỏi bài và theo dõi thông báo học tập.</p>
            </div>
            <Link to="/app/messages" className="text-left text-sm font-bold text-orange-600 hover:underline md:text-right">Mở tất cả kênh →</Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <Link to="/app/messages" className="group flex items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffdf8] p-4 transition-all hover:border-orange-200 hover:bg-white md:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
                <Send size={20} className="translate-x-0.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="truncate text-sm font-black text-gray-800">Zalo · Nhóm chính</h4>
                <p className="text-xs font-medium text-gray-500">Trao đổi nhanh, hỏi bài và nhận nhắc lịch học.</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-orange-300 transition-colors group-hover:text-orange-500" />
            </Link>

            <Link to="/app/messages" className="group flex items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffdf8] p-4 transition-all hover:border-orange-200 hover:bg-white md:p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
                <Users size={20} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <h4 className="truncate text-sm font-black text-gray-800">Facebook · Cộng đồng</h4>
                <p className="text-xs font-medium text-gray-500">Cập nhật đề mới và chia sẻ kinh nghiệm.</p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-orange-300 transition-colors group-hover:text-orange-500" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
