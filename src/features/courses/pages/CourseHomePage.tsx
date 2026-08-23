import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, FileText, Gamepad2, GraduationCap, Headphones, Target, ChevronRight } from 'lucide-react';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { assets } from '@/src/shared/lib/assets';

export default function CourseHomePage() {
  const { id } = useParams();
  const workspace = useCourseLearningWorkspace(id);

  if (workspace.isLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 text-sm font-bold text-[#5f6b7c]">Đang tải khóa học…</div>;
  }

  if (workspace.loadError || !workspace.data) {
    return <div className="mx-auto mt-8 flex min-h-[40vh] max-w-xl items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 text-center text-sm font-semibold text-red-700">{workspace.loadError ?? 'Không tải được khóa học.'}</div>;
  }

  const { course, vocabulary, reviewQuestions, documents, exams, podcasts } = workspace.data;
  const progress = Math.max(0, Math.min(100, course.progress));
  const coursePath = `/app/courses/${course.id}/workspace`;

  const sections = [
    { label: 'Từ vựng', hint: `${vocabulary.length} từ trong khóa`, icon: BookOpen, image: assets.courses.workspace.vocabulary },
    { label: 'Tài liệu', hint: `${documents.length} bài đọc & tài liệu`, icon: FileText, image: assets.courses.workspace.documents },
    { label: 'Luyện tập', hint: `${reviewQuestions.length} câu luyện tập`, icon: Target, image: assets.courses.workspace.practice },
    { label: 'Game', hint: 'Luyện phản xạ với từ trong khóa', icon: Gamepad2, image: assets.courses.workspace.games },
    { label: 'Thi thử', hint: `${exams.length} đề thi trong khóa`, icon: GraduationCap, image: assets.courses.workspace.exam },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-4 pb-24 sm:px-6">
      <header className="flex items-center justify-between gap-3">
        <Link to="/app/courses" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#e8dccb] bg-white px-3 text-sm font-black text-[#5f6b7c] shadow-2xs hover:border-orange-300 hover:text-[#d83a00]">
          <ArrowLeft size={16} /> Khóa học
        </Link>
        {podcasts.length > 0 && (
          <Link to={coursePath} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-3 text-xs font-black text-[#c2410c]">
            <Headphones size={15} /> {podcasts.length} audio
          </Link>
        )}
      </header>

      <section className="relative overflow-hidden rounded-[28px] border border-[#fde0c7] bg-gradient-to-br from-[#fffaf3] via-[#fff4e8] to-[#ffe8d2] p-5 shadow-[0_14px_36px_rgba(217,74,19,0.09)] sm:p-7">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-orange-200/30 blur-2xl" />
        <div className="relative grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]">Tổng quan khóa học</span>
            <h1 className="mt-3 font-[var(--font-heading)] text-2xl font-black tracking-tight text-[#172033] sm:text-3xl">{course.title}</h1>
            <p className="mt-1 text-sm font-semibold text-[#6b7280]">{course.description}</p>

            <div className="mt-5 max-w-xl">
              <div className="flex items-center justify-between text-xs font-black text-[#5f6b7c]">
                <span>Tiến độ khóa học</span>
                <span className="text-[#d83a00]">{progress}%</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/80">
                <div className="h-full rounded-full bg-gradient-to-r from-[#d83a00] to-[#f59e0b]" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <Link to={coursePath} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#ea580c] px-5 text-sm font-black text-white shadow-lg shadow-orange-200/50 transition-transform active:scale-[0.98]">
              Tiếp tục học <ChevronRight size={17} />
            </Link>
          </div>

          <img src={assets.shared.mascots.brand} alt="Tokutei mascot" className="mx-auto h-28 w-28 object-contain drop-shadow-md sm:h-36 sm:w-36" />
        </div>
      </section>

      <section className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-[#f0e4d6] bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl font-black text-[#172033]">{vocabulary.length}</strong>
          <span className="text-[11px] font-bold text-[#7b8796]">Từ vựng</span>
        </div>
        <div className="rounded-2xl border border-[#f0e4d6] bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl font-black text-[#172033]">{reviewQuestions.length}</strong>
          <span className="text-[11px] font-bold text-[#7b8796]">Câu luyện</span>
        </div>
        <div className="rounded-2xl border border-[#f0e4d6] bg-white p-3 text-center shadow-2xs">
          <strong className="block text-xl font-black text-[#172033]">{exams.length}</strong>
          <span className="text-[11px] font-bold text-[#7b8796]">Đề thi</span>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#d83a00]">Nội dung khóa học</p>
            <h2 className="font-[var(--font-heading)] text-xl font-black text-[#172033]">Chọn phần muốn học</h2>
          </div>
          <span className="text-xs font-semibold text-[#8c97a8]">Chỉ dữ liệu của khóa này</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.label} to={coursePath} className="group flex items-center gap-3 rounded-[22px] border border-[#eedecf] bg-white p-4 shadow-2xs transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-[#fff8f1] p-1.5">
                  {section.image ? <img src={section.image} alt="" className="h-full w-full object-contain" /> : <Icon size={22} className="text-[#d83a00]" />}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-sm font-black text-[#172033] group-hover:text-[#d83a00]">{section.label}</strong>
                  <span className="mt-0.5 block text-xs font-semibold text-[#7b8796]">{section.hint}</span>
                </span>
                <ChevronRight size={16} className="shrink-0 text-[#a0aab8] group-hover:text-[#d83a00]" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
