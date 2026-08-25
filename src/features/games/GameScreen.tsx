import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FlappyVocab } from '@/src/features/games/FlappyVocab';
import { MemoryMatch } from '@/src/features/games/MemoryMatch';
import { VocabSprint } from '@/src/features/games/VocabSprint';
import { WordBuilder } from '@/src/features/games/WordBuilder';
import { useCourseLearningMeta, useCourseGames } from '@/src/features/courses/hooks/useCourseLearningModules';
import { generateFlappyRounds, generateVocabRounds } from '@/src/features/games/generators/fromCourseVocab';
import { generateMemoryRounds } from '@/src/features/games/generators/fromCourseVocabMemory';
import { generateBuilderRounds } from '@/src/features/games/generators/fromCourseVocabBuilder';
import type { CourseGameType } from '@/src/features/games/types';
import { useActiveCourseStore } from '@/src/features/courses/store/activeCourseStore';
import { PageLoading } from '@/src/shared/components/loading/PageLoading';

type PublishedGameType = CourseGameType;

function normalizeGameType(gameId: string | undefined): PublishedGameType | null {
  if (gameId === 'vocab-sprint' || gameId === 'word-sprint' || gameId === 'vocabulary-sprint') return 'vocab-sprint';
  if (gameId === 'flappy-vocab') return 'flappy-vocab';
  if (gameId === 'memory-match') return 'memory-match';
  if (gameId === 'word-builder') return 'word-builder';
  return null;
}

function GameState({ message, returnTo = '/app/courses' }: { message: string; returnTo?: string }) {
  const returnLabel = returnTo === '/app/dashboard' ? 'Về Hôm nay' : 'Về khóa học';
  return <div className="fixed inset-0 grid place-items-center bg-[#0F1419] p-6 text-center"><div className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white"><p className="text-sm font-semibold text-white/75">{message}</p><Link to={returnTo} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/10"><ArrowLeft size={16} /> {returnLabel}</Link></div></div>;
}

export default function GameScreen() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const requestedCourseId = searchParams.get('courseId') ?? undefined;
  const activeCourseId = useActiveCourseStore((state) => state.activeCourseId);
  const activeCourseStatus = useActiveCourseStore((state) => state.status);
  const courseId = activeCourseId ?? undefined;
  const gameType = normalizeGameType(gameId);
  const canLoad = activeCourseStatus === 'ready' && Boolean(courseId) && requestedCourseId === courseId && Boolean(gameType);
  const meta = useCourseLearningMeta(courseId, canLoad);
  const games = useCourseGames(courseId, canLoad);
  const vocabulary = useMemo(() => games.data?.vocabulary ?? [], [games.data]);
  const vocabRounds = useMemo(() => generateVocabRounds(vocabulary), [vocabulary]);
  const flappyRounds = useMemo(() => generateFlappyRounds(vocabulary), [vocabulary]);
  const memoryRounds = useMemo(() => generateMemoryRounds(vocabulary), [vocabulary]);
  const builderRounds = useMemo(() => generateBuilderRounds(vocabulary), [vocabulary]);

  if (activeCourseStatus !== 'ready') return <PageLoading variant="games" />;
  if (!courseId || requestedCourseId !== courseId || !gameType) return <Navigate to="/app/courses" replace />;
  if (meta.isLoading || games.isLoading) return <PageLoading variant="games" />;
  if (meta.loadError || games.loadError || !meta.data || !games.data) return <GameState message={meta.loadError ?? games.loadError ?? 'Không tìm thấy khóa học đã ghi danh.'} returnTo="/app/dashboard" />;
  if (vocabulary.length < 4) return <GameState message="Khóa học cần ít nhất 4 từ vựng đã xuất bản để mở game." returnTo="/app/dashboard" />;
  if ((gameType === 'vocab-sprint' && !vocabRounds.length) || (gameType === 'flappy-vocab' && !flappyRounds.length) || (gameType === 'memory-match' && !memoryRounds.length) || (gameType === 'word-builder' && !builderRounds.length)) return <GameState message="Nội dung từ vựng hiện chưa phù hợp với game này." returnTo="/app/dashboard" />;

  const returnTo = '/app/dashboard';
  const courseTitle = meta.data.course.title;
  if (gameType === 'vocab-sprint') return <VocabSprint courseId={courseId} rounds={vocabRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  if (gameType === 'flappy-vocab') return <FlappyVocab courseId={courseId} rounds={flappyRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  if (gameType === 'memory-match') return <MemoryMatch courseId={courseId} rounds={memoryRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  return <WordBuilder courseId={courseId} rounds={builderRounds} returnTo={returnTo} courseTitle={courseTitle} />;
}
