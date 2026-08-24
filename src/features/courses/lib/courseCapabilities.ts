import {
  courseWorkspaceTabs,
  type CourseWorkspaceSection,
  type CourseWorkspaceTab,
} from './courseWorkspaceNavigation';

export type CourseFeatureFlags = Record<CourseWorkspaceSection, boolean>;
export type CourseFeatureConfig = Partial<CourseFeatureFlags>;

export const defaultCourseFeatureFlags: CourseFeatureFlags = {
  vocabulary: true,
  documents: true,
  practice: true,
  games: true,
  exams: true,
};

export function resolveCourseFeatureConfig(value: unknown): CourseFeatureFlags {
  const source = value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

  return {
    vocabulary: source.vocabulary !== false,
    documents: source.documents !== false,
    practice: source.practice !== false,
    games: source.games !== false,
    exams: source.exams !== false,
  };
}

export function getVisibleCourseWorkspaceTabs(config: unknown): CourseWorkspaceTab[] {
  const resolved = resolveCourseFeatureConfig(config);
  return courseWorkspaceTabs.filter((tab) => resolved[tab.id]);
}

export function isCourseFeatureEnabled(config: unknown, feature: CourseWorkspaceSection): boolean {
  return resolveCourseFeatureConfig(config)[feature];
}
