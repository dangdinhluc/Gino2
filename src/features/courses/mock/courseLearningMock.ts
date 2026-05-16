export type VocabularyStatus = 'new' | 'learning' | 'due' | 'remembered';
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
  word: string;
  article: string;
  meaning: string;
  pronunciation: string;
  example: {
    de: string;
    vi: string;
  };
  status: VocabularyStatus;
  module: string;
  strength: number;
  tags: string[];
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
      example: { de: 'Ohayou gozaimasu. Kyou mo yoroshiku onegaishimasu.', vi: 'Chào buổi sáng. Hôm nay cũng mong được giúp đỡ.' },
      status: 'remembered',
      module: 'Vào ca',
      strength: 92,
      tags: ['Greeting', 'JFT'],
    },
    {
      id: 'tenchou',
      word: 'tenchou',
      article: '—',
      meaning: 'quản lý cửa hàng',
      pronunciation: 'ten-chou',
      example: { de: 'Tenchou ni houkoku shimasu.', vi: 'Em sẽ báo cáo với quản lý cửa hàng.' },
      status: 'due',
      module: 'Báo cáo & giao tiếp',
      strength: 48,
      tags: ['Workplace', 'People'],
    },
    {
      id: 'houkoku',
      word: 'houkoku',
      article: '—',
      meaning: 'báo cáo',
      pronunciation: 'hou-kô-ku',
      example: { de: 'Mondai ga areba, sugu houkoku shimasu.', vi: 'Nếu có vấn đề, hãy báo cáo ngay.' },
      status: 'learning',
      module: 'An toàn & kỷ luật',
      strength: 64,
      tags: ['Safety', 'Routine'],
    },
    {
      id: 'kyukei',
      word: 'kyukei',
      article: '—',
      meaning: 'giờ nghỉ',
      pronunciation: 'kyu-kei',
      example: { de: 'Kyukei wa juu go fun desu.', vi: 'Giờ nghỉ là mười lăm phút.' },
      status: 'learning',
      module: 'Nhịp ca làm',
      strength: 58,
      tags: ['Shift', 'Routine'],
    },
    {
      id: 'zairyu-card',
      word: 'zairyu card',
      article: '—',
      meaning: 'thẻ cư trú',
      pronunciation: 'zai-ryu ka-do',
      example: { de: 'Mensetsu no mae ni zairyu card o kakunin shimasu.', vi: 'Trước buổi phỏng vấn, hãy kiểm tra lại thẻ cư trú.' },
      status: 'new',
      module: 'Hồ sơ',
      strength: 18,
      tags: ['Documents', 'Tokutei'],
    },
    {
      id: 'mensetsu',
      word: 'mensetsu',
      article: '—',
      meaning: 'phỏng vấn',
      pronunciation: 'men-set-su',
      example: { de: 'Mensetsu de wa mijikai kotae ga anzen desu.', vi: 'Trong phỏng vấn, câu trả lời ngắn thường an toàn hơn.' },
      status: 'due',
      module: 'Phỏng vấn',
      strength: 44,
      tags: ['Interview', 'Core'],
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
