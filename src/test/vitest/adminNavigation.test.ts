import { describe, expect, it } from 'vitest';
import { canAccessAdminPath, getAdminDefaultPath, getAdminNavigation } from '@/src/features/admin/lib/adminNavigation';

function pathsFor(role: Parameters<typeof getAdminNavigation>[0]): string[] {
  return getAdminNavigation(role).flatMap((group) => group.items.map((item) => item.to));
}

describe('Admin V2 navigation permissions', () => {
  it('shows every permitted group to an owner', () => {
    const paths = pathsFor('owner');
    expect(paths).toContain('/admin');
    expect(paths).toContain('/admin/content/courses');
    expect(paths).toContain('/admin/learners');
    expect(paths).toContain('/admin/communication/announcements');
    expect(paths).toContain('/admin/ai/prompts');
    expect(paths).toContain('/admin/system/staff');
  });

  it('keeps owner-only settings out of the content editor navigation', () => {
    const paths = pathsFor('content_editor');
    expect(paths).toContain('/admin/content/courses');
    expect(paths).toContain('/admin/system/revisions');
    expect(paths).not.toContain('/admin/system/staff');
    expect(paths).not.toContain('/admin/learners');
    expect(paths).not.toContain('/admin');
    expect(getAdminDefaultPath('content_editor')).toBe('/admin/content/courses');
  });

  it('keeps learner support scoped to learners and communication', () => {
    const paths = pathsFor('instructor_support');
    expect(paths).toContain('/admin/learners');
    expect(paths).toContain('/admin/communication/announcements');
    expect(paths).not.toContain('/admin/content/courses');
    expect(paths).not.toContain('/admin/system/staff');
  });

  it('keeps analyst navigation read-oriented', () => {
    const paths = pathsFor('analyst');
    expect(paths).toContain('/admin');
    expect(paths).toContain('/admin/communication/alerts');
    expect(paths).toContain('/admin/system/audit');
    expect(paths).not.toContain('/admin/content/courses');
    expect(paths).not.toContain('/admin/learners');
  });

  it('guards each nested route by its own permission instead of its navigation group', () => {
    expect(canAccessAdminPath('content_editor', '/admin/system/revisions')).toBe(true);
    expect(canAccessAdminPath('content_editor', '/admin/system/staff')).toBe(false);
    expect(canAccessAdminPath('instructor_support', '/admin/communication/announcements')).toBe(true);
    expect(canAccessAdminPath('instructor_support', '/admin/communication/alerts')).toBe(false);
  });
});
