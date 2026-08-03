import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Flame,
  Headphones,
  Layers,
  Library,
  Mic,
  PenLine,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fffaf3]';

const heroStats = [
  { label: '1000+ TỪ VỰNG' },
  { label: 'N5–N1 JLPT' },
  { label: 'SM-2 SRS' },
];

const methods: { icon: typeof Layers; title: string; desc: string }[] = [
  { icon: Target, title: 'Tương tác', desc: 'Trắc nghiệm, điền từ theo từng cấp độ.' },
  { icon: Layers, title: 'Flashcards', desc: 'Thuật toán SM-2 giúp nhớ lâu.' },
  { icon: Headphones, title: 'Nghe', desc: 'Hội thoại công việc với phụ đề song ngữ.' },
  { icon: Mic, title: 'Nói', desc: 'Nhập vai và so sánh với bản ngữ.' },
  { icon: PenLine, title: 'Viết', desc: 'Nhật ký học tập luyện phản xạ.' },
  { icon: Library, title: 'Tài liệu', desc: 'Kho đọc mở theo chủ đề ngành nghề.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fffaf3] text-[#172033]">
      <header className="sticky top-0 z-40 border-b border-[#e8dccb] bg-[#fffaf3]/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className={cn('flex items-center gap-2', focusRing)}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-lg shadow-sm">
              🐯
            </span>
            <span className="font-[var(--font-heading)] text-base font-black uppercase italic tracking-tighter">
              TOKUTEI
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> GINO</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={cn(
                'rounded-xl px-3.5 py-2 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-[#172033]',
                focusRing
              )}
            >
              Đăng nhập
            </Link>
            <Link
              to="/app/dashboard"
              className={cn(
                'rounded-xl bg-orange-700 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-orange-800',
                focusRing
              )}
            >
              Vào học
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,#ffe3c2_0%,transparent_55%),radial-gradient(circle_at_85%_10%,#ffd9e2_0%,transparent_45%)]" />
          <div className="relative mx-auto grid w-full max-w-5xl gap-10 px-4 py-14 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-20">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#95a0af]">Chào mừng đến với</p>
              <p className="mt-1 font-[var(--font-heading)] text-lg font-bold tracking-[-0.02em] text-orange-700">
                Tokutei Gino
              </p>
              <h1 className="mt-3 font-[var(--font-heading)] text-4xl font-black leading-[1.1] tracking-[-0.03em] md:text-5xl">
                Chinh phục tiếng Nhật
                <br />
                cho kỹ năng đặc định
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#5f6b7c]">
                Từ bảng chữ cái đến phỏng vấn tuyển dụng — một lộ trình duy nhất, gọn gàng và dễ theo.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/app/courses"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl bg-orange-700 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-orange-800',
                    focusRing
                  )}
                >
                  Bắt đầu học ngay <ArrowRight size={16} aria-hidden="true" focusable="false" />
                </Link>
                <Link
                  to="/app/roadmap"
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#fffdf8] px-5 py-3.5 text-sm font-bold text-[#5f6b7c] transition-colors hover:text-[#172033]',
                    focusRing
                  )}
                >
                  Xem lộ trình
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {heroStats.map((stat) => (
                  <span
                    key={stat.label}
                    className="rounded-full border border-[#e8dccb] bg-[#fffdf8] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#7b8796]"
                  >
                    {stat.label}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative mx-auto w-full max-w-xs"
            >
              <div className="rounded-3xl border border-[#e8dccb] bg-[#fffdf8] p-6 shadow-[0_30px_60px_-40px_rgba(148,163,184,0.5)]">
                <div className="flex h-40 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 text-7xl">
                  🗻
                </div>
                <p className="mt-4 text-sm font-bold">Hành trình N5 → N1</p>
                <p className="mt-1 text-xs text-[#7b8796]">6 chặng, mỗi chặng một cột mốc.</p>
              </div>
              <div className="absolute -left-3 top-6 flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-3 py-2 shadow-md">
                <Flame size={16} className="text-orange-600" aria-hidden="true" focusable="false" />
                <span className="text-xs font-bold">Streak 12 ngày</span>
              </div>
              <div className="absolute -right-3 bottom-8 flex items-center gap-2 rounded-2xl border border-[#e8dccb] bg-[#fffaf3] px-3 py-2 shadow-md">
                <Zap size={16} className="text-amber-600" aria-hidden="true" focusable="false" />
                <span className="text-xs font-bold">+320 XP</span>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 py-14 md:py-20">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#95a0af]">Phương pháp</p>
          <h2 className="mt-2 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] md:text-3xl">
            Đa dạng phương pháp học
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#5f6b7c]">
            Từ flashcard thông minh đến luyện nói thực hành — tất cả hội tụ trong một không gian tối giản.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {methods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-2xl border border-[#e8dccb] bg-[#fffdf8] p-5 transition-colors hover:border-orange-300"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                  <method.icon size={20} aria-hidden="true" focusable="false" />
                </span>
                <h3 className="mt-3.5 text-base font-bold">{method.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5f6b7c]">{method.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-16 md:pb-24">
          <div className="overflow-hidden rounded-3xl border border-[#e8dccb] bg-[linear-gradient(135deg,#fff3e2_0%,#fffaf3_55%,#ffe9d3_100%)] px-6 py-12 text-center md:px-10 md:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
              <Sparkles size={14} aria-hidden="true" focusable="false" /> Miễn phí
            </span>
            <h2 className="mt-4 font-[var(--font-heading)] text-2xl font-bold tracking-[-0.02em] md:text-3xl">
              Bắt đầu hành trình
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#5f6b7c]">
              Khám phá kho từ vựng, ngữ pháp và đề thi thử ngay hôm nay.
            </p>
            <Link
              to="/login"
              className={cn(
                'mt-7 inline-flex items-center gap-2 rounded-2xl bg-orange-700 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-orange-800',
                focusRing
              )}
            >
              Tạo tài khoản <ArrowRight size={16} aria-hidden="true" focusable="false" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e8dccb] bg-[#fffdf8]">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-[#7b8796] md:flex-row md:items-center md:justify-between">
          <span className="flex items-center gap-2 font-bold text-[#5f6b7c]">
            <BookOpen size={16} aria-hidden="true" focusable="false" /> Tokutei Gino
          </span>
          <div className="flex flex-wrap gap-4">
            <Link to="/terms" className={cn('transition-colors hover:text-[#172033]', focusRing)}>
              Điều khoản
            </Link>
            <Link to="/privacy" className={cn('transition-colors hover:text-[#172033]', focusRing)}>
              Bảo mật
            </Link>
            <Link to="/login" className={cn('transition-colors hover:text-[#172033]', focusRing)}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
