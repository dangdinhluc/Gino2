export interface SeedCourse {
  id: string;
  status: string;
}

export interface SeedLesson {
  id: string;
  courseId: string;
}

export interface SeedVocabularyItem {
  id: string;
  lessonId: string;
  hasAudio: boolean;
  audioUrl: string | null;
}

export interface SeedAudioAsset {
  id: string;
  lessonId: string;
  type: string;
  externalUrl: string | null;
}

export interface SeedApiKeyMetadata {
  id: string;
  maskedKey: string;
}

export interface SupabaseSeedSnapshot {
  courses: SeedCourse[];
  lessons: SeedLesson[];
  vocabulary: SeedVocabularyItem[];
  audioAssets: SeedAudioAsset[];
  adminApiKeys: SeedApiKeyMetadata[];
}

function findDuplicateIds(items: ReadonlyArray<{ id: string }>, label: string): string[] {
  const seenIds = new Set<string>();
  const duplicateIds = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      duplicateIds.add(item.id);
    }

    seenIds.add(item.id);
  }

  return [...duplicateIds].map((id) => `Duplicate ${label} id: ${id}`);
}

function looksLikeRawSecret(value: string): boolean {
  return /^(sk|pk|key|secret|token|gemini|openai|anthropic)[-_]/i.test(value) || (value.length > 24 && !value.includes('•') && value !== 'not configured');
}

export function validateSupabaseSeedSnapshot(seed: SupabaseSeedSnapshot): string[] {
  const errors = [
    ...findDuplicateIds(seed.courses, 'course'),
    ...findDuplicateIds(seed.lessons, 'lesson'),
    ...findDuplicateIds(seed.vocabulary, 'vocabulary'),
    ...findDuplicateIds(seed.audioAssets, 'audio asset'),
    ...findDuplicateIds(seed.adminApiKeys, 'API key metadata'),
  ];

  const courseIds = new Set(seed.courses.map((course) => course.id));
  const lessonIds = new Set(seed.lessons.map((lesson) => lesson.id));

  for (const lesson of seed.lessons) {
    if (!courseIds.has(lesson.courseId)) {
      errors.push(`Lesson ${lesson.id} references missing course ${lesson.courseId}`);
    }
  }

  for (const item of seed.vocabulary) {
    if (!lessonIds.has(item.lessonId)) {
      errors.push(`Vocabulary ${item.id} references missing lesson ${item.lessonId}`);
    }

    if (item.audioUrl?.startsWith('supabase://')) {
      errors.push(`Vocabulary ${item.id} must not use Supabase Storage in phase 1`);
    }
  }

  for (const asset of seed.audioAssets) {
    if (!lessonIds.has(asset.lessonId)) {
      errors.push(`Audio asset ${asset.id} references missing lesson ${asset.lessonId}`);
    }

    if (asset.type === 'audio' && asset.externalUrl?.startsWith('supabase://')) {
      errors.push(`Audio asset ${asset.id} must not use Supabase Storage in phase 1`);
    }
  }

  for (const metadata of seed.adminApiKeys) {
    if (looksLikeRawSecret(metadata.maskedKey)) {
      errors.push(`API key metadata ${metadata.id} looks like a raw secret`);
    }
  }

  return errors;
}
