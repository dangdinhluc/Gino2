import type { LucideIcon } from 'lucide-react';
import {
  Award,
  BookOpen,
  Flame,
  Headphones,
  Mic,
  PenTool,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from 'lucide-react';

export type LessonExerciseType = 'choice' | 'match' | 'order' | 'listen';

export interface LessonExercise {
  id: string;
  type: LessonExerciseType;
  prompt: string;
  instruction: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface ExamSkillSummary {
  id: 'language' | 'workplace' | 'documents' | 'interview';
  label: string;
  icon: LucideIcon;
  totalQuestions: number;
  answered: number;
  score: number;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  example: string;
  level: string;
  dueDate: string;
  strength: 'Yếu' | 'Ổn' | 'Tốt';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  status: 'unlocked' | 'locked';
  progress: number;
  icon: LucideIcon;
}

export const lessonShell = {
  courseTitle: 'Tokutei Foundation Sprint',
  lessonTitle: 'Bài 3: Tự giới thiệu khi phỏng vấn',
  hearts: 5,
  xpReward: 35,
  exercises: [
    {
      id: 'ex-1',
      type: 'choice',
      prompt: 'Watashi wa Minh desu.',
      instruction: 'Chọn nghĩa đúng của câu này.',
      options: ['Tôi là Minh.', 'Tôi muốn nghỉ giải lao.', 'Tôi đến ca muộn.', 'Tôi cần trợ giúp.'],
      answer: 'Tôi là Minh.',
      explanation: 'Đây là mẫu tự giới thiệu ngắn, an toàn khi vào phỏng vấn hoặc đầu ca.',
    },
    {
      id: 'ex-2',
      type: 'listen',
      prompt: 'Yoroshiku onegaishimasu',
      instruction: 'Nghe cụm từ và chọn nghĩa phù hợp.',
      options: ['Rất mong được giúp đỡ', 'Xin nghỉ ca', 'Báo cáo sự cố', 'Xin lỗi vì đến muộn'],
      answer: 'Rất mong được giúp đỡ',
      explanation: 'Đây là cụm lịch sự dùng nhiều khi tự giới thiệu và bắt đầu làm việc.',
    },
    {
      id: 'ex-3',
      type: 'order',
      prompt: 'Nihon / de / hatarakitai / desu',
      instruction: 'Chọn câu có thứ tự đúng.',
      options: ['Nihon de hatarakitai desu.', 'Hatarakitai Nihon de desu.', 'Desu Nihon de hatarakitai.', 'Nihon hatarakitai de desu.'],
      answer: 'Nihon de hatarakitai desu.',
      explanation: 'Đây là mẫu trả lời gọn khi nói mục tiêu sang Nhật làm việc.',
    },
    {
      id: 'ex-4',
      type: 'match',
      prompt: 'anzen',
      instruction: 'Ghép từ với nghĩa đúng.',
      options: ['an toàn', 'quản lý', 'giấy tờ', 'giờ nghỉ'],
      answer: 'an toàn',
      explanation: 'Từ này xuất hiện liên tục trong module nội quy và tác phong nơi làm việc.',
    },
  ] satisfies LessonExercise[],
};

export const examShell = {
  id: 'e1',
  title: 'Tokutei Mock 01 · JFT + Workplace',
  provider: 'Tokutei Prep',
  duration: '01:20:00',
  questionTitle: 'Tình huống đầu ca: chọn phản ứng đúng',
  passage: 'Anh bước vào ca làm đầu tiên. Quản lý yêu cầu chào đội, xác nhận vị trí đứng và nhắc quy tắc an toàn trước khi thao tác.',
  options: ['A. Chào đội và xác nhận vị trí làm', 'B. Tự ý vào bếp và làm ngay', 'C. Để điện thoại trên quầy cho tiện', 'D. Bỏ qua checklist đầu ca'],
  skills: [
    { id: 'language', label: 'Tiếng Nhật', icon: BookOpen, totalQuestions: 16, answered: 10, score: 78 },
    { id: 'workplace', label: 'Tình huống', icon: Headphones, totalQuestions: 10, answered: 6, score: 72 },
    { id: 'documents', label: 'Hồ sơ', icon: PenTool, totalQuestions: 6, answered: 4, score: 81 },
    { id: 'interview', label: 'Phỏng vấn', icon: Mic, totalQuestions: 4, answered: 2, score: 75 },
  ] satisfies ExamSkillSummary[],
};

export const flashcards = [
  {
    id: 'card-1',
    front: 'aisatsu',
    back: 'chào hỏi đúng mực khi vào ca',
    example: 'Vào ca, hãy bắt đầu bằng một aisatsu rõ và gọn.',
    level: 'JFT Basic',
    dueDate: '2026-05-06',
    strength: 'Yếu',
  },
  {
    id: 'card-2',
    front: 'houkoku',
    back: 'báo cáo',
    example: 'Khi có sự cố nhỏ, ưu tiên houkoku cho quản lý trước.',
    level: 'Tokutei Core',
    dueDate: '2026-05-06',
    strength: 'Ổn',
  },
  {
    id: 'card-3',
    front: 'zairyu card',
    back: 'thẻ cư trú',
    example: 'Trước buổi phỏng vấn, kiểm tra lại zairyu card và giấy tờ mang theo.',
    level: 'Hồ sơ',
    dueDate: '2026-05-07',
    strength: 'Tốt',
  },
] satisfies FlashcardItem[];

export const aiPromptChips = [
  'Sửa câu trả lời phỏng vấn này giúp anh',
  'Tóm tắt lộ trình Tokutei thật ngắn',
  'Cho anh 5 câu tự giới thiệu an toàn',
  'Đóng vai HR phỏng vấn Tokutei',
];

export const initialChatMessages = [
  {
    id: 'msg-1',
    role: 'assistant',
    text: 'Chào anh, em là Gino AI. Anh có thể hỏi về phỏng vấn, hồ sơ, cụm tiếng Nhật sống còn hoặc mock test Tokutei, em sẽ trả lời theo format ngắn và thực dụng.',
  },
] satisfies ChatMessage[];

export const statsShell = {
  streakDays: 18,
  xp: 4280,
  level: 12,
  dailyGoal: 60,
  completedToday: 34,
  weeklyActivity: [
    { day: 'T2', minutes: 18 },
    { day: 'T3', minutes: 24 },
    { day: 'T4', minutes: 12 },
    { day: 'T5', minutes: 28 },
    { day: 'T6', minutes: 22 },
    { day: 'T7', minutes: 36 },
    { day: 'CN', minutes: 16 },
  ],
  skills: [
    { label: 'Tiếng Nhật', value: 78, color: 'bg-blue-500' },
    { label: 'Tình huống', value: 64, color: 'bg-orange-500' },
    { label: 'Phỏng vấn', value: 58, color: 'bg-purple-500' },
    { label: 'Hồ sơ', value: 46, color: 'bg-emerald-500' },
  ],
  achievements: [
    { id: 'a1', title: 'Giữ nhịp 14 ngày', status: 'unlocked', progress: 100, icon: Flame },
    { id: 'a2', title: 'Hoàn thành 3 mini mock', status: 'unlocked', progress: 100, icon: Trophy },
    { id: 'a3', title: 'Nghe hiểu đầu ca', status: 'locked', progress: 58, icon: Volume2 },
    { id: 'a4', title: 'Hồ sơ đủ bộ', status: 'locked', progress: 42, icon: PenTool },
    { id: 'a5', title: 'Phỏng vấn tự tin', status: 'locked', progress: 35, icon: Mic },
    { id: 'a6', title: 'Sẵn sàng xuất cảnh', status: 'locked', progress: 24, icon: Award },
  ] satisfies AchievementItem[],
  highlights: [
    { label: 'Chuỗi tốt nhất', value: '18 ngày', icon: Flame },
    { label: 'Điểm tuần này', value: '+640 XP', icon: Star },
    { label: 'Track sắp mở', value: 'HR Mock Room', icon: Sparkles },
  ],
};
