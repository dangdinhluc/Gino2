import type { GameRound } from '@/src/features/games/types';

export interface VocabRound extends GameRound {
  data: { word: string; meaning: string; options: string[] };
}

/** Tokutei Gino vocabulary — workplace Japanese for Vietnamese workers */
export const VOCAB_ROUNDS: VocabRound[] = [
  { id: 'v-1', prompt: '"houkoku" nghĩa là gì?', data: { word: 'houkoku', meaning: 'báo cáo', options: ['báo cáo', 'giờ nghỉ', 'quản lý', 'an toàn'] } },
  { id: 'v-2', prompt: '"anzen" nghĩa là gì?', data: { word: 'anzen', meaning: 'an toàn', options: ['an toàn', 'hồ sơ', 'ca tối', 'quản lý'] } },
  { id: 'v-3', prompt: '"kyukei" nghĩa là gì?', data: { word: 'kyukei', meaning: 'giờ nghỉ', options: ['giờ nghỉ', 'điểm danh', 'báo cáo', 'phỏng vấn'] } },
  { id: 'v-4', prompt: '"tenchou" nghĩa là gì?', data: { word: 'tenchou', meaning: 'quản lý cửa hàng', options: ['quản lý cửa hàng', 'đồng nghiệp', 'khách hàng', 'nhân sự'] } },
  { id: 'v-5', prompt: '"soudan" nghĩa là gì?', data: { word: 'soudan', meaning: 'trao đổi/tham vấn', options: ['trao đổi/tham vấn', 'báo cáo', 'xin phép', 'từ chối'] } },
  { id: 'v-6', prompt: '"renraku" nghĩa là gì?', data: { word: 'renraku', meaning: 'liên lạc', options: ['liên lạc', 'nghỉ phép', 'tăng ca', 'chuyển ca'] } },
  { id: 'v-7', prompt: '"zangyou" nghĩa là gì?', data: { word: 'zangyou', meaning: 'tăng ca', options: ['tăng ca', 'nghỉ phép', 'đi muộn', 'về sớm'] } },
  { id: 'v-8', prompt: '"kiken" nghĩa là gì?', data: { word: 'kiken', meaning: 'nguy hiểm', options: ['nguy hiểm', 'an toàn', 'sạch sẽ', 'gọn gàng'] } },
  { id: 'v-9', prompt: '"seiketsu" nghĩa là gì?', data: { word: 'seiketsu', meaning: 'sạch sẽ (5S)', options: ['sạch sẽ (5S)', 'sắp xếp', 'kỷ luật', 'nguy hiểm'] } },
  { id: 'v-10', prompt: '"seiri" nghĩa là gì?', data: { word: 'seiri', meaning: 'sàng lọc (5S)', options: ['sàng lọc (5S)', 'sạch sẽ', 'săn sóc', 'sẵn sàng'] } },
  { id: 'v-11', prompt: '"seiton" nghĩa là gì?', data: { word: 'seiton', meaning: 'sắp xếp (5S)', options: ['sắp xếp (5S)', 'sàng lọc', 'sạch sẽ', 'kỷ luật'] } },
  { id: 'v-12', prompt: '"shitsuke" nghĩa là gì?', data: { word: 'shitsuke', meaning: 'kỷ luật (5S)', options: ['kỷ luật (5S)', 'sạch sẽ', 'sắp xếp', 'an toàn'] } },
  { id: 'v-13', prompt: '"chuusha" nghĩa là gì?', data: { word: 'chuusha', meaning: 'bãi đỗ xe', options: ['bãi đỗ xe', 'nhà ăn', 'phòng thay đồ', 'kho hàng'] } },
  { id: 'v-14', prompt: '"shokudou" nghĩa là gì?', data: { word: 'shokudou', meaning: 'nhà ăn', options: ['nhà ăn', 'bãi đỗ xe', 'phòng họp', 'kho hàng'] } },
  { id: 'v-15', prompt: '"zairyu card" nghĩa là gì?', data: { word: 'zairyu card', meaning: 'thẻ cư trú', options: ['thẻ cư trú', 'thẻ bảo hiểm', 'bằng lái', 'hộ chiếu'] } },
  { id: 'v-16', prompt: '"hoken" nghĩa là gì?', data: { word: 'hoken', meaning: 'bảo hiểm', options: ['bảo hiểm', 'lương', 'thuế', 'tiết kiệm'] } },
  { id: 'v-17', prompt: '"kyuuryou" nghĩa là gì?', data: { word: 'kyuuryou', meaning: 'lương', options: ['lương', 'bảo hiểm', 'thuế', 'tiền thưởng'] } },
  { id: 'v-18', prompt: '"aisatsu" nghĩa là gì?', data: { word: 'aisatsu', meaning: 'chào hỏi', options: ['chào hỏi', 'xin lỗi', 'cảm ơn', 'từ chối'] } },
  { id: 'v-19', prompt: '"sumimasen" nghĩa là gì?', data: { word: 'sumimasen', meaning: 'xin lỗi / xin phép', options: ['xin lỗi / xin phép', 'cảm ơn', 'chào hỏi', 'tạm biệt'] } },
  { id: 'v-20', prompt: '"yoroshiku" nghĩa là gì?', data: { word: 'yoroshiku', meaning: 'mong được giúp đỡ', options: ['mong được giúp đỡ', 'xin lỗi', 'tạm biệt', 'cảm ơn'] } },
];

export function getShuffledVocabRounds(count = 15): VocabRound[] {
  return [...VOCAB_ROUNDS].sort(() => Math.random() - 0.5).slice(0, count);
}
