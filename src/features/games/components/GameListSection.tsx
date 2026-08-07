import React from 'react';
import { Play, RotateCcw, Clock } from 'lucide-react';
import type { CourseGameType } from '@/src/features/games/types';
import { assetPath } from '@/src/shared/lib/assets';

export interface GameListItem {
  type: CourseGameType;
  title: string;
  badge: string;
  badgeColor: 'purple' | 'orange' | 'green';
  description: string;
  rounds: number;
  duration: string;
  thumbnail: string;
}

interface GameListSectionProps {
  games?: GameListItem[];
  onPlayGame: (gameType: CourseGameType) => void;
}

const defaultGames: GameListItem[] = [
  {
    type: 'flappy-vocab',
    title: 'Flappy Vocab',
    badge: 'Phản xạ',
    badgeColor: 'purple',
    description: 'Bay qua thử thách và chọn đúng nghĩa của từ đang học.',
    rounds: 6,
    duration: '2 phút',
    thumbnail: assetPath('assets/thumb_flappy.png'),
  },
  {
    type: 'vocab-sprint',
    title: 'Vocab Sprint',
    badge: 'Tốc độ',
    badgeColor: 'orange',
    description: 'Chọn nghĩa đúng thật nhanh để củng cố nhóm từ vừa học.',
    rounds: 6,
    duration: '1 phút',
    thumbnail: assetPath('assets/thumb_sprint.png'),
  },
  {
    type: 'situation-game',
    title: 'Tình huống',
    badge: 'Hội thoại',
    badgeColor: 'green',
    description: 'Xử lý tình huống bằng câu hỏi ôn tập của khóa này.',
    rounds: 4,
    duration: '2 phút',
    thumbnail: assetPath('assets/thumb_situation.png'),
  },
];

const badgeStyleMap = {
  purple: 'bg-purple-100/90 text-purple-700 border-purple-200',
  orange: 'bg-orange-100/90 text-orange-700 border-orange-200',
  green: 'bg-emerald-100/90 text-emerald-700 border-emerald-200',
};

export function GameListSection({ games = defaultGames, onPlayGame }: GameListSectionProps) {
  return (
    <section className="space-y-3">
      {games.map((game) => (
        <div
          key={game.type}
          className="group relative flex items-center justify-between gap-3 rounded-[24px] border border-[#f5ece1] bg-white p-3 sm:p-4 shadow-[0_6px_20px_rgba(217,74,19,0.05)] transition-all duration-200 hover:border-orange-300 hover:shadow-[0_12px_28px_rgba(217,74,19,0.11)]"
        >
          {/* Game Thumbnail */}
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-[#fff9f3] sm:h-24 sm:w-24 border border-orange-200/40">
            <img
              src={game.thumbnail}
              alt={game.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Game Info */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="font-[var(--font-heading)] text-sm font-black text-[#0f172a] sm:text-base truncate">
                {game.title}
              </h3>
              <span
                className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-extrabold ${badgeStyleMap[game.badgeColor]}`}
              >
                {game.badge}
              </span>
            </div>

            <p className="text-xs font-semibold leading-relaxed text-[#5f6b7c] line-clamp-2">
              {game.description}
            </p>

            <div className="flex items-center gap-2 pt-0.5 text-[11px] font-extrabold text-[#717d8f]">
              <span className="flex items-center gap-1">
                <RotateCcw size={12} className="text-[#d83a00]" />
                {game.rounds} vòng
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-[#d83a00]" />
                {game.duration}
              </span>
            </div>
          </div>

          {/* Play Button */}
          <button
            type="button"
            onClick={() => onPlayGame(game.type)}
            className="flex h-10 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-[#d83a00] to-[#e65100] px-4 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:shadow-md hover:brightness-110 active:scale-95 shrink-0"
          >
            <Play size={13} fill="currentColor" />
            <span>Chơi</span>
          </button>
        </div>
      ))}
    </section>
  );
}
