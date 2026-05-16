import { strict as assert } from 'node:assert';
import { validateSupabaseSeedSnapshot, type SupabaseSeedSnapshot } from './seedValidation';

const validSeed: SupabaseSeedSnapshot = {
  courses: [{ id: 'course-a1', status: 'published' }],
  lessons: [{ id: 'lesson-a1-1', courseId: 'course-a1' }],
  vocabulary: [{ id: 'vocab-hallo', lessonId: 'lesson-a1-1', hasAudio: false, audioUrl: null }],
  audioAssets: [{ id: 'asset-audio-1', lessonId: 'lesson-a1-1', type: 'audio', externalUrl: null }],
  adminApiKeys: [{ id: 'api-key-metadata', maskedKey: 'not configured' }],
};

assert.deepEqual(validateSupabaseSeedSnapshot(validSeed), [], 'valid seed should not report errors');

assert.deepEqual(
  validateSupabaseSeedSnapshot({
    ...validSeed,
    courses: [validSeed.courses[0], { ...validSeed.courses[0] }],
  }),
  ['Duplicate course id: course-a1'],
  'duplicate course ids should be rejected',
);

assert.deepEqual(
  validateSupabaseSeedSnapshot({
    ...validSeed,
    vocabulary: [{ id: 'vocab-orphan', lessonId: 'missing-lesson', hasAudio: false, audioUrl: null }],
  }),
  ['Vocabulary vocab-orphan references missing lesson missing-lesson'],
  'vocabulary should not reference a missing lesson',
);

assert.deepEqual(
  validateSupabaseSeedSnapshot({
    ...validSeed,
    audioAssets: [{ id: 'asset-storage', lessonId: 'lesson-a1-1', type: 'audio', externalUrl: 'supabase://bucket/audio.mp3' }],
  }),
  ['Audio asset asset-storage must not use Supabase Storage in phase 1'],
  'audio metadata should reject Supabase Storage URLs in phase 1',
);

assert.deepEqual(
  validateSupabaseSeedSnapshot({
    ...validSeed,
    adminApiKeys: [{ id: 'api-key-raw', maskedKey: 'sk-live-secret-value' }],
  }),
  ['API key metadata api-key-raw looks like a raw secret'],
  'seed validation should reject raw-looking API keys',
);
