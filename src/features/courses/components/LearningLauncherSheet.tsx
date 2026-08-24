import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { CourseLearningWorkspaceData } from '@/src/features/courses/courseLearning.types';
import { fetchCourseLearningWorkspace } from '@/src/features/courses/repositories/courseLearningRepository';
import { getVisibleCourseWorkspaceTabs } from '@/src/features/courses/lib/courseCapabilities';
import { type CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';
import { assets } from '@/src/shared/lib/assets';

interface LearningLauncherSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

function moduleSummary(section: CourseWorkspaceSection, workspace: CourseLearningWorkspaceData): string {
  switch (section) {
    case 'vocabulary': {
      const dueCount = workspace.vocabulary.filter((item) => item.status !== 'remembered').length;
      return dueCount > 0 ? `${dueCount} từ cần học` : 'Đã ôn xong hôm nay';
    }
    case 'documents':
      return workspace.documents.length > 0 ? `${workspace.documents.length} tài liệu` : 'Tài liệu theo khóa';
    case 'practice':
      return workspace.reviewQuestions.length > 0 ? `${workspace.reviewQuestions.length} câu hỏi` : 'Bài tập theo khóa';
    case 'games':
      return workspace.games.length > 0 ? `${workspace.games.length} trò chơi` : 'Học bằng trò chơi';
    case 'exams':
      return workspace.exams.length > 0 ? `${workspace.exams.length} đề thi` : 'Đề thi của khóa';
  }
}

export function LearningLauncherSheet({ isOpen, onClose }: LearningLauncherSheetProps) {
  const navigate = useNavigate();
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const activeCourseStatus = useActiveCourseStore((state) => state.status);
  const [workspace, setWorkspace] = useState<CourseLearningWorkspaceData | null>(null);
  const [loadedCourseId, setLoadedCourseId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;

    const root = document.documentElement;
    const body = document.body;
    const scrollContainer = document.querySelector<HTMLElement>('.desktop-workspace-main');
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousScrollOverflow = scrollContainer?.style.overflowY;

    root.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    if (scrollContainer) scrollContainer.style.overflowY = 'hidden';

    return () => {
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      if (scrollContainer) scrollContainer.style.overflowY = previousScrollOverflow ?? '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeCourseStatus !== 'ready' || !activeCourseId || loadedCourseId === activeCourseId) {
      return undefined;
    }

    let cancelled = false;
    setWorkspace(null);
    setLoadError(null);
    setIsLoading(true);

    fetchCourseLearningWorkspace(activeCourseId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setLoadError('Không tìm thấy nội dung khóa học đang học.');
        } else {
          setWorkspace(data);
        }
        setLoadedCourseId(activeCourseId);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setLoadError(error instanceof Error ? error.message : 'Không tải được nội dung khóa học.');
        setLoadedCourseId(activeCourseId);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      setIsLoading(false);
    };
  }, [activeCourseId, activeCourseStatus, isOpen, loadedCourseId]);

  const activeWorkspace = workspace?.course.id === activeCourseId ? workspace : null;
  const visibleTabs = useMemo(
    () => activeWorkspace ? getVisibleCourseWorkspaceTabs(activeWorkspace.featureConfig) : [],
    [activeWorkspace],
  );
  const firstTab = visibleTabs[0]?.id ?? 'vocabulary';
  const workspacePath = activeCourseId ? `/app/courses/${activeCourseId}/workspace` : '/app/courses';
  const continuePath = `${workspacePath}?tab=${firstTab}`;

  const navigateTo = (path: string) => {
    onClose();
    navigate(path);
  };

  const retry = () => {
    setWorkspace(null);
    setLoadError(null);
    setLoadedCourseId(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-40 flex touch-none items-end justify-center bg-[#130f24]/40 p-0 backdrop-blur-[3px] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="Học ngay"
            initial={{ y: '100%', opacity: 0.95 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex max-h-[90dvh] min-h-0 w-full max-w-[500px] flex-col overflow-hidden rounded-t-[32px] border-t border-[#ebe3fa] bg-white shadow-[0_-16px_50px_rgba(25,15,50,0.2)]"
          >
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-b from-[#eadefc] via-[#f4efff] to-white px-5 pb-3 pt-2.5">
              <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-[#c8bde3]/70" />

              <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/85 text-[#636573] shadow-xs backdrop-blur-xs transition-all hover:bg-white hover:text-[#1e1f26] active:scale-95"
                aria-label="Đóng Học ngay"
              >
                <X size={17} strokeWidth={2.4} />
              </button>

              <div className="relative flex items-center justify-between pr-8 pt-1">
                <div className="relative flex items-center">
                  <img
                    src={assets.shared.mascots.speechBubble}
                    alt="一緒に勉強しよう!"
                    className="h-auto w-[130px] drop-shadow-[0_4px_10px_rgba(111,69,216,0.12)] sm:w-[145px]"
                  />
                  <span className="absolute -right-3 -top-1 text-base animate-pulse">✨</span>
                </div>
                <div className="relative flex h-[100px] w-[100px] items-end justify-center sm:h-[110px] sm:w-[110px]">
                  <img
                    src={assets.shared.mascots.tanukiWaving}
                    alt="Tanuki"
                    className="h-full w-full object-contain drop-shadow-[0_6px_16px_rgba(111,69,216,0.16)]"
                  />
                </div>
              </div>

              <div className="mt-1 text-center">
                <h2 className="flex items-center justify-center gap-1.5 text-[22px] font-black tracking-tight text-[#1e1e24]">
                  <span className="text-[#7144e8]">⚡</span>
                  <span>Học ngay</span>
                </h2>
                <p className="mt-0.5 text-[12.5px] font-medium text-[#646675]">Mở khóa học và bắt đầu từ đúng vị trí của bạn.</p>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 pb-[calc(6.5rem+env(safe-area-inset-bottom))] pt-3 touch-pan-y">
              {activeCourseStatus !== 'ready' && (
                <div className="space-y-3 rounded-[22px] border border-[#eae6f4] bg-white p-4" role="status">
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-[#eeeaf8]" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-[#f4f1fb]" />
                  <div className="h-12 w-full animate-pulse rounded-2xl bg-[#f4f1fb]" />
                </div>
              )}

              {activeCourseStatus === 'ready' && !activeCourseId && (
                <div className="rounded-[24px] border border-[#ded3f8] bg-[#f8f5ff] p-5 text-center">
                  <p className="text-[15px] font-black text-[#2a2143]">Bạn chưa chọn khóa học</p>
                  <p className="mt-1.5 text-[11px] font-medium leading-5 text-[#777083]">Chọn một khóa để Học ngay luôn mở đúng nội dung của bạn.</p>
                  <button
                    type="button"
                    onClick={() => navigateTo('/app/courses')}
                    className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#6f45d8] px-5 text-[12px] font-black text-white shadow-[0_5px_14px_rgba(111,69,216,.22)] active:scale-[.98]"
                  >
                    Chọn khóa học <ChevronRight size={15} />
                  </button>
                </div>
              )}

              {activeCourseId && isLoading && !activeWorkspace && (
                <div className="space-y-3 rounded-[22px] border border-[#eae6f4] bg-white p-4" role="status">
                  <div className="flex items-center gap-3"><Loader2 size={17} className="animate-spin text-[#6f45d8]" /><span className="text-[12px] font-bold text-[#6f45d8]">Đang mở khóa học…</span></div>
                  <div className="h-2 animate-pulse rounded-full bg-[#eeeaf8]" />
                  <div className="h-14 animate-pulse rounded-2xl bg-[#f7f4fd]" />
                </div>
              )}

              {activeCourseId && loadError && !isLoading && (
                <div className="rounded-[22px] border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-[12px] font-bold text-red-700">{loadError}</p>
                  <button type="button" onClick={retry} className="mt-3 min-h-11 rounded-full bg-white px-4 text-[11px] font-black text-red-700 shadow-xs">Thử lại</button>
                </div>
              )}

              {activeWorkspace && (
                <>
                  <section className="rounded-[22px] border border-[#e3d8fb] bg-[#faf8ff] p-4" aria-label={`Khóa học ${activeWorkspace.course.title}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-black text-[#27203d]">{activeWorkspace.course.title}</p>
                        <p className="mt-1 truncate text-[11px] font-semibold text-[#858091]">{activeWorkspace.course.currentModule}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateTo('/app/courses#course-switcher')}
                        className="inline-flex min-h-11 shrink-0 items-center gap-0.5 rounded-full px-2 text-[11px] font-black text-[#6f45d8] active:bg-[#eee8ff]"
                      >
                        Đổi khóa <ChevronRight size={14} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px] font-black text-[#6f45d8]">
                      <span>Tiến độ</span><span>{activeWorkspace.course.progress}%</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#eae4f8]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={activeWorkspace.course.progress} aria-label={`Tiến độ ${activeWorkspace.course.title}`}>
                      <div className="h-full rounded-full bg-gradient-to-r from-[#6f45d8] to-[#a98af4]" style={{ width: `${activeWorkspace.course.progress}%` }} />
                    </div>
                  </section>

                  <button
                    type="button"
                    onClick={() => navigateTo(continuePath)}
                    className="flex min-h-[64px] w-full items-center justify-between rounded-[22px] bg-[#6f45d8] px-4 text-left text-white shadow-[0_8px_18px_rgba(111,69,216,.22)] transition-transform active:scale-[.99]"
                  >
                    <span className="min-w-0">
                      <strong className="block text-[13px] font-black">▶ TIẾP TỤC BÀI ĐANG HỌC</strong>
                      <span className="mt-1 block truncate text-[10px] font-semibold text-white/75">{activeWorkspace.course.currentModule}</span>
                    </span>
                    <ChevronRight size={20} className="shrink-0" />
                  </button>

                  <div className="space-y-2" aria-label="Nội dung học trong khóa">
                    {visibleTabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => navigateTo(`${workspacePath}?tab=${tab.id}`)}
                        className="flex min-h-[66px] w-full items-center gap-3 rounded-[20px] border border-[#eae6f4] bg-white px-3.5 text-left shadow-[0_2px_8px_rgba(0,0,0,0.025)] transition-colors hover:border-[#ded6f3] hover:bg-[#faf9fe] active:scale-[.99]"
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f6f2ff] p-1.5"><img src={tab.imageIcon} alt="" className="h-full w-full object-contain" /></span>
                        <span className="min-w-0 flex-1">
                          <strong className="block text-[14px] font-extrabold text-[#292a32]">{tab.label}</strong>
                          <span className="mt-0.5 block truncate text-[11px] font-medium text-[#858794]">{moduleSummary(tab.id, activeWorkspace)}</span>
                        </span>
                        <ChevronRight size={18} className="shrink-0 text-[#aaa0c3]" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
