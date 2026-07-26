import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  Mic,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const readinessTracks = [
  {
    title: 'JFT Basic',
    desc: 'Nghe hiểu, biển báo, mẫu câu sống còn và phản xạ tối thiểu để không bị ngợp.',
    icon: BookOpen,
    tone: 'orange',
  },
  {
    title: 'Workplace',
    desc: '5S, an toàn, báo cáo, liên lạc và tác phong đi làm theo đúng nhịp Tokutei.',
    icon: ShieldCheck,
    tone: 'blue',
  },
  {
    title: 'Interview',
    desc: 'Tự giới thiệu, mục tiêu sang Nhật, trả lời HR ngắn gọn và an toàn.',
    icon: Mic,
    tone: 'emerald',
  },
  {
    title: 'Documents',
    desc: 'Checklist hồ sơ, giấy tờ và các bước cần chốt trước lịch hẹn quan trọng.',
    icon: FileText,
    tone: 'purple',
  },
] as const;

const workflowCards = [
  {
    title: 'Dashboard sẵn sàng',
    desc: 'Vào app là thấy ngay hôm nay nên ôn gì trước: flashcards, mock hay speaking.',
    meta: '15-20 phút / phiên',
    icon: Target,
  },
  {
    title: 'AI Writing + Speaking',
    desc: 'Chấm bản nháp phỏng vấn, nghe lại câu trả lời và trả về 1-2 lỗi chính cần sửa.',
    meta: 'Rõ lỗi, không lan man',
    icon: Sparkles,
  },
  {
    title: 'Mock test theo track',
    desc: 'Đề mô phỏng gom tiếng Nhật, workplace, hồ sơ và phỏng vấn vào cùng một flow.',
    meta: 'Kết quả chia theo kỹ năng',
    icon: Trophy,
  },
];

const signalCards = [
  { value: '04', label: 'trục cốt lõi', sub: 'JFT, workplace, interview, documents' },
  { value: '18', label: 'bài nền', sub: 'Tokutei Foundation Sprint' },
  { value: '03', label: 'phòng AI', sub: 'chat, writing, speaking mock' },
  { value: "20'", label: 'nhịp đề xuất', sub: 'mỗi phiên học trọng tâm' },
];

const proofCards = [
  { title: 'Không học lan man', desc: 'Flow được tách rõ theo việc thật: đầu ca, hồ sơ, phỏng vấn, mock exam.' },
  { title: 'Giữ được nhịp mỗi ngày', desc: 'Mỗi màn đều có entry point ngắn để anh quay lại học nhanh mà không bị quá tải.' },
  { title: 'Dễ nối dữ liệu thật', desc: 'Mock data đã dựng theo cấu trúc Tokutei để sau này thay bằng dữ liệu production.' },
];

const toneStyles = {
  orange: 'border-orange-100 bg-orange-50 text-[#C96A1B] shadow-[0_10px_24px_-18px_rgba(201,106,27,0.5)]',
  blue: 'border-[#315C73]/20 bg-[#315C73]/10 text-[#315C73] shadow-[0_10px_24px_-18px_rgba(49,92,115,0.45)]',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600 shadow-[0_10px_24px_-18px_rgba(47,143,107,0.45)]',
  purple: 'border-[#6F4AA8]/20 bg-[#6F4AA8]/10 text-[#6F4AA8] shadow-[0_10px_24px_-18px_rgba(111,74,168,0.45)]',
} as const;

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const },
  viewport: { once: true, amount: 0.2 },
};

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F1E8] text-[#172033] selection:bg-orange-100 selection:text-orange-700">
      <AuroraBackdrop />

      {/* Nav */}
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#ece4d8] bg-[#fcfaf6]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm transition-transform group-hover:scale-105">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-lg font-black text-transparent">T</span>
              <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-orange-300/40 to-amber-300/40 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
            </span>
            <span className="leading-none">
              <span className="block text-[10px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">Tokutei prep</span>
              <span className="mt-1 block text-base font-black tracking-tight text-[#172033]">TOKUTEI GINO</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm font-black text-[#5F6B7C] transition-colors hover:text-[#172033] sm:block">
              Đăng nhập
            </Link>
            <Link
              to="/app/dashboard"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#E08A3C] px-4 py-2.5 text-sm font-black text-white shadow-[0_16px_34px_-18px_rgba(201,106,27,0.7)] transition-all hover:shadow-[0_18px_38px_-18px_rgba(201,106,27,0.85)]"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative inline-flex items-center gap-2">
                Vào dashboard
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative px-4 pb-16 pt-24 md:px-6 md:pt-28">
        {/* HERO */}
        <section className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="relative"
          >
            <div className="pointer-events-none absolute -inset-1 rounded-[2.75rem] bg-gradient-to-br from-orange-300/25 via-amber-200/15 to-purple-200/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[linear-gradient(135deg,rgba(255,250,243,0.98)_0%,rgba(247,243,236,0.98)_58%,rgba(243,236,226,0.96)_100%)] p-6 shadow-[0_40px_90px_-52px_rgba(180,138,91,0.45)] md:p-8">
              <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-orange-300/70 to-transparent" />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -right-12 top-0 h-48 w-48 rounded-full bg-orange-300/45 blur-3xl"
                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                aria-hidden
                className="pointer-events-none absolute -bottom-8 left-0 h-44 w-44 rounded-full bg-amber-300/40 blur-3xl"
                animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              />

              <div className="relative z-10 space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B] shadow-sm">
                  <Sparkles size={14} />
                  Tokutei readiness system
                </span>

                <h1 className="max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.05em] text-[#172033] md:text-6xl">
                  Lộ trình Tokutei rõ từ
                  <span className="relative whitespace-nowrap">
                    <span className="bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#F0A848] bg-clip-text text-transparent"> JFT Basic </span>
                    <svg className="absolute -bottom-1 left-1 h-3 w-[calc(100%-0.5rem)]" viewBox="0 0 220 12" fill="none" preserveAspectRatio="none" aria-hidden>
                      <path d="M2 8 Q 60 1, 110 6 T 218 5" stroke="#C96A1B" strokeOpacity="0.45" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </svg>
                  </span>
                  tới mock phỏng vấn.
                </h1>

                <p className="max-w-2xl text-base font-medium leading-7 text-[#5F6B7C] md:text-lg">
                  App này được dựng để anh học đúng việc cần cho Tokutei: tiếng Nhật sống còn, tác phong nơi làm việc, hồ sơ và phản xạ trả lời HR.
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-[1.75rem] border border-[#E4D8C9] bg-white/85 p-4 shadow-[0_18px_32px_-28px_rgba(148,163,184,0.18)] backdrop-blur">
                    <span className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-orange-200/40 blur-2xl" />
                    <div className="relative">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#5F6B7C]">Flow hôm nay</div>
                      <div className="mt-3 space-y-3">
                        {['Ôn 8 cụm đầu ca', 'Shadowing 1 câu tự giới thiệu', 'Mock nhanh 1 phần hồ sơ'].map((item, index) => (
                          <div key={item} className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-amber-50 text-xs font-black text-[#C96A1B]">
                              {index + 1}
                            </div>
                            <div className="text-sm font-semibold text-[#172033]">{item}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="relative overflow-hidden rounded-[1.75rem] border border-orange-200 bg-[linear-gradient(160deg,rgba(255,237,213,0.92)_0%,rgba(255,247,232,0.96)_100%)] p-4 shadow-[0_22px_40px_-26px_rgba(201,106,27,0.35)]">
                    <span className="absolute -bottom-8 -right-6 h-24 w-24 rounded-full bg-orange-300/45 blur-2xl" />
                    <div className="relative">
                      <div className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">Readiness note</div>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-[#172033]">4 trục, 1 dashboard</h2>
                      <p className="mt-2 text-sm font-medium leading-relaxed text-[#5F6B7C]">
                        Tất cả màn chính đã xoay về Tokutei và mock readiness để anh vào app là biết nên học gì tiếp theo.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                  <Link
                    to="/app/dashboard"
                    className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#E08A3C] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_22px_40px_-18px_rgba(201,106,27,0.7)] transition-all hover:shadow-[0_24px_44px_-18px_rgba(201,106,27,0.85)]"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative inline-flex items-center gap-2">
                      Bắt đầu vào app
                      <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                  <Link
                    to="/app/exams"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E4D8C9] bg-white px-6 py-4 text-sm font-black text-[#172033] transition-colors hover:border-orange-200 hover:text-[#C96A1B]"
                  >
                    <Play size={18} />
                    Xem đề mock
                  </Link>
                </div>

                {/* mascot mini */}
                <div className="pointer-events-none absolute -bottom-6 right-4 hidden lg:block">
                  <motion.img
                    src={`${import.meta.env.BASE_URL}mascot.png`}
                    alt=""
                    aria-hidden
                    className="h-32 w-32 object-contain drop-shadow-[0_18px_24px_rgba(201,106,27,0.3)]"
                    animate={{ y: [0, -10, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: 0.1 }}
            className="grid gap-4"
          >
            <section className="relative overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[#fffaf3] p-5 shadow-[0_30px_70px_-44px_rgba(148,163,184,0.25)] md:p-6">
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-200/40 blur-3xl" />
              <div className="relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">
                <Target size={14} />
                Tín hiệu sản phẩm
              </div>
              <div className="relative mt-5 grid grid-cols-2 gap-3">
                {signalCards.map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-[#E4D8C9] bg-white/85 p-4 shadow-[0_14px_28px_-22px_rgba(148,163,184,0.2)] backdrop-blur">
                    <div className="bg-gradient-to-br from-[#172033] to-[#3b4863] bg-clip-text text-3xl font-black tracking-tight text-transparent">
                      {item.value}
                    </div>
                    <div className="mt-1 text-[11px] font-black uppercase tracking-[0.18em] text-[#C96A1B]">{item.label}</div>
                    <div className="mt-2 text-xs font-medium leading-relaxed text-[#5F6B7C]">{item.sub}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[linear-gradient(180deg,rgba(255,250,243,0.94)_0%,rgba(248,244,236,0.98)_100%)] p-5 shadow-[0_26px_58px_-44px_rgba(180,138,91,0.22)] md:p-6">
              <span className="pointer-events-none absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-[#315C73]/15 blur-3xl" />
              <div className="relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#315C73]">
                <Clock size={14} />
                Nhịp vào app
              </div>
              <div className="relative mt-4 space-y-3">
                {[
                  'Mở dashboard để thấy việc ưu tiên trong ngày.',
                  'Ôn flashcards hoặc speaking trước khi làm mock.',
                  'Kết thúc phiên bằng 1 checklist hồ sơ hoặc 1 đề ngắn.',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-[#E4D8C9] bg-[#fffaf3]/95 px-4 py-3 text-sm font-semibold text-[#172033] shadow-[0_14px_30px_-26px_rgba(148,163,184,0.18)]">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#C96A1B]" />
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </motion.div>
        </section>

        {/* TRACKS */}
        <motion.section
          {...fadeUp}
          className="relative mx-auto mt-10 max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[#fffaf3] p-5 shadow-[0_24px_56px_-44px_rgba(148,163,184,0.22)] md:p-7"
        >
          <span className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 rounded-full bg-orange-200/35 blur-3xl" />
          <span className="pointer-events-none absolute -right-12 bottom-0 h-40 w-40 rounded-full bg-[#6F4AA8]/15 blur-3xl" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">
                <BookOpen size={14} />
                Các track chính
              </span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-[#172033] md:text-4xl">Mỗi track là một phần việc thật.</h2>
            </div>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-[#5F6B7C]">
              Mật độ card được giữ gọn, phần mô tả rõ và spacing dịu để app nhìn sạch, dễ quét và đủ thực dụng cho hành trình Tokutei.
            </p>
          </div>

          <div className="relative mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {readinessTracks.map((track, index) => (
              <motion.article
                key={track.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.05, ease: 'easeOut' }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-[2rem] border border-[#E4D8C9] bg-white/85 p-5 shadow-[0_22px_44px_-32px_rgba(148,163,184,0.2)] backdrop-blur transition-all hover:border-orange-200 hover:shadow-[0_30px_60px_-32px_rgba(201,106,27,0.3)]"
              >
                <span className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-orange-200/0 blur-2xl transition-all duration-500 group-hover:bg-orange-200/40" />
                <div className={`relative flex h-12 w-12 items-center justify-center rounded-2xl border ${toneStyles[track.tone]}`}>
                  <track.icon size={22} />
                </div>
                <h3 className="relative mt-5 text-xl font-black text-[#172033]">{track.title}</h3>
                <p className="relative mt-2 text-sm font-medium leading-relaxed text-[#5F6B7C]">{track.desc}</p>
              </motion.article>
            ))}
          </div>
        </motion.section>

        {/* WORKFLOW + PROOF */}
        <section className="mx-auto mt-10 grid max-w-7xl gap-6 xl:grid-cols-[0.94fr_1.06fr]">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[linear-gradient(135deg,#fffaf3_0%,#fff4e8_100%)] p-6 shadow-[0_32px_70px_-44px_rgba(180,138,91,0.3)] md:p-7"
          >
            <span className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-orange-300/35 blur-3xl" />
            <span className="pointer-events-none absolute -bottom-12 left-0 h-44 w-44 rounded-full bg-amber-200/35 blur-3xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B] shadow-sm">
                <Users size={14} />
                Workflow
              </span>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#172033]">Mock app ưu tiên hành động thay vì trang trí.</h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-[#5F6B7C]">
                Landing, dashboard, exam, AI lab và review center đều đã xoay về việc chốt mức sẵn sàng Tokutei thay vì học ngôn ngữ chung.
              </p>

              <div className="mt-6 space-y-3">
                {workflowCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
                    className="rounded-[1.75rem] border border-[#E4D8C9] bg-white/90 p-4 shadow-[0_16px_30px_-24px_rgba(148,163,184,0.18)] backdrop-blur transition-all hover:border-orange-200 hover:bg-white"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 text-[#C96A1B]">
                        <card.icon size={20} />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-[#172033]">{card.title}</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#5F6B7C]">{card.desc}</p>
                        <div className="mt-3 inline-flex rounded-full border border-[#315C73]/15 bg-[#315C73]/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-[#315C73]">
                          {card.meta}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <div className="grid gap-4">
            <motion.div
              {...fadeUp}
              className="relative overflow-hidden rounded-[2.5rem] border border-[#E4D8C9] bg-[#fffaf3] p-5 shadow-[0_24px_56px_-44px_rgba(148,163,184,0.22)] md:p-6"
            >
              <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-200/30 blur-3xl" />
              <div className="relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
                <Zap size={14} />
                Vì sao hợp Tokutei
              </div>
              <div className="relative mt-5 space-y-3">
                {proofCards.map((card, index) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.4, delay: index * 0.07, ease: 'easeOut' }}
                    className="rounded-[1.75rem] border border-[#E4D8C9] bg-white/85 p-4 backdrop-blur"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500 shadow-[0_10px_24px_-18px_rgba(47,143,107,0.45)]">
                        <Star size={16} className="fill-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#172033]">{card.title}</h3>
                        <p className="mt-1 text-sm font-medium leading-relaxed text-[#5F6B7C]">{card.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="relative overflow-hidden rounded-[2.5rem] border border-orange-200 bg-[linear-gradient(135deg,rgba(255,237,213,0.92)_0%,rgba(255,247,232,0.96)_100%)] p-6 shadow-[0_30px_70px_-44px_rgba(249,115,22,0.35)]"
            >
              <span className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-orange-300/45 blur-3xl" />
              <span className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-amber-200/45 blur-3xl" />
              <div className="relative">
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B]">Tóm tắt cho anh</div>
                <blockquote className="mt-3 text-2xl font-black leading-tight tracking-tight text-[#172033]">
                  “Mở app là biết hôm nay nên học gì để tiến gần hơn tới Tokutei.”
                </blockquote>
                <p className="mt-3 text-sm font-medium leading-relaxed text-[#5F6B7C]">
                  Đây là hướng thiết kế mới của bản mock: bớt vui chơi chung chung, nhiều quyết định học tập rõ ràng hơn.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          {...fadeUp}
          className="relative mx-auto mt-10 max-w-7xl overflow-hidden rounded-[2.75rem] border border-orange-200 bg-[linear-gradient(135deg,rgba(255,243,225,0.98)_0%,rgba(255,235,210,0.98)_100%)] px-6 py-10 shadow-[0_40px_100px_-52px_rgba(201,106,27,0.45)] md:px-10 md:py-12"
        >
          <span className="pointer-events-none absolute -right-16 -top-16 h-60 w-60 rounded-full bg-orange-300/50 blur-3xl" />
          <span className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-amber-300/40 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(201,106,27,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-50" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#C96A1B] shadow-sm">
                <Sparkles size={14} />
                Bắt đầu lộ trình
              </span>
              <h2 className="mt-4 text-4xl font-black leading-tight text-[#172033] md:text-5xl">
                Vào thẳng dashboard
                <br />
                để học theo nhịp{' '}
                <span className="bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#E08A3C] bg-clip-text text-transparent">Tokutei</span>.
              </h2>
              <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-[#5F6B7C]">
                Mock data, copy và giao diện chính đã chuyển sang Tokutei. Anh có thể tiếp tục refine sâu từng flow từ đây.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/app/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#C96A1B] via-[#D8791F] to-[#E08A3C] px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-white shadow-[0_22px_40px_-18px_rgba(201,106,27,0.7)] transition-all hover:shadow-[0_24px_44px_-18px_rgba(201,106,27,0.85)]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative inline-flex items-center gap-2">
                  Mở app ngay
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
              <Link
                to="/app/exams"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 text-sm font-black text-[#C96A1B] transition-colors hover:bg-orange-50"
              >
                <Play size={18} />
                Mở đề mô phỏng
              </Link>
            </div>
          </div>
        </motion.section>
      </main>

      <footer className="relative border-t border-[#ece4d8] bg-[#f8f4ee] px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#fff4e8_0%,#fffaf3_100%)] shadow-sm">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-base font-black text-transparent">T</span>
            </span>
            <div>
              <div className="text-base font-black tracking-tight text-[#172033]">TOKUTEI GINO</div>
              <p className="mt-1 text-sm font-medium text-[#5F6B7C]">
                Mock app luyện Tokutei theo hướng rõ việc, gọn flow và sẵn sàng nối dữ liệu thật.
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm font-black text-[#5F6B7C]">
            <Link to="/login" className="transition-colors hover:text-[#C96A1B]">
              Đăng nhập
            </Link>
            <Link to="/terms" className="transition-colors hover:text-[#C96A1B]">
              Điều khoản
            </Link>
            <Link to="/privacy" className="transition-colors hover:text-[#C96A1B]">
              Bảo mật
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function AuroraBackdrop() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-[40rem] w-[68rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(201,106,27,0.18),transparent)]" />
        <div className="absolute -bottom-44 -right-24 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgba(111,74,168,0.16),transparent)]" />
        <div className="absolute -bottom-32 left-1/4 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(closest-side,rgba(49,92,115,0.16),transparent)]" />
        <div className="absolute top-1/3 -left-20 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(closest-side,rgba(201,106,27,0.12),transparent)]" />
      </div>

      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-12 top-32 h-3 w-3 rounded-full bg-[#C96A1B]/60 blur-[1px]"
        animate={{ y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-16 top-44 h-2.5 w-2.5 rounded-full bg-[#6F4AA8]/60 blur-[1px]"
        animate={{ y: [0, 16, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-32 left-1/3 h-2 w-2 rounded-full bg-[#315C73]/70 blur-[1px]"
        animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1.3 }}
      />

      <div className="pointer-events-none absolute inset-0 [background-image:radial-gradient(rgba(180,138,91,0.06)_1px,transparent_1px)] [background-size:18px_18px] opacity-60" />
    </>
  );
}
