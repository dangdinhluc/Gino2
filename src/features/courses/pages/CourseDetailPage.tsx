import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Play, Lock, CheckCircle2, Bookmark, Share2, Star, Clock, BookOpen, GraduationCap, FileText, Volume2, Layers, Zap, Heart, Headphones, X, Pause } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/src/lib/utils';
import { useProgressStore } from '../store/progressStore';

export default function CourseDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const courseId = id || 'course-1';
  const isLearningView = location.pathname.endsWith('/learn');
  
  const { courseProgress } = useProgressStore();
  const progressData = courseProgress[courseId] || { completedLessons: [] };

  const completedCount = progressData.completedLessons?.length || 0;
  const course = {
    title: 'Tokutei Foundation Sprint',
    level: 'JFT Basic + Core',
    description: 'Lộ trình nền để anh dựng tiếng Nhật sống còn, tác phong đi làm, hồ sơ và phản xạ phỏng vấn Tokutei.',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=1000',
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

  const [activeTab, setActiveTab] = useState<'lessons' | 'vocab' | 'docs' | 'review'>('lessons');
  const [showPodcast, setShowPodcast] = useState(false);
  const [playingPodcastId, setPlayingPodcastId] = useState<number | null>(null);

  const vocabList = [
    { word: 'ohayou gozaimasu', meaning: 'chào buổi sáng', pos: 'Greeting' },
    { word: 'houkoku', meaning: 'báo cáo', pos: 'Action' },
    { word: 'kyukei', meaning: 'giờ nghỉ', pos: 'Routine' },
    { word: 'tenchou', meaning: 'quản lý cửa hàng', pos: 'Role' },
    { word: 'zairyu card', meaning: 'thẻ cư trú', pos: 'Document' },
  ];

  const resources = [
    { title: 'Checklist hồ sơ Tokutei', type: 'PDF', size: '2.8 MB', icon: FileText },
    { title: 'Audio tự giới thiệu 45 giây', type: 'MP3', size: '12 MB', icon: Volume2 },
    { title: '5S và an toàn đầu ca', type: 'PDF', size: '1.5 MB', icon: FileText },
  ];

  const podcasts = [
     { id: 1, title: 'Episode 1: Trước giờ vào ca', duration: '05:30' },
     { id: 2, title: 'Episode 2: Tự giới thiệu ngắn', duration: '08:15' },
     { id: 3, title: 'Episode 3: Checklist hồ sơ', duration: '06:45' },
     { id: 4, title: 'Episode 4: Báo cáo khi chưa hiểu', duration: '07:20' },
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

  const tabs = [
    { id: 'lessons', label: 'Bài học', icon: BookOpen },
    { id: 'vocab', label: 'Từ vựng', icon: Layers },
    { id: 'docs', label: 'Tài liệu', icon: FileText },
    { id: 'review', label: 'Ôn tập', icon: Zap },
  ];

  const handleStartLearning = () => {
    navigate(`/app/courses/${courseId}/learn`);
  };

  if (!isLearningView) {
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

  return (
    <div className="min-h-[calc(100dvh-1.5rem)] pb-4">
      {/* Sticky Top Nav */}
      <div className="sticky top-0 z-50 flex items-center justify-between rounded-2xl border border-[#e6ddd1] bg-[#f8f4ee]/90 px-3 py-2.5 shadow-[0_16px_34px_-30px_rgba(148,163,184,0.16)] backdrop-blur-md md:px-4 md:py-3">
        <button onClick={() => navigate(-1)} className="-ml-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]">
          <ChevronLeft size={24} className="text-gray-800" />
        </button>
        <h2 className="text-sm font-black text-gray-800 italic uppercase tracking-tight truncate max-w-[200px]">
          {course.title}
        </h2>
        <div className="flex items-center gap-1">
           <button className="rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"><Bookmark size={20} className="text-gray-400" /></button>
           <button className="-mr-2 rounded-xl p-2 transition-colors hover:bg-[#f1ebe2]"><Share2 size={20} className="text-gray-400" /></button>
        </div>
      </div>

      <div className="w-full">
        {/* Compact Banner Section */}
        <div className="mx-auto w-full max-w-[1320px] pt-4">
           <div className="relative overflow-hidden rounded-[2.75rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,rgba(255,249,240,0.98)_0%,rgba(247,242,234,0.98)_52%,rgba(242,236,226,0.98)_100%)] shadow-[0_28px_60px_-42px_rgba(180,138,91,0.24)]">
             <div className="absolute inset-0">
               <img src={course.image} className="h-full w-full object-cover opacity-[0.1] mix-blend-multiply" alt="" />
               <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(216,137,73,0.18),transparent_32%)]" />
               <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-orange-100/45 blur-3xl" />
             </div>

             <div className="relative z-10 flex flex-col gap-6 px-4 py-6 sm:px-5 md:p-8 lg:flex-row lg:items-end lg:justify-between xl:p-10">
                <div className="max-w-2xl flex-1 space-y-4">
                   <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-orange-200 bg-[#fff3e6] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">{course.level}</span>
                      <div className="flex items-center gap-1 rounded-full border border-amber-200 bg-[#fff7e8] px-3 py-1 text-amber-600">
                         <Star size={14} className="fill-amber-500 text-amber-500" />
                         <span className="text-xs font-black">{course.rating}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500">{course.students} học viên</span>
                   </div>

                   <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900 md:text-4xl">
                      {course.title}
                   </h1>

                   <p className="max-w-lg text-sm font-medium leading-relaxed text-gray-600 md:text-base">
                      {course.description}
                   </p>

                   <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-2 text-gray-600 no-scrollbar">
                      <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e6ddd1] bg-[#fffaf3]/90 px-3 py-2 text-xs font-bold shadow-[0_14px_28px_-24px_rgba(148,163,184,0.18)]">
                         <Clock size={16} />
                         <span>{course.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#e6ddd1] bg-[#fffaf3]/90 px-3 py-2 text-xs font-bold shadow-[0_14px_28px_-24px_rgba(148,163,184,0.18)]">
                         <BookOpen size={16} />
                         <span>{course.totalLessons} bài học</span>
                      </div>
                      <button
                         onClick={() => setShowPodcast(true)}
                         className="flex items-center gap-2 whitespace-nowrap rounded-full border border-orange-200 bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] px-3 py-2 text-white shadow-[0_16px_32px_-24px_rgba(180,138,91,0.34)] transition-colors active:scale-95"
                      >
                         <Headphones size={15} />
                         <span className="text-xs font-bold">Nghe Podcast</span>
                      </button>
                   </div>
                </div>

                <div className="w-full shrink-0 rounded-[2rem] border border-[#eadfce] bg-[#fffaf3]/92 p-5 shadow-[0_22px_42px_-30px_rgba(148,163,184,0.18)] md:w-80">
                   <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-black uppercase text-gray-500">Tiến độ</h3>
                      <span className="text-xs font-black text-orange-500">{course.progress}%</span>
                   </div>
                   <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-[#efe5d7]">
                      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-[#d6ad6d]" style={{ width: `${course.progress}%` }} />
                   </div>
                   <button
                      onClick={handleStartLearning}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] py-3.5 text-sm font-black uppercase tracking-wide text-white shadow-[0_18px_36px_-26px_rgba(180,138,91,0.34)] transition-all active:scale-95"
                   >
                      <Play size={18} className="fill-white" /> Vào màn học tập
                   </button>
                </div>
             </div>
           </div>
        </div>

        <div className="mx-auto w-full max-w-5xl space-y-6 py-6 md:px-4">
           {/* Tab Switcher */}
           <div className="flex justify-center">
             <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#e6ddd1] bg-[#fffaf3]/95 p-1.5 shadow-[0_18px_34px_-28px_rgba(148,163,184,0.16)] no-scrollbar">
                {tabs.map((tab) => (
                   <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                         "flex min-w-[5.75rem] items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-black transition-all whitespace-nowrap sm:min-w-[7.5rem] sm:px-6",
                         activeTab === tab.id 
                            ? "border border-orange-200 bg-[#fff3e6] text-orange-600 shadow-[0_12px_24px_-20px_rgba(180,138,91,0.28)]" 
                            : "text-gray-500 hover:bg-[#f5efe6] hover:text-gray-700"
                      )}
                   >
                      <tab.icon size={16} />
                      <span className="hidden md:inline">{tab.label}</span>
                   </button>
                ))}
             </div>
           </div>

           {/* Tab Content */}
           <AnimatePresence mode="wait">
              <motion.div
                 key={activeTab}
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 transition={{ duration: 0.2 }}
              >
                 {activeTab === 'lessons' && (
                    <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
                       {modules.map((module) => (
                          <div key={module.title} className="space-y-4 overflow-hidden rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-4 shadow-[0_18px_40px_-32px_rgba(148,163,184,0.16)] md:p-6">
                             <h4 className="flex items-center gap-3 text-sm font-black text-gray-800 uppercase tracking-tight">
                                {module.title}
                             </h4>
                             <div className="space-y-3">
                                {module.lessons.map((lesson) => {
                                    const isCompleted = progressData.completedLessons?.includes(lesson.id) || lesson.completed;
                                    return (
                                   <div 
                                      onClick={() => { if (!lesson.locked) navigate(`/app/courses/${courseId}/lessons/${lesson.id}`); }}
                                      key={lesson.id} 
                                      className={cn(
                                         "flex cursor-pointer items-center justify-between rounded-[1.5rem] border p-4 transition-all group",
                                         isCompleted ? "border-green-100 bg-emerald-50/50" : 
                                         lesson.locked ? "border-[#ece4d8] bg-[#f5efe6] opacity-60 grayscale cursor-not-allowed" : 
                                         "border-[#e8dece] bg-[#fffdf9] hover:border-orange-200 hover:shadow-[0_16px_30px_-24px_rgba(180,138,91,0.2)] active:scale-98"
                                      )}
                                   >
                                      <div className="flex min-w-0 items-center gap-4">
                                         <div className={cn(
                                            "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm",
                                            isCompleted ? "bg-green-50 text-green-500" :
                                            lesson.locked ? "bg-gray-200 text-gray-400" :
                                            "bg-orange-50 text-orange-500"
                                         )}>
                                            {isCompleted ? <CheckCircle2 size={20} /> : lesson.locked ? <Lock size={18} /> : <Play size={16} className="fill-orange-500 ml-0.5" />}
                                         </div>
                                         <div className="min-w-0 space-y-0.5">
                                            <h5 className="truncate text-sm font-black tracking-tight text-gray-800">{lesson.title}</h5>
                                            <p className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5 uppercase tracking-tighter">
                                               <Clock size={12} /> {lesson.duration}
                                            </p>
                                         </div>
                                      </div>
                                   </div>
                                )})} 
                             </div>
                          </div>
                       ))}
                    </div>
                 )}

                 {activeTab === 'vocab' && (
                    <div className="mx-auto max-w-3xl space-y-4 md:space-y-6">
                       <div className="flex flex-col gap-4 rounded-[2rem] border border-[#eadfce] bg-[linear-gradient(135deg,rgba(255,243,230,0.96)_0%,rgba(255,250,243,0.98)_100%)] p-4 shadow-[0_18px_36px_-30px_rgba(180,138,91,0.16)] sm:flex-row sm:items-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eadfce] bg-[#fffaf3] shadow-[0_12px_24px_-20px_rgba(148,163,184,0.16)]">
                             <Layers className="text-orange-500" size={24} />
                          </div>
                          <div className="flex-1">
                             <h4 className="font-black text-gray-800">Bộ từ vựng chương 1</h4>
                             <p className="text-xs font-bold text-gray-500">24 cụm từ • Track Tokutei</p>
                          </div>
                          <button 
                             onClick={() => navigate('/app/grammar')}
                             className="whitespace-nowrap rounded-xl border border-orange-200 bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] px-4 py-2 text-xs font-bold text-white shadow-[0_16px_30px_-22px_rgba(180,138,91,0.3)] transition-all active:scale-95"
                          >
                             Mở thư viện
                          </button>
                       </div>

                       <div className="overflow-hidden rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] shadow-[0_18px_40px_-32px_rgba(148,163,184,0.16)] divide-y divide-[#efe6da]">
                          {vocabList.map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-5 transition-colors hover:bg-[#f8f3ec]">
                                <div className="space-y-1">
                                   <div className="flex items-center gap-2">
                                      <h4 className="text-lg font-black text-gray-800 italic">{item.word}</h4>
                                      <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md uppercase">{item.pos}</span>
                                   </div>
                                   <p className="text-sm font-bold text-gray-500">{item.meaning}</p>
                                </div>
                                <button className="rounded-xl border border-[#e6ddd1] bg-[#fffdf9] p-3 text-gray-400 transition-all hover:border-orange-200 hover:bg-[#fff3e6] hover:text-orange-500 active:scale-95">
                                   <Volume2 size={20} />
                                </button>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {activeTab === 'docs' && (
                    <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-2">
                       {resources.map((res, i) => (
                          <div key={i} className="group flex cursor-pointer items-center gap-4 rounded-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-5 shadow-[0_18px_40px_-32px_rgba(148,163,184,0.16)] transition-all hover:border-orange-200">
                             <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#e8dece] bg-[#fffdf9] text-gray-400 transition-all group-hover:bg-[#fff3e6] group-hover:text-orange-500">
                                <res.icon size={24} />
                             </div>
                             <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-black text-gray-800 truncate">{res.title}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">{res.type} • {res.size}</p>
                             </div>
                             <button className="p-2 text-gray-300 group-hover:text-orange-500">
                                <Play size={18} className="rotate-90" />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}

                 {activeTab === 'review' && (
                    <div className="max-w-2xl mx-auto">
                       <div className="space-y-5 rounded-[2.5rem] border border-[#e6ddd1] bg-[linear-gradient(135deg,rgba(255,249,240,0.98)_0%,rgba(247,242,234,0.98)_100%)] p-5 text-center shadow-[0_22px_46px_-34px_rgba(180,138,91,0.18)] md:space-y-6 md:p-8">
                           <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] border border-[#eadfce] bg-[#fff3e6] text-orange-500 shadow-[0_18px_32px_-24px_rgba(180,138,91,0.2)]">
                              <Zap size={40} className="fill-orange-500" />
                           </div>
                           <div className="space-y-2">
                              <h3 className="text-xl font-black text-gray-800 uppercase italic">Chốt lại module</h3>
                              <p className="px-0 text-sm font-bold text-gray-400 sm:px-10">Làm 10 câu hỏi ngắn để khóa lại phần đầu ca, hồ sơ và tự giới thiệu.</p>
                           </div>
                           <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Mục tiêu</p>
                                 <p className="text-sm font-black text-gray-800">10 câu</p>
                              </div>
                              <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Thời gian</p>
                                 <p className="text-sm font-black text-gray-800">5 phút</p>
                              </div>
                              <div className="rounded-2xl border border-[#e8dece] bg-[#fffaf3] p-3">
                                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">XP</p>
                                 <p className="text-sm font-black text-gray-800">+100</p>
                              </div>
                           </div>
                           <button onClick={() => navigate('/app/review/flashcards')} className="w-full rounded-2xl border border-orange-200 bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] py-4 font-black text-white shadow-[0_18px_36px_-24px_rgba(180,138,91,0.34)] transition-all hover:scale-[1.02] active:scale-95">
                              BẮT ĐẦU PHIÊN ÔN
                           </button>
                       </div>
                    </div>
                 )}
              </motion.div>
           </AnimatePresence>

           <div className="space-y-4 py-10 text-center">
               <p className="text-xs font-bold text-gray-400 italic">
                  Anh đã xem hết phần giới thiệu khóa học.
               </p>
           </div>
        </div>
      </div>

      {/* Podcast Audio Player Modal */}
      <AnimatePresence>
        {showPodcast && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setShowPodcast(false)}
               className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div 
               initial={{ opacity: 0, y: 100, scale: 0.9 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 100, scale: 0.9 }}
               className="fixed bottom-0 left-0 right-0 z-[70] flex max-h-[80vh] w-full flex-col rounded-t-[2rem] border border-[#e6ddd1] bg-[#fffaf3] p-6 shadow-[0_32px_70px_-42px_rgba(17,24,39,0.26)] md:left-1/2 md:top-1/2 md:max-w-md md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem]"
            >
               <div className="mb-6 flex items-center justify-between">
                 <div>
                   <h3 className="text-xl font-black italic tracking-tight text-gray-800">Nghe lại module</h3>
                   <p className="text-xs font-bold text-gray-500">Phiên audio ngắn để giữ tai quen nhịp Tokutei</p>
                 </div>
                 <button onClick={() => setShowPodcast(false)} className="rounded-full bg-[#f5efe6] p-2 transition-colors hover:bg-[#eee6dc]">
                   <X size={20} className="text-gray-600" />
                 </button>
               </div>
               
               {/* Now playing area */}
               {playingPodcastId && (
                  <div className="mb-6 flex shrink-0 items-center gap-4 rounded-2xl border border-[#eadfce] bg-[linear-gradient(135deg,rgba(255,243,230,0.96)_0%,rgba(255,250,243,0.98)_100%)] p-4">
                     <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] shadow-[0_18px_34px_-24px_rgba(180,138,91,0.3)] animate-pulse">
                        <Volume2 size={24} className="text-white" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase text-orange-500 tracking-widest">Đang phát</p>
                        <h4 className="text-sm font-bold text-gray-800 truncate">
                           {podcasts.find(p => p.id === playingPodcastId)?.title}
                        </h4>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-orange-200">
                           <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: "100%" }}
                              transition={{ duration: 300, ease: "linear" }}
                              className="h-full bg-[linear-gradient(90deg,#d98949_0%,#c79160_100%)]"
                           />
                        </div>
                     </div>
                     <button onClick={() => setPlayingPodcastId(null)} className="shrink-0 p-2 text-gray-400 hover:text-orange-500">
                        <Pause size={24} className="fill-current" />
                     </button>
                  </div>
               )}

               <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar pb-6 mx-[-1.5rem] px-6">
                  {podcasts.map(podcast => (
                     <div 
                        key={podcast.id}
                        onClick={() => setPlayingPodcastId(podcast.id)}
                        className={cn(
                           "flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all",
                           playingPodcastId === podcast.id ? "border-orange-200 bg-[#fffaf3] shadow-[0_16px_30px_-24px_rgba(180,138,91,0.18)]" : "border-[#eee5d9] bg-[#f8f3ec] hover:bg-[#fffaf3]"
                        )}
                     >
                        <button className={cn(
                           "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
                           playingPodcastId === podcast.id ? "bg-[linear-gradient(135deg,#d98949_0%,#c79160_100%)] text-white shadow-[0_14px_28px_-20px_rgba(180,138,91,0.3)]" : "border border-[#e6ddd1] bg-[#fffdf9] text-gray-400"
                        )}>
                           {playingPodcastId === podcast.id ? <Volume2 size={18} /> : <Play size={18} className="translate-x-[1px] fill-current" />}
                        </button>
                        <div className="flex-1 min-w-0">
                           <h5 className={cn(
                              "text-sm font-bold truncate",
                              playingPodcastId === podcast.id ? "text-orange-600" : "text-gray-700"
                           )}>{podcast.title}</h5>
                           <p className="text-xs text-gray-400">{podcast.duration}</p>
                        </div>
                     </div>
                  ))}
                  <div className="text-center pt-4">
                     <p className="text-xs font-bold italic text-gray-400">"Gợi ý nhanh: nghe 1 episode ở giờ nghỉ để giữ tai quen nhịp câu."</p>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
