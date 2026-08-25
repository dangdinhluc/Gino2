import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Flame, Headphones } from 'lucide-react';
import {
  useCourseDocuments,
  useCourseExams,
  useCourseLearningMeta,
  useCoursePractice,
  useCourseVocabulary,
} from '@/src/features/courses/hooks/useCourseLearningModules';
import { getVisibleCourseWorkspaceTabs } from '@/src/features/courses/lib/courseCapabilities';
import { useProgressStore } from '@/src/features/courses/store/progressStore';

export default function CourseHomePage() {
  const { id } = useParams();
  const meta = useCourseLearningMeta(id);
  const modulesEnabled = Boolean(meta.data?.course.id === id);
  const vocabularyState = useCourseVocabulary(id, modulesEnabled && Boolean(meta.data?.featureConfig.vocabulary));
  const documentsState = useCourseDocuments(id, modulesEnabled && Boolean(meta.data?.featureConfig.documents));
  const practiceState = useCoursePractice(id, modulesEnabled && Boolean(meta.data?.featureConfig.practice));
  const examsState = useCourseExams(id, modulesEnabled && Boolean(meta.data?.featureConfig.exams));
  const streak = useProgressStore((state) => state.streak);
  const isLoading = meta.isLoading || (modulesEnabled && [vocabularyState, documentsState, practiceState, examsState].some((state) => state.isLoading || (!state.data && !state.loadError)));
  const loadError = meta.loadError ?? vocabularyState.loadError ?? documentsState.loadError ?? practiceState.loadError ?? examsState.loadError;

  if (isLoading) {
    return <div className="mx-auto flex min-h-[60vh] max-w-[760px] items-center justify-center px-4 text-[11px] font-semibold text-[#8b8e98]">Đang tải khóa học…</div>;
  }

  if (loadError || !meta.data) {
    return <div className="mx-auto mt-8 flex min-h-[40vh] max-w-xl items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-6 text-center text-[11px] font-semibold text-red-700">{loadError ?? 'Không tải được khóa học.'}</div>;
  }

  const { course, featureConfig } = meta.data;
  const vocabulary = vocabularyState.data?.vocabulary ?? [];
  const reviewQuestions = practiceState.data?.reviewQuestions ?? [];
  const documents = documentsState.data?.documents ?? [];
  const exams = examsState.data?.exams ?? [];
  const progress = Math.max(0, Math.min(100, course.progress));
  const coursePath = `/app/courses/${course.id}/workspace`;
  const learnedVocabulary = vocabulary.filter((item) => item.status === 'remembered' || item.status === 'learning').length;
  const visibleTabs = getVisibleCourseWorkspaceTabs(featureConfig);
  const firstTab = visibleTabs[0]?.id ?? 'vocabulary';
  const countByTab: Record<string, string> = {
    vocabulary: `${vocabulary.length} từ`,
    documents: `${documents.length} tài liệu`,
    practice: `${reviewQuestions.length} câu hỏi`,
    games: 'Luyện phản xạ',
    exams: `${exams.length} đề`,
  };
  const sections = visibleTabs.map((tab) => ({
    label: tab.label,
    hint: countByTab[tab.id] ?? tab.hint,
    tab: tab.id,
    image: tab.imageIcon,
  }));
  return (
    <div className="mx-auto w-full max-w-[760px] px-4 pt-3 sm:px-6">
      <header className="flex min-h-11 items-center justify-between gap-3">
        <Link to="/app/courses" className="flex h-9 w-9 items-center justify-center rounded-full text-[#30323a]" aria-label="Trở về khóa học"><ArrowLeft size={18} /></Link>
        <div className="min-w-0 flex-1 text-center">
          <h1 className="truncate text-[13px] font-extrabold text-[#222329]">{course.title}</h1>
          <p className="truncate text-[9px] font-medium text-[#8b8e98]">{course.level}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-flex h-8 items-center gap-1 rounded-full border border-[#ececf2] bg-white px-2.5 text-[10px] font-bold text-[#646771]"><Flame size={12} className="fill-[#ff8559] text-[#ff8559]" /> {streak}</span>
          {meta.data.podcastCount > 0 && <Link to={`${coursePath}?tab=documents`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ececf2] bg-white text-[#6f45d8]" aria-label="Mở audio khóa học"><Headphones size={14} /></Link>}
        </div>
      </header>

      <div className="relative mt-2 flex h-[138px] items-end overflow-hidden rounded-[15px] bg-[linear-gradient(135deg,#785f4b_0%,#b79872_52%,#5f4938_100%)] p-4 shadow-[0_4px_14px_rgba(20,20,35,.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,.18),transparent_35%)]" />
        <div className="relative rounded-lg bg-black/28 px-3 py-2 text-white backdrop-blur-sm">
          <strong className="block text-[15px] font-extrabold">{course.title}</strong>
          <span className="text-[9px] font-medium text-white/80">{course.currentModule || 'Không gian học tập của khóa'}</span>
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
          <strong className="block text-[12px] font-extrabold text-[#292a30]">{course.currentModule || 'Tiếp tục nội dung khóa'}</strong>
          <span className="mt-1 block text-[9px] font-medium text-[#94969f]">Giữ nhịp học từ vị trí gần nhất</span>
          <Link to={`${coursePath}?tab=${firstTab}`} className="mt-3 flex h-9 w-full items-center justify-center rounded-lg bg-[#6f45d8] text-[10px] font-extrabold text-white shadow-[0_5px_12px_rgba(111,69,216,.2)]">TIẾP TỤC HỌC →</Link>
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
          {sections.map((section, index) => (
            <Link key={section.label} to={`${coursePath}?tab=${section.tab}`} className={`flex min-h-[57px] items-center gap-3 px-3 ${index ? 'border-t border-[#eeeef3]' : ''}`}>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f7f5fc] p-1.5 text-[#6f45d8]"><img src={section.image} alt="" className="h-full w-full object-contain" /></span>
              <span className="min-w-0 flex-1"><strong className="block text-[10px] font-extrabold text-[#303138]">{section.label}</strong><small className="text-[8px] font-medium text-[#9a9ca5]">{section.hint}</small></span>
              <span className="text-[15px] font-semibold text-[#b2a7d0]">›</span>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
