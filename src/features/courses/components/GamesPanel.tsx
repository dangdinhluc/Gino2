import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import type { CourseVocabularyItem } from '@/src/features/courses/courseLearning.types';
import type { CourseGameType } from '@/src/features/games/types';
import { assets } from '@/src/shared/lib/assets';

interface CourseGameCard {
  type: CourseGameType;
  title: string;
  subtitle: string;
  thumbnail: string;
}

function getAvailableCourseGames(vocabulary: CourseVocabularyItem[]): CourseGameCard[] {
  if (vocabulary.length < 4) return [];
  return [
    { type: 'flappy-vocab', title: 'Flappy Vocab', subtitle: 'Bay & học từ vựng', thumbnail: assets.games.thumbnails.flappy },
    { type: 'vocab-sprint', title: 'Vocab Sprint', subtitle: 'Đua tốc độ', thumbnail: assets.games.thumbnails.sprint },
    { type: 'memory-match', title: 'Memory Match', subtitle: 'Ghi nhớ cặp từ', thumbnail: assets.games.thumbnails.situation },
    { type: 'word-builder', title: 'Word Builder', subtitle: 'Xếp chữ', thumbnail: assets.games.mascot },
  ];
}

interface GamesPanelProps {
  courseId: string;
  courseTitle: string;
  vocabulary: CourseVocabularyItem[];
}

export function GamesPanel({ courseId, courseTitle, vocabulary }: GamesPanelProps) {
  const navigate = useNavigate();
  const games = useMemo(() => getAvailableCourseGames(vocabulary), [vocabulary]);

  return (
    <div className="mx-auto w-full max-w-[620px] space-y-2.5">
      <p className="px-1 text-[9px] font-medium text-[#989aa3]">Game sử dụng từ vựng của {courseTitle}.</p>

      {games.length === 0 ? (
        <div className="rounded-[13px] border border-dashed border-[#dedbe6] bg-white px-4 py-8 text-center">
          <img src={assets.games.mascot} alt="" className="mx-auto h-16 w-16 object-contain opacity-80" />
          <strong className="mt-2 block text-[11px] font-extrabold text-[#34353b]">Chưa đủ từ để mở game</strong>
          <span className="mt-1 block text-[9px] text-[#9597a0]">Cần ít nhất 4 từ vựng trong khóa.</span>
        </div>
      ) : (
        games.map((game) => (
          <article key={game.type} className="flex min-h-[78px] items-center gap-3 rounded-[13px] border border-[#e8e8ef] bg-white p-2.5 shadow-[0_2px_8px_rgba(25,25,40,.025)]">
            <div className="h-14 w-16 shrink-0 overflow-hidden rounded-[10px] bg-[#f5f3fa]">
              <img src={game.thumbnail} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <strong className="block truncate text-[11px] font-extrabold text-[#303138]">{game.title}</strong>
              <span className="mt-1 block text-[9px] font-medium text-[#9698a1]">{game.subtitle}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/app/game/${game.type}?courseId=${encodeURIComponent(courseId)}`)}
              className="inline-flex h-8 shrink-0 items-center gap-1 rounded-lg border border-[#d4c9ee] bg-[#fbf9ff] px-2.5 text-[9px] font-extrabold text-[#6f45d8] hover:bg-[#f4f0ff]"
            >
              <Play size={11} fill="currentColor" /> Chơi ngay
            </button>
          </article>
        ))
      )}
    </div>
  );
}
