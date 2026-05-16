import { supabase } from '@/src/features/supabase/lib/supabaseClient';
import { validateSupabaseSeedSnapshot, type SupabaseSeedSnapshot } from '@/src/features/supabase/lib/seedValidation';

interface CourseRow {
  id: string;
  status: string;
}

interface LessonRow {
  id: string;
  course_id: string;
}

interface VocabularyRow {
  id: string;
  audio_url: string | null;
  lesson_vocabulary?: Array<{ lesson_id: string }>;
}

interface AudioAssetRow {
  id: string;
  lesson_id: string;
  asset_type: string;
  external_url: string | null;
}

interface ApiKeyMetadataRow {
  id: string;
  masked_key: string;
}

export interface SeedSnapshotRepositoryResult {
  snapshot: SupabaseSeedSnapshot;
  validationErrors: string[];
}

function toSeedSnapshot({
  courses,
  lessons,
  vocabulary,
  audioAssets,
  adminApiKeys,
}: {
  courses: CourseRow[];
  lessons: LessonRow[];
  vocabulary: VocabularyRow[];
  audioAssets: AudioAssetRow[];
  adminApiKeys: ApiKeyMetadataRow[];
}): SupabaseSeedSnapshot {
  return {
    courses: courses.map((course) => ({ id: course.id, status: course.status })),
    lessons: lessons.map((lesson) => ({ id: lesson.id, courseId: lesson.course_id })),
    vocabulary: vocabulary.map((item) => ({
      id: item.id,
      lessonId: item.lesson_vocabulary?.[0]?.lesson_id ?? '',
      hasAudio: Boolean(item.audio_url),
      audioUrl: item.audio_url,
    })),
    audioAssets: audioAssets.map((asset) => ({
      id: asset.id,
      lessonId: asset.lesson_id,
      type: asset.asset_type,
      externalUrl: asset.external_url,
    })),
    adminApiKeys: adminApiKeys.map((metadata) => ({ id: metadata.id, maskedKey: metadata.masked_key })),
  };
}

export async function loadSupabaseSeedSnapshot(): Promise<SeedSnapshotRepositoryResult | null> {
  if (!supabase) {
    return null;
  }

  const [courses, lessons, vocabulary, audioAssets, adminApiKeys] = await Promise.all([
    supabase.from('courses').select('id,status'),
    supabase.from('lessons').select('id,course_id'),
    supabase.from('vocabulary_items').select('id,audio_url,lesson_vocabulary(lesson_id)'),
    supabase.from('lesson_assets').select('id,lesson_id,asset_type,external_url').eq('asset_type', 'audio'),
    supabase.from('api_key_metadata').select('id,masked_key'),
  ]);

  const firstError = [courses.error, lessons.error, vocabulary.error, audioAssets.error, adminApiKeys.error].find(Boolean);

  if (firstError) {
    throw new Error(firstError.message);
  }

  const snapshot = toSeedSnapshot({
    courses: courses.data ?? [],
    lessons: lessons.data ?? [],
    vocabulary: vocabulary.data ?? [],
    audioAssets: audioAssets.data ?? [],
    adminApiKeys: adminApiKeys.data ?? [],
  });

  return {
    snapshot,
    validationErrors: validateSupabaseSeedSnapshot(snapshot),
  };
}
