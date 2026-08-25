import { motion, useReducedMotion } from 'motion/react';
import type { CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { cn } from '@/src/lib/utils';
import { DocumentsSkeleton } from './DocumentsSkeleton';
import { ExamsSkeleton } from './ExamsSkeleton';
import { GamesSkeleton } from './GamesSkeleton';
import { PracticeSkeleton } from './PracticeSkeleton';
import { VocabularySkeleton } from './VocabularySkeleton';

const loadingMessages: Record<CourseWorkspaceSection, string> = {
  vocabulary: 'Đang chuẩn bị từ vựng cho bạn…',
  documents: 'Đang chuẩn bị tài liệu cho bạn…',
  practice: 'Đang chuẩn bị bài luyện cho bạn…',
  games: 'Đang chuẩn bị game cho bạn…',
  exams: 'Đang chuẩn bị đề thi cho bạn…',
};

export function CourseLearningSkeleton({
  activeTab,
  showStatus,
}: {
  activeTab: CourseWorkspaceSection;
  showStatus: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div aria-busy="true" className="space-y-3">
      <motion.div
        aria-hidden="true"
        className={cn('course-learning-skeleton', activeTab === 'practice' || activeTab === 'exams' ? 'lg:max-w-none' : '')}
        initial={reducedMotion ? false : { opacity: 0.72 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reducedMotion ? 0 : 0.16 }}
      >
        {activeTab === 'vocabulary' && <VocabularySkeleton />}
        {activeTab === 'documents' && <DocumentsSkeleton />}
        {activeTab === 'practice' && <PracticeSkeleton />}
        {activeTab === 'games' && <GamesSkeleton />}
        {activeTab === 'exams' && <ExamsSkeleton />}
      </motion.div>

      {showStatus && <p role="status" aria-live="polite" className="px-1 text-center text-[11px] font-semibold text-[#858091]">{loadingMessages[activeTab]}</p>}
    </div>
  );
}
