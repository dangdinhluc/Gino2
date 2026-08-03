/**
 * Dữ liệu mẫu cho trang Lộ trình (hành trình học tập).
 *
 * Mô phỏng bố cục roadmap dạng "journey" (tham khảo brottin.quest) nhưng chuyển
 * sang bối cảnh tiếng Nhật / Tokutei: các chặng N5 -> N1 + Tokutei, gắn với cột
 * mốc cảnh quan Nhật Bản. Đây là dữ liệu demo, khi có lộ trình thật chỉ cần thay
 * nguồn trả về đúng shape này.
 */

export type RoadmapLevelStatus = 'done' | 'current' | 'locked';

export interface RoadmapAction {
  label: string;
  path: string;
}

export interface RoadmapWeekBlock {
  id: string;
  period: string;
  title: string;
  tip: string;
  actions: RoadmapAction[];
  details: string[];
}

export interface RoadmapGame {
  label: string;
  note: string;
  path: string;
}

export interface RoadmapLevel {
  id: string;
  code: string;
  landmark: string;
  emoji: string;
  title: string;
  subtitle: string;
  duration: string;
  wordCount: string;
  status: RoadmapLevelStatus;
  accent: string;
  weeks: RoadmapWeekBlock[];
  vocab: string[];
  grammar: string[];
  games: RoadmapGame[];
}

export const roadmapLevels: RoadmapLevel[] = [
  {
    id: 'n5',
    code: 'N5',
    landmark: 'Núi Phú Sĩ',
    emoji: '🗻',
    title: 'JLPT N5 · Nền tảng',
    subtitle: 'Giao tiếp cơ bản trong sinh hoạt và nơi làm việc',
    duration: '12 tuần',
    wordCount: '800 từ',
    status: 'current',
    accent: 'from-orange-400 to-amber-500',
    weeks: [
      {
        id: 'n5-w1',
        period: 'Tuần 1–2',
        title: 'Hiragana & Katakana',
        tip: 'Nghe rồi lặp lại thật nhiều lần mỗi ngày.',
        actions: [
          { label: 'Học bảng chữ', path: '/app/courses' },
          { label: 'Luyện nghe & phát âm', path: '/app/review/flashcards' },
        ],
        details: [
          'Thuộc 46 âm Hiragana + biến âm (dakuten, handakuten)',
          'Thuộc 46 âm Katakana cho từ ngoại lai',
          'Trường âm, âm ngắt (っ), âm ghép (きゃ・しゅ・ちょ)',
          'Đọc to 10 phút mỗi ngày',
        ],
      },
      {
        id: 'n5-w2',
        period: 'Tuần 3–4',
        title: 'Chào hỏi & Giới thiệu bản thân',
        tip: 'Tập nói to vài câu mỗi ngày.',
        actions: [
          { label: 'Tập câu chào', path: '/app/courses' },
          { label: 'Luyện nói với AI', path: '/app/ai-speak' },
        ],
        details: [
          'おはようございます / こんにちは / お疲れ様です',
          'はじめまして、〜と申します、よろしくお願いします',
          'Số đếm, tuổi, quốc tịch: 〜歳です、〜から来ました',
          'Học 100 từ chủ đề chào hỏi & bản thân',
        ],
      },
      {
        id: 'n5-w3',
        period: 'Tuần 5–6',
        title: 'Gia đình, đồ vật & nơi chốn',
        tip: 'Học từ theo chủ đề rồi luyện ngay.',
        actions: [
          { label: 'Học từ vựng chủ đề', path: '/app/courses' },
          { label: 'Ôn thẻ nhanh', path: '/app/review/flashcards' },
        ],
        details: [
          'Từ vựng gia đình, đồ dùng, nơi làm việc',
          'Đại từ chỉ định: これ・それ・あれ・どれ',
          'Vị trí: 〜は〜にあります／います',
          'Trợ từ cơ bản: は・が・を・に・で',
        ],
      },
      {
        id: 'n5-w4',
        period: 'Tuần 7–8',
        title: 'Động từ & Câu cơ bản',
        tip: 'Làm bài chia động từ mỗi ngày.',
        actions: [{ label: 'Luyện ngữ pháp', path: '/app/grammar' }],
        details: [
          'Thể ます・ません・ました・ませんでした',
          'Cấu trúc 〜を〜ます (ăn cơm, đọc sách…)',
          'Tính từ đuôi い và đuôi な',
          'Thời gian, ngày tháng, thứ trong tuần',
        ],
      },
      {
        id: 'n5-w5',
        period: 'Tuần 9–10',
        title: 'Câu hỏi & Diễn đạt mong muốn',
        tip: 'Luyện đặt câu để nhớ cấu trúc.',
        actions: [
          { label: 'Làm bài tập', path: '/app/grammar' },
          { label: 'Mini game phản xạ', path: '/app/hub' },
        ],
        details: [
          'Nghi vấn: 何・誰・どこ・いつ・いくら・どうして',
          '〜たいです (muốn làm), 〜がほしいです (muốn có)',
          '〜てください (đề nghị lịch sự)',
          'Đếm đồ vật với trợ số từ (〜個・〜枚・〜人)',
        ],
      },
      {
        id: 'n5-w6',
        period: 'Tuần 11–12',
        title: 'Ôn tập & Luyện đề N5/JFT',
        tip: 'Thi thử đến khi đạt 80%+.',
        actions: [
          { label: 'Ôn tập tổng hợp', path: '/app/review/flashcards' },
          { label: 'Làm đề mô phỏng', path: '/app/exams/e1/start' },
        ],
        details: [
          'Ôn lại 800 từ đã học',
          'Làm 3–5 đề thi thử N5 / JFT-Basic',
          'Luyện 3 phần: 文字・語彙, 文法・読解, 聴解',
          'Đánh giá tiến độ và lấp lỗ hổng',
        ],
      },
    ],
    vocab: [
      '800 từ vựng nền tảng N5 theo chủ đề',
      'Từ vựng nơi làm việc: 挨拶, 報告, 休憩, 安全',
      'Học 20 từ/ngày → 800 từ trong khoảng 40 ngày',
      'Flashcard SRS lặp lại ngắt quãng',
    ],
    grammar: [
      '80+ mẫu ngữ pháp N5 cốt lõi',
      'Trợ từ は・が・を・に・で・へ・と',
      'Chia thể ます và thể từ điển',
      'Tính từ い/な và so sánh cơ bản',
    ],
    games: [
      { label: 'Flappy Vocab', note: 'Phản xạ nghĩa từ trong 1–3 phút', path: '/app/hub' },
      { label: 'Shift Sprint', note: 'Ghép cụm từ nơi làm việc', path: '/app/hub' },
      { label: 'Nghe & chọn', note: 'Luyện 聴解 nhanh', path: '/app/hub' },
    ],
  },
  {
    id: 'n4',
    code: 'N4',
    landmark: 'Chùa Kim Các',
    emoji: '🏯',
    title: 'JLPT N4 · Giao tiếp công việc',
    subtitle: 'Diễn đạt tình huống công việc và đời sống',
    duration: '12 tuần',
    wordCount: '1.500 từ',
    status: 'locked',
    accent: 'from-emerald-400 to-teal-500',
    weeks: [
      {
        id: 'n4-w1',
        period: 'Tuần 1–3',
        title: 'Thể て và kết nối câu',
        tip: 'Ghép các hành động liền mạch.',
        actions: [{ label: 'Học ngữ pháp', path: '/app/grammar' }],
        details: [
          'Thể て: 〜てください, 〜ています',
          '〜てもいいです / 〜てはいけません (xin phép, cấm)',
          'Nối câu bằng thể て',
          'Diễn đạt trình tự công việc',
        ],
      },
      {
        id: 'n4-w2',
        period: 'Tuần 4–7',
        title: 'Thể thông thường & khả năng',
        tip: 'Nói tự nhiên hơn mỗi ngày.',
        actions: [{ label: 'Luyện nói với AI', path: '/app/ai-speak' }],
        details: [
          'Thể 普通形 (thể thường)',
          'Khả năng 〜ことができる / thể khả năng',
          '〜と思います, 〜と言いました (trích dẫn)',
          'Từ vựng báo cáo – liên lạc – trao đổi (報連相)',
        ],
      },
      {
        id: 'n4-w3',
        period: 'Tuần 8–12',
        title: 'Ôn tập & Luyện đề N4',
        tip: 'Thi thử tới khi ổn định.',
        actions: [{ label: 'Làm đề mô phỏng', path: '/app/exams/e1/start' }],
        details: [
          'Ôn 1.500 từ đã học',
          'Luyện đề N4 đủ 3 phần',
          'Đọc hiểu đoạn văn ngắn nơi làm việc',
          'Nghe hội thoại công sở',
        ],
      },
    ],
    vocab: [
      '1.500 từ mở rộng chủ đề công việc',
      'Kính ngữ sơ cấp: いらっしゃいます, なさいます',
      'Từ vựng an toàn lao động & quy trình',
      'Cụm từ điện thoại và email nội bộ',
    ],
    grammar: [
      'Thể て và các mẫu mở rộng',
      'Thể thông thường trong hội thoại',
      'Điều kiện 〜たら / 〜ば cơ bản',
      'Kính ngữ – khiêm nhường mức nhập môn',
    ],
    games: [
      { label: 'Keigo Match', note: 'Ghép kính ngữ đúng ngữ cảnh', path: '/app/hub' },
      { label: 'Runner công trường', note: 'Phản xạ từ vựng an toàn', path: '/app/hub' },
    ],
  },
  {
    id: 'tokutei',
    code: 'Tokutei',
    landmark: 'Công trường & Nhà xưởng',
    emoji: '🏭',
    title: 'Tokutei · Kỹ năng đặc định',
    subtitle: 'JFT-Basic + tiếng Nhật chuyên ngành SSW',
    duration: '8 tuần',
    wordCount: '600 từ chuyên ngành',
    status: 'locked',
    accent: 'from-orange-500 to-rose-500',
    weeks: [
      {
        id: 'tk-w1',
        period: 'Tuần 1–2',
        title: 'JFT-Basic tổng quan',
        tip: 'Nắm dạng đề trước khi luyện.',
        actions: [{ label: 'Làm đề JFT', path: '/app/exams/e1/start' }],
        details: [
          'Cấu trúc & tiêu chí JFT-Basic (trình độ A2)',
          'Kỹ năng CAN-DO theo tình huống',
          'Từ vựng sinh hoạt tại Nhật',
          'Chiến lược làm bài từng phần',
        ],
      },
      {
        id: 'tk-w2',
        period: 'Tuần 3–5',
        title: 'Tiếng Nhật hiện trường',
        tip: 'Học đúng ngành của bạn.',
        actions: [
          { label: 'Từ vựng chuyên ngành', path: '/app/grammar' },
          { label: 'Luyện nói tình huống', path: '/app/ai-speak' },
        ],
        details: [
          'Chỉ dẫn an toàn & báo cáo sự cố',
          'Hội thoại với quản lý ca (店長・先輩)',
          'Từ vựng theo ngành: chế biến, điều dưỡng, xây dựng…',
          'Đọc bảng hướng dẫn & biển báo',
        ],
      },
      {
        id: 'tk-w3',
        period: 'Tuần 6–8',
        title: 'Phỏng vấn & Ôn tổng lực',
        tip: 'Diễn tập phỏng vấn như thật.',
        actions: [
          { label: 'Mock interview', path: '/app/ai-speak' },
          { label: 'Ôn tập', path: '/app/review/flashcards' },
        ],
        details: [
          'Bộ câu hỏi phỏng vấn tuyển dụng',
          'Giới thiệu kinh nghiệm & nguyện vọng',
          'Ứng xử & tác phong khi phỏng vấn',
          'Đề tổng hợp JFT + chuyên ngành',
        ],
      },
    ],
    vocab: [
      '600 từ chuyên ngành theo lĩnh vực SSW',
      'Từ vựng an toàn – vệ sinh – quy trình',
      'Mẫu câu báo cáo – xin nghỉ – đổi ca',
      'Thuật ngữ phỏng vấn tuyển dụng',
    ],
    grammar: [
      'Mẫu câu lịch sự nơi làm việc',
      'Diễn đạt nguyên nhân – kết quả',
      'Xin phép, đề nghị, từ chối lịch sự',
      'Kể lại sự việc đã xảy ra',
    ],
    games: [
      { label: 'Interview Rush', note: 'Phản xạ trả lời phỏng vấn', path: '/app/hub' },
      { label: 'Safety Match', note: 'Ghép biển báo an toàn', path: '/app/hub' },
    ],
  },
  {
    id: 'n3',
    code: 'N3',
    landmark: 'Cổng Torii Fushimi',
    emoji: '⛩️',
    title: 'JLPT N3 · Trung cấp',
    subtitle: 'Hiểu hội thoại và văn bản đời thường phức tạp hơn',
    duration: '16 tuần',
    wordCount: '3.700 từ',
    status: 'locked',
    accent: 'from-sky-400 to-blue-500',
    weeks: [
      {
        id: 'n3-w1',
        period: 'Tuần 1–5',
        title: 'Ngữ pháp trung cấp I',
        tip: 'Tăng dần độ dài câu.',
        actions: [{ label: 'Học ngữ pháp', path: '/app/grammar' }],
        details: [
          'Kính ngữ – khiêm nhường đầy đủ',
          '〜ようだ / 〜そうだ / 〜らしい (suy đoán)',
          'Bị động – sai khiến',
          'Từ vựng tin tức & thông báo',
        ],
      },
      {
        id: 'n3-w2',
        period: 'Tuần 6–11',
        title: 'Đọc hiểu & Nghe',
        tip: 'Luyện tốc độ đọc và nghe.',
        actions: [{ label: 'Ôn tập', path: '/app/review/flashcards' }],
        details: [
          'Đọc đoạn văn 300–500 chữ',
          'Nghe hội thoại tốc độ tự nhiên',
          'Đoán nghĩa từ ngữ cảnh',
          'Ghi chú ý chính thật nhanh',
        ],
      },
      {
        id: 'n3-w3',
        period: 'Tuần 12–16',
        title: 'Luyện đề N3',
        tip: 'Thi thử định kỳ.',
        actions: [{ label: 'Làm đề mô phỏng', path: '/app/exams/e1/start' }],
        details: [
          'Đề đầy đủ 3 phần N3',
          'Quản lý thời gian làm bài',
          'Phân tích lỗi sai',
          'Củng cố 3.700 từ',
        ],
      },
    ],
    vocab: [
      '3.700 từ trung cấp đa chủ đề',
      'Từ Hán tự (漢語) thường gặp',
      'Thành ngữ & cụm cố định',
      'Từ vựng tin tức, công việc, xã hội',
    ],
    grammar: [
      'Bị động – sai khiến – sai khiến bị động',
      'Kính ngữ hoàn chỉnh',
      'Mẫu suy đoán & truyền đạt',
      'Câu điều kiện nâng cao',
    ],
    games: [
      { label: 'Kanji Blast', note: 'Nhận diện Hán tự N3', path: '/app/hub' },
      { label: 'Listening Dash', note: 'Nghe & chọn thật nhanh', path: '/app/hub' },
    ],
  },
  {
    id: 'n2',
    code: 'N2',
    landmark: 'Tháp Tokyo',
    emoji: '🗼',
    title: 'JLPT N2 · Trung cao cấp',
    subtitle: 'Sử dụng tiếng Nhật trong công việc và học thuật',
    duration: '20 tuần',
    wordCount: '6.000 từ',
    status: 'locked',
    accent: 'from-violet-400 to-purple-500',
    weeks: [
      {
        id: 'n2-w1',
        period: 'Tuần 1–7',
        title: 'Ngữ pháp N2',
        tip: 'Chú ý sắc thái từng mẫu.',
        actions: [{ label: 'Học ngữ pháp', path: '/app/grammar' }],
        details: [
          'Mẫu ngữ pháp trang trọng N2',
          'Liên từ & mẫu nối văn viết',
          'Sắc thái gần nghĩa dễ nhầm',
          'Từ vựng học thuật & kinh tế',
        ],
      },
      {
        id: 'n2-w2',
        period: 'Tuần 8–14',
        title: 'Đọc – Nghe nâng cao',
        tip: 'Đọc báo tiếng Nhật mỗi ngày.',
        actions: [{ label: 'Ôn tập', path: '/app/review/flashcards' }],
        details: [
          'Đọc bài báo & xã luận',
          'Nghe bản tin, phỏng vấn',
          'Nắm ý ẩn & thái độ người nói',
          'Mở rộng lên 6.000 từ',
        ],
      },
      {
        id: 'n2-w3',
        period: 'Tuần 15–20',
        title: 'Luyện đề N2',
        tip: 'Bấm giờ nghiêm túc.',
        actions: [{ label: 'Làm đề mô phỏng', path: '/app/exams/e1/start' }],
        details: [
          'Đề đầy đủ N2',
          'Chiến lược đọc nhanh',
          'Phân bổ thời gian hợp lý',
          'Rà soát điểm yếu',
        ],
      },
    ],
    vocab: [
      '6.000 từ trình độ N2',
      'Từ vựng báo chí – kinh tế – xã hội',
      'Từ ghép Hán tự phức tạp',
      'Từ tượng thanh – tượng hình',
    ],
    grammar: [
      'Mẫu ngữ pháp văn viết trang trọng',
      'Liên từ logic & tương phản',
      'Phân biệt sắc thái gần nghĩa',
      'Câu nhấn mạnh & nhượng bộ',
    ],
    games: [
      { label: 'Grammar Sniper', note: 'Chọn mẫu đúng theo sắc thái', path: '/app/hub' },
      { label: 'News Rush', note: 'Đọc lướt lấy ý chính', path: '/app/hub' },
    ],
  },
  {
    id: 'n1',
    code: 'N1',
    landmark: 'Đỉnh Anh Đào',
    emoji: '🌸',
    title: 'JLPT N1 · Thành thạo',
    subtitle: 'Hiểu và diễn đạt gần như người bản ngữ',
    duration: '24 tuần',
    wordCount: '10.000+ từ',
    status: 'locked',
    accent: 'from-pink-400 to-rose-500',
    weeks: [
      {
        id: 'n1-w1',
        period: 'Tuần 1–8',
        title: 'Ngữ pháp & Sắc thái N1',
        tip: 'Học qua ngữ liệu thật.',
        actions: [{ label: 'Học ngữ pháp', path: '/app/grammar' }],
        details: [
          'Mẫu ngữ pháp trang trọng & văn phong viết',
          'Sắc thái tinh tế, hàm ý',
          'Thành ngữ, quán ngữ, 四字熟語',
          'Từ vựng chuyên sâu',
        ],
      },
      {
        id: 'n1-w2',
        period: 'Tuần 9–17',
        title: 'Đọc – Nghe học thuật',
        tip: 'Tiếp xúc ngữ liệu đa dạng.',
        actions: [{ label: 'Ôn tập', path: '/app/review/flashcards' }],
        details: [
          'Đọc luận văn, tiểu luận',
          'Nghe diễn thuyết, tọa đàm',
          'Phân tích lập luận',
          'Mở rộng 10.000+ từ',
        ],
      },
      {
        id: 'n1-w3',
        period: 'Tuần 18–24',
        title: 'Luyện đề N1',
        tip: 'Duy trì phong độ ổn định.',
        actions: [{ label: 'Làm đề mô phỏng', path: '/app/exams/e1/start' }],
        details: [
          'Đề đầy đủ N1',
          'Đọc hiểu tốc độ cao',
          'Nghe nắm chi tiết & hàm ý',
          'Tổng ôn toàn diện',
        ],
      },
    ],
    vocab: [
      '10.000+ từ trình độ N1',
      'Từ Hán tự học thuật & chuyên môn',
      'Thành ngữ, quán ngữ, 四字熟語',
      'Từ vựng trừu tượng & văn chương',
    ],
    grammar: [
      'Mẫu ngữ pháp N1 trang trọng',
      'Văn phong viết & cổ ngữ còn dùng',
      'Sắc thái ẩn ý & hàm ngôn',
      'Lập luận học thuật',
    ],
    games: [
      { label: 'Idiom Master', note: 'Ghép thành ngữ & 四字熟語', path: '/app/hub' },
      { label: 'Kanji Boss', note: 'Hán tự cấp N1', path: '/app/hub' },
    ],
  },
];
