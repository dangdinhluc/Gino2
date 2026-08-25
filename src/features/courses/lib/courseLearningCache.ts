export type CourseLearningModuleKey = 'meta' | 'vocabulary' | 'documents' | 'practice' | 'games' | 'exams' | 'podcasts';

export const courseLearningStaleTimes: Record<CourseLearningModuleKey, number> = {
  meta: 5 * 60_000,
  vocabulary: 5 * 60_000,
  documents: 5 * 60_000,
  practice: 2 * 60_000,
  games: 5 * 60_000,
  exams: 5 * 60_000,
  podcasts: 5 * 60_000,
};

interface CacheEntry {
  value: unknown;
  storedAt: number;
}

const entries = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

function cacheKey(courseId: string, module: CourseLearningModuleKey): string {
  return `course:${courseId}:${module}`;
}

export function readCourseLearningCache<T>(
  courseId: string,
  module: CourseLearningModuleKey,
): T | null | undefined {
  const key = cacheKey(courseId, module);
  const entry = entries.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.storedAt > courseLearningStaleTimes[module]) {
    entries.delete(key);
    return undefined;
  }
  return entry.value as T | null;
}

export function fetchCourseLearningCached<T>(
  courseId: string,
  module: CourseLearningModuleKey,
  loader: () => Promise<T | null>,
): Promise<T | null> {
  const cached = readCourseLearningCache<T>(courseId, module);
  if (cached !== undefined) return Promise.resolve(cached);

  const key = cacheKey(courseId, module);
  const currentRequest = inFlight.get(key);
  if (currentRequest) return currentRequest as Promise<T | null>;

  const request = loader()
    .then((value) => {
      entries.set(key, { value, storedAt: Date.now() });
      return value;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, request);
  return request;
}

export function invalidateCourseLearningCache(courseId: string, module?: CourseLearningModuleKey): void {
  if (module) {
    entries.delete(cacheKey(courseId, module));
    return;
  }

  for (const key of entries.keys()) {
    if (key.startsWith(`course:${courseId}:`)) entries.delete(key);
  }
}

export function clearCourseLearningCache(): void {
  entries.clear();
}
