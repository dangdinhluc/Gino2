import type { Course } from '@/src/features/courses/types';

export const COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Tokutei Foundation Sprint',
    level: 'JFT Basic + Core',
    description: 'Lộ trình nền để dựng tiếng Nhật sống còn, tác phong đi làm và phản xạ phỏng vấn Tokutei.',
    progress: 46,
    totalLessons: 18,
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'course-2',
    title: 'Nhà hàng Tokutei Drill',
    level: 'Workplace',
    description: 'Tình huống ca làm, câu chào đầu ca, an toàn và phản xạ báo cáo cho ngành dịch vụ ăn uống.',
    progress: 24,
    totalLessons: 14,
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
  },
];
