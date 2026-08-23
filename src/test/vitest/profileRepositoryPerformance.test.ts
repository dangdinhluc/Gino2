import { readFileSync } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireUserId: vi.fn(),
  supabase: { from: vi.fn() },
  profilesQuery: { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() },
  learnerProfilesQuery: { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() },
}));

vi.mock('@/src/features/supabase/lib/supabaseRepository', () => ({
  requireSupabase: () => mocks.supabase,
  requireUserId: mocks.requireUserId,
}));

import { fetchLearnerProfile } from '@/src/features/profile/repositories/profileRepository';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireUserId.mockResolvedValue('fallback-user');
  mocks.profilesQuery.select.mockReturnValue(mocks.profilesQuery);
  mocks.profilesQuery.eq.mockReturnValue(mocks.profilesQuery);
  mocks.profilesQuery.maybeSingle.mockResolvedValue({ data: { display_name: 'Learner', email: 'learner@example.com' }, error: null });
  mocks.learnerProfilesQuery.select.mockReturnValue(mocks.learnerProfilesQuery);
  mocks.learnerProfilesQuery.eq.mockReturnValue(mocks.learnerProfilesQuery);
  mocks.learnerProfilesQuery.maybeSingle.mockResolvedValue({ data: { display_name: 'Learner', target_level: 'Tokutei Gino' }, error: null });
  mocks.supabase.from.mockImplementation((table: string) => table === 'profiles' ? mocks.profilesQuery : mocks.learnerProfilesQuery);
});

describe('profile repository request boundary', () => {
  it('uses the known AuthProvider user ID without an auth lookup', async () => {
    await fetchLearnerProfile('known-user');

    expect(mocks.requireUserId).not.toHaveBeenCalled();
    expect(mocks.profilesQuery.eq).toHaveBeenCalledWith('user_id', 'known-user');
    expect(mocks.learnerProfilesQuery.eq).toHaveBeenCalledWith('user_id', 'known-user');
  });

  it('keeps profile data independent from dashboard and stats repositories', () => {
    const source = readFileSync(path.resolve(process.cwd(), 'src/features/profile/repositories/profileRepository.ts'), 'utf8');
    expect(source).not.toContain('learnerDashboardRepository');
    expect(source).not.toContain('learnerStatsRepository');
  });
});
