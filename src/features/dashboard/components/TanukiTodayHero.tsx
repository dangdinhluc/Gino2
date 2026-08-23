import { Link } from 'react-router-dom';

interface TanukiTodayHeroProps {
  name?: string;
  streak?: number;
  lessonTitle?: string;
  courseTitle?: string;
  mascotSrc?: string;
  backgroundSrc?: string;
}

export function TanukiTodayHero({
  name = 'Luc',
  streak = 12,
  lessonTitle = 'Bài 8: てあります',
  courseTitle = 'Minna no Nihongo N5',
  mascotSrc,
  backgroundSrc,
}: TanukiTodayHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] bg-[#221640] p-4 text-white shadow-lg">
      {backgroundSrc && (
        <img
          src={backgroundSrc}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#160d2d]/95 to-transparent" />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-white/80">Xin chào</p>
          <h1 className="text-2xl font-black">{name} ✨</h1>
          <p className="mt-2 text-sm font-medium">Sẵn sàng học tiếng Nhật hôm nay?</p>
        </div>
        {mascotSrc && (
          <img src={mascotSrc} alt="Tanuki" className="h-24 w-24 object-contain" />
        )}
      </div>

      <div className="relative z-10 mt-4 rounded-2xl bg-white p-3 text-[#1e1f26]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black text-[#6e46e6]">TIẾP TỤC HỌC</span>
            <strong className="block text-sm font-black">{lessonTitle}</strong>
            <span className="text-xs text-gray-500">{courseTitle}</span>
          </div>
          <Link
            to="/app/courses"
            className="rounded-full bg-[#6e46e6] px-4 py-2 text-xs font-black text-white"
          >
            Học
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-3 inline-flex rounded-full bg-white/95 px-3 py-1 text-xs font-black text-[#221640]">
        🔥 {streak} ngày liên tiếp
      </div>
    </section>
  );
}
