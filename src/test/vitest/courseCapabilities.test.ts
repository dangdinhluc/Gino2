import { describe, expect, it } from 'vitest';
import {
  getVisibleCourseWorkspaceTabs,
  isCourseFeatureEnabled,
  resolveCourseFeatureConfig,
} from '@/src/features/courses/lib/courseCapabilities';

describe('course feature config', () => {
  it('defaults missing config to all capabilities enabled', () => {
    expect(resolveCourseFeatureConfig(null)).toEqual({
      vocabulary: true,
      documents: true,
      practice: true,
      games: true,
      exams: true,
    });
    expect(getVisibleCourseWorkspaceTabs(undefined).map((tab) => tab.id)).toEqual([
      'vocabulary',
      'documents',
      'practice',
      'games',
      'exams',
    ]);
  });

  it('hides disabled capabilities without adding course-specific tabs', () => {
    const config = { games: false, exams: false };
    expect(isCourseFeatureEnabled(config, 'games')).toBe(false);
    expect(getVisibleCourseWorkspaceTabs(config).map((tab) => tab.id)).toEqual([
      'vocabulary',
      'documents',
      'practice',
    ]);
  });
});
