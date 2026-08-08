import { courseWorkspaceTabs } from './courseWorkspaceNavigation';

const expectedIds = ['vocabulary', 'documents', 'practice', 'games', 'exams'];

if (courseWorkspaceTabs.length !== expectedIds.length) {
  throw new Error('Course workspace must expose exactly five sections.');
}

if (courseWorkspaceTabs.some((tab, index) => tab.id !== expectedIds[index] || !tab.imageIcon || !tab.hint)) {
  throw new Error('Course workspace metadata is missing an ordered tab, hint, or image.');
}

if (new Set(courseWorkspaceTabs.map((tab) => tab.id)).size !== courseWorkspaceTabs.length) {
  throw new Error('Course workspace tab ids must be unique.');
}

// eslint-disable-next-line no-console
console.log('✓ courseWorkspaceNavigation.test passed');
