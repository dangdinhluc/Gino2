import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { assets } from '@/src/shared/lib/assets';

export function CourseHero() {
  return (
    <motion.section
      aria-labelledby="course-page-title"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative isolate overflow-hidden rounded-[32px] bg-[#6f45d8] p-5 text-white shadow-[0_12px_32px_rgba(111,69,216,.16)] sm:p-7"
    >
      <img
        src={assets.shared.backgrounds.fujiScene}
        alt=""
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#7449dc]/95 via-[#8d6ae5]/80 to-[#c4b7f8]/70" />
      <div className="absolute -right-16 -top-20 -z-10 h-52 w-52 rounded-full bg-white/15 blur-3xl" />

      <div className="max-w-[62%] sm:max-w-[58%]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[10px] font-black uppercase tracking-[.12em] text-white/90 backdrop-blur-sm">
          <Sparkles size={12} /> Lộ trình của bạn
        </span>
        <h1 id="course-page-title" className="mt-3 text-[25px] font-black leading-[1.12] tracking-[-.03em] sm:text-[32px]">
          📖 Khóa học
          <span className="mt-1 block text-white/90">Học theo lộ trình,</span>
          <span className="block text-white/90">tiến bộ mỗi ngày ✨</span>
        </h1>
        <a
          href="#roadmap"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[11px] font-black text-[#6840ce] shadow-[0_6px_16px_rgba(54,27,123,.18)] transition-transform hover:scale-[1.03] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-[.98]"
        >
          Xem lộ trình <ArrowRight size={14} />
        </a>
      </div>

      <motion.img
        src={assets.shared.mascots.readingBook}
        alt="Tanuki đang học"
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0, y: [0, -4, 0] }}
        transition={{ opacity: { duration: .35 }, x: { duration: .35 }, y: { duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
        className="absolute bottom-0 right-2 h-[70%] w-[42%] object-contain object-bottom drop-shadow-[0_12px_18px_rgba(55,25,120,.28)] sm:right-8 sm:h-[82%] sm:w-[34%]"
      />
    </motion.section>
  );
}
