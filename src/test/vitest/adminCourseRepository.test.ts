import { describe, expect, it } from 'vitest';
import { summarizeAdminCourses } from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';

const course = (id: string): Tables<'courses'> => ({
  id,
  slug: id,
  title: id,
  level: 'N4',
  description: 'Mô tả',
  order_index: 0,
  theme_color: null,
  status: 'draft',
  published_at: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
});

describe('summarizeAdminCourses', () => {
  it('groups relationship counts under the right course and computes readiness', () => {
    const summaries = summarizeAdminCourses({
      courses: [course('course-a'), course('course-b')],
      modules: [{ course_id: 'course-a', status: 'published' }, { course_id: 'course-a', status: 'draft' }],
      lessons: [{ id: 'lesson-a', course_id: 'course-a', status: 'published' }, { id: 'lesson-b', course_id: 'course-b', status: 'published' }],
      lessonVocabulary: [{ lesson_id: 'lesson-a' }, { lesson_id: 'lesson-a' }, { lesson_id: 'lesson-b' }],
      assessments: [{ course_id: 'course-a', status: 'published' }],
      documents: [{ course_id: 'course-a', status: 'draft' }],
      audio: [{ course_id: 'course-b', status: 'published' }],
    });

    expect(summaries[0]).toMatchObject({ course: { id: 'course-a' }, moduleCount: 2, lessonCount: 1, vocabularyLinkCount: 2, assessmentCount: 1, documentCount: 1, audioCount: 0, readinessPercent: 60, pendingContentCount: 2 });
    expect(summaries[1]).toMatchObject({ course: { id: 'course-b' }, moduleCount: 0, lessonCount: 1, vocabularyLinkCount: 1, assessmentCount: 0, documentCount: 0, audioCount: 1, readinessPercent: 100, pendingContentCount: 0 });
  });
});
