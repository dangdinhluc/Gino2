import type { GameRound } from '@/src/features/games/types';

export interface SituationRound extends GameRound {
  data: { situation: string; options: string[]; answer: string; explanation: string };
}

/** Tokutei workplace situations — choose correct response */
export const SITUATION_ROUNDS: SituationRound[] = [
  { id: 's-1', prompt: 'Khi vào ca, hành động nào đúng nhất?', data: { situation: 'Bước vào nơi làm việc đầu ca', options: ['Chào đội và xác nhận vị trí', 'Mở điện thoại kiểm tra tin nhắn', 'Tự đổi vị trí làm', 'Bỏ qua checklist'], answer: 'Chào đội và xác nhận vị trí', explanation: 'Aisatsu + xác nhận vị trí là bước đầu tiên khi vào ca.' } },
  { id: 's-2', prompt: 'Khi chưa hiểu hướng dẫn của quản lý, phản ứng nào đúng?', data: { situation: 'Quản lý vừa hướng dẫn nhưng bạn chưa hiểu rõ', options: ['Xin nhắc lại giúp em một lần nữa', 'Đoán và làm luôn', 'Bỏ qua vì ngại hỏi', 'Hỏi đồng nghiệp sau ca'], answer: 'Xin nhắc lại giúp em một lần nữa', explanation: 'Hỏi lại ngay tránh sai sót. Dùng: "Sumimasen, mou ichido onegaishimasu."' } },
  { id: 's-3', prompt: 'Phát hiện sàn ướt trơn ở khu vực làm việc, bạn nên?', data: { situation: 'Sàn ướt trơn gần khu vực thao tác', options: ['Báo quản lý ngay (houkoku)', 'Bước qua và tiếp tục làm', 'Đợi ai đó dọn', 'Chỉ cẩn thận bước'], answer: 'Báo quản lý ngay (houkoku)', explanation: 'Anzen first — báo cáo ngay để tránh tai nạn cho cả đội.' } },
  { id: 's-4', prompt: 'Muốn xin nghỉ phép, bạn nên làm gì?', data: { situation: 'Cần xin nghỉ 1 ngày tuần sau', options: ['Báo trước cho quản lý bằng đơn/lời', 'Nhắn tin cho đồng nghiệp nhờ nói hộ', 'Nghỉ rồi báo sau', 'Chỉ cần gọi sáng hôm đó'], answer: 'Báo trước cho quản lý bằng đơn/lời', explanation: 'Renraku trước — liên lạc sớm để quản lý sắp xếp ca.' } },
  { id: 's-5', prompt: 'Khi HR hỏi lý do sang Nhật, câu nào an toàn nhất?', data: { situation: 'Phỏng vấn: HR hỏi mục tiêu', options: ['Tôi muốn học và làm việc ổn định lâu dài', 'Tôi chưa biết rõ nhưng cứ sang trước', 'Tôi chỉ muốn thử vài tháng', 'Tôi sang vì bạn rủ'], answer: 'Tôi muốn học và làm việc ổn định lâu dài', explanation: 'Thể hiện cam kết dài hạn — HR đánh giá cao sự ổn định.' } },
  { id: 's-6', prompt: 'Đồng nghiệp bị thương nhẹ, bạn nên?', data: { situation: 'Đồng nghiệp bị đứt tay khi thao tác', options: ['Sơ cứu cơ bản + báo quản lý', 'Bảo họ tự xử lý', 'Tiếp tục làm việc', 'Chỉ đưa băng cá nhân'], answer: 'Sơ cứu cơ bản + báo quản lý', explanation: 'Houkoku + soudan — sơ cứu rồi báo để ghi nhận sự cố.' } },
  { id: 's-7', prompt: 'Hết ca nhưng chưa xong việc, bạn nên?', data: { situation: 'Hết giờ ca nhưng công việc chưa hoàn thành', options: ['Hỏi quản lý có cần tăng ca không', 'Tự ý ở lại làm thêm', 'Bỏ dở và về', 'Nhờ ca sau làm tiếp mà không báo'], answer: 'Hỏi quản lý có cần tăng ca không', explanation: 'Soudan — trao đổi trước khi quyết định zangyou (tăng ca).' } },
  { id: 's-8', prompt: 'Khi được giao việc mới chưa từng làm, bạn nên?', data: { situation: 'Quản lý giao task mới bạn chưa biết cách', options: ['Xin hướng dẫn cụ thể trước khi bắt đầu', 'Tự tìm cách làm', 'Từ chối vì chưa biết', 'Nhờ đồng nghiệp làm hộ'], answer: 'Xin hướng dẫn cụ thể trước khi bắt đầu', explanation: 'Soudan trước khi thao tác — tránh sai sót và tai nạn.' } },
  { id: 's-9', prompt: 'Giờ nghỉ (kyukei), bạn nên?', data: { situation: 'Đến giờ nghỉ giữa ca', options: ['Nghỉ đúng giờ, đúng khu vực quy định', 'Nghỉ ở đâu cũng được', 'Tranh thủ dùng điện thoại ở khu sản xuất', 'Nghỉ thêm 10 phút'], answer: 'Nghỉ đúng giờ, đúng khu vực quy định', explanation: 'Kỷ luật giờ giấc và khu vực — shitsuke trong 5S.' } },
  { id: 's-10', prompt: 'Khi tự giới thiệu ngày đầu, nên nói gì?', data: { situation: 'Ngày đầu tiên đi làm, giới thiệu với đội', options: ['Tên + quê + "yoroshiku onegaishimasu"', 'Chỉ nói tên rồi im', 'Kể dài về bản thân', 'Không cần giới thiệu'], answer: 'Tên + quê + "yoroshiku onegaishimasu"', explanation: 'Aisatsu ngắn gọn, lịch sự — tạo ấn tượng tốt ngày đầu.' } },
];

export function getShuffledSituationRounds(count = 8): SituationRound[] {
  return [...SITUATION_ROUNDS].sort(() => Math.random() - 0.5).slice(0, count);
}
