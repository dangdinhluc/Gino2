import type { BuilderRound, LetterChip } from '@/src/features/games/types';

/**
 * Mock fallback rounds cho Word Builder (khi không có courseGameContext).
 * Vocab tiếng Nhật công việc Tokutei, viết dạng romaji.
 *
 * Spec: docs/design/new-games-mvp.md §2.3
 *
 * Constraint: word ≤ 12 chữ cái (giới hạn slot trên mobile 360px).
 */

function makeChip(id: string, char: string): LetterChip {
  return { id, char };
}

interface SeedWord {
  id: string;
  word: string;
  meaning: string;
  /** decoy phải khác mọi ký tự đã có trong word */
  decoys: string[];
}

const SEED: SeedWord[] = [
  { id: 'wb-1',  word: 'houkoku',   meaning: 'báo cáo',             decoys: ['m'] },
  { id: 'wb-2',  word: 'kyukei',    meaning: 'giờ nghỉ',            decoys: ['n'] },
  { id: 'wb-3',  word: 'tenchou',   meaning: 'quản lý cửa hàng',    decoys: ['s'] },
  { id: 'wb-4',  word: 'anzen',     meaning: 'an toàn',             decoys: ['m'] },
  { id: 'wb-5',  word: 'aisatsu',   meaning: 'chào hỏi',            decoys: ['r'] },
  { id: 'wb-6',  word: 'mensetsu',  meaning: 'phỏng vấn',           decoys: ['k'] },
  { id: 'wb-7',  word: 'rirekisho', meaning: 'hồ sơ',               decoys: ['n'] },
  { id: 'wb-8',  word: 'shorui',    meaning: 'giấy tờ, tài liệu',   decoys: ['m'] },
  { id: 'wb-9',  word: 'junbi',     meaning: 'chuẩn bị',            decoys: ['k'] },
  { id: 'wb-10', word: 'douryou',   meaning: 'đồng nghiệp',         decoys: ['s'] },
  { id: 'wb-11', word: 'kikai',     meaning: 'máy móc',             decoys: ['n', 's'] },
  { id: 'wb-12', word: 'kiken',     meaning: 'nguy hiểm',           decoys: ['m'] },
  { id: 'wb-13', word: 'renshuu',   meaning: 'luyện tập',           decoys: ['k'] },
  { id: 'wb-14', word: 'shigoto',   meaning: 'công việc',           decoys: ['n'] },
  { id: 'wb-15', word: 'kakunin',   meaning: 'kiểm tra, xác nhận',  decoys: ['s'] },
  { id: 'wb-16', word: 'ganbaru',   meaning: 'cố gắng',             decoys: ['t'] },
  { id: 'wb-17', word: 'shokuba',   meaning: 'nơi làm việc',        decoys: ['n'] },
  { id: 'wb-18', word: 'kyuuryou',  meaning: 'lương',               decoys: ['n'] },
  { id: 'wb-19', word: 'sagyou',    meaning: 'tác vụ, thao tác',    decoys: ['n'] },
  { id: 'wb-20', word: 'kunren',    meaning: 'huấn luyện',          decoys: ['s', 'a'] },
];

function buildRound(seed: SeedWord): BuilderRound {
  const wordChips = Array.from(seed.word).map((char, idx) => makeChip(`${seed.id}-w-${idx}`, char));
  const decoyChips = seed.decoys.map((char, idx) => makeChip(`${seed.id}-d-${idx}`, char));
  const letterPool = [...wordChips, ...decoyChips].sort(() => Math.random() - 0.5);

  return {
    id: seed.id,
    prompt: seed.meaning,
    data: {
      word: seed.word,
      meaning: seed.meaning,
      letterPool,
    },
  };
}

export const BUILDER_ROUNDS: BuilderRound[] = SEED.map(buildRound);

export function getShuffledBuilderRounds(count = 8): BuilderRound[] {
  return [...SEED]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, SEED.length))
    .map(buildRound);
}
