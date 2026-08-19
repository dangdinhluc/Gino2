export interface Exam {
  id: string;
  title: string;
  type: string;
  skills: string[];
  /** Chỉ dùng nội bộ để tính prerequisite — courseId + orderIndex. */
  courseId?: string;
  orderIndex?: number;
  locked?: boolean;
  unlockLabel?: string;
}
