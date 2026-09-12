/**
 * Bottom-nav activation rules.
 *
 * "Thi thử" is not its own route tree: `/app/exams` redirects into the exam tab of
 * the active course workspace (`/app/courses/:id/workspace?tab=exams`). A plain
 * prefix match therefore lights "Khóa học" for `/app/courses/:id/workspace...`
 * even while the learner is on the exam tab, so both tabs lit up at once.
 *
 * These helpers are the single source of truth for "are we on the exam tab", shared
 * by MainLayout (whether to render the nav) and BottomNav (which item is active), so
 * the two can never drift apart.
 */

/** True when the route is a course workspace showing the exam tab. */
export function isExamWorkspaceTab(pathname: string, search: string): boolean {
  return pathname.endsWith('/workspace') && new URLSearchParams(search).get('tab') === 'exams';
}

/** True when a bottom-nav destination owns the current location. */
export function isBottomNavItemActive(path: string, pathname: string, search: string): boolean {
  const onExamTab = isExamWorkspaceTab(pathname, search);

  if (path === '/app/exams') {
    return pathname === '/app/exams' || pathname.startsWith('/app/exams/') || onExamTab;
  }

  if (path === '/app/courses') {
    const inCourseTree = pathname === '/app/courses' || pathname.startsWith('/app/courses/');
    return inCourseTree && !onExamTab;
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}
