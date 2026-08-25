import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearCourseLearningCache,
  fetchCourseLearningCached,
  invalidateCourseLearningCache,
} from '@/src/features/courses/lib/courseLearningCache';

afterEach(() => {
  clearCourseLearningCache();
  vi.restoreAllMocks();
});

describe('course learning cache', () => {
  it('deduplicates an in-flight module request and reuses its result', async () => {
    let resolveRequest: (value: { vocabulary: string[] }) => void = () => undefined;
    const loader = vi.fn(() => new Promise<{ vocabulary: string[] }>((resolve) => { resolveRequest = resolve; }));

    const firstRequest = fetchCourseLearningCached('course-1', 'vocabulary', loader);
    const secondRequest = fetchCourseLearningCached('course-1', 'vocabulary', loader);
    expect(loader).toHaveBeenCalledTimes(1);

    resolveRequest({ vocabulary: ['one'] });
    await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([{ vocabulary: ['one'] }, { vocabulary: ['one'] }]);
    await expect(fetchCourseLearningCached('course-1', 'vocabulary', loader)).resolves.toEqual({ vocabulary: ['one'] });
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('invalidates only the requested module', async () => {
    const loader = vi.fn((value: string) => Promise.resolve({ value }));
    await fetchCourseLearningCached('course-1', 'documents', () => loader('documents'));
    await fetchCourseLearningCached('course-1', 'exams', () => loader('exams'));

    invalidateCourseLearningCache('course-1', 'documents');
    await fetchCourseLearningCached('course-1', 'documents', () => loader('documents-reloaded'));
    await fetchCourseLearningCached('course-1', 'exams', () => loader('exams-again'));

    expect(loader.mock.calls).toEqual([['documents'], ['exams'], ['documents-reloaded']]);
  });
});
