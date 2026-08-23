import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';

type SeedCourse = {
  id: string;
  slug: string;
  title: string;
  level: string;
  status: string;
  description: string;
  theme_color: string;
  order_index: number;
};

type SeedModule = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  level: string;
  status: string;
  order_index: number;
};

type SeedLesson = {
  id: string;
  course_id: string;
  module_id: string;
  title: string;
  description: string;
  lesson_type: string;
  duration_minutes: number;
  objectives: string[];
  knowledge_points: string[];
  scenario: string;
  content_markdown: string;
};

type SeedVocabulary = {
  id: string;
  term: string;
  translation: string;
  reading: string;
  pronunciation: string;
  example_sentence: string;
  level: string;
  tags: string[];
};

type SeedLessonVocabulary = {
  lesson_id: string;
  vocabulary_item_id: string;
  position: number;
};

type SeedQuestion = {
  id: string;
  lesson_id: string;
  question_type: string;
  prompt_ja: string;
  prompt_vi: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
  difficulty: string;
  domain: string;
};

type SeedAssessment = {
  id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  passing_score: number;
  status: string;
  order_index: number;
};

type SeedMockQuestion = {
  id: string;
  domain: string;
  section: string;
  kind: string;
  prompt_ja: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
  difficulty: string;
};

type StrategyExplanation = {
  quick_rule_vi?: string;
  answer_reason_vi?: string;
};

type StrategyQuestion = {
  id: string;
  lesson_id: string;
  domain: string;
  section: string;
  kind: string;
  topic?: string;
  prompt_ja: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
  difficulty: string;
  exam_eligible: boolean;
  source_term?: string;
  authoring_note?: string;
  strategy_explanation?: StrategyExplanation;
};

type StrategyData = {
  meta: { course_id: string; counts: Record<string, number> };
  keyword_rules: unknown[];
  formula_guide: unknown[];
  v2_questions_enhanced: StrategyQuestion[];
  advanced_questions: StrategyQuestion[];
};

type V3MockQuestion = StrategyQuestion & {
  exam_question_no: number;
  points: number;
  source_question_id: string;
};

type V3MockExam = {
  meta: {
    id: string;
    title: string;
    total_questions: number;
    passing_percent: number;
  };
  questions: V3MockQuestion[];
};

type V3MockData = {
  mock_exams: V3MockExam[];
};

type ReviewQuestionSource = {
  id: string;
  lesson_id: string;
  prompt_ja: string;
  prompt_vi?: string;
  options: string[];
  correct_index: number;
  explanation_vi: string;
  strategy_explanation?: StrategyExplanation;
};

type SeedData = {
  meta: { counts: Record<string, number> };
  course: SeedCourse;
  modules: SeedModule[];
  lessons: SeedLesson[];
  vocabulary_items: SeedVocabulary[];
  lesson_vocabulary: SeedLessonVocabulary[];
  starter_questions: SeedQuestion[];
  assessments: SeedAssessment[];
  mock_exams: Array<{
    meta: { id: string; total_questions: number };
    questions: SeedMockQuestion[];
  }>;
};

type SeedClient = {
  from: (table: string) => {
    upsert: (rows: Record<string, unknown>[], options: { onConflict: string }) => PromiseLike<{ error: { message: string } | null }>;
  };
};

const DATA_PATH = resolve(process.cwd(), 'src/data/courses/ssw2-gaishoku/gino2_ssw2_gaishoku_seed_v1.json');
const STRATEGY_PATH = resolve(process.cwd(), 'src/data/courses/ssw2-gaishoku/gino2_ssw2_gaishoku_v31_strategy_questions.json');
const MOCK_V3_PATH = resolve(process.cwd(), 'src/data/courses/ssw2-gaishoku/gino2_ssw2_gaishoku_v33_mock_exams.json');
const STRATEGY_GUIDE_PATH = resolve(process.cwd(), 'src/data/courses/ssw2-gaishoku/gino2_ssw2_gaishoku_v34_exam_strategy.md');
const seed = JSON.parse(readFileSync(DATA_PATH, 'utf8')) as SeedData;
const strategy = JSON.parse(readFileSync(STRATEGY_PATH, 'utf8')) as StrategyData;
const mockV3 = JSON.parse(readFileSync(MOCK_V3_PATH, 'utf8')) as V3MockData;
const strategyGuide = readFileSync(STRATEGY_GUIDE_PATH, 'utf8');
const publish = process.argv.includes('--publish');

const assessmentByModule: Record<string, string> = {
  'ssw2-gai-m01': 'ssw2-gai-assess-hygiene',
  'ssw2-gai-m02': 'ssw2-gai-assess-cooking',
  'ssw2-gai-m03': 'ssw2-gai-assess-service',
  'ssw2-gai-m04': 'ssw2-gai-assess-store',
};

function assertUnique(label: string, ids: string[]): void {
  assert.equal(new Set(ids).size, ids.length, `${label} contains duplicate IDs`);
}

function validateSeed(): void {
  const courseIds = new Set([seed.course.id]);
  const moduleIds = new Set(seed.modules.map((module) => module.id));
  const lessonIds = new Set(seed.lessons.map((lesson) => lesson.id));
  const vocabularyIds = new Set(seed.vocabulary_items.map((item) => item.id));

  assertUnique('modules', seed.modules.map((module) => module.id));
  assertUnique('lessons', seed.lessons.map((lesson) => lesson.id));
  assertUnique('vocabulary', seed.vocabulary_items.map((item) => item.id));
  assertUnique('starter questions', seed.starter_questions.map((question) => question.id));
  assertUnique('assessments', seed.assessments.map((assessment) => assessment.id));
  assert.equal(seed.meta.counts.modules, seed.modules.length, 'module count does not match meta');
  assert.equal(seed.meta.counts.lessons, seed.lessons.length, 'lesson count does not match meta');
  assert.equal(seed.meta.counts.vocabulary_items, seed.vocabulary_items.length, 'vocabulary count does not match meta');
  assert.equal(seed.meta.counts.starter_questions, seed.starter_questions.length, 'starter question count does not match meta');

  for (const module of seed.modules) {
    assert.ok(courseIds.has(module.course_id), `module ${module.id} references a missing course`);
  }
  for (const lesson of seed.lessons) {
    assert.ok(courseIds.has(lesson.course_id), `lesson ${lesson.id} references a missing course`);
    assert.ok(moduleIds.has(lesson.module_id), `lesson ${lesson.id} references a missing module`);
    assert.ok(['vocabulary', 'grammar', 'conversation', 'exam-prep', 'listening'].includes(lesson.lesson_type), `lesson ${lesson.id} has an invalid lesson type`);
  }
  for (const link of seed.lesson_vocabulary) {
    assert.ok(lessonIds.has(link.lesson_id), `vocabulary link references a missing lesson: ${link.lesson_id}`);
    assert.ok(vocabularyIds.has(link.vocabulary_item_id), `vocabulary link references a missing item: ${link.vocabulary_item_id}`);
  }
  for (const question of seed.starter_questions) {
    assert.ok(lessonIds.has(question.lesson_id), `starter question ${question.id} references a missing lesson`);
    assert.ok(question.options.length >= 2, `starter question ${question.id} needs at least two options`);
    assert.ok(question.correct_index >= 0 && question.correct_index < question.options.length, `starter question ${question.id} has an invalid correct index`);
  }

  const mockExam = seed.mock_exams[0];
  assert.ok(mockExam, 'mock exam is missing');
  assert.equal(mockExam.meta.total_questions, mockExam.questions.length, 'mock exam count does not match meta');
  assert.ok(seed.assessments.some((assessment) => assessment.id === mockExam.meta.id), 'mock exam has no assessment row');
  for (const question of mockExam.questions) {
    assert.ok(question.options.length >= 2, `mock question ${question.id} needs at least two options`);
    assert.ok(question.correct_index >= 0 && question.correct_index < question.options.length, `mock question ${question.id} has an invalid correct index`);
  }

  assert.equal(strategy.meta.course_id, seed.course.id, 'strategy data references a different course');
  assert.equal(strategy.meta.counts.v2_questions_enhanced, strategy.v2_questions_enhanced.length, 'enhanced question count does not match meta');
  assert.equal(strategy.meta.counts.advanced_case_questions, strategy.advanced_questions.length, 'advanced question count does not match meta');
  assert.equal(strategy.meta.counts.combined_training_questions, strategy.v2_questions_enhanced.length + strategy.advanced_questions.length, 'combined training question count does not match meta');
  assert.equal(strategy.v2_questions_enhanced.length, 432, 'unexpected enhanced question count');
  assert.equal(strategy.advanced_questions.length, 200, 'unexpected advanced question count');
  assert.equal(mockV3.mock_exams.length, 3, 'unexpected V3 mock exam count');

  const strategyQuestions = [...strategy.v2_questions_enhanced, ...strategy.advanced_questions];
  assertUnique('enhanced questions', strategy.v2_questions_enhanced.map((question) => question.id));
  assertUnique('advanced questions', strategy.advanced_questions.map((question) => question.id));
  for (const question of strategyQuestions) {
    assert.ok(lessonIds.has(question.lesson_id), `strategy question ${question.id} references a missing lesson`);
    assert.ok(question.options.length >= 2, `strategy question ${question.id} needs at least two options`);
    assert.ok(question.correct_index >= 0 && question.correct_index < question.options.length, `strategy question ${question.id} has an invalid correct index`);
  }

  assertUnique('V3 mock assessments', mockV3.mock_exams.map((exam) => exam.meta.id));
  const v3QuestionIds = mockV3.mock_exams.flatMap((exam) => exam.questions.map((question) => question.id));
  assertUnique('V3 mock questions', v3QuestionIds);
  for (const exam of mockV3.mock_exams) {
    assert.equal(exam.meta.total_questions, exam.questions.length, `${exam.meta.id} count does not match meta`);
    for (const question of exam.questions) {
      assert.ok(lessonIds.has(question.lesson_id), `V3 mock question ${question.id} references a missing lesson`);
      assert.ok(question.options.length >= 2, `V3 mock question ${question.id} needs at least two options`);
      assert.ok(question.correct_index >= 0 && question.correct_index < question.options.length, `V3 mock question ${question.id} has an invalid correct index`);
    }
  }

  assertUnique('review question IDs', [
    ...seed.starter_questions.map((question) => question.id),
    ...strategyQuestions.map((question) => question.id),
  ]);
  assertUnique('assessment question IDs', [
    ...seed.starter_questions.map((question) => `ssw2-gai-assessment-q-${question.id}`),
    ...seed.mock_exams.flatMap((exam) => exam.questions.map((question) => question.id)),
    ...v3QuestionIds,
  ]);
  assert.ok(strategyGuide.trim().length > 0, 'V34 strategy guide is empty');
}

function sourceStatus(status: string): string {
  return publish ? 'published' : status;
}

function questionExplanation(question: ReviewQuestionSource): string {
  return [
    question.explanation_vi,
    question.strategy_explanation?.answer_reason_vi && question.strategy_explanation.answer_reason_vi !== question.explanation_vi
      ? question.strategy_explanation.answer_reason_vi
      : undefined,
    question.strategy_explanation?.quick_rule_vi ? `Mẹo: ${question.strategy_explanation.quick_rule_vi}` : undefined,
  ].filter((value): value is string => Boolean(value)).join('\n\n');
}

function buildRows() {
  const contentStatus = sourceStatus(seed.course.status);
  const publishedAt = contentStatus === 'published' ? new Date().toISOString() : null;
  const lessonOrder = new Map<string, number>();
  const lessons = seed.lessons.map((lesson) => {
    const orderIndex = (lessonOrder.get(lesson.module_id) ?? 0) + 1;
    lessonOrder.set(lesson.module_id, orderIndex);
    return {
      id: lesson.id,
      course_id: lesson.course_id,
      module_id: lesson.module_id,
      title: lesson.title,
      description: lesson.description,
      lesson_type: lesson.lesson_type,
      status: contentStatus,
      duration_minutes: lesson.duration_minutes,
      objectives: lesson.objectives,
      content_markdown: lesson.content_markdown,
      order_index: orderIndex,
    };
  });
  const reviewSources: ReviewQuestionSource[] = [
    ...seed.starter_questions,
    ...strategy.v2_questions_enhanced,
    ...strategy.advanced_questions,
  ];
  const reviewQuestions = reviewSources.map((question, index) => ({
    id: question.id,
    lesson_id: question.lesson_id,
    prompt: question.prompt_vi ? `${question.prompt_ja}\n${question.prompt_vi}` : question.prompt_ja,
    explanation: questionExplanation(question),
    order_index: index + 1,
  }));
  const reviewOptions = reviewSources.flatMap((question) => question.options.map((label, index) => ({
    id: `ssw2-gai-review-option-${question.id}-${index + 1}`,
    question_id: question.id,
    label,
    is_correct: index === question.correct_index,
    order_index: index + 1,
  })));
  const exerciseOrder = new Map<string, number>();
  const lessonExercises = seed.starter_questions.map((question) => {
    const orderIndex = (exerciseOrder.get(question.lesson_id) ?? 0) + 1;
    exerciseOrder.set(question.lesson_id, orderIndex);
    return {
      id: `ssw2-gai-exercise-${question.id}`,
      lesson_id: question.lesson_id,
      exercise_type: 'multiple-choice',
      prompt: question.prompt_ja,
      answer: question.options[question.correct_index],
      choices: question.options,
      order_index: orderIndex,
    };
  });
  const assessmentOrder = new Map<string, number>();
  const nextAssessmentOrder = (assessmentId: string): number => {
    const orderIndex = (assessmentOrder.get(assessmentId) ?? 0) + 1;
    assessmentOrder.set(assessmentId, orderIndex);
    return orderIndex;
  };
  const checkpointQuestions = seed.starter_questions.flatMap((question) => {
    const moduleId = seed.lessons.find((lesson) => lesson.id === question.lesson_id)?.module_id;
    const assessmentId = moduleId ? assessmentByModule[moduleId] : undefined;
    if (!assessmentId) return [];
    return [{
      id: `ssw2-gai-assessment-q-${question.id}`,
      assessment_id: assessmentId,
      prompt: question.prompt_ja,
      correct_answer: question.options[question.correct_index],
      options: question.options,
      explanation: question.explanation_vi,
      order_index: nextAssessmentOrder(assessmentId),
    }];
  });
  const mockAssessment = seed.mock_exams[0];
  const mockQuestions = mockAssessment.questions.map((question) => ({
    id: question.id,
    assessment_id: mockAssessment.meta.id,
    prompt: question.prompt_ja,
    correct_answer: question.options[question.correct_index],
    options: question.options,
    explanation: question.explanation_vi,
    order_index: nextAssessmentOrder(mockAssessment.meta.id),
  }));
  const v3Assessments = mockV3.mock_exams.map((exam, index) => ({
    id: exam.meta.id,
    course_id: seed.course.id,
    title: exam.meta.title,
    assessment_type: 'mock_exam',
    passing_score: exam.meta.passing_percent,
    status: contentStatus,
    order_index: Math.max(...seed.assessments.map((assessment) => assessment.order_index), 0) + index + 1,
  }));
  const v3MockQuestions = mockV3.mock_exams.flatMap((exam) => exam.questions.map((question) => ({
    id: question.id,
    assessment_id: exam.meta.id,
    prompt: question.prompt_ja,
    correct_answer: question.options[question.correct_index],
    options: question.options,
    explanation: questionExplanation(question),
    order_index: question.exam_question_no,
  })));

  return {
    courses: [{ ...seed.course, status: contentStatus, published_at: publishedAt }],
    modules: seed.modules.map((module) => ({ ...module, status: sourceStatus(module.status) })),
    lessons,
    vocabulary: seed.vocabulary_items.map((item) => ({
      ...item,
      audio_url: null,
      metadata: { source: 'gino2_ssw2_gaishoku_seed_v1' },
    })),
    lessonVocabulary: seed.lesson_vocabulary,
    lessonExercises,
    reviewQuestions,
    reviewOptions,
    assessments: [
      ...seed.assessments.map((assessment) => ({ ...assessment, status: sourceStatus(assessment.status) })),
      ...v3Assessments,
    ],
    assessmentQuestions: [...checkpointQuestions, ...mockQuestions, ...v3MockQuestions],
    documents: [
      ...seed.lessons.map((lesson) => ({
      id: `ssw2-gai-doc-${lesson.id}`,
      course_id: lesson.course_id,
      title: `${lesson.title} · Tài liệu học`,
      document_type: 'post',
      status: contentStatus,
      external_url: null,
      storage_path: null,
      summary: lesson.description,
      content_markdown: lesson.content_markdown,
      read_time_minutes: Math.max(5, Math.ceil(lesson.duration_minutes / 3)),
      metadata: {
        source: 'gino2_ssw2_gaishoku_seed_v1',
        moduleId: lesson.module_id,
        knowledgePoints: lesson.knowledge_points,
        scenario: lesson.scenario,
      },
      })),
      {
        id: 'ssw2-gai-doc-v34-exam-strategy',
        course_id: seed.course.id,
        title: 'Mẹo đọc đề & chọn đáp án V3',
        document_type: 'guide',
        status: contentStatus,
        external_url: null,
        storage_path: null,
        summary: 'Bộ quy tắc từ khóa, công thức và bẫy thường gặp khi làm bài 外食業2号.',
        content_markdown: strategyGuide,
        read_time_minutes: 15,
        metadata: {
          source: 'gino2_ssw2_gaishoku_v34_exam_strategy',
          keywordRules: strategy.keyword_rules,
          formulaGuide: strategy.formula_guide,
        },
      },
    ],
    podcasts: seed.modules.map((module) => ({
      id: `ssw2-gai-podcast-${module.id}`,
      course_id: module.course_id,
      lesson_id: seed.lessons.find((lesson) => lesson.module_id === module.id)?.id ?? null,
      title: `${module.title} · Audio sẽ bổ sung`,
      summary: 'Metadata podcast cho module; file âm thanh chưa được cung cấp trong bộ dữ liệu này.',
      external_url: null,
      storage_path: null,
      duration_minutes: 0,
      status: contentStatus,
    })),
  };
}

function requiredEnv(name: string): string {
  const value = process.env[name]?.trim() ?? (name === 'SUPABASE_URL' ? process.env.VITE_SUPABASE_URL?.trim() : undefined);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function upsert(client: SeedClient, table: string, rows: Record<string, unknown>[], onConflict = 'id'): Promise<void> {
  if (rows.length === 0) return;
  const { error } = await client.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
}

async function seedCourse(): Promise<void> {
  const rows = buildRows();
  const client = createClient(requiredEnv('SUPABASE_URL'), requiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { autoRefreshToken: false, persistSession: false },
  }) as unknown as SeedClient;

  await upsert(client, 'courses', rows.courses);
  await upsert(client, 'course_modules', rows.modules);
  await upsert(client, 'lessons', rows.lessons);
  await upsert(client, 'vocabulary_items', rows.vocabulary);
  await upsert(client, 'lesson_vocabulary', rows.lessonVocabulary, 'lesson_id,vocabulary_item_id');
  await upsert(client, 'lesson_exercises', rows.lessonExercises);
  await upsert(client, 'review_questions', rows.reviewQuestions);
  await upsert(client, 'review_options', rows.reviewOptions);
  await upsert(client, 'assessments', rows.assessments);
  await upsert(client, 'assessment_questions', rows.assessmentQuestions);
  await upsert(client, 'documents', rows.documents);
  await upsert(client, 'podcast_episodes', rows.podcasts);

  console.log(JSON.stringify({
    course: seed.course.id,
    status: rows.courses[0].status,
    counts: {
      modules: rows.modules.length,
      lessons: rows.lessons.length,
      vocabulary: rows.vocabulary.length,
      reviewQuestions: rows.reviewQuestions.length,
      lessonExercises: rows.lessonExercises.length,
      assessments: rows.assessments.length,
      assessmentQuestions: rows.assessmentQuestions.length,
      documents: rows.documents.length,
      podcasts: rows.podcasts.length,
    },
  }, null, 2));
}

async function main(): Promise<void> {
  validateSeed();
  if (process.argv.includes('--check')) {
    const rows = buildRows();
    console.log(JSON.stringify({
      valid: true,
      source: DATA_PATH,
      course: seed.course.id,
      counts: {
        modules: rows.modules.length,
        lessons: rows.lessons.length,
        vocabulary: rows.vocabulary.length,
        reviewQuestions: rows.reviewQuestions.length,
        assessments: rows.assessments.length,
        assessmentQuestions: rows.assessmentQuestions.length,
      },
    }, null, 2));
    return;
  }
  await seedCourse();
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
