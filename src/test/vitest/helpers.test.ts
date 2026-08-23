import { describe, expect, it } from 'vitest';
import { decideAuthRouteAccess } from '@/src/features/auth/lib/authRouteDecisions';
import { courseWorkspaceTabs } from '@/src/features/courses/lib/courseWorkspaceNavigation';
import { toLearnerDateKey } from '@/src/features/profile/repositories/learningActivityRepository';

describe('core learner boundaries', () => {
  it('redirects an unauthenticated learner to the learner login', () => {
    expect(decideAuthRouteAccess({
      area: 'learner',
      isAuthenticated: false,
      isAdmin: false,
      staffRoleStatus: 'idle',
      isSupabaseConfigured: true,
    })).toEqual({ status: 'redirect', to: '/login', reason: 'missing-session' });
  });

  it('keeps course workspace tabs in the product order', () => {
    expect(courseWorkspaceTabs.map((tab) => tab.id)).toEqual([
      'vocabulary',
      'documents',
      'practice',
      'games',
      'exams',
    ]);
  });

  it('uses the learner timezone at a local-day boundary', () => {
    expect(toLearnerDateKey(new Date('2026-08-23T15:01:00.000Z'), 'Asia/Tokyo')).toBe('2026-08-24');
  });
});
