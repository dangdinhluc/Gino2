import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { assets } from '@/src/shared/lib/assets';

export function CourseTanukiHero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#6e46e6] to-[#9b7af5] p-5 text-white shadow-lg">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-white/80">Khóa học</p>
          <h1 className="mt-1 text-2xl font-black">Học theo lộ trình mỗi ngày ✨</h1>
          <p className="mt-2 text-sm font-semibold text-white/85">
            Tiếp tục hành trình tiếng Nhật cùng Tanuki.
          </p>
        </div>
        <img
          src={assets.shared.mascots.headerWaving}
          alt="Tanuki"
          className="h-28 w-28 object-contain drop-shadow-xl"
        />
      </div>
      <Link
        to="/app/courses"
        className="relative z-10 mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-black text-[#6e46e6]"
      >
        Xem lộ trình <ChevronRight size={18} />
      </Link>
    </section>
  );
}
