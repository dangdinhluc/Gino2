export type VocabularyStatus = 'new' | 'learning' | 'due' | 'remembered';
/** Kiểu chữ hiển thị từ vựng: romaji cho người mới, kana và kanji cho người đã quen mặt chữ. */
export type VocabularyScript = 'romaji' | 'kana' | 'kanji';
export type CourseDocumentKind = 'PDF' | 'Post';
export type CourseExamStatus = 'ready' | 'in_progress' | 'completed';
export type NonEmptyArray<T> = [T, ...T[]];

export interface CourseLearningCourse {
  id: string;
  title: string;
  level: string;
  description: string;
  currentModule: string;
  progress: number;
  streakDays: number;
  dailyGoal: string;
  vocabularyTarget: number;
}

export interface CourseVocabularyItem {
  id: string;
  /** Dạng romaji — luôn có, dùng làm mức fallback cuối cùng. */
  word: string;
  article: string;
  meaning: string;
  pronunciation: string;
  /** Dạng kana (hiragana/katakana). Thiếu thì rơi về romaji. */
  kana?: string;
  /** Dạng có kanji. Bỏ trống với từ vốn chỉ viết bằng kana. Thiếu thì rơi về kana. */
  kanji?: string;
  example: {
    /** Câu ví dụ dạng romaji. */
    jp: string;
    vi: string;
    kana?: string;
    kanji?: string;
  };
  status: VocabularyStatus;
  module: string;
  strength: number;
  tags: string[];
  /** Giải thích cách dùng: sắc thái, ngữ cảnh nơi làm việc, lỗi hay gặp. */
  explanation?: string;
  /** Mẹo nhớ nhanh — liên tưởng âm hoặc hình ảnh, viết ngắn một câu. */
  mnemonic?: string;
}

export interface CourseReviewQuestion {
  id: string;
  type: 'meaning' | 'article' | 'sentence' | 'listening';
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  source: string;
}

export interface CourseDocumentItem {
  id: string;
  title: string;
  kind: CourseDocumentKind;
  size: string;
  publishedAt: string;
  readTime: string;
  module: string;
  summary: string;
  preview: string;
  tags: string[];
}

export interface CourseGameItem {
  id: string;
  title: string;
  source: string;
  description: string;
  rounds: number;
  bestScore: number;
  duration: string;
  color: string;
}

export interface CourseExamItem {
  id: string;
  title: string;
  skills: string[];
  duration: string;
  status: CourseExamStatus;
  latestScore?: number;
}

export interface CoursePodcastItem {
  id: string;
  title: string;
  episode: string;
  duration: string;
  summary: string;
  isNew: boolean;
}

export interface CourseLearningWorkspaceData {
  course: CourseLearningCourse;
  vocabulary: NonEmptyArray<CourseVocabularyItem>;
  reviewQuestions: NonEmptyArray<CourseReviewQuestion>;
  documents: NonEmptyArray<CourseDocumentItem>;
  games: NonEmptyArray<CourseGameItem>;
  exams: NonEmptyArray<CourseExamItem>;
  podcasts: NonEmptyArray<CoursePodcastItem>;
}

const tokuteiWorkspace: CourseLearningWorkspaceData = {
  course: {
    id: 'course-1',
    title: 'Tokutei Foundation Sprint',
    level: 'JFT Basic + Core',
    description: 'Workspace để anh ôn cụm từ sống còn, tình huống nơi làm việc, hồ sơ và mock test Tokutei trong cùng một bàn học.',
    currentModule: 'Module 2: Tự giới thiệu & tác phong đi làm',
    progress: 46,
    streakDays: 18,
    dailyGoal: '20 phút',
    vocabularyTarget: 60,
  },
  vocabulary: [
    {
      id: 'ohayou-gozaimasu',
      word: 'Ohayou gozaimasu',
      article: '—',
      meaning: 'chào buổi sáng',
      pronunciation: 'o-ha-yo go-zai-ma-su',
      kana: 'おはようございます',
      // Từ này thực tế luôn viết bằng kana, không dùng kanji.
      example: {
        jp: 'Ohayou gozaimasu. Kyou mo yoroshiku onegaishimasu.',
        vi: 'Chào buổi sáng. Hôm nay cũng mong được giúp đỡ.',
        kana: 'おはようございます。きょうもよろしくおねがいします。',
        kanji: 'おはようございます。今日もよろしくお願いします。',
      },
      status: 'remembered',
      module: 'Vào ca',
      strength: 92,
      tags: ['Greeting', 'JFT'],
      explanation: 'Câu chào chuẩn khi bắt đầu ca, dùng được cả buổi chiều nếu đó là ca đầu tiên anh gặp người đó trong ngày. Có "gozaimasu" là thể lịch sự — với quản lý và khách phải nói đủ, bỏ đi chỉ hợp với bạn cùng ca thân thiết.',
      mnemonic: '"Ô-ha-yô" nghe như tiếng ngáp lúc mới dậy — chào buổi sáng.',
    },
    {
      id: 'tenchou',
      word: 'tenchou',
      article: '—',
      meaning: 'quản lý cửa hàng',
      pronunciation: 'ten-chou',
      kana: 'てんちょう',
      kanji: '店長',
      example: {
        jp: 'Tenchou ni houkoku shimasu.',
        vi: 'Em sẽ báo cáo với quản lý cửa hàng.',
        kana: 'てんちょうにほうこくします。',
        kanji: '店長に報告します。',
      },
      status: 'due',
      module: 'Báo cáo & giao tiếp',
      strength: 48,
      tags: ['Workplace', 'People'],
      explanation: 'Người phụ trách cao nhất của một cửa hàng. Gọi trực tiếp bằng chức danh "Tenchou" là đủ lịch sự, không cần thêm tên. Đây là người anh báo cáo khi có sự cố hoặc xin nghỉ.',
      mnemonic: '"Ten" (店) là cửa hàng, "chou" (長) là trưởng — trưởng cửa hàng.',
    },
    {
      id: 'houkoku',
      word: 'houkoku',
      article: '—',
      meaning: 'báo cáo',
      pronunciation: 'hou-kô-ku',
      kana: 'ほうこく',
      kanji: '報告',
      example: {
        jp: 'Mondai ga areba, sugu houkoku shimasu.',
        vi: 'Nếu có vấn đề, hãy báo cáo ngay.',
        kana: 'もんだいがあれば、すぐほうこくします。',
        kanji: '問題があれば、すぐ報告します。',
      },
      status: 'learning',
      module: 'An toàn & kỷ luật',
      strength: 64,
      tags: ['Safety', 'Routine'],
      explanation: 'Từ quan trọng nhất nhóm "hou-ren-sou" (báo cáo - liên lạc - bàn bạc) mà công ty Nhật nào cũng nhắc. Nguyên tắc: hỏng máy, làm sai, hay chưa hiểu việc thì báo ngay, báo sớm được đánh giá cao hơn tự xoay rồi giấu.',
      mnemonic: '"Hou-kô-ku" — nghe như "hô lên khúc mắc", có gì vướng là hô lên.',
    },
    {
      id: 'kyukei',
      word: 'kyukei',
      article: '—',
      meaning: 'giờ nghỉ',
      pronunciation: 'kyu-kei',
      kana: 'きゅうけい',
      kanji: '休憩',
      example: {
        jp: 'Kyukei wa juu go fun desu.',
        vi: 'Giờ nghỉ là mười lăm phút.',
        kana: 'きゅうけいはじゅうごふんです。',
        kanji: '休憩は十五分です。',
      },
      status: 'learning',
      module: 'Nhịp ca làm',
      strength: 58,
      tags: ['Shift', 'Routine'],
      explanation: 'Giờ nghỉ giữa ca. Khi cần đi nghỉ phải xin phép bằng "Kyukei ni ittemo ii desu ka?" chứ không tự rời vị trí. Ca dài thường có kyukei 45-60 phút, ca ngắn thì 15 phút.',
      mnemonic: '"Kyu" nghe gần "cứu" — hết ca sáng được "cứu" bằng giờ nghỉ.',
    },
    {
      id: 'zairyu-card',
      word: 'zairyu card',
      article: '—',
      meaning: 'thẻ cư trú',
      pronunciation: 'zai-ryu ka-do',
      kana: 'ざいりゅうカード',
      kanji: '在留カード',
      example: {
        jp: 'Mensetsu no mae ni zairyu card o kakunin shimasu.',
        vi: 'Trước buổi phỏng vấn, hãy kiểm tra lại thẻ cư trú.',
        kana: 'めんせつのまえにざいりゅうカードをかくにんします。',
        kanji: '面接の前に在留カードを確認します。',
      },
      status: 'new',
      module: 'Hồ sơ',
      strength: 18,
      tags: ['Documents', 'Tokutei'],
      explanation: 'Thẻ cư trú do Cục Xuất nhập cảnh cấp, ghi tư cách lưu trú và hạn. Luật yêu cầu mang theo người mọi lúc. Khi đổi chỗ ở hoặc đổi công ty phải đi khai báo trong 14 ngày, trễ hạn là bị phạt.',
      mnemonic: '"Zairyu" (在留) = đang ở lại — tấm thẻ chứng minh anh được ở lại Nhật.',
    },
    {
      id: 'mensetsu',
      word: 'mensetsu',
      article: '—',
      meaning: 'phỏng vấn',
      pronunciation: 'men-set-su',
      kana: 'めんせつ',
      kanji: '面接',
      example: {
        jp: 'Mensetsu de wa mijikai kotae ga anzen desu.',
        vi: 'Trong phỏng vấn, câu trả lời ngắn thường an toàn hơn.',
        kana: 'めんせつではみじかいこたえがあんぜんです。',
        kanji: '面接では短い答えが安全です。',
      },
      status: 'due',
      module: 'Phỏng vấn',
      strength: 44,
      tags: ['Interview', 'Core'],
      explanation: 'Buổi phỏng vấn xin việc. Nhà tuyển dụng Nhật chấm thái độ và sự rõ ràng hơn là vốn từ nhiều: trả lời ngắn, nói đủ nghe, không hiểu thì xin nhắc lại bằng "Mou ichido onegaishimasu".',
      mnemonic: '"Men" (面) là mặt, "setsu" (接) là tiếp — gặp mặt trực tiếp.',
    },
  ],
  reviewQuestions: [
    {
      id: 'rq-1',
      type: 'meaning',
      prompt: '“zairyu card” nghĩa là gì?',
      options: ['thẻ cư trú', 'giờ nghỉ', 'quản lý cửa hàng', 'bảng ca'],
      answer: 'thẻ cư trú',
      explanation: 'Đây là giấy tờ nền mà anh cần hiểu và chuẩn bị kỹ trong lộ trình Tokutei.',
      source: 'Module hồ sơ',
    },
    {
      id: 'rq-2',
      type: 'article',
      prompt: 'Khi vào ca, câu mở đầu nào phù hợp nhất?',
      options: ['Ohayou gozaimasu.', 'Mou kaerimasu.', 'Daijoubu janai.', 'Muzukashii desu ne.'],
      answer: 'Ohayou gozaimasu.',
      explanation: 'Một lời chào đầu ca rõ ràng luôn là phản xạ an toàn và chuyên nghiệp.',
      source: 'Module vào ca',
    },
    {
      id: 'rq-3',
      type: 'sentence',
      prompt: 'Khi HR hỏi mục tiêu sang Nhật, câu nào gọn và an toàn nhất?',
      options: ['Em muốn học và làm việc ổn định lâu dài.', 'Em chưa rõ nhưng sang trước rồi tính.', 'Em muốn thử vài tháng thôi.', 'Bạn em bảo đi nên em đi.'],
      answer: 'Em muốn học và làm việc ổn định lâu dài.',
      explanation: 'Câu trả lời cần ngắn, rõ ý và thể hiện định hướng nghiêm túc.',
      source: 'Module phỏng vấn',
    },
    {
      id: 'rq-4',
      type: 'listening',
      prompt: 'Nghe mock: “houkoku”. Chọn nghĩa phù hợp.',
      options: ['báo cáo', 'xin phép', 'giờ nghỉ', 'đồng phục'],
      answer: 'báo cáo',
      explanation: 'Từ này gắn với thói quen xử lý sự cố và giao tiếp nội bộ.',
      source: 'Podcast 02',
    },
  ],
  documents: [
    {
      id: 'doc-tokutei-checklist',
      title: 'Checklist hồ sơ Tokutei đầu vào',
      kind: 'PDF',
      size: '2.8 MB',
      publishedAt: '2026-05-06',
      readTime: '9 phút',
      module: 'Hồ sơ',
      summary: 'Danh sách giấy tờ nên kiểm tra trước phỏng vấn và trước ngày xuất cảnh.',
      preview: 'Gồm hộ chiếu, thẻ cư trú, ảnh hồ sơ, giấy xác nhận và checklist đối chiếu từng bước.',
      tags: ['PDF', 'Checklist'],
    },
    {
      id: 'doc-self-intro-post',
      title: 'Khung tự giới thiệu 45 giây an toàn',
      kind: 'Post',
      size: 'Bài đăng',
      publishedAt: '2026-05-06',
      readTime: '6 phút',
      module: 'Phỏng vấn',
      summary: 'Bố cục ngắn để anh nói tên, mục tiêu, thế mạnh và cam kết học việc.',
      preview: 'Mở đầu bằng tên, hiện trạng học, lý do chọn ngành và một câu cam kết về thái độ làm việc.',
      tags: ['Article', 'Interview'],
    },
    {
      id: 'doc-5s-sheet',
      title: '5S và an toàn đầu ca',
      kind: 'PDF',
      size: '1.1 MB',
      publishedAt: '2026-05-06',
      readTime: '7 phút',
      module: 'Workplace',
      summary: 'Tờ nhắc nhanh về sạch sẽ, sắp xếp, đúng vị trí và báo cáo sự cố.',
      preview: 'Trang đầu gom 5S, quy tắc vệ sinh, vị trí đồ dùng và checklist đầu ca để luyện phản xạ.',
      tags: ['Operations', 'Safety'],
    },
  ],
  games: [
    {
      id: 'vocabulary-sprint',
      title: 'Shift Sprint',
      source: 'Tạo từ cụm từ nơi làm việc',
      description: 'Chọn phản xạ đúng càng nhanh càng tốt trong 60 giây.',
      rounds: 10,
      bestScore: 86,
      duration: '1 phút',
      color: 'from-orange-500 to-amber-400',
    },
    {
      id: 'article-match',
      title: 'Safety Match',
      source: 'Tạo từ checklist 5S và nội quy',
      description: 'Ghép đúng quy tắc với tình huống ở nơi làm việc.',
      rounds: 8,
      bestScore: 72,
      duration: '2 phút',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      id: 'sentence-builder',
      title: 'Interview Flow',
      source: 'Tạo từ 12 câu phỏng vấn cốt lõi',
      description: 'Chọn thứ tự câu trả lời gọn, đúng ý và không lan man.',
      rounds: 6,
      bestScore: 64,
      duration: '3 phút',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      id: 'listening-pick',
      title: 'Form Finder',
      source: 'Tạo từ bộ giấy tờ Tokutei',
      description: 'Xác định đúng giấy tờ hoặc bước xử lý theo từng tình huống.',
      rounds: 8,
      bestScore: 78,
      duration: '2 phút',
      color: 'from-violet-500 to-fuchsia-400',
    },
  ],
  exams: [
    {
      id: 'tokutei-mini-01',
      title: 'Tokutei Mock 01 · JFT + Workplace',
      skills: ['Tiếng Nhật', 'Tình huống'],
      duration: '25 phút',
      status: 'ready',
    },
    {
      id: 'interview-setup',
      title: 'HR Interview Drill · Tự giới thiệu',
      skills: ['Phỏng vấn'],
      duration: '12 phút',
      status: 'in_progress',
      latestScore: 70,
    },
    {
      id: 'tokutei-full-mock',
      title: 'Full Readiness Check · Hồ sơ + phản xạ',
      skills: ['Tiếng Nhật', 'Hồ sơ', 'Tình huống', 'Phỏng vấn'],
      duration: '65 phút',
      status: 'completed',
      latestScore: 82,
    },
  ],
  podcasts: [
    {
      id: 'pod-01',
      title: 'Trước giờ vào ca',
      episode: 'Episode 01',
      duration: '05:30',
      summary: 'Nghe lại ba câu mở đầu cần nhớ để vào ca tự tin hơn.',
      isNew: false,
    },
    {
      id: 'pod-02',
      title: 'Ba câu tự giới thiệu an toàn',
      episode: 'Episode 02',
      duration: '08:15',
      summary: 'Ôn câu tự giới thiệu gọn để không bị lan man khi phỏng vấn.',
      isNew: true,
    },
    {
      id: 'pod-03',
      title: 'Checklist hồ sơ mang theo',
      episode: 'Episode 03',
      duration: '06:45',
      summary: 'Nhắc lại các giấy tờ và thứ tự kiểm tra trước buổi hẹn quan trọng.',
      isNew: false,
    },
  ],
};

export const courseLearningWorkspaces: Record<string, CourseLearningWorkspaceData> = {
  'course-1': tokuteiWorkspace,
  'course-tokutei': tokuteiWorkspace,
};

export function getCourseLearningWorkspace(courseId: string | undefined): CourseLearningWorkspaceData {
  if (!courseId) {
    return tokuteiWorkspace;
  }

  return courseLearningWorkspaces[courseId] ?? tokuteiWorkspace;
}
