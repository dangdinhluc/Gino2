import { useNavigate } from 'react-router-dom';
import { useCourseGameStore } from '@/src/features/games/courseGameStore';
import type { CourseGameType } from '@/src/features/games/types';
import { GameHeroBanner } from '@/src/features/games/components/GameHeroBanner';
import { DailyChallengeCard } from '@/src/features/games/components/DailyChallengeCard';
import { GameStatsGrid } from '@/src/features/games/components/GameStatsGrid';
import { GameListSection } from '@/src/features/games/components/GameListSection';
import { RecentGameResults } from '@/src/features/games/components/RecentGameResults';
import { FloatingAudioButton } from '@/src/features/games/components/FloatingAudioButton';

export default function LearningHub() {
  const navigate = useNavigate();
  const setCourseGameContext = useCourseGameStore((state) => state.setCourseGameContext);

  const handlePlayGame = (gameType: CourseGameType) => {
    const courseId = 'tokutei-n4-sprint';
    setCourseGameContext({
      courseId,
      courseTitle: 'Tokutei Foundation Sprint',
      vocabulary: [],
      reviewQuestions: [],
      returnPath: '/app/hub',
      selectedGameType: gameType,
    });
    navigate(`/app/game/${gameType}?courseId=${encodeURIComponent(courseId)}`);
  };

  const dailyChallenge = {
    title: 'Chơi 1 game bất kỳ',
    rewardXp: 20,
    progress: 70,
    target: 1,
  };

  const stats = {
    gamesCount: 3,
    totalPlays: 12,
    bestScorePercent: 92,
  };

  return (
    <div className="mx-auto w-full max-w-xl space-y-4 pb-28 sm:pb-32">
      {/* 1. Hero Banner */}
      <GameHeroBanner />

      {/* 2. Card thử thách hôm nay */}
      <DailyChallengeCard challenge={dailyChallenge} />

      {/* 3. Ba ô thống kê */}
      <GameStatsGrid stats={stats} />

      {/* 4. Danh sách game */}
      <GameListSection onPlayGame={handlePlayGame} />

      {/* 5. Kết quả gần đây */}
      <RecentGameResults onReplay={handlePlayGame} />

      {/* 6. Floating audio/support button */}
      <FloatingAudioButton />
    </div>
  );
}
