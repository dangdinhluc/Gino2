import { motion } from 'motion/react';
import { Bookmark, BookOpen, CheckCircle2, ChevronLeft, Clock, GraduationCap, Headphones, Heart, Layers, Play, Share2, Star, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProgressStore } from '../store/progressStore';

/**
 * Trang giới thiệu khóa học. KHÔNG còn nằm trên luồng học chính — danh sách khóa,
 * tìm kiếm và bài học đều đi thẳng vào workspace `/app/courses/:id/learn`.
 * Giữ lại route để sau này dùng làm màn xem trước / đăng ký gói cho người chưa mua.
 *
 * Lưu ý: nội dung dưới đây vẫn là dữ liệu tĩnh, chưa nối `useCourseList` hay
 * repository nên mọi courseId đều hiển thị cùng một khóa. Cần thay khi làm enrollment.
 */
export default function CourseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const courseId = id || 'course-1';

  const { courseProgress } = useProgressStore();
  const progressData = courseProgress[courseId] || { completedLessons: [] };

  const completedCount = progressData.completedLessons?.length || 0;
  const course = {
    title: 'Tokutei Foundation Sprint',
    level: 'JFT Basic + Core',
    description: 'Lộ trình nền để anh dựng tiếng Nhật sống còn, tác phong đi làm, hồ sơ và phản xạ phỏng vấn Tokutei.',
    totalLessons: 18,
    duration: '12 giờ',
    rating: 4.9,
    students: '2.4k',
    progress: Math.round((completedCount / 18) * 100),
  };

  const modules = [
    {
      title: 'Module 1: Vào ca & Aisatsu',
      lessons: [
        { id: '1', title: 'Bài 1: Câu chào đầu ca', duration: '12:00', completed: true, locked: false },
        { id: '2', title: 'Bài 2: Checklist vị trí làm việc', duration: '08:45', completed: true, locked: false },
        { id: '3', title: 'Bài 3: Tự giới thiệu ngắn', duration: '15:20', completed: false, locked: false },
      ]
    },
    {
      title: 'Module 2: Hồ sơ & Phỏng vấn',
      lessons: [
        { id: '4', title: 'Bài 4: Hồ sơ phải kiểm tra', duration: '10:15', completed: false, locked: true },
        { id: '5', title: 'Bài 5: Trả lời câu hỏi HR', duration: '14:30', completed: false, locked: true },
        { id: '6', title: 'Bài 6: Báo cáo khi chưa hiểu', duration: '11:00', completed: false, locked: true },
      ]
    }
  ];

  const overviewPoints = [
    'Bắt đầu từ lời chào đầu ca, tự giới thiệu và tác phong làm việc.',
    'Mỗi bài học ngắn, phù hợp học theo phiên 10-15 phút.',
    'Có sẵn checklist hồ sơ, cụm từ sống còn và phần ôn tập theo module.',
  ];

  const overviewStats = [
    { label: 'Thời lượng', value: course.duration, icon: Clock },
    { label: 'Bài học', value: `${course.totalLessons} bài`, icon: BookOpen },
    { label: 'Cấp độ', value: course.level, icon: GraduationCap },
  ];

  const handleStartLearning = () => {
    navigate(`/app/courses/${courseId}/learn`);
  };

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
      <div className="sticky top-0 z-50 flex items-center justify-between rounded-2xl border border-[#e6ddd1] bg-[#f8f4ee]/90 px-3 py-2.5 shadow-[0_16px_34px_-30px_rgba(148,163,184,0.16)] backdrop-blur-md md:px-4 md:py-3">
        <button onClick={() => navigate(-1)} className="-ml-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h2 className="max-w-[220px] truncate text-sm font-black uppercase tracking-tight text-gray-800 italic">
          Giới thiệu khóa học
        </h2>
        <div className="flex items-center gap-1">
          <button className="rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"><Bookmark size={20} className="text-gray-400" /></button>
          <button className="-mr-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"><Share2 size={20} className="text-gray-400" /></button>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1320px] space-y-6 pt-4">
        <section className="rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf4] shadow-[0_20px_44px_-36px_rgba(148,163,184,0.22)]">
          <div className="grid gap-6 px-4 py-5 sm:px-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start xl:p-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-orange-200 bg-[#fff3e6] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">{course.level}</span>
                <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-[#fff7e8] px-3 py-1 text-amber-600">
                  <Star size={14} className="fill-amber-500 text-amber-500" />
                  <span className="text-xs font-black">{course.rating}</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{course.students} học viên đang học</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-500">Giới thiệu nhanh</p>
                  <h1 className="max-w-3xl text-3xl font-black tracking-[-0.04em] text-gray-900 md:text-5xl">
                    {course.title}
                  </h1>
                </div>
                <p className="max-w-2xl text-base font-medium leading-7 text-gray-600 md:text-lg">
                  {course.description}
                </p>
                <ul className="grid gap-2.5 text-sm font-semibold leading-relaxed text-gray-600">
                  {overviewPoints.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {overviewStats.map((item) => (
                  <div key={item.label} className="rounded-[1.35rem] border border-[#ece4d8] bg-white px-4 py-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                      <item.icon size={14} />
                      {item.label}
                    </div>
                    <div className="mt-2 text-lg font-black text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-[#eadfce] bg-white p-5 shadow-[0_18px_34px_-30px_rgba(148,163,184,0.22)]">
              <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-gray-500">Tiến độ hiện tại</p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <div className="text-3xl font-black tracking-tight text-gray-900">{course.progress}%</div>
                    <p className="text-sm font-semibold text-gray-500">
                      {completedCount > 0 ? `${completedCount}/${course.totalLessons} bài đã xong` : 'Chưa bắt đầu bài học nào'}
                    </p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-black text-orange-600">
                    {course.level} cơ bản
                  </span>
                </div>
              </div>

              <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#efe5d7]">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${course.progress}%` }} />
              </div>

              <div className="mt-4 rounded-2xl border border-[#f0e4d6] bg-[#fffaf4] px-4 py-3 text-sm font-semibold leading-relaxed text-gray-600">
                Vào khu học tập để học theo đúng thứ tự từng bài, rồi quay lại đây khi cần xem nhanh lộ trình.
              </div>

              <button
                onClick={handleStartLearning}
                className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-orange-600 active:scale-[0.99]"
              >
                <Play size={18} className="fill-white" />
                {course.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
              </button>
              <p className="mt-3 text-center text-xs font-semibold leading-relaxed text-gray-400">
                Màn học tập riêng có bài học, từ vựng, tài liệu và ôn tập.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_46px_-38px_rgba(148,163,184,0.18)] md:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-500">
                <Heart size={22} className="fill-orange-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Phù hợp với</p>
                <h3 className="text-xl font-black text-gray-900">Người mới vào track Tokutei</h3>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm font-medium leading-relaxed text-gray-600">
              <p>Khóa này đi từ lời chào đầu ca, cụm từ sống còn, hồ sơ và các câu trả lời phỏng vấn cơ bản.</p>
              <p>Anh có thể học theo phiên ngắn 10-15 phút, sau đó chuyển sang review hoặc mock để chốt ngay phần vừa học.</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: 'Nắm nền Tokutei', desc: 'Lời chào đầu ca, tự giới thiệu, 5S và quy tắc cơ bản.', icon: CheckCircle2 },
              { title: 'Cụm từ dùng được', desc: 'Tập trung vào các cụm xuất hiện nhiều trong hồ sơ và nơi làm việc.', icon: Layers },
              { title: 'Nghe lại linh hoạt', desc: 'Podcast khóa học giúp ôn khi nghỉ ngắn hoặc di chuyển.', icon: Headphones },
              { title: 'Có điểm dừng rõ', desc: 'Mỗi module có phần ôn tập riêng để anh biết mình đã chắc tới đâu.', icon: Zap },
            ].map((item) => (
              <motion.div
                key={item.title}
                whileHover={{ y: -2 }}
                className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_18px_36px_-32px_rgba(148,163,184,0.16)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fff7ed] text-orange-500">
                  <item.icon size={20} />
                </div>
                <h4 className="text-base font-black text-gray-900">{item.title}</h4>
                <p className="mt-2 text-sm font-medium leading-relaxed text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="rounded-[2.25rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_22px_46px_-38px_rgba(148,163,184,0.18)] md:p-6">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">Lộ trình học</p>
              <h3 className="mt-1 text-2xl font-black tracking-tight text-gray-900">Vào học theo từng chương</h3>
            </div>
            <button onClick={handleStartLearning} className="w-fit rounded-2xl bg-orange-500 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white shadow-[0_16px_34px_-22px_rgba(249,115,22,0.65)]">
              Đi tới khu học tập
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {modules.map((module, index) => (
              <div key={module.title} className="rounded-[1.75rem] border border-[#e6ddd1] bg-[#fffdf8] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-sm font-black text-orange-500">{index + 1}</div>
                  <h4 className="text-sm font-black uppercase tracking-tight text-gray-800">{module.title}</h4>
                </div>
                <p className="text-sm font-medium text-gray-500">{module.lessons.length} bài học nhỏ, học theo thứ tự để không bị hụt nền.</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
