/**
 * Dữ liệu mẫu cho trang chi tiết khóa học.
 *
 * Trước đây toàn bộ phần này nằm trực tiếp trong `CourseDetailPage.tsx`, khiến
 * component vừa lo hiển thị vừa lo dữ liệu và rất khó thay bằng dữ liệu thật.
 *
 * Khi nối Supabase, chỉ cần thay `getCourseDetailSeed` bằng một hook/repository
 * trả về đúng shape `CourseDetailSeed` là màn hình không phải sửa gì.
 */

export type CourseResourceKind = 'pdf' | 'audio';

export type CourseHighlightIcon = 'check' | 'layers' | 'headphones' | 'zap';

export interface CourseDetailLesson {
  id: string;
  title: string;
  /** Định dạng mm:ss */
  duration: string;
  completed: boolean;
  locked: boolean;
}

export interface CourseDetailModule {
  title: string;
  lessons: CourseDetailLesson[];
}

export interface CourseVocabEntry {
  word: string;
  meaning: string;
  category: string;
}

export interface CourseResource {
  title: string;
  kind: CourseResourceKind;
  size: string;
}

export interface CoursePodcastEpisode {
  id: number;
  title: string;
  duration: string;
}

export interface CourseHighlight {
  title: string;
  description: string;
  icon: CourseHighlightIcon;
}

export interface CourseReviewSession {
  questionCount: number;
  minutes: number;
  xp: number;
}

export interface CourseDetailSeed {
  id: string;
  title: string;
  level: string;
  description: string;
  image: string;
  /** Tổng thời lượng dạng đọc được, ví dụ "12 giờ" */
  duration: string;
  rating: number;
  students: string;
  overviewPoints: string[];
  highlights: CourseHighlight[];
  modules: CourseDetailModule[];
  vocabulary: CourseVocabEntry[];
  resources: CourseResource[];
  podcasts: CoursePodcastEpisode[];
  reviewSession: CourseReviewSession;
}

const tokuteiFoundationSprint: CourseDetailSeed = {
  id: 'course-1',
  title: 'Tokutei Foundation Sprint',
  level: 'JFT Basic + Core',
  description:
    'Lộ trình nền để anh dựng tiếng Nhật sống còn, tác phong đi làm, hồ sơ và phản xạ phỏng vấn Tokutei.',
  image:
    'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=1000',
  duration: '12 giờ',
  rating: 4.9,
  students: '2.4k',
  overviewPoints: [
    'Bắt đầu từ lời chào đầu ca, tự giới thiệu và tác phong làm việc.',
    'Mỗi bài học ngắn, phù hợp học theo phiên 10-15 phút.',
    'Có sẵn checklist hồ sơ, cụm từ sống còn và phần ôn tập theo module.',
  ],
  highlights: [
    {
      title: 'Nắm nền Tokutei',
      description: 'Lời chào đầu ca, tự giới thiệu, 5S và quy tắc cơ bản.',
      icon: 'check',
    },
    {
      title: 'Cụm từ dùng được',
      description: 'Tập trung vào các cụm xuất hiện nhiều trong hồ sơ và nơi làm việc.',
      icon: 'layers',
    },
    {
      title: 'Nghe lại linh hoạt',
      description: 'Podcast khóa học giúp ôn khi nghỉ ngắn hoặc di chuyển.',
      icon: 'headphones',
    },
    {
      title: 'Có điểm dừng rõ',
      description: 'Mỗi module có phần ôn tập riêng để anh biết mình đã chắc tới đâu.',
      icon: 'zap',
    },
  ],
  modules: [
    {
      title: 'Module 1: Vào ca & Aisatsu',
      lessons: [
        { id: '1', title: 'Bài 1: Câu chào đầu ca', duration: '12:00', completed: true, locked: false },
        { id: '2', title: 'Bài 2: Checklist vị trí làm việc', duration: '08:45', completed: true, locked: false },
        { id: '3', title: 'Bài 3: Tự giới thiệu ngắn', duration: '15:20', completed: false, locked: false },
      ],
    },
    {
      title: 'Module 2: Hồ sơ & Phỏng vấn',
      lessons: [
        { id: '4', title: 'Bài 4: Hồ sơ phải kiểm tra', duration: '10:15', completed: false, locked: true },
        { id: '5', title: 'Bài 5: Trả lời câu hỏi HR', duration: '14:30', completed: false, locked: true },
        { id: '6', title: 'Bài 6: Báo cáo khi chưa hiểu', duration: '11:00', completed: false, locked: true },
      ],
    },
  ],
  vocabulary: [
    { word: 'ohayou gozaimasu', meaning: 'chào buổi sáng', category: 'Chào hỏi' },
    { word: 'houkoku', meaning: 'báo cáo', category: 'Hành động' },
    { word: 'kyukei', meaning: 'giờ nghỉ', category: 'Ca làm' },
    { word: 'tenchou', meaning: 'quản lý cửa hàng', category: 'Vai trò' },
    { word: 'zairyu card', meaning: 'thẻ cư trú', category: 'Hồ sơ' },
  ],
  resources: [
    { title: 'Checklist hồ sơ Tokutei', kind: 'pdf', size: '2.8 MB' },
    { title: 'Audio tự giới thiệu 45 giây', kind: 'audio', size: '12 MB' },
    { title: '5S và an toàn đầu ca', kind: 'pdf', size: '1.5 MB' },
  ],
  podcasts: [
    { id: 1, title: 'Episode 1: Trước giờ vào ca', duration: '05:30' },
    { id: 2, title: 'Episode 2: Tự giới thiệu ngắn', duration: '08:15' },
    { id: 3, title: 'Episode 3: Checklist hồ sơ', duration: '06:45' },
    { id: 4, title: 'Episode 4: Báo cáo khi chưa hiểu', duration: '07:20' },
  ],
  reviewSession: {
    questionCount: 10,
    minutes: 5,
    xp: 100,
  },
};

/** Tra theo id khóa học. Thêm khóa mới chỉ cần bổ sung vào đây. */
export const courseDetailSeeds: Record<string, CourseDetailSeed> = {
  'course-1': tokuteiFoundationSprint,
  '1': tokuteiFoundationSprint,
};

export const defaultCourseDetailSeed = tokuteiFoundationSprint;

/** Lấy dữ liệu khóa học theo id, fallback về khóa mặc định nếu chưa có. */
export function getCourseDetailSeed(courseId?: string): CourseDetailSeed {
  if (!courseId) return defaultCourseDetailSeed;
  return courseDetailSeeds[courseId] ?? defaultCourseDetailSeed;
}

/**
 * Tổng số bài học, tính từ modules.
 *
 * Trước đây `totalLessons` bị hardcode là 18 trong khi modules chỉ khai báo 6
 * bài, nên phần trăm tiến độ luôn sai. Tính từ dữ liệu thật để không lệch nữa.
 */
export function getCourseLessonCount(seed: CourseDetailSeed): number {
  return seed.modules.reduce((total, module) => total + module.lessons.length, 0);
}
