import type { MemoryRound } from '@/src/features/games/types';

/**
 * Mock fallback rounds cho Memory Match (khi không có courseGameContext).
 * Vocab tiếng Nhật công việc Tokutei (romaji + nghĩa Việt), mỗi round 1 chủ đề.
 *
 * Spec: docs/design/new-games-mvp.md §2.3
 */
export const MEMORY_ROUNDS: MemoryRound[] = [
  {
    id: 'mem-r1',
    prompt: 'Vào ca & giao tiếp',
    data: {
      gridCols: 4,
      timeLimitSec: 90,
      pairs: [
        { id: 'mem-r1-p1', word: 'ohayou gozaimasu', meaning: 'chào buổi sáng' },
        { id: 'mem-r1-p2', word: 'houkoku', meaning: 'báo cáo' },
        { id: 'mem-r1-p3', word: 'kyukei', meaning: 'giờ nghỉ' },
        { id: 'mem-r1-p4', word: 'tenchou', meaning: 'quản lý cửa hàng' },
        { id: 'mem-r1-p5', word: 'anzen', meaning: 'an toàn' },
        { id: 'mem-r1-p6', word: 'aisatsu', meaning: 'chào hỏi' },
      ],
    },
  },
  {
    id: 'mem-r2',
    prompt: 'Hồ sơ & giấy tờ',
    data: {
      gridCols: 4,
      timeLimitSec: 90,
      pairs: [
        { id: 'mem-r2-p1', word: 'zairyu card', meaning: 'thẻ cư trú' },
        { id: 'mem-r2-p2', word: 'mensetsu', meaning: 'phỏng vấn' },
        { id: 'mem-r2-p3', word: 'rirekisho', meaning: 'hồ sơ' },
        { id: 'mem-r2-p4', word: 'shashin', meaning: 'ảnh hồ sơ' },
        { id: 'mem-r2-p5', word: 'pasupooto', meaning: 'hộ chiếu' },
        { id: 'mem-r2-p6', word: 'kakunin', meaning: 'kiểm tra, xác nhận' },
        { id: 'mem-r2-p7', word: 'shorui', meaning: 'giấy tờ, tài liệu' },
        { id: 'mem-r2-p8', word: 'moshikomi', meaning: 'đăng ký, nộp hồ sơ' },
      ],
    },
  },
  {
    id: 'mem-r3',
    prompt: 'Tác phong & an toàn nơi làm việc',
    data: {
      gridCols: 4,
      timeLimitSec: 90,
      pairs: [
        { id: 'mem-r3-p1', word: 'shigoto', meaning: 'công việc' },
        { id: 'mem-r3-p2', word: 'kikai', meaning: 'máy móc' },
        { id: 'mem-r3-p3', word: 'kiken', meaning: 'nguy hiểm' },
        { id: 'mem-r3-p4', word: 'renshuu', meaning: 'luyện tập' },
        { id: 'mem-r3-p5', word: 'junbi', meaning: 'chuẩn bị' },
        { id: 'mem-r3-p6', word: 'douryou', meaning: 'đồng nghiệp' },
      ],
    },
  },
];

/**
 * Lấy tối đa `count` round được trộn ngẫu nhiên.
 * Pattern giống `getShuffledVocabRounds` để consistent.
 */
export function getShuffledMemoryRounds(count = 3): MemoryRound[] {
  return [...MEMORY_ROUNDS]
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(count, MEMORY_ROUNDS.length));
}
