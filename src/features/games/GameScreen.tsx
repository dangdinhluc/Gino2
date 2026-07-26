import { useMemo } from 'react';
import { Link, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';
import { FlappyVocab } from '@/src/features/games/FlappyVocab';
import { MemoryMatch } from '@/src/features/games/MemoryMatch';
import { SituationGame } from '@/src/features/games/SituationGame';
import { VocabSprint } from '@/src/features/games/VocabSprint';
import { WordBuilder } from '@/src/features/games/WordBuilder';
import { getCourseLearningWorkspace } from '@/src/features/courses/mock/courseLearningMock';
import { useCourseGameStore, type CourseGameContext } from '@/src/features/games/courseGameStore';
import { generateFlappyRounds, generateVocabRounds } from '@/src/features/games/generators/fromCourseVocab';
import { generateMemoryRounds } from '@/src/features/games/generators/fromCourseVocabMemory';
import { generateBuilderRounds } from '@/src/features/games/generators/fromCourseVocabBuilder';
import { generateSituationRounds } from '@/src/features/games/generators/fromCourseReview';
import type { CourseGameType } from '@/src/features/games/types';

type NormalizedGameType = CourseGameType | 'daily-challenge';

function normalizeGameType(gameId: string | undefined): NormalizedGameType | null {
  if (gameId === 'vocab-sprint' || gameId === 'word-sprint' || gameId === 'vocabulary-sprint') {
    return 'vocab-sprint';
  }

  if (gameId === 'flappy-vocab' || gameId === 'daily-challenge') {
    return gameId;
  }

  if (gameId === 'situation-game' || gameId === 'fill-blank' || gameId === 'sentence-builder') {
    return 'situation-game';
  }

  if (gameId === 'memory-match') {
    return 'memory-match';
  }

  if (gameId === 'word-builder') {
    return 'word-builder';
  }

  return null;
}

function buildCourseContext(courseId: string): CourseGameContext {
  const workspace = getCourseLearningWorkspace(courseId);

  return {
    courseId: workspace.course.id,
    courseTitle: workspace.course.title,
    vocabulary: workspace.vocabulary,
    reviewQuestions: workspace.reviewQuestions,
    returnPath: `/app/courses/${workspace.course.id}/learn`,
  };
}

interface ComingSoonProps {
  title: string;
  accent: string;
  phaseLabel: string;
}

function ComingSoon({ title, accent, phaseLabel }: ComingSoonProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 bg-[#0F1419] p-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-3xl text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}
        aria-hidden="true"
      >
        <Construction size={36} />
      </div>
      <div>
        <h1 className="text-2xl font-black text-white">{title}</h1>
        <p className="mt-2 max-w-sm text-sm font-semibold text-white/60">
          Game này đang được phát triển ở {phaseLabel}. Em sẽ ship sớm nhất có thể!
        </p>
      </div>
      <Link
        to="/app/hub"
        className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
      >
        <ArrowLeft size={16} /> Về Hub
      </Link>
    </div>
  );
}

export default function GameScreen() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const storeContext = useCourseGameStore((state) => state.context);
  const normalizedGameType = normalizeGameType(gameId);
  const courseId = searchParams.get('courseId') ?? undefined;

  const courseContext = useMemo(() => {
    if (!courseId) {
      return null;
    }

    if (storeContext?.courseId === courseId) {
      return storeContext;
    }

    return buildCourseContext(courseId);
  }, [courseId, storeContext]);

  const vocabRounds = useMemo(() => (courseContext ? generateVocabRounds(courseContext.vocabulary) : undefined), [courseContext]);
  const flappyRounds = useMemo(() => (courseContext ? generateFlappyRounds(courseContext.vocabulary) : undefined), [courseContext]);
  const memoryRounds = useMemo(() => (courseContext ? generateMemoryRounds(courseContext.vocabulary) : undefined), [courseContext]);
  const builderRounds = useMemo(() => (courseContext ? generateBuilderRounds(courseContext.vocabulary) : undefined), [courseContext]);
  const situationRounds = useMemo(() => (courseContext ? generateSituationRounds(courseContext.reviewQuestions) : undefined), [courseContext]);
  const returnTo = courseContext?.returnPath;
  const courseTitle = courseContext?.courseTitle;

  if (normalizedGameType === 'vocab-sprint') {
    return <VocabSprint rounds={vocabRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  }

  if (normalizedGameType === 'flappy-vocab' || normalizedGameType === 'daily-challenge') {
    return <FlappyVocab rounds={flappyRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  }

  if (normalizedGameType === 'situation-game') {
    return <SituationGame rounds={situationRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  }

  if (normalizedGameType === 'memory-match') {
    return <MemoryMatch rounds={memoryRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  }

  if (normalizedGameType === 'word-builder') {
    return <WordBuilder rounds={builderRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  }

  return <Navigate to="/app/hub" replace />;
}
