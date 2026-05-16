import { strict as assert } from 'node:assert';
import { filterAdminData } from './adminDashboardModel';

const grammarData = filterAdminData('course-content', '', 'grammar');
assert.ok(grammarData.courseLessons.length > 0, 'grammar filter should return grammar lessons');
assert.ok(grammarData.courseLessons.every((lesson) => lesson.type === 'grammar'), 'grammar filter should only return grammar lessons');
assert.ok(grammarData.courseModules.length > 0, 'grammar filter should include related modules');
assert.ok(
  grammarData.lessonAssets.every((asset) => grammarData.courseLessons.some((lesson) => lesson.id === asset.lessonId)),
  'grammar filter should only include assets related to visible lessons',
);
assert.ok(
  grammarData.lessonExercises.every((exercise) => grammarData.courseLessons.some((lesson) => lesson.id === exercise.lessonId)),
  'grammar filter should only include exercises related to visible lessons',
);

const assetQueryData = filterAdminData('course-content', 'Question order audio prompts', 'all');
assert.ok(
  assetQueryData.courseLessons.some((lesson) => lesson.id === 'lesson-a2-question-order'),
  'asset query should pull in the parent lesson',
);
assert.ok(
  assetQueryData.courseModules.some((module) => module.id === 'module-a2-question-order'),
  'asset query should pull in the parent module',
);

const moduleQueryData = filterAdminData('course-content', 'Daily routine role-play', 'all');
assert.equal(moduleQueryData.courseLessons.length, 0, 'module-only query should not invent lesson matches');
assert.ok(moduleQueryData.courseModules.length > 0, 'module-only query should keep module results visible');

const maskedKeySearchData = filterAdminData('api-keys', 'D3V1', 'all');
assert.equal(maskedKeySearchData.apiKeys.length, 0, 'API key search should not match masked key previews');

const apiOwnerSearchData = filterAdminData('api-keys', 'Security Owner', 'all');
assert.ok(apiOwnerSearchData.apiKeys.some((apiKey) => apiKey.id === 'api-key-gemini-prod'), 'API key search should still match metadata fields');
