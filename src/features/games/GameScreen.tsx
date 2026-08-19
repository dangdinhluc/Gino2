import { useMemo } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { FlappyVocab } from '@/src/features/games/FlappyVocab';
import { MemoryMatch } from '@/src/features/games/MemoryMatch';
import { VocabSprint } from '@/src/features/games/VocabSprint';
import { WordBuilder } from '@/src/features/games/WordBuilder';
import { useCourseLearningWorkspace } from '@/src/features/courses/hooks/useCourseLearningWorkspace';
import { generateFlappyRounds, generateVocabRounds } from '@/src/features/games/generators/fromCourseVocab';
import { generateMemoryRounds } from '@/src/features/games/generators/fromCourseVocabMemory';
import { generateBuilderRounds } from '@/src/features/games/generators/fromCourseVocabBuilder';
import type { CourseGameType } from '@/src/features/games/types';

type PublishedGameType = CourseGameType;

function normalizeGameType(gameId: string | undefined): PublishedGameType | null {
  if (gameId === 'vocab-sprint' || gameId === 'word-sprint' || gameId === 'vocabulary-sprint') return 'vocab-sprint';
  if (gameId === 'flappy-vocab') return 'flappy-vocab';
  if (gameId === 'memory-match') return 'memory-match';
  if (gameId === 'word-builder') return 'word-builder';
  return null;
}

function GameState({ message, returnTo = '/app/courses' }: { message: string; returnTo?: string }) {
  return <div className="fixed inset-0 grid place-items-center bg-[#0F1419] p-6 text-center"><div className="max-w-md space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white"><p className="text-sm font-semibold text-white/75">{message}</p><Link to={returnTo} className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-bold hover:bg-white/10"><ArrowLeft size={16} /> Về khóa học</Link></div></div>;
}

export default function GameScreen() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') ?? undefined;
  const gameType = normalizeGameType(gameId);
  const workspace = useCourseLearningWorkspace(courseId);
  const vocabulary = workspace.data?.vocabulary ?? [];
  const vocabRounds = useMemo(() => generateVocabRounds(vocabulary), [vocabulary]);
  const flappyRounds = useMemo(() => generateFlappyRounds(vocabulary), [vocabulary]);
  const memoryRounds = useMemo(() => generateMemoryRounds(vocabulary), [vocabulary]);
  const builderRounds = useMemo(() => generateBuilderRounds(vocabulary), [vocabulary]);

  if (!courseId || !gameType) return <Navigate to="/app/courses" replace />;
  if (workspace.isLoading) return <GameState message="Đang tải dữ liệu game từ khóa học…" returnTo={`/app/courses/${courseId}/learn`} />;
  if (workspace.loadError || !workspace.data) return <GameState message={workspace.loadError ?? 'Không tìm thấy khóa học đã ghi danh.'} returnTo={`/app/courses/${courseId}/learn`} />;
  if (vocabulary.length < 4) return <GameState message="Khóa học cần ít nhất 4 từ vựng đã xuất bản để mở game." returnTo={`/app/courses/${courseId}/learn`} />;
  if ((gameType === 'vocab-sprint' && !vocabRounds.length) || (gameType === 'flappy-vocab' && !flappyRounds.length) || (gameType === 'memory-match' && !memoryRounds.length) || (gameType === 'word-builder' && !builderRounds.length)) return <GameState message="Nội dung từ vựng hiện chưa phù hợp với game này." returnTo={`/app/courses/${courseId}/learn`} />;

  const returnTo = `/app/courses/${workspace.data.course.id}/learn`;
  const courseTitle = workspace.data.course.title;
  if (gameType === 'vocab-sprint') return <VocabSprint courseId={courseId} rounds={vocabRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  if (gameType === 'flappy-vocab') return <FlappyVocab courseId={courseId} rounds={flappyRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  if (gameType === 'memory-match') return <MemoryMatch courseId={courseId} rounds={memoryRounds} returnTo={returnTo} courseTitle={courseTitle} />;
  return <WordBuilder courseId={courseId} rounds={builderRounds} returnTo={returnTo} courseTitle={courseTitle} />;
}
