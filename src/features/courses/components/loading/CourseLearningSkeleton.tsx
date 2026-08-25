import { motion, useIsPresent, useReducedMotion } from 'motion/react';
import type { CourseWorkspaceSection } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { cn } from '@/src/lib/utils';
import { DocumentsSkeleton } from './DocumentsSkeleton';
import { ExamsSkeleton } from './ExamsSkeleton';
import { GamesSkeleton } from './GamesSkeleton';
import { MascotLoadingCompanion } from './MascotLoadingCompanion';
import { PracticeSkeleton } from './PracticeSkeleton';
import { VocabularySkeleton } from './VocabularySkeleton';

export function CourseLearningSkeleton({
  activeTab,
  showDelayedMascot,
}: {
  activeTab: CourseWorkspaceSection;
  showDelayedMascot: boolean;
}) {
  const isPresent = useIsPresent();
  const reducedMotion = useReducedMotion();

  return (
    <div aria-busy={isPresent} className="space-y-3">
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

      <MascotLoadingCompanion mode={activeTab} visible={showDelayedMascot && isPresent} />
    </div>
  );
}
