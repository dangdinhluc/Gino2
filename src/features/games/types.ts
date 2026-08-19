import type { LucideIcon } from 'lucide-react';

export type CourseGameType =
  | 'vocab-sprint'
  | 'flappy-vocab'
  | 'memory-match'
  | 'word-builder';

export type GameId = CourseGameType | 'daily-challenge';

export type GameStatus = 'idle' | 'playing' | 'feedback' | 'complete';

export interface GameConfig {
  id: GameId;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  level: string;
}

export interface GameRound {
  id: string;
  prompt: string;
  data: Record<string, unknown>;
}

export interface GameResult {
  gameId: GameId;
  score: number;
  maxScore: number;
  combo: number;
  rounds: number;
  correct: number;
  wrong: string[];
  completedAt: string;
}

export interface FeedbackState {
  visible: boolean;
  correct: boolean;
  message: string;
  detail?: string;
}

/* ────────────────────────────────────────────────────────────
 * Memory Match — lật bài ghép cặp từ vựng
 * ──────────────────────────────────────────────────────────── */

export interface MemoryPair {
  /** unique trong 1 round */
  id: string;
  /** cụm tiếng Nhật romaji: "houkoku" */
  word: string;
  /** nghĩa tiếng Việt: "báo cáo" */
  meaning: string;
  /** map về CourseVocabularyItem.id để push SRS khi miss */
  sourceVocabId?: string;
}

export interface MemoryRound extends GameRound {
  data: {
    pairs: MemoryPair[];
    /** số cột grid: 3 cho mobile hẹp, 4 mặc định */
    gridCols: 3 | 4;
    /** thời gian giới hạn cho cả session (giữ cross-round); default 90s */
    timeLimitSec?: number;
  };
}

/* ────────────────────────────────────────────────────────────
 * Word Builder — xếp chữ thành cụm tiếng Nhật romaji
 * ──────────────────────────────────────────────────────────── */

export interface LetterChip {
  /** unique trong 1 round */
  id: string;
  /** ký tự đơn: 'h', 'o', 'u', ... */
  char: string;
}

export interface BuilderRound extends GameRound {
  data: {
    /** đáp án dạng romaji: "houkoku" */
    word: string;
    /** nghĩa tiếng Việt: "báo cáo" */
    meaning: string;
    /** pool chữ cái = chữ trong word + 1-2 decoy */
    letterPool: LetterChip[];
    /** map về CourseVocabularyItem.id để push SRS */
    sourceVocabId?: string;
  };
}
