import type { Exam } from '@/src/features/exams/types';

export const EXAMS: Exam[] = [
  { id: 'e1', title: 'Tokutei Mock 01 · JFT + Workplace', type: 'Tokutei Mock', skills: ['Tiếng Nhật', 'Tình huống', 'Hồ sơ', 'Phỏng vấn'] },
  { id: 'e2', title: 'JFT-Basic Checkpoint · Ca làm đầu tiên', type: 'JFT-Basic', skills: ['Tiếng Nhật', 'Nghe hiểu', 'Biển báo'] },
  { id: 'e3', title: 'HR Interview Drill · Nhà hàng', type: 'Interview', skills: ['Phỏng vấn', 'Tự giới thiệu', 'Mục tiêu'] },
];
