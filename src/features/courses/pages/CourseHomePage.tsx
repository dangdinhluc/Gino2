import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Flame, Gamepad2, GraduationCap, Headphones, Home, PencilLine, Target } from 'lucide-react';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { useProgressStore } from '@/src/features/courses/store/progressStore';
import { assets } from '@/src/shared/lib/assets';

export default function CourseHomePage() {
  const { id } = useParams();
  const workspace = useCourseLearningWorkspace(id);
  const streak = useProgressStore((state) => state.streak);

  if (workspace.isLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-[760px] items-center justify-center px-4 text-[11px] font-semibold text-[#8b8e98]">Đang tải khóa học…</div>;
  }

  if (workspace.loadError || !workspace.data) {
    return <div className="mx-auto mt-8 flex min-h-[40vh] max-w-xl items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center text-[11px] font-semibold text-red-700">{workspace.loadError ?? 'Không tải được khóa học.'}</div>;
  }

  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace.data;
  const progress = Math.max(0, Math.min(100, course.progress));
  const coursePath = `/app/courses/${course.id}/workspace`;
  const learnedVocabulary = vocabulary.filter((item) => item.status === 'mastered' || item.status === 'learning').length;

  const sections = [
    { label: 'Từ vựng', hint: `${vocabulary.length} từ`, icon: BookOpen, image: assets.courses.workspace.vocabulary },
    { label: 'Tài liệu', hint: `${documents.length} tài liệu`, icon: FileText, image: assets.courses.workspace.documents },
    { label: 'Luyện tập', hint: `${reviewQuestions.length} câu hỏi`, icon: Target, image: assets.courses.workspace.practice },
    { label: 'Game', hint: 'Luyện phản xạ', icon: Gamepad2, image: assets.courses.workspace.games },
    { label: 'Thi thử', hint: `${exams.length} đề`, icon: GraduationCap, image: assets.courses.workspace.exam },
  ];

  const localNav = [
    { label: 'Tổng quan', icon: Home, to: `/app/courses/${course.id}/learn`, active: true },
    { label: 'Từ vựng', icon: BookOpen, to: coursePath },
    { label: 'Tài liệu', icon: FileText, to: coursePath },
    { label: 'Luyện tập', icon: PencilLine, to: coursePath },
    { label: 'Game', icon: Gamepad2, to: coursePath },
    { label: 'Thi thử', icon: GraduationCap, to: coursePath },
  ];

  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-3 sm:px-6">
      <header className="flex min-h-11 items-center justify-between gap-3">
        <Link to="/app/courses" className="flex h-9 w-9 items-center justify-center rounded-full text-[#30323a]" aria-label="Trở về khóa học"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[13px] font-extrabold text-[#222329]">{course.title}</h1>
          <p className="truncate text-[9px] font-medium text-[#8b8e98]">{course.level}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-8 items-center gap-1 rounded-full border border-[#ececf2] bg-white px-2.5 text-[10px] font-bold text-[#646771]"><Flame size={12} className="fill-[#ff8559] text-[#ff8559]" /> {streak}</span>
          {podcasts.length > 0 && <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ececf2] bg-white text-[#6f45d8]"><Headphones size={14} /></span>}
        </div>
      </header>

      <div className="mt-2 flex h-[128px] items-end overflow-hidden rounded-[15px] bg-[linear-gradient(135deg,#806448_0%,#c3a177_55%,#5c4634_100%)] p-4 shadow-[0_4px_14px_rgba(20,20,35,.08)]">
        <div className="rounded-lg bg-black/30 px-3 py-2 text-white backdrop-blur-sm">
          <strong className="block text-[15px] font-extrabold">{course.title}</strong>
          <span className="text-[9px] font-medium text-white/80">Không gian học tập của khóa</span>
        </div>
      </div>

      <section className="mt-3 rounded-[14px] border border-[#e7e7ed] bg-white p-3.5 shadow-[0_3px_10px_rgba(20,20,35,.035)]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f2effa]">
            <span className="text-[11px] font-extrabold text-[#6f45d8]">{progress}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3"><strong className="text-[11px] font-extrabold text-[#292a30]">Tiến độ khóa học</strong><span className="text-[9px] font-semibold text-[#9698a1]">{Math.max(1, Math.round((progress / 100) * Math.max(documents.length, 1)))}/{Math.max(documents.length, 1)} bài</span></div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eeeef3]"><div className="h-full rounded-full bg-[#6f45d8]" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[10px] font-extrabold uppercase tracking-[.05em] text-[#41434a]">Bài đang học</h2>
        <div className="rounded-[14px] border border-[#e8e8ef] bg-white p-3.5 shadow-[0_3px_12px_rgba(20,20,35,.035)]">
          <strong className="block text-[12px] font-extrabold text-[#292a30]">Tiếp tục nội dung khóa</strong>
          <span className="mt-1 block text-[9px] font-medium text-[#94969f]">Giữ nhịp học từ vị trí gần nhất</span>
          <Link to={coursePath} className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-[#6f45d8] text-[10px] font-extrabold text-white shadow-[0_5px_12px_rgba(111,69,216,.2)]">TIẾP TỤC HỌC →</Link>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[10px] font-extrabold uppercase tracking-[.05em] text-[#41434a]">Hôm nay trong khóa này</h2>
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-[12px] border border-[#e8e8ef] bg-white p-3 text-center"><strong className="text-[13px] font-extrabold text-[#292a30]">{Math.max(0, vocabulary.length - learnedVocabulary)}</strong><span className="mt-1 block text-[8px] font-medium text-[#92949d]">Từ cần ôn</span></div>
          <div className="rounded-[12px] border border-[#e8e8ef] bg-white p-3 text-center"><strong className="text-[13px] font-extrabold text-[#292a30]">{reviewQuestions.length}</strong><span className="mt-1 block text-[8px] font-medium text-[#92949d]">Câu luyện tập</span></div>
          <div className="rounded-[12px] border border-[#e8e8ef] bg-white p-3 text-center"><strong className="text-[13px] font-extrabold text-[#292a30]">{streak}</strong><span className="mt-1 block text-[8px] font-medium text-[#92949d]">Chuỗi ngày</span></div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 text-[10px] font-extrabold uppercase tracking-[.05em] text-[#41434a]">Nội dung khóa học</h2>
        <div className="overflow-hidden rounded-[14px] border border-[#e8e8ef] bg-white">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={section.label} to={coursePath} className={`flex min-h-[57px] items-center gap-3 px-3 ${index ? 'border-t border-[#eeeeF3]' : ''}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7f5fc] p-1.5 text-[#6f45d8]">{section.image ? <img src={section.image} alt="" className="h-full w-full object-contain" /> : <Icon size={15} />}</span>
                <span className="min-w-0 flex-1"><strong className="block text-[10px] font-extrabold text-[#303138]">{section.label}</strong><small className="text-[8px] font-medium text-[#9a9ca5]">{section.hint}</small></span>
                <span className="text-[9px] font-extrabold text-[#6f45d8]">›</span>
              </Link>
            );
          })}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto grid min-h-[62px] max-w-[760px] grid-cols-6 border-t border-[#e8e8ef] bg-white/98 px-1 pb-[env(safe-area-inset-bottom)] pt-1 backdrop-blur-xl">
        {localNav.map((item) => {
          const Icon = item.icon;
          return <Link key={item.label} to={item.to} className={`flex min-w-0 flex-col items-center justify-center gap-1 ${item.active ? 'text-[#6f45d8]' : 'text-[#62656f]'}`}><Icon size={15} /><span className="max-w-full truncate text-[8px] font-bold">{item.label}</span></Link>;
        })}
      </nav>
    </div>
  );
}
