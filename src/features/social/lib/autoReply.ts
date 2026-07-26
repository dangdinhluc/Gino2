/**
 * Bộ trả lời tự động cho các kênh cộng đồng (chạy offline, không cần backend).
 * Mỗi kênh có persona riêng; câu trả lời chọn theo từ khóa + hash nội dung
 * để cùng một câu hỏi không phải lúc nào cũng ra một câu trả lời duy nhất.
 */

export type ThreadId = 'group-restaurant' | 'mentor' | 'hr-room';

export interface ThreadMeta {
  id: ThreadId;
  name: string;
  label: string;
  description: string;
  /** Tin mở màn khi chưa có lịch sử */
  seedMessages: { from: 'them'; text: string }[];
}

export const THREADS: ThreadMeta[] = [
  {
    id: 'group-restaurant',
    name: 'Nhóm Tokutei Nhà hàng',
    label: 'Nhóm học',
    description: 'Nhóm bạn học cùng ngành dịch vụ ăn uống — rủ nhau ôn mỗi tối.',
    seedMessages: [
      { from: 'them', text: 'Minh: Tối nay 21h cả nhóm ôn 5 câu tự giới thiệu với checklist đầu ca nhé!' },
      { from: 'them', text: 'Hoa: Em vừa cram xong 20 thẻ chủ đề an toàn, khó nhất là 非常口 😅' },
    ],
  },
  {
    id: 'mentor',
    name: 'Gino Mentor',
    label: 'Mentor',
    description: 'Mentor đồng hành — hỏi gì cũng trả lời theo hướng thực dụng, ngắn gọn.',
    seedMessages: [
      { from: 'them', text: 'Chào anh! Em là Gino Mentor. Anh cứ nhắn câu hỏi về phỏng vấn, hồ sơ hay cách ôn từ vựng, em sẽ gợi ý cách luyện ngắn gọn nhất.' },
    ],
  },
  {
    id: 'hr-room',
    name: 'HR Mock Room',
    label: 'Phỏng vấn',
    description: 'Phòng luyện phỏng vấn — mỗi ngày một câu hỏi HR để tập trả lời.',
    seedMessages: [
      { from: 'them', text: 'Câu hỏi hôm nay: 「自己紹介をお願いします」— thử trả lời trong 30-45 giây rồi gửi vào đây nhé.' },
    ],
  },
];

const threadById = new Map(THREADS.map((thread) => [thread.id, thread]));

export function getThreadMeta(id: ThreadId): ThreadMeta {
  return threadById.get(id) ?? THREADS[0];
}

function hash(value: string): number {
  let result = 0;
  for (let i = 0; i < value.length; i++) {
    result = (result * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return result;
}

function pick(pool: string[], seedText: string): string {
  return pool[hash(seedText) % pool.length];
}

interface Rule {
  keywords: string[];
  replies: Record<ThreadId, string[]>;
}

const RULES: Rule[] = [
  {
    keywords: ['phỏng vấn', 'mensetsu', '面接', 'interview', 'jikoshoukai', 'tự giới thiệu'],
    replies: {
      mentor: [
        'Phỏng vấn thì cứ khung 3 ý: tên + quê quán → lý do muốn sang Nhật → cam kết học việc. Anh thử viết 3 câu rồi gửi em xem.',
        'Mẹo phỏng vấn: nói chậm, kết câu bằng です/ます cho chắc. Anh luyện trước câu 「日本で長く働きたいです」nhé.',
      ],
      'group-restaurant': [
        'Minh: Phỏng vấn hả? Tối nay nhóm mock interview đó, vào luyện chung luôn!',
        'Hoa: Em hay tập trả lời trước gương 30 giây, đỡ run hẳn á anh.',
      ],
      'hr-room': [
        'Ghi nhận! Câu hỏi tiếp theo cho anh: 「志望動機を教えてください」— trả lời trong 3 câu thôi nhé.',
        'Tốt. Nhớ cấu trúc: kết luận trước, lý do sau. HR Nhật thích câu trả lời ngắn và rõ.',
      ],
    },
  },
  {
    keywords: ['hồ sơ', 'giấy tờ', 'rirekisho', 'zairyu', '在留', 'passport', 'hộ chiếu', 'shorui'],
    replies: {
      mentor: [
        'Về hồ sơ: checklist tối thiểu là zairyuu kaado, hộ chiếu, rirekisho và ảnh thẻ. Anh vào chủ đề "Hồ sơ & giấy tờ" ôn 12 thẻ là nắm đủ từ khóa.',
        'Giấy tờ thì đừng học vẹt — mở Review Center, lọc chủ đề Hồ sơ, ôn bằng thẻ SRS sẽ nhớ lâu hơn.',
      ],
      'group-restaurant': [
        'Tuan: Hồ sơ em làm tuần trước rồi, cần mẫu rirekisho thì em gửi cho!',
        'Minh: Nhớ photo 2 bản zairyuu kaado nha anh, lần trước em thiếu 1 bản chạy mệt luôn.',
      ],
      'hr-room': [
        'Trước buổi mock nhớ mang đủ: 履歴書, 在留カード, パスポート. Thiếu 1 trong 3 là bị trừ điểm tác phong đó.',
      ],
    },
  },
  {
    keywords: ['an toàn', 'anzen', '安全', 'kiken', 'nguy hiểm'],
    replies: {
      mentor: [
        'An toàn là chủ đề ra thi nhiều nhất. Ba từ phải thuộc: 安全 (anzen), 危険 (kiken), 非常口 (hijouguchi). Ôn chủ đề An toàn trong Review Center nhé.',
      ],
      'group-restaurant': [
        'Hoa: Chủ đề an toàn em vừa cram sáng nay, từ 救急車 đọc líu lưỡi ghê 😂',
      ],
      'hr-room': [
        'Câu tình huống: quản lý chỉ vào khu vực ướt và nói 「危険です」. Anh phản ứng thế nào? Gửi câu trả lời vào đây.',
      ],
    },
  },
  {
    keywords: ['ôn', 'học', 'từ vựng', 'flashcard', 'thẻ', 'srs', 'quên'],
    replies: {
      mentor: [
        'Nhịp chuẩn: mỗi sáng vào "Ôn thẻ tới hạn" trước (5-10 phút), còn sức thì thêm 10 từ mới. Đừng học dồn — SRS lo phần ghi nhớ cho anh.',
        'Nếu hay quên một từ, mở trang chi tiết từ đó xem câu ví dụ và bấm nghe phát âm vài lần — gắn với ngữ cảnh sẽ nhớ dai hơn.',
      ],
      'group-restaurant': [
        'Minh: Em đang giữ streak 12 ngày nè, thi đua không anh? 😎',
        'Lan: Em hay ôn thẻ lúc giờ nghỉ kyuukei, mỗi lần 10 phút là vừa đẹp.',
      ],
      'hr-room': [
        'Từ vựng chắc thì phỏng vấn mới trôi. Mỗi ngày ôn xong thẻ tới hạn rồi hãy vào mock nhé.',
      ],
    },
  },
  {
    keywords: ['chào', 'aisatsu', '挨拶', 'ohayou', 'hello', 'hi', 'alo'],
    replies: {
      mentor: [
        'Chào anh! Hôm nay mình ôn gì trước — thẻ tới hạn hay luyện câu phỏng vấn?',
        'おはようございます！Bắt đầu ngày mới bằng một phiên thẻ nhớ cho nóng máy nhé anh.',
      ],
      'group-restaurant': [
        'Hoa: Chào anh! Tối nay nhóm học lúc 21h, anh vào không?',
        'Minh: Ohayou~ hôm nay anh ôn được bao nhiêu thẻ rồi?',
      ],
      'hr-room': [
        'Chào anh. Sẵn sàng cho câu hỏi mock hôm nay chưa? Gõ "bắt đầu" để nhận câu hỏi.',
      ],
    },
  },
  {
    keywords: ['bắt đầu', 'start', 'câu hỏi'],
    replies: {
      mentor: [
        'Bắt đầu thôi! Anh vào Review Center bấm "Ôn ngay", xong quay lại kể em nghe kết quả nhé.',
      ],
      'group-restaurant': [
        'Minh: Chốt kèo! Ai xong phiên ôn hôm nay thì báo vào nhóm nha.',
      ],
      'hr-room': [
        'Câu hỏi: 「なぜ日本で働きたいですか」— vì sao anh muốn làm việc ở Nhật? Trả lời 2-3 câu.',
        'Câu hỏi: 「あなたの長所は何ですか」— điểm mạnh của anh là gì? Nhớ kèm ví dụ thực tế.',
      ],
    },
  },
];

const FALLBACKS: Record<ThreadId, string[]> = {
  mentor: [
    'Em ghi nhận rồi nhé. Nếu anh muốn luyện ngay, thử một phiên "Ôn thẻ tới hạn" rồi kể em nghe kết quả.',
    'Câu này hay đó. Anh thử diễn đạt lại bằng 1 câu tiếng Nhật đơn giản xem — sai em sửa cho.',
    'OK anh. Mẹo nhỏ: học đều 10 phút mỗi ngày ăn đứt học dồn 2 tiếng cuối tuần.',
  ],
  'group-restaurant': [
    'Minh: Nghe hợp lý đó anh!',
    'Hoa: Dạ, tối nay vào học nhóm kể tiếp nha anh.',
    'Lan: 👍 Em cũng nghĩ vậy. Mai cả nhóm cram chung chủ đề nơi làm việc không?',
  ],
  'hr-room': [
    'Đã ghi nhận câu trả lời. Nhận xét nhanh: giữ câu ngắn, kết bằng です/ます, tránh vòng vo. Mai có câu hỏi mới nhé.',
    'Tốt. Anh nhớ luyện nói to câu trả lời này 3 lần trước khi ngủ để thành phản xạ.',
  ],
};

export function getAutoReply(threadId: ThreadId, userText: string): string {
  const normalized = userText.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      const pool = rule.replies[threadId];
      if (pool && pool.length > 0) return pick(pool, userText + threadId);
    }
  }
  return pick(FALLBACKS[threadId], userText + threadId);
}

/** Độ trễ "đang gõ..." mô phỏng người thật (1.2s - 2.6s, tất định theo nội dung). */
export function replyDelayMs(userText: string): number {
  return 1200 + (hash(userText) % 1400);
}
