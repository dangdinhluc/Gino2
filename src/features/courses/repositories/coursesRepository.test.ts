import { strict as assert } from 'node:assert';
import { mapCourseRowToEntry, type SupabaseCourseRow } from './coursesRepository';

const baseRow: SupabaseCourseRow = {
  id: 'course-a1',
  title: 'Tokutei Foundation A1',
  level: 'A1',
  description: 'Core everyday Japanese for first-time Tokutei learners.',
  status: 'published',
  theme_color: '#2563eb',
  order_index: 1,
  lessons: [{ count: 4 }],
};

const mappedWithLessons = mapCourseRowToEntry(baseRow);
assert.equal(mappedWithLessons.id, 'course-a1');
assert.equal(mappedWithLessons.title, 'Tokutei Foundation A1');
assert.equal(mappedWithLessons.level, 'A1');
assert.equal(mappedWithLessons.totalLessons, 4, 'lesson count should come from the embedded count aggregate');
assert.equal(mappedWithLessons.themeColor, '#2563eb');
assert.equal(mappedWithLessons.progress, 0, 'progress defaults to 0 until enrollment data is wired');

const mappedWithProgress = mapCourseRowToEntry(baseRow, 49.6);
assert.equal(mappedWithProgress.progress, 50, 'enrollment progress should be rounded for display');

const mappedWithoutLessons = mapCourseRowToEntry({ ...baseRow, lessons: null });
assert.equal(mappedWithoutLessons.totalLessons, 0, 'missing lessons aggregate should default to 0');

const mappedWithEmptyLessons = mapCourseRowToEntry({ ...baseRow, lessons: [] });
assert.equal(mappedWithEmptyLessons.totalLessons, 0, 'empty lessons aggregate should default to 0');

assert.equal(typeof mappedWithLessons.image, 'string');
assert.equal(mappedWithLessons.image, '', 'course cards must not fabricate an image when Cloud has none');
