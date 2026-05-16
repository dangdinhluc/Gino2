import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ChevronRight,
  Search,
  Flame,
  BookOpen,
  Clock,
  RotateCcw,
  Download,
  X,
  Send,
  Users,
  Sparkles,
  Crown,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export default function Dashboard() {
  const [isInstallPromptVisible, setIsInstallPromptVisible] = useState(true);

  const tools = [
    { label: 'Thẻ ôn nhanh', sub: 'Cụm từ, hồ sơ, tình huống', icon: 'https://cdn-icons-png.flaticon.com/512/2951/2951237.png', gradient: 'from-purple-400 to-pink-300', path: '/app/review/flashcards' },
    { label: 'Lộ trình Tokutei', sub: 'JFT, workplace, interview', icon: 'https://cdn-icons-png.flaticon.com/512/3306/3306613.png', gradient: 'from-orange-400 to-amber-300', path: '/app/courses' },
    { label: 'Thư viện Tokutei', sub: 'Checklist, tác phong, từ khóa', icon: 'https://cdn-icons-png.flaticon.com/512/2436/2436814.png', gradient: 'from-emerald-400 to-teal-300', path: '/app/grammar' },
    { label: 'Mini game ca làm', sub: 'Phản xạ 1-3 phút', icon: 'https://cdn-icons-png.flaticon.com/512/3128/3128211.png', gradient: 'from-rose-400 to-pink-300', path: '/app/hub' },
    { label: 'Đề mô phỏng', sub: 'JFT, hồ sơ, HR', icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233514.png', gradient: 'from-violet-400 to-purple-300', path: '/app/exams/e1/start' },
    { label: 'Coach AI', sub: 'Sửa câu trả lời nhanh', icon: 'https://cdn-icons-png.flaticon.com/512/3474/3474360.png', gradient: 'from-yellow-400 to-orange-300', path: '/app/ai-chat' },
    { label: 'Thống kê', sub: 'Mức sẵn sàng của anh', icon: 'https://cdn-icons-png.flaticon.com/512/570/570223.png', gradient: 'from-gray-400 to-slate-300', path: '/app/stats' },
  ];

  const tasks = [
    { title: 'Ôn 8 cụm đầu ca', xp: '+12', status: '0/1', icon: 'https://cdn-icons-png.flaticon.com/512/2040/2040504.png', gradient: 'from-blue-400 to-blue-600', path: '/app/review/flashcards' },
    { title: 'Shift Sprint', xp: '+25', status: '0/1', icon: 'https://cdn-icons-png.flaticon.com/512/5351/5351432.png', gradient: 'from-orange-400 to-orange-600', path: '/app/hub/gino-runner' },
    { title: 'Mock interview 3 câu', xp: '+20', status: '0/1', icon: 'https://cdn-icons-png.flaticon.com/512/3128/3128211.png', gradient: 'from-green-400 to-green-600', path: '/app/ai-speak' },
    { title: 'Checklist hồ sơ', xp: '+10', status: '0/1', icon: 'https://cdn-icons-png.flaticon.com/512/2951/2951237.png', gradient: 'from-purple-400 to-purple-600', path: '/app/grammar' },
  ];

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] space-y-6 pb-4 md:space-y-8 md:pt-2">
      <div className="space-y-3 md:hidden">
        <section className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3]/94 px-4 py-4 shadow-[0_16px_36px_-30px_rgba(180,138,91,0.2)] backdrop-blur-md">
          <div className="flex items-center gap-3">
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
                <p className="truncate text-base font-black italic tracking-tight text-gray-900">Vào nhịp Tokutei, anh</p>
                <p className="mt-0.5 truncate text-xs font-bold text-gray-500">Mỗi ngày một phiên ngắn nhưng đúng việc</p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#e2d7c7] bg-[linear-gradient(135deg,#fff7ed_0%,#fffaf3_58%,#f3eadf_100%)] p-4 shadow-[0_20px_46px_-34px_rgba(96,70,42,0.22)]">
          <div className="absolute right-0 top-0 h-28 w-28 translate-x-1/3 -translate-y-1/3 rounded-full bg-orange-100/55 blur-3xl" />

          <div className="relative z-10 space-y-4">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-600">Hôm nay</p>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-gray-900">Bắt đầu 1 phiên sẵn sàng</h2>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-gray-500">
                  Đi thẳng vào cụm việc quan trọng nhất: tự giới thiệu, hồ sơ, phản xạ đầu ca hoặc mock test.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <BookOpen size={16} className="text-blue-500" />
                <p className="mt-2 text-lg font-black text-gray-900">0</p>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Cụm đã khóa</p>
              </div>
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <Clock size={16} className="text-emerald-500" />
                <p className="mt-2 text-lg font-black text-gray-900">3'</p>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Hôm nay</p>
              </div>
              <div className="rounded-[1.35rem] border border-orange-100 bg-[#fffdf8] px-3 py-3 shadow-sm">
                <Flame size={16} className="fill-orange-500 text-orange-500" />
                <p className="mt-2 text-lg font-black text-gray-900">0d</p>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">Streak</p>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <Link to="/app/review/flashcards" className="inline-flex min-h-12 items-center justify-center rounded-[1.35rem] bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-[0_16px_32px_-22px_rgba(249,115,22,0.62)] transition-transform hover:scale-[1.01]">
                Vào phiên ưu tiên
              </Link>
              <Link to="/app/courses" className="inline-flex min-h-12 items-center justify-center rounded-[1.35rem] border border-orange-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-orange-700 transition-colors hover:bg-orange-50">
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
            <p className="mt-0.5 truncate text-xs font-semibold text-gray-400">Đi tới tìm kiếm nhanh</p>
          </div>
          <ChevronRight size={18} className="shrink-0 text-orange-300 transition-transform group-hover:translate-x-0.5 group-hover:text-orange-500" />
        </Link>
      </div>

      <div className="relative hidden overflow-hidden rounded-[2.25rem] border border-[#e2d7c7] bg-[#fffaf3] p-6 shadow-[0_18px_48px_-38px_rgba(96,70,42,0.22)] md:block lg:p-7">
        <div className="absolute -right-12 -top-14 h-44 w-44 rounded-full bg-orange-100/35 blur-3xl" />
        <div className="absolute -bottom-16 -left-14 h-44 w-44 rounded-full bg-amber-100/28 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-center gap-5 lg:gap-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="relative h-20 w-20 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 p-0.5 shadow-[0_20px_40px_-22px_rgba(180,138,91,0.3)]"
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-3xl font-black text-transparent">T</span>
            </div>
            <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-pink-400 shadow-lg">
              <Sparkles size={12} className="text-white" />
            </div>
          </motion.div>

          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <span className="rounded-full border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-orange-500">Track Tokutei</span>
              <span className="rounded-full border border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-500">JFT + Core</span>
            </div>
            <h2 className="text-3xl font-black italic tracking-tight text-gray-800 lg:text-4xl">
              Sẵn sàng vào nhịp, <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">anh!</span>
            </h2>
          </div>
        </div>

        <div className="grid w-full grid-cols-3 gap-3 xl:w-auto">
          <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Hôm nay</div>
            <div className="mt-2 text-2xl font-black text-gray-900">3'</div>
            <div className="text-[11px] font-medium text-emerald-500">đang học</div>
          </div>
          <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Cụm đã khóa</div>
            <div className="mt-2 text-2xl font-black text-gray-900">0</div>
            <div className="text-[11px] font-medium text-blue-500">sẵn sàng ôn</div>
          </div>
          <div className="rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] px-4 py-3 shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Streak</div>
            <div className="mt-2 text-2xl font-black text-gray-900">0d</div>
            <div className="text-[11px] font-medium text-orange-500">giữ nhịp</div>
          </div>
        </div>
        </div>

        <motion.div
          animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute right-16 top-4 text-2xl"
        >
          ⭐
        </motion.div>
      </div>

      <div className="relative z-10 space-y-6 md:space-y-8">
        <section className="rounded-[2.25rem] border border-[#e2d7c7] bg-[#fffaf3] p-3 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)]">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => (
              <motion.div
                key={tool.label}
                whileHover={{ y: -3 }}
                className="h-full"
              >
                <Link
                  to={tool.path}
                  className="group relative flex h-full cursor-pointer items-center gap-3 rounded-[1.35rem] border border-[#e8ded0] bg-[#fffdf8] p-3 text-left shadow-[0_12px_28px_-24px_rgba(96,70,42,0.22)] transition-all hover:border-orange-200 hover:bg-white hover:shadow-[0_18px_34px_-26px_rgba(249,115,22,0.28)]"
                >
                <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fffaf3] p-2 transition-transform group-hover:scale-105 md:h-12 md:w-12">
                  <img src={tool.icon} className="h-full w-full object-contain" alt="" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-[12px] font-black leading-tight text-gray-800 md:text-sm">{tool.label}</h4>
                  <p className="mt-0.5 truncate text-[10px] font-bold text-gray-400">{tool.sub}</p>
                </div>
                <ChevronRight size={14} className="hidden shrink-0 text-orange-300 transition-colors group-hover:text-orange-500 md:block" />
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          whileHover={{ y: -2 }}
          className="overflow-hidden rounded-[2.25rem] border border-orange-100 bg-[#fffaf3] shadow-[0_18px_44px_-36px_rgba(96,70,42,0.18)]"
        >
          <div className="relative grid gap-5 p-5 md:grid-cols-[1.15fr_0.85fr] md:p-6">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-orange-400 via-amber-400 to-orange-300" />
            <div className="absolute right-0 top-0 h-40 w-40 translate-x-1/4 -translate-y-1/4 rounded-full bg-orange-100/45 blur-3xl" />

            <div className="relative z-10 flex flex-col justify-center space-y-3 pl-2">
              <p className="w-fit rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Sprint trọng tâm</p>
              <h4 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">7 ngày chốt Tokutei readiness</h4>
              <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-500">
                Dồn đúng 4 trục: tự giới thiệu, phản xạ nơi làm việc, checklist hồ sơ và một mock test cuối tuần.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link to="/app/exams/e1/start" className="rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.7)] transition-transform hover:scale-[1.02]">
                  Mở sprint
                </Link>
                <span className="text-xs font-bold text-gray-400">Ưu tiên cho mock interview cuối tuần</span>
              </div>
            </div>

            <div className="relative z-10 grid gap-3 sm:grid-cols-2 md:grid-cols-1">
              <div className="rounded-[1.5rem] border border-[#e6ddd1] bg-[#fffdf8] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Combo</div>
                <div className="mt-1 text-lg font-black text-gray-900">4 trục cốt lõi</div>
                <p className="mt-1 text-xs font-medium text-gray-500">Tiếng Nhật, workplace, hồ sơ và phỏng vấn.</p>
              </div>
              <div className="rounded-[1.5rem] border border-orange-100 bg-orange-50/65 p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-400">Nhịp học</div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-black text-orange-600">20'</span>
                  <span className="pb-1 text-xs font-bold text-orange-400">mỗi ngày</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <section className="rounded-[2.5rem] border border-[#e2d7c7] bg-[#fffaf3] p-5 shadow-[0_22px_50px_-38px_rgba(148,163,184,0.18)] md:p-6">
          <header className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black italic text-gray-800">
              Nhiệm vụ hàng ngày <span className="text-2xl">⚡️</span>
            </h3>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-sm font-bold text-orange-400">0/4</span>
          </header>

          <div className="space-y-3">
            {tasks.map((task, idx) => (
              <motion.div
                key={task.title}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                className="group rounded-[1.75rem] bg-gradient-to-r from-[#efe9df] to-[#fffaf3] p-[1px] shadow-[0_16px_34px_-28px_rgba(148,163,184,0.16)] transition-all hover:shadow-[0_20px_40px_-28px_rgba(180,138,91,0.14)]"
              >
                <Link to={task.path} className="relative flex items-center gap-4 rounded-[1.7rem] bg-[#fffaf3] px-4 py-4">
                  <div className={`absolute inset-y-3 left-0 w-1 rounded-full bg-gradient-to-b ${task.gradient}`} />
                  <div className="h-10 w-10 rounded-xl bg-gray-50 p-2 shadow-sm transition-colors group-hover:bg-white">
                    <img src={task.icon} className="h-full w-full object-contain" alt="" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <span className="block text-sm font-bold text-gray-700">{task.title}</span>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '25%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full rounded-full bg-gradient-to-r ${task.gradient}`}
                      />
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 items-center gap-2 pr-1 sm:gap-4">
                    <span className="text-xs font-black text-orange-500">{task.xp}</span>
                    <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-500">{task.status}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-[2.25rem] border border-[#e2d7c7] bg-[#fffaf3] p-5 shadow-[0_18px_44px_-38px_rgba(96,70,42,0.18)] md:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <motion.div whileHover={{ y: -2 }} className="space-y-2 rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-blue-500">
                <BookOpen size={14} /> Cụm đã khóa
              </div>
              <div className="text-3xl font-black text-gray-900">0</div>
              <div className="text-[10px] text-blue-400">+6 hôm nay</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="space-y-2 rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-sky-500">
                <Clock size={14} /> Checklist xong
              </div>
              <div className="text-3xl font-black text-gray-900">3</div>
              <div className="text-[10px] text-sky-400">hôm nay</div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="relative overflow-hidden rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] p-4">
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-orange-100/28 blur-xl" />
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-orange-500">
                <Flame size={14} className="fill-orange-500" /> Streak
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-orange-600">0</span>
                <span className="text-[10px] font-bold italic text-orange-400">ngày</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} className="relative overflow-hidden rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] p-4">
              <div className="absolute right-0 top-0 h-16 w-16 rounded-full bg-green-100/24 blur-xl" />
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-600">
                <Clock size={14} /> Hôm nay
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-green-600">3</span>
                <span className="text-[10px] font-bold italic text-green-400">phút</span>
              </div>
            </motion.div>
          </div>

          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            <Link to="/app/stats" className="flex w-full items-center justify-center gap-2 rounded-[1.35rem] border border-[#e6ddd1] bg-[#fffdf8] py-3.5 text-sm font-bold text-gray-600 transition-all hover:border-orange-100 hover:text-orange-600 hover:shadow-sm">
              <Sparkles size={16} className="text-orange-400" />
              Xem chi tiết thống kê
              <ChevronRight size={16} />
            </Link>
          </motion.div>
        </section>

        <section className="space-y-4">
          <header className="flex items-center justify-between px-1">
            <h3 className="flex items-center gap-2 text-lg font-black italic text-gray-800">
              Thử thách mỗi ngày <span className="text-2xl">🔥</span>
            </h3>
            <Link to="/app/hub/gino-runner" className="text-xs font-bold text-orange-500 hover:underline">Xem thêm →</Link>
          </header>

          <motion.div
            whileHover={{ scale: 1.005 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.95)_0%,rgba(248,244,236,0.98)_100%)] p-6 shadow-[0_28px_62px_-42px_rgba(180,138,91,0.18)] md:p-7"
          >
            <div className="absolute -right-12 top-0 h-40 w-40 rounded-full bg-orange-200/18 blur-3xl" />
            <div className="absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-amber-200/18 blur-3xl" />

            <div className="relative z-10 grid gap-6 lg:grid-cols-[1.55fr_0.95fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-1.5 text-xs font-bold text-orange-600 shadow-sm">
                    <Crown size={14} className="text-orange-400" />
                    Câu hỏi trắc nghiệm
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-bold text-orange-500">
                    Workplace • 1 phút
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-400">Chủ đề đang mở</p>
                  <h4 className="text-2xl font-black tracking-tight text-gray-900 md:text-3xl">3 phản xạ đầu ca</h4>
                  <p className="max-w-xl text-sm font-medium leading-relaxed text-gray-500">
                    Chọn đúng phản xạ để giữ streak, tích XP và quen nhịp Tokutei trước khi vào mock dài hơn.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {['Ohayou gozaimasu.', 'Tự vào vị trí không chào', 'Bỏ qua checklist đầu ca', 'Để điện thoại trên quầy'].map((option, idx) => (
                    <motion.div key={option} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      <Link
                        to="/app/hub/gino-runner"
                        className={cn(
                          'flex items-center justify-between rounded-[1.5rem] border px-4 py-4 text-left text-sm font-bold transition-all',
                          idx === 0
                            ? 'border-orange-200 bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg shadow-orange-200'
                            : 'border-orange-100 bg-white/90 text-gray-700 hover:border-orange-200 hover:bg-orange-50/60'
                        )}
                      >
                        <span>{option}</span>
                        <ChevronRight size={16} className={idx === 0 ? 'text-white' : 'text-orange-400'} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3]/92 p-5 shadow-[0_22px_48px_-38px_rgba(148,163,184,0.16)]">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">Phiên nhanh</p>
                    <div className="text-3xl font-black text-gray-900">14</div>
                    <p className="text-sm font-medium text-gray-500">lượt miễn phí còn lại hôm nay</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-orange-50 px-3 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Mục tiêu</div>
                      <div className="mt-1 text-sm font-black text-orange-600">+25 XP</div>
                    </div>
                    <div className="rounded-2xl bg-blue-50 px-3 py-3">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Chế độ</div>
                      <div className="mt-1 text-sm font-black text-blue-600">Readiness</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-6">
                  <p className="text-xs font-medium text-gray-400">Làm đều mỗi ngày để giữ nhịp và mở thêm đề luyện.</p>
                  <Link to="/app/hub/gino-runner" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-orange-200 transition-colors hover:from-orange-600 hover:to-amber-500">
                    <RotateCcw size={14} />
                    Làm mới câu hỏi
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {isInstallPromptVisible && (
          <motion.div
            whileHover={{ scale: 1.005 }}
            className="flex flex-col gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_20px_46px_-36px_rgba(148,163,184,0.16)] md:flex-row md:items-center md:justify-between"
          >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-200 bg-orange-50 text-orange-500 shadow-sm">
              <Download size={24} />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-black text-gray-800">Cài đặt TOKUTEI GINO</h4>
              <p className="text-[11px] font-medium leading-tight text-gray-500">Ghim lối tắt để mở nhanh dashboard và luyện tập mỗi ngày.</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 md:justify-end">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/app/settings" className="block rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-orange-200">
                Cài đặt
              </Link>
            </motion.div>
            <button type="button" aria-label="Ẩn nhắc cài đặt" onClick={() => setIsInstallPromptVisible(false)} className="text-gray-300 transition-colors hover:text-gray-500">
              <X size={20} />
            </button>
          </div>
          </motion.div>
        )}

        <section className="space-y-4 pb-10">
          <div className="flex flex-col gap-1 px-1 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">CỘNG ĐỒNG TOKUTEI GINO</h3>
              <p className="mt-1 text-sm font-medium text-gray-500">Giữ liên lạc, hỏi bài và theo dõi thông báo học tập ngay trên mobile.</p>
            </div>
            <Link to="/app/messages" className="text-left text-xs font-bold text-orange-500 hover:underline md:text-right">Mở tất cả kênh →</Link>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link to="/app/messages" className="group flex items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.95)_0%,rgba(248,244,236,0.98)_100%)] p-4 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] transition-all hover:border-[#dccfbe] hover:shadow-[0_22px_48px_-34px_rgba(180,138,91,0.14)] md:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-200 transition-transform group-hover:scale-105">
                <Send size={20} className="translate-x-0.5" />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-black text-gray-800">Zalo</h4>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-500">Nhóm chính</span>
                </div>
                <p className="text-xs font-medium text-gray-500">Trao đổi nhanh, hỏi bài và nhận nhắc lịch học.</p>
              </div>
              <ChevronRight size={18} className="text-orange-300 transition-colors group-hover:text-orange-500" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Link to="/app/messages" className="group flex items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[linear-gradient(180deg,rgba(255,250,243,0.95)_0%,rgba(248,244,236,0.98)_100%)] p-4 shadow-[0_18px_42px_-34px_rgba(148,163,184,0.16)] transition-all hover:border-[#dccfbe] hover:shadow-[0_22px_48px_-34px_rgba(180,138,91,0.14)] md:p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-700 text-white shadow-lg shadow-indigo-200 transition-transform group-hover:scale-105">
                <Users size={20} />
              </div>
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="truncate text-sm font-black text-gray-800">Facebook</h4>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-500">Cộng đồng</span>
                </div>
                <p className="text-xs font-medium text-gray-500">TOKUTEI GINO VN với cập nhật đề mới và chia sẻ kinh nghiệm.</p>
              </div>
              <ChevronRight size={18} className="text-orange-300 transition-colors group-hover:text-orange-500" />
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
