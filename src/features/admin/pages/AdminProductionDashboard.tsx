import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Send,
  Trash2,
} from 'lucide-react';
import {
  archiveAdminAnnouncement,
  createAdminAnnouncement,
  createAdminCourse,
  createAdminInterventionNote,
  deleteAdminAlert,
  deleteAdminAssessment,
  deleteAdminAssessmentQuestion,
  deleteAdminAudio,
  deleteAdminCourse,
  deleteAdminDashboardHeroSlot,
  deleteAdminDocument,
  deleteAdminGrammarExample,
  deleteAdminGrammarRule,
  deleteAdminGrammarTopic,
  deleteAdminLesson,
  deleteAdminLessonAsset,
  deleteAdminLessonExercise,
  deleteAdminModule,
  deleteAdminPackage,
  deleteAdminPrompt,
  deleteAdminReviewQuestion,
  deleteAdminSitePage,
  deleteAdminSpeakingPrompt,
  deleteAdminVocabulary,
  fetchAdminLearnerDetail,
  getCurrentAdminRole,
  grantAdminEnrollment,
  inviteAdminStaff,
  publishAdminContent,
  rollbackAdminContentRevision,
  removeAdminStaffRole,
  replaceAdminPackageCourses,
  replaceAdminGrammarTopicCourses,
  replaceAdminLessonVocabulary,
  revokeAdminEnrollment,
  saveAdminAlert,
  saveAdminAssessment,
  saveAdminAssessmentQuestion,
  saveAdminAudio,
  saveAdminDashboardHeroSlot,
  saveAdminDocument,
  saveAdminGrammarExample,
  saveAdminGrammarRule,
  saveAdminGrammarTopic,
  saveAdminLesson,
  saveAdminLessonAsset,
  saveAdminLessonExercise,
  saveAdminModule,
  saveAdminPackage,
  saveAdminPrompt,
  saveAdminReviewQuestion,
  saveAdminSitePage,
  saveAdminSpeakingPrompt,
  saveAdminVocabulary,
  setAdminStaffRole,
  updateAdminCourse,
  uploadAdminCourseAsset,
  type AdminAnalytics,
  type AdminLearnerDetail,
  type AdminStaffMember,
  type AdminStaffRole,
} from '@/src/features/admin/repositories/adminRepository';
import type { Tables } from '@/src/features/supabase/lib/database.types';
import { loadProductionData } from '@/src/features/admin/lib/adminProductionData';
import { CONTENT_ENTITY_TYPES, isAnnouncementRole, PAGE_SIZE, sectionsFor } from '@/src/features/admin/lib/adminProductionConfig';
import { draftFromRow, fieldsFor, formatDate, rowId, rowMeta, rowTitle, rowsFor, sectionCount, splitList, text } from '@/src/features/admin/lib/adminProductionHelpers';
import { emptyProductionData, type CmsField, type ProductionData, type Row, type SectionId } from '@/src/features/admin/lib/adminProductionTypes';

function FieldControl({ field, value, onChange }: { field: CmsField; value: string; onChange: (value: string) => void }) {
  const id = `cms-${field.key}`;
  const common = 'mt-1 w-full rounded-xl border border-[#E4D8C9] bg-white px-3 py-2 text-sm text-[#172033] outline-none focus:border-[#315C73]';
  return (
    <label className={field.kind === 'textarea' ? 'sm:col-span-2' : ''} htmlFor={id}>
      <span className="text-xs font-bold text-[#5F6B7C]">{field.label}{field.required ? ' *' : ''}</span>
      {field.kind === 'textarea' ? <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} className={`${common} min-h-28 resize-y`} /> : field.kind === 'select' ? <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={common}><option value="">Chọn…</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.kind === 'multi' ? <select id={id} multiple value={splitList(value)} onChange={(event) => { const values: string[] = []; for (let index = 0; index < event.currentTarget.selectedOptions.length; index += 1) { const option = event.currentTarget.selectedOptions.item(index); if (option) values.push(option.value); } onChange(values.join(',')); }} className={`${common} min-h-28`}>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : <input id={id} type={field.kind === 'number' ? 'number' : field.kind === 'time' ? 'time' : 'text'} value={value} onChange={(event) => onChange(event.target.value)} className={common} />}
      {field.hint && <span className="mt-1 block text-[11px] text-[#7B8796]">{field.hint}</span>}
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7B8796]">{label}</p><p className="mt-2 text-2xl font-black text-[#172033]">{value}</p></article>;
}

export default function AdminProductionDashboard() {
  const [role, setRole] = useState<AdminStaffRole | null>(null);
  const [data, setData] = useState<ProductionData>(emptyProductionData);
  const [section, setSection] = useState<SectionId>('overview');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grantCourseId, setGrantCourseId] = useState('');
  const [grantPackageId, setGrantPackageId] = useState('');
  const [interventionNote, setInterventionNote] = useState('');
  const [staffUserId, setStaffUserId] = useState('');
  const [staffRole, setStaffRole] = useState<AdminStaffRole>('content_editor');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Exclude<AdminStaffRole, 'owner'>>('content_editor');
  const [selectedRevision, setSelectedRevision] = useState<Tables<'content_revisions'> | null>(null);
  const [learnerDetail, setLearnerDetail] = useState<AdminLearnerDetail | null>(null);
  const [learnerDetailLoading, setLearnerDetailLoading] = useState(false);
  const [learnerDetailError, setLearnerDetailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const roleRef = useRef<AdminStaffRole | null>(null);
  const loadRequestRef = useRef(0);

  async function loadSection(nextRole: AdminStaffRole, nextSection: SectionId, nextPage: number, nextQuery: string): Promise<void> {
    const requestId = ++loadRequestRef.current;
    setLoading(true);
    setError(null);
    try {
      const nextData = await loadProductionData(nextRole, nextSection, nextPage, nextQuery);
      if (requestId !== loadRequestRef.current) return;
      setData(nextData);
    } catch (nextError: unknown) {
      if (requestId === loadRequestRef.current) setError(nextError instanceof Error ? nextError.message : 'Không tải được CMS production.');
    } finally {
      if (requestId === loadRequestRef.current) setLoading(false);
    }
  }

  async function reload(): Promise<void> {
    try {
      const nextRole = await getCurrentAdminRole();
      roleRef.current = nextRole;
      setRole(nextRole);
      const availableSections = sectionsFor(nextRole);
      const nextSection = availableSections.some((item) => item.id === section) ? section : availableSections[0]?.id ?? 'overview';
      const nextPage = nextSection === section ? page : 0;
      const nextQuery = nextSection === section ? query : '';
      setSection(nextSection);
      setPage(nextPage);
      setQuery(nextQuery);
      await loadSection(nextRole, nextSection, nextPage, nextQuery);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không tải được CMS production.');
      setLoading(false);
    }
  }

  useEffect(() => { void reload(); }, []);

  useEffect(() => {
    if (section !== 'students' || !selectedStudentId) {
      setLearnerDetail(null);
      setLearnerDetailError(null);
      return undefined;
    }
    let cancelled = false;
    setLearnerDetailLoading(true);
    setLearnerDetailError(null);
    fetchAdminLearnerDetail(selectedStudentId)
      .then((detail) => { if (!cancelled) setLearnerDetail(detail); })
      .catch((nextError: unknown) => { if (!cancelled) { setLearnerDetail(null); setLearnerDetailError(nextError instanceof Error ? nextError.message : 'Không tải được tiến độ học viên.'); } })
      .finally(() => { if (!cancelled) setLearnerDetailLoading(false); });
    return () => { cancelled = true; };
  }, [section, selectedStudentId]);

  const fields = role ? fieldsFor(section, data) : [];
  const rawRows = rowsFor(data, section);
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('vi-VN');
    if (!needle) return rawRows;
    return rawRows.filter((row) => Object.values(row).some((value) => text(value).toLocaleLowerCase('vi-VN').includes(needle)));
  }, [query, rawRows]);
  const pageCount = Math.max(1, Math.ceil((data.counts[section] ?? filteredRows.length) / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageRows = filteredRows.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const selectedStudent = data.students.find((student) => student.user_id === selectedStudentId) ?? null;
  const selectedEnrollments = data.enrollments.filter((enrollment) => enrollment.user_id === selectedStudentId);

  function switchSection(nextSection: SectionId): void {
    setSection(nextSection);
    setPage(0);
    setQuery('');
    setEditingId(null);
    setForm(draftFromRow(nextSection, null, data));
    setAssetFile(null);
    setSelectedRevision(null);
    setNotice(null);
    const currentRole = roleRef.current;
    if (currentRole) void loadSection(currentRole, nextSection, 0, '');
  }

  function searchSection(nextQuery: string): void {
    setQuery(nextQuery);
    setPage(0);
    const currentRole = roleRef.current;
    if (currentRole) void loadSection(currentRole, section, 0, nextQuery);
  }

  function changePage(nextPage: number): void {
    setPage(nextPage);
    const currentRole = roleRef.current;
    if (currentRole) void loadSection(currentRole, section, nextPage, query);
  }

  function editRow(row: Row): void {
    setEditingId(rowId(row));
    setForm(draftFromRow(section, row, data));
    setAssetFile(null);
    setNotice(null);
  }

  function startNew(): void {
    setEditingId(null);
    setForm(draftFromRow(section, null, data));
    setAssetFile(null);
    setNotice(null);
  }

  async function saveForm(): Promise<void> {
    const required = (key: string, label: string): string => {
      const value = (form[key] ?? '').trim();
      if (!value) throw new Error(`Cần nhập ${label}.`);
      return value;
    };
    const numeric = (key: string, label: string, fallback = 0): number => {
      const raw = (form[key] ?? '').trim();
      if (!raw) return fallback;
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0) throw new Error(`${label} phải là số không âm.`);
      return value;
    };
    setSaving(true);
    setError(null);
    try {
      if (section === 'announcements') {
        const audience = required('audience', 'đối tượng') as 'all_learners' | 'active_learners' | 'course_learners';
        const courseId = (form.course_id ?? '').trim();
        if (audience === 'course_learners' && !courseId) throw new Error('Chọn khóa học trước khi gửi thông báo theo khóa.');
        await createAdminAnnouncement({ title: required('title', 'tiêu đề'), body: required('body', 'nội dung'), audience, ...(courseId ? { courseId } : {}), ...(form.action_url?.trim() ? { actionUrl: form.action_url.trim() } : {}) });
      } else {
        const id = (form.id ?? '').trim() || crypto.randomUUID();
        const isNew = !editingId;
        if (section === 'courses') {
          const payload = { id, slug: required('slug', 'slug'), title: required('title', 'tên khóa học'), level: required('level', 'cấp độ'), description: required('description', 'mô tả'), order_index: numeric('order_index', 'thứ tự'), theme_color: form.theme_color?.trim() || null, status: form.status || 'draft' };
          if (isNew) await createAdminCourse(payload); else await updateAdminCourse(id, payload);
        } else if (section === 'modules') {
          await saveAdminModule({ id, isNew, course_id: required('course_id', 'khóa học'), title: required('title', 'tên module'), description: required('description', 'mô tả'), level: required('level', 'cấp độ'), order_index: numeric('order_index', 'thứ tự'), status: form.status || 'draft' });
        } else if (section === 'lessons') {
          await saveAdminLesson({ id, isNew, course_id: required('course_id', 'khóa học'), module_id: required('module_id', 'module'), title: required('title', 'tên bài học'), description: required('description', 'mô tả'), lesson_type: required('lesson_type', 'loại bài'), duration_minutes: numeric('duration_minutes', 'số phút'), objectives: splitList(form.objectives ?? ''), content_markdown: form.content_markdown ?? '', order_index: numeric('order_index', 'thứ tự'), status: form.status || 'draft' });
        } else if (section === 'vocabulary') {
          await saveAdminVocabulary({ id, isNew, term: required('term', 'từ tiếng Nhật'), translation: required('translation', 'nghĩa tiếng Việt'), reading: form.reading?.trim() || null, pronunciation: form.pronunciation?.trim() || null, level: form.level?.trim() || null, tags: splitList(form.tags ?? ''), example_sentence: form.example_sentence?.trim() || null, audio_url: form.audio_url?.trim() || null });
        } else if (section === 'assessments') {
          const passingScore = numeric('passing_score', 'điểm đạt');
          if (passingScore > 100) throw new Error('Điểm đạt không được quá 100%.');
          await saveAdminAssessment({ id, isNew, course_id: required('course_id', 'khóa học'), title: required('title', 'tên đề'), assessment_type: required('assessment_type', 'loại đề'), passing_score: passingScore, order_index: numeric('order_index', 'thứ tự'), status: form.status || 'draft' });
        } else if (section === 'questions') {
          const options = [form.option_1, form.option_2, form.option_3, form.option_4].map((item) => item?.trim() ?? '').filter(Boolean);
          const correctIndex = Number(form.correct_option ?? '');
          if (options.length < 2 || !Number.isInteger(correctIndex) || !options[correctIndex]) throw new Error('Câu hỏi cần ít nhất hai lựa chọn và một đáp án đúng.');
          await saveAdminAssessmentQuestion({ id, isNew, assessment_id: required('assessment_id', 'đề thi'), prompt: required('prompt', 'câu hỏi'), options, correct_answer: options[correctIndex], explanation: form.explanation?.trim() || null, order_index: numeric('order_index', 'thứ tự') });
        } else if (section === 'documents') {
          const saved = await saveAdminDocument({ id, isNew, course_id: required('course_id', 'khóa học'), title: required('title', 'tên tài liệu'), summary: required('summary', 'tóm tắt'), document_type: required('document_type', 'loại tài liệu'), content_markdown: form.content_markdown ?? '', external_url: form.external_url?.trim() || null, read_time_minutes: numeric('read_time_minutes', 'thời gian đọc'), status: form.status || 'draft' });
          if (assetFile) {
            const storagePath = await uploadAdminCourseAsset(saved.course_id, saved.id, assetFile);
            await saveAdminDocument({ id: saved.id, storage_path: storagePath });
          }
        } else if (section === 'audio') {
          const saved = await saveAdminAudio({ id, isNew, course_id: required('course_id', 'khóa học'), lesson_id: form.lesson_id?.trim() || null, title: required('title', 'tên audio'), summary: required('summary', 'tóm tắt'), external_url: form.external_url?.trim() || null, duration_minutes: numeric('duration_minutes', 'thời lượng'), status: form.status || 'draft' });
          if (assetFile) {
            const storagePath = await uploadAdminCourseAsset(saved.course_id, saved.id, assetFile);
            await saveAdminAudio({ id: saved.id, storage_path: storagePath });
          }
        } else if (section === 'lessonAssets') {
          const lessonId = required('lesson_id', 'bài học');
          const saved = await saveAdminLessonAsset({ id, isNew, lesson_id: lessonId, title: required('title', 'tên tệp'), asset_type: required('asset_type', 'loại tệp'), description: form.description?.trim() || null, external_url: form.external_url?.trim() || null, metadata: {} });
          if (assetFile) {
            const lesson = data.lessons.find((item) => item.id === lessonId);
            if (!lesson) throw new Error('Không tìm thấy bài học để tải tệp.');
            const storagePath = await uploadAdminCourseAsset(lesson.course_id, saved.id, assetFile);
            await saveAdminLessonAsset({ id: saved.id, storage_path: storagePath });
          }
        } else if (section === 'lessonExercises') {
          await saveAdminLessonExercise({ id, isNew, lesson_id: required('lesson_id', 'bài học'), exercise_type: required('exercise_type', 'dạng bài'), prompt: required('prompt', 'đề bài'), choices: splitList(form.choices ?? ''), answer: required('answer', 'đáp án'), order_index: numeric('order_index', 'thứ tự') });
        } else if (section === 'lessonVocabulary') {
          await replaceAdminLessonVocabulary(required('lesson_id', 'bài học'), splitList(form.vocabulary_ids ?? ''));
        } else if (section === 'reviewQuestions') {
          const options = [form.option_1, form.option_2, form.option_3, form.option_4].map((item) => item?.trim() ?? '').filter(Boolean);
          const correctIndex = Number(form.correct_option ?? '');
          if (options.length < 2 || !Number.isInteger(correctIndex) || !options[correctIndex]) throw new Error('Câu hỏi cần ít nhất hai lựa chọn và một đáp án đúng.');
          await saveAdminReviewQuestion({ id: isNew ? undefined : id, lessonId: required('lesson_id', 'bài học'), prompt: required('prompt', 'câu hỏi'), explanation: form.explanation?.trim() || null, orderIndex: numeric('order_index', 'thứ tự'), options, correctIndex });
        } else if (section === 'grammarTopics') {
          const saved = await saveAdminGrammarTopic({ id, isNew, slug: required('slug', 'slug'), title: required('title', 'chủ điểm'), level: required('level', 'cấp độ'), category: required('category', 'danh mục'), summary: required('summary', 'tóm tắt'), order_index: numeric('order_index', 'thứ tự'), status: form.status || 'draft' });
          await replaceAdminGrammarTopicCourses(saved.id, splitList(form.course_ids ?? ''));
        } else if (section === 'grammarRules') {
          await saveAdminGrammarRule({ id, isNew, topic_id: required('topic_id', 'chủ điểm'), title: required('title', 'tiêu đề quy tắc'), body_markdown: required('body_markdown', 'nội dung Markdown'), order_index: numeric('order_index', 'thứ tự') });
        } else if (section === 'grammarExamples') {
          await saveAdminGrammarExample({ id, isNew, topic_id: required('topic_id', 'chủ điểm'), japanese_text: required('japanese_text', 'câu tiếng Nhật'), vietnamese_text: required('vietnamese_text', 'dịch tiếng Việt'), explanation: form.explanation?.trim() || null, order_index: numeric('order_index', 'thứ tự') });
        } else if (section === 'speakingPrompts') {
          await saveAdminSpeakingPrompt({ id, isNew, course_id: form.course_id?.trim() || null, title: required('title', 'tên đề'), instructions: required('instructions', 'hướng dẫn'), rubric: { criteria: splitList(form.rubric_criteria ?? '') }, order_index: numeric('order_index', 'thứ tự'), status: form.status || 'draft' });
        } else if (section === 'packages') {
          const saved = await saveAdminPackage({ id, isNew, name: required('name', 'tên gói'), description: required('description', 'mô tả'), price_cents: numeric('price_cents', 'giá'), currency: required('currency', 'tiền tệ'), ai_monthly_quota: numeric('ai_monthly_quota', 'quota AI'), status: form.status || 'draft' });
          await replaceAdminPackageCourses(saved.id, splitList(form.course_ids ?? ''));
        } else if (section === 'prompts') {
          await saveAdminPrompt({ id, isNew, name: required('name', 'tên prompt'), provider: required('provider', 'provider'), purpose: required('purpose', 'mục đích'), prompt_body: required('prompt_body', 'prompt'), status: form.status || 'draft' });
        } else if (section === 'sitePages') {
          await saveAdminSitePage({ id, isNew, slug: required('slug', 'slug'), title: required('title', 'tiêu đề'), body_markdown: required('body_markdown', 'nội dung Markdown'), status: form.status || 'draft' });
        } else if (section === 'dashboardHero') {
          const startTime = required('start_time', 'giờ bắt đầu');
          const endTime = required('end_time', 'giờ kết thúc');
          if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)) throw new Error('Giờ mascot phải có định dạng HH:MM.');
          await saveAdminDashboardHeroSlot({ id, isNew, label: required('label', 'tên khung giờ'), start_time: `${startTime}:00`, end_time: `${endTime}:00`, asset_key: required('asset_key', 'mascot / icon'), alt_text: required('alt_text', 'mô tả ảnh'), sort_order: numeric('sort_order', 'thứ tự ưu tiên'), is_active: form.is_active !== 'false' });
        } else if (section === 'alerts') {
          await saveAdminAlert({ id, isNew, severity: required('severity', 'mức độ'), title: required('title', 'tiêu đề'), body: required('body', 'nội dung'), status: form.status || 'open' });
        } else {
          return;
        }
      }
      startNew();
      await reload();
      setNotice('Đã lưu vào Supabase Cloud.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được thay đổi.');
    } finally {
      setSaving(false);
    }
  }

  async function changeContentStatus(target: Row, status: 'in_review' | 'published' | 'archived'): Promise<void> {
    const id = rowId(target);
    const entityType = CONTENT_ENTITY_TYPES[section];
    if (!id || !entityType) return;
    setSaving(true);
    setError(null);
    try {
      if (status === 'published' || status === 'archived') {
        await publishAdminContent(entityType, id, status);
      } else if (section === 'courses') await updateAdminCourse(id, { status });
      else if (section === 'modules') await saveAdminModule({ id, status });
      else if (section === 'lessons') await saveAdminLesson({ id, status });
      else if (section === 'assessments') await saveAdminAssessment({ id, status });
      else if (section === 'documents') await saveAdminDocument({ id, status });
      else if (section === 'audio') await saveAdminAudio({ id, status });
      else if (section === 'grammarTopics') await saveAdminGrammarTopic({ id, status });
      else if (section === 'speakingPrompts') await saveAdminSpeakingPrompt({ id, status });
      await reload();
      setNotice(status === 'in_review' ? 'Đã gửi nội dung để Owner duyệt.' : 'Đã cập nhật trạng thái publish.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không cập nhật được trạng thái.');
    } finally {
      setSaving(false);
    }
  }

  async function rollbackRevision(revision: Tables<'content_revisions'>): Promise<void> {
    if (role !== 'owner' || !window.confirm(`Khôi phục ${revision.entity_type} về phiên bản v${revision.version}?`)) return;
    setSaving(true);
    setError(null);
    try {
      await rollbackAdminContentRevision(revision.id);
      setSelectedRevision(null);
      await reload();
      setNotice(`Đã khôi phục ${revision.entity_type} về phiên bản v${revision.version}.`);
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không khôi phục được phiên bản nội dung.');
    } finally {
      setSaving(false);
    }
  }

  async function deleteRow(target: Row): Promise<void> {
    const id = rowId(target);
    if (!id || !window.confirm('Xóa bản ghi này khỏi Supabase Cloud? Thao tác không thể hoàn tác.')) return;
    setSaving(true);
    setError(null);
    try {
      switch (section) {
        case 'courses': await deleteAdminCourse(id); break;
        case 'modules': await deleteAdminModule(id); break;
        case 'lessons': await deleteAdminLesson(id); break;
        case 'vocabulary': await deleteAdminVocabulary(id); break;
        case 'assessments': await deleteAdminAssessment(id); break;
        case 'questions': await deleteAdminAssessmentQuestion(id); break;
        case 'documents': await deleteAdminDocument(id); break;
        case 'audio': await deleteAdminAudio(id); break;
        case 'lessonAssets': await deleteAdminLessonAsset(id); break;
        case 'lessonExercises': await deleteAdminLessonExercise(id); break;
        case 'reviewQuestions': await deleteAdminReviewQuestion(id); break;
        case 'grammarTopics': await deleteAdminGrammarTopic(id); break;
        case 'grammarRules': await deleteAdminGrammarRule(id); break;
        case 'grammarExamples': await deleteAdminGrammarExample(id); break;
        case 'speakingPrompts': await deleteAdminSpeakingPrompt(id); break;
        case 'packages': await deleteAdminPackage(id); break;
        case 'prompts': await deleteAdminPrompt(id); break;
        case 'sitePages': await deleteAdminSitePage(id); break;
        case 'dashboardHero': await deleteAdminDashboardHeroSlot(id); break;
        case 'alerts': await deleteAdminAlert(id); break;
        default: return;
      }
      await reload();
      startNew();
      setNotice('Đã xóa bản ghi.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không xóa được bản ghi.');
    } finally {
      setSaving(false);
    }
  }

  async function grantSelectedEnrollment(): Promise<void> {
    if (!selectedStudentId || !grantCourseId) return;
    setSaving(true);
    setError(null);
    try {
      await grantAdminEnrollment(selectedStudentId, grantCourseId, grantPackageId || undefined);
      await reload();
      setNotice('Đã cấp enrollment cho học viên.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không cấp được enrollment.');
    } finally { setSaving(false); }
  }

  async function revokeSelectedEnrollment(courseId: string): Promise<void> {
    if (!selectedStudentId || !window.confirm('Gỡ enrollment này? Học viên sẽ không còn truy cập khóa học.')) return;
    setSaving(true);
    setError(null);
    try {
      await revokeAdminEnrollment(selectedStudentId, courseId);
      await reload();
      setNotice('Đã gỡ enrollment.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không gỡ được enrollment.');
    } finally { setSaving(false); }
  }

  async function saveInterventionNote(): Promise<void> {
    if (!selectedStudentId || !interventionNote.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createAdminInterventionNote(selectedStudentId, interventionNote);
      setInterventionNote('');
      setNotice('Đã lưu ghi chú can thiệp vào audit.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu được ghi chú.');
    } finally { setSaving(false); }
  }

  async function saveStaffRole(): Promise<void> {
    if (!staffUserId.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await setAdminStaffRole(staffUserId.trim(), staffRole);
      setStaffUserId('');
      await reload();
      setNotice('Đã cập nhật quyền nhân sự.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không cập nhật được quyền.');
    } finally { setSaving(false); }
  }

  async function inviteStaff(): Promise<void> {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await inviteAdminStaff(inviteEmail.trim(), inviteRole);
      setInviteEmail('');
      await reload();
      setNotice('Đã gửi email mời và gán quyền nhân sự.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không gửi được lời mời nhân sự.');
    } finally { setSaving(false); }
  }

  async function archiveAnnouncement(id: string): Promise<void> {
    if (!window.confirm('Lưu trữ thông báo này?')) return;
    setSaving(true);
    setError(null);
    try {
      await archiveAdminAnnouncement(id);
      await reload();
      setNotice('Đã lưu trữ thông báo.');
    } catch (nextError: unknown) {
      setError(nextError instanceof Error ? nextError.message : 'Không lưu trữ được thông báo.');
    } finally { setSaving(false); }
  }

  if (loading && !role) return <main className="grid min-h-dvh place-items-center bg-[#F5EFE6] text-sm font-bold text-[#5F6B7C]"><span className="inline-flex items-center gap-2"><Loader2 className="animate-spin" size={18} /> Đang tải CMS từ Supabase Cloud…</span></main>;
  if (!role) return <main className="grid min-h-dvh place-items-center bg-[#F5EFE6] p-6"><p className="max-w-lg rounded-3xl border border-red-200 bg-red-50 p-6 text-sm font-semibold text-red-700">{error ?? 'Không xác định được quyền quản trị.'}</p></main>;

  const navigation = sectionsFor(role);
  const canEditSection = fields.length > 0 && (role === 'owner' || role === 'content_editor' || (section === 'announcements' && isAnnouncementRole(role)));
  const canDelete = role === 'owner' && !['announcements', 'staff', 'apiKeys', 'revisions', 'activity', 'lessonVocabulary'].includes(section);
  const hasContentWorkflow = Boolean(CONTENT_ENTITY_TYPES[section]);

  return (
    <div className="min-h-dvh bg-[#F5EFE6] text-[#172033]">
      <header className="border-b border-[#E4D8C9] bg-[#FFFCF7] px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C96A1B]">Supabase Cloud · {role.replace('_', ' ')}</p><h1 className="mt-1 text-2xl font-black">Quản trị TOKUTEI GINO</h1><p className="mt-1 text-sm text-[#5F6B7C]">Dữ liệu, publish và quyền đều được kiểm tra trên server.</p></div>
          <button type="button" onClick={() => void reload()} disabled={loading || saving} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#E4D8C9] bg-white px-4 py-2.5 text-sm font-bold text-[#315C73]"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Làm mới</button>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <nav className="h-fit overflow-x-auto rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-3 shadow-sm lg:overflow-visible">{navigation.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => switchSection(id)} className={`inline-flex w-auto items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold lg:flex lg:w-full ${section === id ? 'bg-[#F0E8DC] text-[#C96A1B]' : 'text-[#5F6B7C] hover:bg-[#F8F2EA]'}`}><Icon size={15} />{label}{sectionCount(data, id) !== null && <span className="ml-auto text-xs text-[#95A0AF]">{sectionCount(data, id)}</span>}</button>)}</nav>
        <section className="min-w-0 space-y-5">
          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          {notice && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}
          {section === 'overview' && <Overview analytics={data.analytics} alerts={data.alerts} activity={data.activity} />}
          {section === 'students' && <LearnerManager students={data.students} courses={data.courses} packages={data.packages} enrollments={selectedEnrollments} selectedStudent={selectedStudent} selectedStudentId={selectedStudentId} grantCourseId={grantCourseId} grantPackageId={grantPackageId} interventionNote={interventionNote} detail={learnerDetail} detailLoading={learnerDetailLoading} detailError={learnerDetailError} saving={saving} onSelectStudent={setSelectedStudentId} onGrantCourse={setGrantCourseId} onGrantPackage={setGrantPackageId} onGrant={() => void grantSelectedEnrollment()} onRevoke={(courseId) => void revokeSelectedEnrollment(courseId)} onNote={setInterventionNote} onSaveNote={() => void saveInterventionNote()} />}
          {section === 'staff' && <StaffManager staff={data.staff} userId={staffUserId} role={staffRole} inviteEmail={inviteEmail} inviteRole={inviteRole} saving={saving} onUserId={setStaffUserId} onRole={setStaffRole} onSave={() => void saveStaffRole()} onInviteEmail={setInviteEmail} onInviteRole={setInviteRole} onInvite={() => void inviteStaff()} onRemove={(userId) => { if (window.confirm('Thu hồi quyền nhân sự này?')) void removeAdminStaffRole(userId).then(reload).catch((nextError: unknown) => setError(nextError instanceof Error ? nextError.message : 'Không thu hồi được quyền.')); }} />}
          {section === 'revisions' && selectedRevision && <article className="rounded-3xl border border-[#E4D8C9] bg-[#172033] p-5 text-white shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-orange-300">Snapshot nội dung</p><h2 className="mt-1 text-xl font-black">{selectedRevision.entity_type} · phiên bản v{selectedRevision.version}</h2><p className="mt-1 text-sm text-white/60">{selectedRevision.action} · {formatDate(selectedRevision.created_at)}</p></div><button type="button" onClick={() => setSelectedRevision(null)} className="rounded-xl border border-white/20 px-3 py-2 text-xs font-bold text-white">Đóng</button></div><pre className="mt-4 max-h-96 overflow-auto rounded-2xl bg-black/20 p-4 text-xs leading-5 text-white/80">{JSON.stringify(selectedRevision.snapshot, null, 2)}</pre></article>}
          {section !== 'overview' && section !== 'students' && section !== 'staff' && (
            <>
              {canEditSection && <form onSubmit={(event) => { event.preventDefault(); void saveForm(); }} className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#C96A1B]">{editingId ? 'Chỉnh sửa dữ liệu thật' : 'Tạo dữ liệu thật'}</p><p className="mt-1 text-sm text-[#5F6B7C]">Form có kiểm tra bắt buộc; không có JSON editor hoặc thao tác giả.</p></div><button type="button" onClick={startNew} className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-xs font-bold text-[#315C73]">Bản ghi mới</button></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{fields.map((field) => <div key={field.key}><FieldControl field={field} value={form[field.key] ?? ''} onChange={(value) => setForm((current) => ({ ...current, [field.key]: value }))} /></div>)}</div>{(section === 'documents' || section === 'audio' || section === 'lessonAssets') && <label className="mt-4 block"><span className="text-xs font-bold text-[#5F6B7C]">Tệp private (tối đa 50 MB)</span><input type="file" accept={section === 'documents' ? '.pdf,text/markdown,text/plain' : section === 'audio' ? 'audio/*' : '.pdf,audio/*,image/*,text/markdown,text/plain'} onChange={(event) => setAssetFile(event.currentTarget.files?.[0] ?? null)} className="mt-1 block w-full text-sm" />{assetFile && <span className="mt-1 block text-xs text-[#5F6B7C]">Sẽ tải lên bucket private: {assetFile.name}</span>}</label>}<button type="submit" disabled={saving} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C96A1B] px-4 py-2.5 text-sm font-black text-white disabled:opacity-60"><Send size={15} />{saving ? 'Đang lưu…' : editingId ? 'Lưu thay đổi' : section === 'announcements' ? 'Gửi thông báo' : 'Tạo bản ghi'}</button></form>}
              <div className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-black">{navigation.find((item) => item.id === section)?.label}</h2><p className="mt-1 text-sm text-[#5F6B7C]">{data.counts[section] ?? filteredRows.length} bản ghi theo quyền hiện tại.</p></div><input value={query} onChange={(event) => searchSection(event.target.value)} placeholder="Tìm kiếm…" className="rounded-xl border border-[#E4D8C9] bg-white px-3 py-2 text-sm outline-none focus:border-[#315C73]" /></div>{loading ? <p className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#5F6B7C]"><Loader2 size={16} className="animate-spin" /> Đang đồng bộ…</p> : <div className="mt-4 divide-y divide-[#EDE4D8]">{pageRows.map((row) => <article key={rowId(row)} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="truncate font-black text-[#172033]">{rowTitle(row)}</p><p className="mt-1 truncate text-sm text-[#5F6B7C]">{rowMeta(row)}</p><p className="mt-1 text-xs text-[#8A95A3]">{formatDate(row.updated_at ?? row.created_at ?? row.published_at ?? row.occurred_at)}</p></div><div className="flex flex-wrap gap-2">{section === 'revisions' && <button type="button" onClick={() => setSelectedRevision(row as unknown as Tables<'content_revisions'>)} disabled={saving} className="rounded-xl border border-[#E4D8C9] px-3 py-1.5 text-xs font-bold text-[#315C73]">Xem snapshot</button>}{section === 'revisions' && role === 'owner' && <button type="button" onClick={() => void rollbackRevision(row as unknown as Tables<'content_revisions'>)} disabled={saving} className="rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">Rollback</button>}{canEditSection && section !== 'announcements' && <button type="button" onClick={() => editRow(row)} disabled={saving} className="rounded-xl border border-[#E4D8C9] px-3 py-1.5 text-xs font-bold text-[#315C73]">Sửa</button>}{hasContentWorkflow && text(row.status) !== 'published' && <button type="button" onClick={() => void changeContentStatus(row, 'in_review')} disabled={saving} className="rounded-xl border border-[#E4D8C9] px-3 py-1.5 text-xs font-bold text-[#315C73]">Gửi duyệt</button>}{role === 'owner' && hasContentWorkflow && text(row.status) !== 'published' && <button type="button" onClick={() => void changeContentStatus(row, 'published')} disabled={saving} className="rounded-xl bg-[#315C73] px-3 py-1.5 text-xs font-bold text-white">Publish</button>}{role === 'owner' && hasContentWorkflow && text(row.status) === 'published' && <button type="button" onClick={() => void changeContentStatus(row, 'archived')} disabled={saving} className="rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">Archive</button>}{section === 'announcements' && isAnnouncementRole(role) && !row.archived_at && <button type="button" onClick={() => void archiveAnnouncement(rowId(row))} disabled={saving} className="rounded-xl border border-amber-200 px-3 py-1.5 text-xs font-bold text-amber-700">Archive</button>}{canDelete && <button type="button" onClick={() => void deleteRow(row)} disabled={saving} className="inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700"><Trash2 size={13} /> Xóa</button>}</div></article>)}{pageRows.length === 0 && <p className="py-10 text-center text-sm font-semibold text-[#7B8796]">Không có dữ liệu phù hợp.</p>}</div>}<div className="mt-4 flex items-center justify-between border-t border-[#EDE4D8] pt-4 text-sm"><span className="text-[#5F6B7C]">Trang {currentPage + 1}/{pageCount}</span><div className="flex gap-2"><button type="button" disabled={currentPage === 0} onClick={() => changePage(Math.max(0, currentPage - 1))} className="rounded-lg border border-[#E4D8C9] p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button type="button" disabled={currentPage + 1 >= pageCount} onClick={() => changePage(Math.min(pageCount - 1, currentPage + 1))} className="rounded-lg border border-[#E4D8C9] p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div></div></div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function Overview({ analytics, alerts, activity }: { analytics: AdminAnalytics | null; alerts: Tables<'admin_alerts'>[]; activity: Tables<'admin_activity_logs'>[] }) {
  if (!analytics) return <section className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 text-sm font-semibold text-[#5F6B7C]">Không có quyền đọc analytics.</section>;
  const readinessRows = [
    { label: 'Khóa học', published: analytics.contentReadiness.publishedCourses, total: analytics.contentReadiness.totalCourses },
    { label: 'Bài học', published: analytics.contentReadiness.publishedLessons, total: analytics.contentReadiness.totalLessons },
    { label: 'Tài liệu', published: analytics.contentReadiness.publishedDocuments, total: analytics.contentReadiness.totalDocuments },
    { label: 'Đề thi', published: analytics.contentReadiness.publishedAssessments, total: analytics.contentReadiness.totalAssessments },
  ];
  return <>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Metric label="Học viên xác thực" value={analytics.verifiedUsers} />
      <Metric label="Đang học" value={analytics.activeLearners} />
      <Metric label="Hoạt động 7 ngày" value={analytics.weeklyActiveLearners} />
      <Metric label="Enrollment active" value={analytics.activeEnrollments} />
      <Metric label="Completion" value={`${analytics.courseCompletion}%`} />
      <Metric label="Streak 3 ngày" value={analytics.currentStreakLearners} />
      <Metric label="Từ đã master" value={analytics.masteredVocabulary} />
      <Metric label="Từ đến hạn" value={analytics.dueVocabulary} />
      <Metric label="Lượt thi" value={analytics.examAttempts} />
      <Metric label="Tỷ lệ đỗ" value={`${analytics.examPassRate}%`} />
      <Metric label="AI tháng này" value={`${analytics.aiRequestsThisMonth} / ${analytics.aiQuotaCapacity}`} />
      <Metric label="Lỗi AI tháng này" value={analytics.aiErrorsThisMonth} />
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm xl:col-span-2">
        <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-black">Content readiness</h2><p className="mt-1 text-sm text-[#5F6B7C]">Tỷ lệ nội dung đã publish cho học viên.</p></div><strong className="text-2xl font-black text-[#C96A1B]">{analytics.contentReadiness.percent}%</strong></div>
        <div className="mt-5 space-y-4">{readinessRows.map((row) => { const percent = row.total ? Math.round((row.published / row.total) * 100) : 0; return <div key={row.label}><div className="mb-1 flex justify-between text-sm font-bold"><span>{row.label}</span><span className="text-[#5F6B7C]">{row.published}/{row.total}</span></div><div className="h-2 overflow-hidden rounded-full bg-[#EFE5D7]"><div className="h-full rounded-full bg-[#C96A1B]" style={{ width: `${percent}%` }} /></div></div>; })}</div>
      </article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Retention cohort</h2><p className="mt-1 text-sm text-[#5F6B7C]">Học viên có hoạt động sau mốc ghi danh.</p><div className="mt-5 grid grid-cols-2 gap-3 text-center"><div className="rounded-2xl bg-[#F8F2EA] p-4"><p className="text-xs font-bold text-[#7B8796]">D+7</p><strong className="mt-1 block text-2xl font-black">{analytics.cohortRetention.day7}%</strong></div><div className="rounded-2xl bg-[#F8F2EA] p-4"><p className="text-xs font-bold text-[#7B8796]">D+30</p><strong className="mt-1 block text-2xl font-black">{analytics.cohortRetention.day30}%</strong></div></div></article>
    </section>
    <section className="grid gap-5 xl:grid-cols-3">
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Chủ đề cần ôn lại</h2><div className="mt-4 space-y-3">{analytics.weakTopics.map((topic) => <div key={`${topic.courseId}-${topic.title}`} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8F2EA] p-3"><div className="min-w-0"><p className="truncate text-sm font-bold">{topic.title}</p><p className="mt-1 text-xs text-[#7B8796]">{topic.attempts} lượt thi</p></div><strong className="shrink-0 text-sm text-[#C96A1B]">{topic.passRate}%</strong></div>)}{analytics.weakTopics.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có lượt thi để phân tích.</p>}</div></article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Email delivery</h2><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-amber-50 p-3"><span className="text-[#7B8796]">Chờ xử lý</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.pending + analytics.emailDelivery.processing}</strong></div><div className="rounded-2xl bg-emerald-50 p-3"><span className="text-[#7B8796]">Đã gửi</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.sent}</strong></div><div className="rounded-2xl bg-red-50 p-3"><span className="text-[#7B8796]">Lỗi</span><strong className="mt-1 block text-xl">{analytics.emailDelivery.failed}</strong></div><div className="rounded-2xl bg-slate-50 p-3"><span className="text-[#7B8796]">Quota AI</span><strong className="mt-1 block text-xl">{analytics.aiQuotaConsumed}/{analytics.aiQuotaCapacity}</strong></div></div></article>
      <article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="font-black">Cảnh báo mở</h2><div className="mt-4 space-y-3">{alerts.filter((alert) => alert.status === 'open').slice(0, 5).map((alert) => <div key={alert.id} className="rounded-2xl bg-[#F8F2EA] p-3"><p className="font-bold">{alert.title}</p><p className="mt-1 text-sm text-[#5F6B7C]">{alert.body}</p></div>)}{alerts.every((alert) => alert.status !== 'open') && <p className="text-sm text-[#5F6B7C]">Không có cảnh báo mở.</p>}</div></article>
    </section>
    <section className="rounded-3xl border border-[#E4D8C9] bg-[#172033] p-5 text-white shadow-sm"><h2 className="font-black">Audit gần nhất</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{activity.slice(0, 5).map((item) => <div key={item.id}><p className="text-sm font-bold">{item.action}</p><p className="text-xs text-white/60">{item.entity_type} · {formatDate(item.occurred_at)}</p></div>)}{activity.length === 0 && <p className="text-sm text-white/60">Chưa có audit.</p>}</div></section>
  </>;
}

function LearnerManager({ students, courses, packages, enrollments, selectedStudent, selectedStudentId, grantCourseId, grantPackageId, interventionNote, detail, detailLoading, detailError, saving, onSelectStudent, onGrantCourse, onGrantPackage, onGrant, onRevoke, onNote, onSaveNote }: { students: Tables<'profiles'>[]; courses: Tables<'courses'>[]; packages: Tables<'packages'>[]; enrollments: Tables<'enrollments'>[]; selectedStudent: Tables<'profiles'> | null; selectedStudentId: string; grantCourseId: string; grantPackageId: string; interventionNote: string; detail: AdminLearnerDetail | null; detailLoading: boolean; detailError: string | null; saving: boolean; onSelectStudent: (value: string) => void; onGrantCourse: (value: string) => void; onGrantPackage: (value: string) => void; onGrant: () => void; onRevoke: (courseId: string) => void; onNote: (value: string) => void; onSaveNote: () => void }) {
  const lessonPercent = detail?.lessonProgress.total ? Math.round((detail.lessonProgress.completed / detail.lessonProgress.total) * 100) : 0;
  return <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="text-xl font-black">Học viên</h2><div className="mt-4 space-y-2">{students.map((student) => <button key={student.user_id} type="button" onClick={() => onSelectStudent(student.user_id)} className={`w-full rounded-2xl border p-3 text-left ${student.user_id === selectedStudentId ? 'border-[#C96A1B] bg-[#FFF5EC]' : 'border-[#E4D8C9] bg-white'}`}><p className="font-bold">{student.display_name || 'Chưa đặt tên'}</p><p className="mt-1 text-xs text-[#5F6B7C]">{student.email}</p></button>)}{students.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có học viên.</p>}</div></article><article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm">{selectedStudent ? <><h2 className="text-xl font-black">{selectedStudent.display_name || selectedStudent.email}</h2><p className="mt-1 text-sm text-[#5F6B7C]">{selectedStudent.email}</p><div className="mt-5 grid gap-3 sm:grid-cols-2"><select value={grantCourseId} onChange={(event) => onGrantCourse(event.target.value)} className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm"><option value="">Chọn khóa học</option>{courses.filter((course) => course.status === 'published').map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}</select><select value={grantPackageId} onChange={(event) => onGrantPackage(event.target.value)} className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm"><option value="">Không gán gói</option>{packages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><button type="button" onClick={onGrant} disabled={!grantCourseId || saving} className="mt-3 rounded-xl bg-[#315C73] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">Cấp enrollment</button><div className="mt-5"><h3 className="font-black">Enrollment hiện tại</h3><div className="mt-2 space-y-2">{enrollments.map((enrollment) => <div key={enrollment.id} className="flex items-center justify-between rounded-xl bg-[#F8F2EA] p-3 text-sm"><span>{courses.find((course) => course.id === enrollment.course_id)?.title ?? enrollment.course_id} · {enrollment.progress_percent}%</span>{enrollment.status === 'active' && <button type="button" onClick={() => onRevoke(enrollment.course_id)} disabled={saving} className="text-xs font-bold text-red-700">Gỡ</button>}</div>)}{enrollments.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa được cấp khóa học.</p>}</div></div><div className="mt-5"><label className="text-xs font-bold text-[#5F6B7C]">Ghi chú can thiệp nội bộ</label><textarea value={interventionNote} onChange={(event) => onNote(event.target.value)} className="mt-1 min-h-24 w-full rounded-xl border border-[#E4D8C9] p-3 text-sm" /><button type="button" onClick={onSaveNote} disabled={!interventionNote.trim() || saving} className="mt-2 rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm font-bold text-[#315C73]">Lưu ghi chú</button></div>{detailLoading && <p className="mt-5 text-sm font-semibold text-[#5F6B7C]">Đang tải tiến độ thật của học viên…</p>}{detailError && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{detailError}</p>}{detail && <div className="mt-5 space-y-4 border-t border-[#EDE4D8] pt-5"><div className="grid gap-2 sm:grid-cols-4"><Metric label="Lesson" value={`${detail.lessonProgress.completed}/${detail.lessonProgress.total} · ${lessonPercent}%`} /><Metric label="SRS đã ôn" value={detail.vocabulary.reviewed} /><Metric label="Đến hạn" value={detail.vocabulary.due} /><Metric label="Thi / đỗ" value={`${detail.assessments.attempts} / ${detail.assessments.passRate}%`} /></div><div className="grid gap-4 lg:grid-cols-2"><div><h3 className="font-black">Bài thi gần đây</h3><div className="mt-2 space-y-2">{detail.assessments.recent.map((attempt) => <div key={`${attempt.assessmentId}-${attempt.attemptedAt}`} className="flex items-center justify-between gap-2 rounded-xl bg-[#F8F2EA] p-3 text-sm"><span className="min-w-0 truncate">{attempt.title}</span><span className={attempt.passed ? 'font-black text-emerald-700' : 'font-black text-red-700'}>{attempt.score}%</span></div>)}{detail.assessments.recent.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có lượt thi.</p>}</div></div><div><h3 className="font-black">Hoạt động gần đây</h3><div className="mt-2 space-y-2">{detail.activity.slice(0, 5).map((event, index) => <div key={`${event.occurredAt}-${index}`} className="rounded-xl bg-[#F8F2EA] p-3 text-sm"><p className="font-bold">{event.eventLabel || event.eventType}</p><p className="mt-1 text-xs text-[#7B8796]">{formatDate(event.occurredAt)}</p></div>)}{detail.activity.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có hoạt động.</p>}</div></div></div><div><h3 className="font-black">Ghi chú đã lưu</h3><div className="mt-2 space-y-2">{detail.notes.slice(0, 3).map((note) => <div key={note.id} className="rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm"><p className="whitespace-pre-wrap text-[#172033]">{note.body}</p><p className="mt-1 text-xs text-[#7B8796]">{formatDate(note.createdAt)}</p></div>)}{detail.notes.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có ghi chú.</p>}</div></div></div>}</> : <p className="text-sm text-[#5F6B7C]">Chọn một học viên để quản lý enrollment.</p>}</article></section>;
}

function StaffManager({ staff, userId, role, inviteEmail, inviteRole, saving, onUserId, onRole, onSave, onInviteEmail, onInviteRole, onInvite, onRemove }: { staff: AdminStaffMember[]; userId: string; role: AdminStaffRole; inviteEmail: string; inviteRole: Exclude<AdminStaffRole, 'owner'>; saving: boolean; onUserId: (value: string) => void; onRole: (value: AdminStaffRole) => void; onSave: () => void; onInviteEmail: (value: string) => void; onInviteRole: (value: Exclude<AdminStaffRole, 'owner'>) => void; onInvite: () => void; onRemove: (userId: string) => void }) {
  return <section className="space-y-5"><article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="text-xl font-black">Mời nhân sự mới</h2><p className="mt-1 text-sm text-[#5F6B7C]">Email mời và role được kiểm tra bởi Edge Function; Owner không cần biết UUID.</p><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]"><input type="email" value={inviteEmail} onChange={(event) => onInviteEmail(event.target.value)} placeholder="email@company.com" className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm" /><select value={inviteRole} onChange={(event) => onInviteRole(event.target.value as Exclude<AdminStaffRole, 'owner'>)} className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm">{['content_editor', 'instructor_support', 'analyst'].map((value) => <option key={value} value={value}>{value}</option>)}</select><button type="button" onClick={onInvite} disabled={!inviteEmail.trim() || saving} className="rounded-xl bg-[#315C73] px-4 py-2 text-sm font-bold text-white">Gửi lời mời</button></div></article><article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="text-xl font-black">Gán quyền tài khoản hiện có</h2><p className="mt-1 text-sm text-[#5F6B7C]">Dùng UUID khi nhân sự đã có tài khoản và cần đổi vai trò hoặc thành Owner.</p><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_220px_auto]"><input value={userId} onChange={(event) => onUserId(event.target.value)} placeholder="UUID người dùng" className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm" /><select value={role} onChange={(event) => onRole(event.target.value as AdminStaffRole)} className="rounded-xl border border-[#E4D8C9] px-3 py-2 text-sm">{['owner', 'content_editor', 'instructor_support', 'analyst'].map((value) => <option key={value} value={value}>{value}</option>)}</select><button type="button" onClick={onSave} disabled={!userId.trim() || saving} className="rounded-xl bg-[#315C73] px-4 py-2 text-sm font-bold text-white">Lưu quyền</button></div></article><article className="rounded-3xl border border-[#E4D8C9] bg-[#FFFCF7] p-5 shadow-sm"><h2 className="text-xl font-black">Nhân sự</h2><div className="mt-4 divide-y divide-[#EDE4D8]">{staff.map((member) => <div key={member.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3"><div><p className="font-bold">{member.displayName}</p><p className="text-sm text-[#5F6B7C]">{member.email} · {member.role}</p></div><button type="button" onClick={() => onRemove(member.user_id)} disabled={saving} className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700">Thu hồi</button></div>)}{staff.length === 0 && <p className="text-sm text-[#5F6B7C]">Chưa có nhân sự.</p>}</div></article></section>;
}
