import { requireSupabase } from '@/src/features/supabase/lib/supabaseRepository';
import type { CourseGameType } from '@/src/features/games/types';

type AwardableGameType = CourseGameType;

export interface GameCompletionAward {
  awarded: boolean;
  xpAwarded: number;
  completedAt: string | null;
}

export function isAwardableGameType(gameType: CourseGameType | undefined): gameType is AwardableGameType {
  return gameType === 'vocab-sprint' || gameType === 'flappy-vocab' || gameType === 'memory-match' || gameType === 'word-builder';
}

export async function recordGameCompletion(courseId: string, gameType: AwardableGameType): Promise<GameCompletionAward> {
  const { data, error } = await requireSupabase().rpc('record_game_completion', {
    target_course_id: courseId,
    target_game_type: gameType,
  });
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Máy chủ không xác nhận lượt chơi.');
  return {
    awarded: Boolean(result.awarded),
    xpAwarded: Number(result.xp_awarded),
    completedAt: result.completed_at,
  };
}
