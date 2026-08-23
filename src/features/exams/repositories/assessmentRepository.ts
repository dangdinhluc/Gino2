import { requireSupabase, requireUserId } from '@/src/features/supabase/lib/supabaseRepository';
import type { Json } from '@/src/features/supabase/lib/database.types';
import type { Exam } from '@/src/features/exams/types';

export interface AssessmentConfig {
  durationMinutes: number | null;
  totalPoints: number | null;
  passingPoints: number | null;
  scoringMode: string;
  showStrategyAfterSubmit: boolean;
}

export interface AssessmentQuestionMetadata {
  domain?: string;
  section?: string;
  kind?: string;
  points?: number;
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  prompt: string;
  options: string[];
  orderIndex: number;
  metadata: AssessmentQuestionMetadata;
}

export interface AssessmentPaper {
  id: string;
  courseId: string;
  title: string;
  type: string;
  passingScore: number;
  config: AssessmentConfig;
  questions: AssessmentQuestion[];
}

export interface AssessmentSectionBreakdown {
  domain: string;
  section: string;
  questions: number;
  correctAnswers: number;
  pointsEarned: number;
  totalPoints: number;
}

export interface AssessmentResult {
  attemptId: string;
  assessmentId: string;
  score: number;
  passed: boolean;
  totalQuestions: number;
  correctAnswers: number;
  attemptedAt: string;
  pointsEarned: number;
  totalPoints: number;
  passingPoints: number;
  sectionBreakdown: AssessmentSectionBreakdown[];
}

export interface AssessmentVocabClue {
  term: string;
  meaning?: string;
  whenSeen?: string;
}

export interface AssessmentStrategy {
  questionPattern?: string;
  signalWords: string[];
  quickRule?: string;
  answerReason?: string;
  vocabClues: AssessmentVocabClue[];
  eliminationTips: string[];
  trap?: string;
  examSteps: string[];
  memoryTip?: string;
}

export interface AssessmentResultDetail {
  questionId: string;
  prompt: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  orderIndex: number;
  points: number;
  pointsEarned: number;
  domain?: string;
  section?: string;
  kind?: string;
  strategy: AssessmentStrategy;
}

type JsonObject = { [key: string]: Json | undefined };
type RpcResponse<T> = { data: T | null; error: { message: string } | null };

function isJsonObject(value: Json | undefined | null): value is JsonObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function asString(value: Json | undefined): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asNumber(value: Json | undefined): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function asStringArray(value: Json | undefined): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0) : [];
}

function asOptions(value: Json): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function parseAssessmentConfig(value: Json | undefined | null): AssessmentConfig {
  const config = isJsonObject(value) ? value : {};
  return {
    durationMinutes: asNumber(config.durationMinutes) ?? null,
    totalPoints: asNumber(config.totalPoints) ?? null,
    passingPoints: asNumber(config.passingPoints) ?? null,
    scoringMode: asString(config.scoringMode) ?? 'equal_percentage',
    showStrategyAfterSubmit: typeof config.showStrategyAfterSubmit === 'boolean' ? config.showStrategyAfterSubmit : true,
  };
}

function parseQuestionMetadata(value: Json | undefined | null): AssessmentQuestionMetadata {
  const metadata = isJsonObject(value) ? value : {};
  return {
    domain: asString(metadata.domain),
    section: asString(metadata.section),
    kind: asString(metadata.kind),
    points: asNumber(metadata.points),
  };
}

function parseVocabClues(value: Json | undefined): AssessmentVocabClue[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isJsonObject(entry)) return [];
    const term = asString(entry.term);
    if (!term) return [];
    return [{
      term,
      meaning: asString(entry.meaning) ?? asString(entry.meaning_vi),
      whenSeen: asString(entry.whenSeen) ?? asString(entry.when_seen_vi),
    }];
  });
}

function parseStrategy(value: Json | undefined | null): AssessmentStrategy {
  const metadata = isJsonObject(value) ? value : {};
  const nested = isJsonObject(metadata.strategy) ? metadata.strategy : {};
  const source: JsonObject = { ...metadata, ...nested };
  const trapValue = source.trap ?? source.traps;
  const trap = typeof trapValue === 'string'
    ? trapValue
    : Array.isArray(trapValue)
      ? trapValue.filter((item): item is string => typeof item === 'string').join(' · ')
      : undefined;
  return {
    questionPattern: asString(source.questionPattern) ?? asString(source.pattern),
    signalWords: asStringArray(source.signalWords),
    quickRule: asString(source.quickRule),
    answerReason: asString(source.answerReason),
    vocabClues: parseVocabClues(source.vocabClues),
    eliminationTips: asStringArray(source.eliminationTips),
    trap,
    examSteps: asStringArray(source.examSteps),
    memoryTip: asString(source.memoryTip),
  };
}

function parseSectionBreakdown(value: Json | undefined | null): AssessmentSectionBreakdown[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isJsonObject(entry)) return [];
    return [{
      domain: asString(entry.domain) ?? 'Tổng hợp',
      section: asString(entry.section) ?? 'Chung',
      questions: asNumber(entry.questions) ?? 0,
      correctAnswers: asNumber(entry.correctAnswers) ?? 0,
      pointsEarned: asNumber(entry.pointsEarned) ?? 0,
      totalPoints: asNumber(entry.totalPoints) ?? 0,
    }];
  });
}

async function callUntypedRpc<T>(name: string, args: Record<string, unknown>): Promise<RpcResponse<T>> {
  const client = requireSupabase();
  const rpc = client.rpc.bind(client) as unknown as (fn: string, params: Record<string, unknown>) => Promise<RpcResponse<T>>;
  return rpc(name, args);
}

function isMissingV2Rpc(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes('could not find the function') || normalized.includes('does not exist') || normalized.includes('pgrst202');
}

type AssessmentListRow = {
  id: string;
  title: string;
  assessment_type: string;
  passing_score: number;
  course_id: string;
  order_index: number;
  config?: Json;
};

export async function fetchPublishedAssessments(): Promise<Exam[]> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const [{ data, error }, { data: attempts, error: attemptsError }] = await Promise.all([
    client.from('assessments').select('*').eq('status', 'published').order('order_index'),
    client.from('assessment_attempts').select('assessment_id, passed').eq('user_id', userId),
  ]);
  if (error) throw new Error(error.message);
  if (attemptsError) throw new Error(attemptsError.message);

  const rows = ([...(data ?? [])] as unknown as AssessmentListRow[]).sort((a, b) => (
    a.course_id === b.course_id ? a.order_index - b.order_index : a.course_id.localeCompare(b.course_id)
  ));
  const passedIds = new Set((attempts ?? []).filter((attempt) => attempt.passed).map((attempt) => attempt.assessment_id));
  const byCourse = new Map<string, AssessmentListRow[]>();
  for (const row of rows) {
    const list = byCourse.get(row.course_id) ?? [];
    list.push(row);
    byCourse.set(row.course_id, list);
  }

  const exams: Exam[] = [];
  for (const list of byCourse.values()) {
    list.forEach((assessment, index) => {
      const previous = index > 0 ? list[index - 1] : null;
      const isLocked = index > 0 && previous !== null && !passedIds.has(previous.id);
      const config = parseAssessmentConfig(assessment.config);
      const passLabel = config.totalPoints && config.passingPoints
        ? `Đạt từ ${config.passingPoints}/${config.totalPoints}`
        : `Đạt từ ${assessment.passing_score}%`;
      const skills = [passLabel];
      if (config.durationMinutes) skills.push(`${config.durationMinutes} phút`);
      exams.push({
        id: assessment.id,
        title: assessment.title,
        type: assessment.assessment_type,
        skills,
        courseId: assessment.course_id,
        orderIndex: assessment.order_index,
        ...(isLocked
          ? { locked: true, unlockLabel: previous ? `Vượt "${previous.title}" để mở` : 'Chưa mở khóa' }
          : { locked: false }),
      });
    });
  }
  return exams;
}

export interface AssessmentUnlockState {
  locked: boolean;
  unlockLabel?: string;
}

export async function fetchAssessmentUnlockState(assessmentId: string): Promise<AssessmentUnlockState> {
  const client = requireSupabase();
  const userId = await requireUserId(client);
  const [{ data: assessment, error: assessmentError }, { data: attempts, error: attemptsError }] = await Promise.all([
    client.from('assessments').select('id, course_id, title, order_index').eq('id', assessmentId).eq('status', 'published').maybeSingle(),
    client.from('assessment_attempts').select('assessment_id, passed').eq('user_id', userId),
  ]);
  if (assessmentError) throw new Error(assessmentError.message);
  if (attemptsError) throw new Error(attemptsError.message);
  if (!assessment) return { locked: false };

  const { data: siblings, error: siblingsError } = await client
    .from('assessments')
    .select('id, title, order_index')
    .eq('course_id', assessment.course_id)
    .eq('status', 'published')
    .order('order_index');
  if (siblingsError) throw new Error(siblingsError.message);
  const ordered = (siblings ?? []).sort((a, b) => a.order_index - b.order_index);
  const index = ordered.findIndex((item) => item.id === assessmentId);
  if (index <= 0) return { locked: false };
  const previous = ordered[index - 1];
  const passedIds = new Set((attempts ?? []).filter((attempt) => attempt.passed).map((attempt) => attempt.assessment_id));
  return passedIds.has(previous.id)
    ? { locked: false }
    : { locked: true, unlockLabel: `Vượt "${previous.title}" để mở khóa đề này` };
}

type PaperV2Row = {
  assessment_id: string;
  course_id: string;
  title: string;
  assessment_type: string;
  passing_score: number;
  config: Json;
  questions: Json;
};

export async function fetchAssessmentPaper(assessmentId: string): Promise<AssessmentPaper | null> {
  const v2 = await callUntypedRpc<PaperV2Row[]>('get_assessment_paper_v2', { target_assessment_id: assessmentId });
  if (!v2.error) {
    const row = v2.data?.[0];
    if (!row) return null;
    const rawQuestions = Array.isArray(row.questions) ? row.questions : [];
    return {
      id: row.assessment_id,
      courseId: row.course_id,
      title: row.title,
      type: row.assessment_type,
      passingScore: row.passing_score,
      config: parseAssessmentConfig(row.config),
      questions: rawQuestions.flatMap((item) => {
        if (!isJsonObject(item)) return [];
        const id = asString(item.id);
        const prompt = asString(item.prompt);
        const questionAssessmentId = asString(item.assessmentId);
        if (!id || !prompt || !questionAssessmentId) return [];
        return [{
          id,
          assessmentId: questionAssessmentId,
          prompt,
          options: asOptions(item.options ?? []),
          orderIndex: asNumber(item.orderIndex) ?? 0,
          metadata: parseQuestionMetadata(item.metadata),
        }];
      }),
    };
  }
  if (!isMissingV2Rpc(v2.error.message)) throw new Error(v2.error.message);

  const client = requireSupabase();
  const [{ data: assessment, error: assessmentError }, { data: questions, error: questionError }] = await Promise.all([
    client.from('assessments').select('id, course_id, title, assessment_type, passing_score').eq('id', assessmentId).maybeSingle(),
    client.from('assessment_questions').select('id, assessment_id, prompt, options, order_index').eq('assessment_id', assessmentId).order('order_index'),
  ]);
  if (assessmentError) throw new Error(assessmentError.message);
  if (questionError) throw new Error(questionError.message);
  if (!assessment) return null;
  return {
    id: assessment.id,
    courseId: assessment.course_id,
    title: assessment.title,
    type: assessment.assessment_type,
    passingScore: assessment.passing_score,
    config: parseAssessmentConfig(null),
    questions: (questions ?? []).map((question) => ({
      id: question.id,
      assessmentId: question.assessment_id,
      prompt: question.prompt,
      options: asOptions(question.options),
      orderIndex: question.order_index,
      metadata: {},
    })),
  };
}

type ResultV2Row = {
  attempt_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  attempted_at: string;
  points_earned: number;
  total_points: number;
  passing_points: number;
  section_breakdown: Json;
};

function mapResultV2(row: ResultV2Row): AssessmentResult {
  return {
    attemptId: row.attempt_id,
    assessmentId: row.assessment_id,
    score: row.score,
    passed: row.passed,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    attemptedAt: row.attempted_at,
    pointsEarned: row.points_earned,
    totalPoints: row.total_points,
    passingPoints: row.passing_points,
    sectionBreakdown: parseSectionBreakdown(row.section_breakdown),
  };
}

async function getLegacyPassingScore(assessmentId: string): Promise<number> {
  const { data, error } = await requireSupabase().from('assessments').select('passing_score').eq('id', assessmentId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.passing_score ?? 0;
}

function mapLegacyResult(row: {
  attempt_id: string;
  assessment_id: string;
  score: number;
  passed: boolean;
  total_questions: number;
  correct_answers: number;
  attempted_at: string;
}, passingScore: number): AssessmentResult {
  return {
    attemptId: row.attempt_id,
    assessmentId: row.assessment_id,
    score: row.score,
    passed: row.passed,
    totalQuestions: row.total_questions,
    correctAnswers: row.correct_answers,
    attemptedAt: row.attempted_at,
    pointsEarned: row.correct_answers,
    totalPoints: row.total_questions,
    passingPoints: Math.ceil(row.total_questions * passingScore / 100),
    sectionBreakdown: [],
  };
}

export async function submitAssessment(assessmentId: string, answers: Record<string, string>): Promise<AssessmentResult> {
  const v2 = await callUntypedRpc<ResultV2Row[]>('submit_assessment_v2', { target_assessment_id: assessmentId, target_answers: answers });
  if (!v2.error) {
    const result = v2.data?.[0];
    if (!result) throw new Error('Không nhận được kết quả chấm điểm từ máy chủ.');
    return mapResultV2(result);
  }
  if (!isMissingV2Rpc(v2.error.message)) throw new Error(v2.error.message);

  const [{ data, error }, passingScore] = await Promise.all([
    requireSupabase().rpc('submit_assessment', { target_assessment_id: assessmentId, target_answers: answers }),
    getLegacyPassingScore(assessmentId),
  ]);
  if (error) throw new Error(error.message);
  const result = data?.[0];
  if (!result) throw new Error('Không nhận được kết quả chấm điểm từ máy chủ.');
  return mapLegacyResult(result, passingScore);
}

export async function fetchLatestAssessmentResult(assessmentId: string): Promise<AssessmentResult | null> {
  const v2 = await callUntypedRpc<ResultV2Row[]>('get_latest_assessment_result_v2', { target_assessment_id: assessmentId });
  if (!v2.error) return v2.data?.[0] ? mapResultV2(v2.data[0]) : null;
  if (!isMissingV2Rpc(v2.error.message)) throw new Error(v2.error.message);

  const [{ data, error }, passingScore] = await Promise.all([
    requireSupabase().rpc('get_latest_assessment_result', { target_assessment_id: assessmentId }),
    getLegacyPassingScore(assessmentId),
  ]);
  if (error) throw new Error(error.message);
  return data?.[0] ? mapLegacyResult(data[0], passingScore) : null;
}

type ResultDetailV2Row = {
  question_id: string;
  prompt: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  explanation: string;
  order_index: number;
  metadata: Json;
  points: number;
  points_earned: number;
};

export async function fetchAssessmentResultDetail(attemptId: string): Promise<AssessmentResultDetail[]> {
  const v2 = await callUntypedRpc<ResultDetailV2Row[]>('get_assessment_result_detail_v2', { target_attempt_id: attemptId });
  if (!v2.error) {
    return (v2.data ?? []).map((item) => {
      const metadata = parseQuestionMetadata(item.metadata);
      return {
        questionId: item.question_id,
        prompt: item.prompt,
        selectedAnswer: item.selected_answer,
        correctAnswer: item.correct_answer,
        isCorrect: item.is_correct,
        explanation: item.explanation,
        orderIndex: item.order_index,
        points: item.points,
        pointsEarned: item.points_earned,
        domain: metadata.domain,
        section: metadata.section,
        kind: metadata.kind,
        strategy: parseStrategy(item.metadata),
      };
    });
  }
  if (!isMissingV2Rpc(v2.error.message)) throw new Error(v2.error.message);

  const { data, error } = await requireSupabase().rpc('get_assessment_result_detail', { target_attempt_id: attemptId });
  if (error) throw new Error(error.message);
  return (data ?? []).map((item) => ({
    questionId: item.question_id,
    prompt: item.prompt,
    selectedAnswer: item.selected_answer,
    correctAnswer: '',
    isCorrect: item.is_correct,
    explanation: item.explanation,
    orderIndex: item.order_index,
    points: 1,
    pointsEarned: item.is_correct ? 1 : 0,
    strategy: { signalWords: [], vocabClues: [], eliminationTips: [], examSteps: [] },
  }));
}
