import { DASHBOARD_HERO_ASSET_OPTIONS } from '@/src/features/dashboard/lib/dashboardHero';
import type { CmsField, ProductionData, Row, SectionId } from './adminProductionTypes';
import { ALERT_STATUS_OPTIONS, PACKAGE_STATUS_OPTIONS, PROMPT_STATUS_OPTIONS, SITE_PAGE_STATUS_OPTIONS, STATUS_OPTIONS } from './adminProductionConfig';

export function text(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

export function asTextList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export function splitList(value: string): string[] {
  return value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
}

function rubricCriteria(value: unknown): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return [];
  const criteria = (value as { criteria?: unknown }).criteria;
  return asTextList(criteria);
}

export function formatDate(value: unknown): string {
  const date = new Date(text(value));
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function rowId(row: Row): string {
  return text(row.id ?? row.slug ?? row.user_id);
}

export function rowTitle(row: Row): string {
  if (row.entity_type && row.version) return `${text(row.entity_type)} · v${text(row.version)}`;
  return text(row.title ?? row.name ?? row.label ?? row.term ?? row.prompt ?? row.display_name ?? row.email ?? row.action ?? row.provider ?? row.entity_type ?? row.id);
}

export function rowMeta(row: Row): string {
  if (row.entity_type && row.entity_id && row.action) return `${text(row.action)} · ${text(row.entity_id)}`;
  return text(row.description ?? row.summary ?? row.translation ?? row.body ?? row.asset_key ?? row.status ?? row.role ?? row.vocabulary_count ?? row.updated_at ?? row.created_at ?? row.occurred_at);
}

export function rowsFor(data: ProductionData, section: SectionId): Row[] {
  switch (section) {
    case 'courses': return data.courses as unknown as Row[];
    case 'modules': return data.modules as unknown as Row[];
    case 'lessons': return data.lessons as unknown as Row[];
    case 'vocabulary': return data.vocabulary as unknown as Row[];
    case 'assessments': return data.assessments as unknown as Row[];
    case 'questions': return data.questions as unknown as Row[];
    case 'documents': return data.documents as unknown as Row[];
    case 'audio': return data.audio as unknown as Row[];
    case 'lessonAssets': return data.lessonAssets as unknown as Row[];
    case 'lessonExercises': return data.lessonExercises as unknown as Row[];
    case 'lessonVocabulary': return data.lessons.map((lesson) => ({ id: lesson.id, lesson_id: lesson.id, title: lesson.title, vocabulary_ids: data.lessonVocabulary.filter((item) => item.lesson_id === lesson.id).map((item) => item.vocabulary_item_id).join(','), vocabulary_count: data.lessonVocabulary.filter((item) => item.lesson_id === lesson.id).length }));
    case 'reviewQuestions': return data.reviewQuestions as unknown as Row[];
    case 'grammarTopics': return data.grammarTopics as unknown as Row[];
    case 'grammarRules': return data.grammarRules as unknown as Row[];
    case 'grammarExamples': return data.grammarExamples as unknown as Row[];
    case 'speakingPrompts': return data.speakingPrompts as unknown as Row[];
    case 'packages': return data.packages as unknown as Row[];
    case 'prompts': return data.prompts as unknown as Row[];
    case 'sitePages': return data.sitePages as unknown as Row[];
    case 'dashboardHero': return data.dashboardHero as unknown as Row[];
    case 'announcements': return data.announcements as unknown as Row[];
    case 'staff': return data.staff as unknown as Row[];
    case 'alerts': return data.alerts as unknown as Row[];
    case 'apiKeys': return data.apiKeys as unknown as Row[];
    case 'revisions': return data.revisions as unknown as Row[];
    case 'activity': return data.activity as unknown as Row[];
    default: return [];
  }
}

export function sectionCount(data: ProductionData, section: SectionId): number | null {
  if (section === 'overview') return null;
  if (section === 'students') return data.students.length;
  return rowsFor(data, section).length;
}

export function fieldsFor(section: SectionId, data: ProductionData): CmsField[] {
  const courseOptions = data.courses.map((course) => ({ value: course.id, label: course.title }));
  const moduleOptions = data.modules.map((module) => ({ value: module.id, label: `${module.title} · ${module.course_id}` }));
  const lessonOptions = data.lessons.map((lesson) => ({ value: lesson.id, label: lesson.title }));
  const vocabularyOptions = data.vocabulary.map((item) => ({ value: item.id, label: `${item.term} · ${item.translation}` }));
  const grammarTopicOptions = data.grammarTopics.map((topic) => ({ value: topic.id, label: topic.title }));
  const assessmentOptions = data.assessments.map((assessment) => ({ value: assessment.id, label: assessment.title }));
  const id = { key: 'id', label: 'ID (để trống tự tạo)' };
  switch (section) {
    case 'courses': return [id, { key: 'slug', label: 'Slug', required: true }, { key: 'title', label: 'Tên khóa học', required: true }, { key: 'level', label: 'Cấp độ', required: true }, { key: 'description', label: 'Mô tả', kind: 'textarea', required: true }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'theme_color', label: 'Màu chủ đề' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'modules': return [id, { key: 'course_id', label: 'Khóa học', kind: 'select', required: true, options: courseOptions }, { key: 'title', label: 'Tên module', required: true }, { key: 'description', label: 'Mô tả', kind: 'textarea', required: true }, { key: 'level', label: 'Cấp độ', required: true }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'lessons': return [id, { key: 'course_id', label: 'Khóa học', kind: 'select', required: true, options: courseOptions }, { key: 'module_id', label: 'Module', kind: 'select', required: true, options: moduleOptions }, { key: 'title', label: 'Tên bài học', required: true }, { key: 'description', label: 'Mô tả', kind: 'textarea', required: true }, { key: 'lesson_type', label: 'Loại bài', kind: 'select', required: true, options: ['grammar', 'vocabulary', 'listening', 'speaking', 'exam-prep'].map((value) => ({ value, label: value })) }, { key: 'duration_minutes', label: 'Số phút', kind: 'number' }, { key: 'objectives', label: 'Mục tiêu (mỗi dòng một mục)', kind: 'textarea' }, { key: 'content_markdown', label: 'Nội dung Markdown', kind: 'textarea' }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'vocabulary': return [id, { key: 'term', label: 'Từ tiếng Nhật', required: true }, { key: 'reading', label: 'Cách đọc' }, { key: 'pronunciation', label: 'Romaji' }, { key: 'translation', label: 'Nghĩa tiếng Việt', required: true }, { key: 'level', label: 'Cấp độ' }, { key: 'tags', label: 'Nhãn (phân cách dấu phẩy)' }, { key: 'example_sentence', label: 'Ví dụ', kind: 'textarea' }, { key: 'audio_url', label: 'URL phát âm' }];
    case 'assessments': return [id, { key: 'course_id', label: 'Khóa học', kind: 'select', required: true, options: courseOptions }, { key: 'title', label: 'Tên đề', required: true }, { key: 'assessment_type', label: 'Loại đề', kind: 'select', required: true, options: ['quiz', 'mock-exam', 'listening', 'vocabulary'].map((value) => ({ value, label: value })) }, { key: 'passing_score', label: 'Điểm đạt (%)', kind: 'number', required: true }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'questions': return [id, { key: 'assessment_id', label: 'Đề thi', kind: 'select', required: true, options: assessmentOptions }, { key: 'prompt', label: 'Câu hỏi', kind: 'textarea', required: true }, { key: 'option_1', label: 'Lựa chọn 1', required: true }, { key: 'option_2', label: 'Lựa chọn 2', required: true }, { key: 'option_3', label: 'Lựa chọn 3' }, { key: 'option_4', label: 'Lựa chọn 4' }, { key: 'correct_option', label: 'Đáp án đúng', kind: 'select', required: true, options: ['0', '1', '2', '3'].map((value, index) => ({ value, label: `Lựa chọn ${index + 1}` })) }, { key: 'explanation', label: 'Giải thích sau khi nộp', kind: 'textarea' }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }];
    case 'documents': return [id, { key: 'course_id', label: 'Khóa học', kind: 'select', required: true, options: courseOptions }, { key: 'title', label: 'Tên tài liệu', required: true }, { key: 'summary', label: 'Tóm tắt', kind: 'textarea', required: true }, { key: 'document_type', label: 'Loại tài liệu', kind: 'select', required: true, options: ['markdown', 'pdf', 'worksheet', 'checklist'].map((value) => ({ value, label: value })) }, { key: 'content_markdown', label: 'Nội dung Markdown', kind: 'textarea' }, { key: 'external_url', label: 'URL ngoài (nếu có)' }, { key: 'read_time_minutes', label: 'Thời gian đọc (phút)', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'audio': return [id, { key: 'course_id', label: 'Khóa học', kind: 'select', required: true, options: courseOptions }, { key: 'lesson_id', label: 'Bài học (tùy chọn)', kind: 'select', options: data.lessons.map((lesson) => ({ value: lesson.id, label: lesson.title })) }, { key: 'title', label: 'Tên audio', required: true }, { key: 'summary', label: 'Tóm tắt', kind: 'textarea', required: true }, { key: 'external_url', label: 'URL ngoài (nếu có)' }, { key: 'duration_minutes', label: 'Thời lượng (phút)', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'lessonAssets': return [id, { key: 'lesson_id', label: 'Bài học', kind: 'select', required: true, options: lessonOptions }, { key: 'title', label: 'Tên tệp', required: true }, { key: 'asset_type', label: 'Loại tệp', kind: 'select', required: true, options: ['pdf', 'audio', 'image', 'worksheet'].map((value) => ({ value, label: value })) }, { key: 'description', label: 'Mô tả', kind: 'textarea' }, { key: 'external_url', label: 'URL ngoài (nếu có)' }];
    case 'lessonExercises': return [id, { key: 'lesson_id', label: 'Bài học', kind: 'select', required: true, options: lessonOptions }, { key: 'exercise_type', label: 'Dạng bài', kind: 'select', required: true, options: ['multiple_choice', 'short_answer', 'matching'].map((value) => ({ value, label: value })) }, { key: 'prompt', label: 'Đề bài', kind: 'textarea', required: true }, { key: 'choices', label: 'Lựa chọn (mỗi dòng một lựa chọn)', kind: 'textarea' }, { key: 'answer', label: 'Đáp án', required: true }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }];
    case 'lessonVocabulary': return [{ key: 'lesson_id', label: 'Bài học', kind: 'select', required: true, options: lessonOptions }, { key: 'vocabulary_ids', label: 'Từ vựng trong bài', kind: 'multi', options: vocabularyOptions }];
    case 'reviewQuestions': return [id, { key: 'lesson_id', label: 'Bài học', kind: 'select', required: true, options: lessonOptions }, { key: 'prompt', label: 'Câu hỏi', kind: 'textarea', required: true }, { key: 'option_1', label: 'Lựa chọn 1', required: true }, { key: 'option_2', label: 'Lựa chọn 2', required: true }, { key: 'option_3', label: 'Lựa chọn 3' }, { key: 'option_4', label: 'Lựa chọn 4' }, { key: 'correct_option', label: 'Đáp án đúng', kind: 'select', required: true, options: ['0', '1', '2', '3'].map((value, index) => ({ value, label: `Lựa chọn ${index + 1}` })) }, { key: 'explanation', label: 'Giải thích sau khi nộp', kind: 'textarea' }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }];
    case 'grammarTopics': return [id, { key: 'slug', label: 'Slug', required: true }, { key: 'title', label: 'Chủ điểm', required: true }, { key: 'level', label: 'Cấp độ', required: true }, { key: 'category', label: 'Danh mục', required: true }, { key: 'summary', label: 'Tóm tắt', kind: 'textarea', required: true }, { key: 'course_ids', label: 'Khóa học được liên kết', kind: 'multi', options: courseOptions }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'grammarRules': return [id, { key: 'topic_id', label: 'Chủ điểm', kind: 'select', required: true, options: grammarTopicOptions }, { key: 'title', label: 'Tiêu đề quy tắc', required: true }, { key: 'body_markdown', label: 'Nội dung Markdown', kind: 'textarea', required: true }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }];
    case 'grammarExamples': return [id, { key: 'topic_id', label: 'Chủ điểm', kind: 'select', required: true, options: grammarTopicOptions }, { key: 'japanese_text', label: 'Câu tiếng Nhật', kind: 'textarea', required: true }, { key: 'vietnamese_text', label: 'Dịch tiếng Việt', kind: 'textarea', required: true }, { key: 'explanation', label: 'Giải thích', kind: 'textarea' }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }];
    case 'speakingPrompts': return [id, { key: 'course_id', label: 'Khóa học (để trống là toàn hệ thống)', kind: 'select', options: courseOptions }, { key: 'title', label: 'Tên đề', required: true }, { key: 'instructions', label: 'Hướng dẫn', kind: 'textarea', required: true }, { key: 'rubric_criteria', label: 'Tiêu chí chấm (mỗi dòng một tiêu chí)', kind: 'textarea' }, { key: 'order_index', label: 'Thứ tự', kind: 'number' }, { key: 'status', label: 'Luồng duyệt', kind: 'select', options: STATUS_OPTIONS }];
    case 'packages': return [id, { key: 'name', label: 'Tên gói', required: true }, { key: 'description', label: 'Mô tả', kind: 'textarea', required: true }, { key: 'price_cents', label: 'Giá (đơn vị nhỏ nhất)', kind: 'number', required: true }, { key: 'currency', label: 'Tiền tệ', required: true }, { key: 'ai_monthly_quota', label: 'Quota AI mỗi tháng', kind: 'number', required: true }, { key: 'course_ids', label: 'Khóa học trong gói', kind: 'multi', options: courseOptions }, { key: 'status', label: 'Trạng thái', kind: 'select', options: PACKAGE_STATUS_OPTIONS }];
    case 'prompts': return [id, { key: 'name', label: 'Tên prompt', required: true }, { key: 'provider', label: 'Provider', required: true }, { key: 'purpose', label: 'Mục đích', required: true }, { key: 'prompt_body', label: 'Prompt', kind: 'textarea', required: true }, { key: 'status', label: 'Trạng thái', kind: 'select', options: PROMPT_STATUS_OPTIONS }];
    case 'sitePages': return [id, { key: 'slug', label: 'Slug URL', required: true, hint: 'Ví dụ: terms hoặc privacy' }, { key: 'title', label: 'Tiêu đề', required: true }, { key: 'body_markdown', label: 'Nội dung Markdown', kind: 'textarea', required: true }, { key: 'status', label: 'Trạng thái', kind: 'select', options: SITE_PAGE_STATUS_OPTIONS }];
    case 'dashboardHero': return [id, { key: 'label', label: 'Tên khung giờ', required: true }, { key: 'start_time', label: 'Bắt đầu', kind: 'time', required: true }, { key: 'end_time', label: 'Kết thúc', kind: 'time', required: true, hint: 'Nếu giờ kết thúc sớm hơn giờ bắt đầu, khung giờ sẽ chạy qua nửa đêm.' }, { key: 'asset_key', label: 'Mascot / icon', kind: 'select', required: true, options: DASHBOARD_HERO_ASSET_OPTIONS.map((option) => ({ value: option.key, label: option.label })) }, { key: 'alt_text', label: 'Mô tả ảnh cho accessibility', required: true }, { key: 'sort_order', label: 'Thứ tự ưu tiên', kind: 'number' }, { key: 'is_active', label: 'Trạng thái', kind: 'select', options: [{ value: 'true', label: 'Đang dùng' }, { value: 'false', label: 'Tạm tắt' }] }];
    case 'alerts': return [id, { key: 'severity', label: 'Mức độ', kind: 'select', required: true, options: ['info', 'warning', 'critical'].map((value) => ({ value, label: value })) }, { key: 'title', label: 'Tiêu đề', required: true }, { key: 'body', label: 'Nội dung', kind: 'textarea', required: true }, { key: 'status', label: 'Trạng thái', kind: 'select', options: ALERT_STATUS_OPTIONS }];
    case 'announcements': return [{ key: 'title', label: 'Tiêu đề', required: true }, { key: 'body', label: 'Nội dung', kind: 'textarea', required: true }, { key: 'audience', label: 'Đối tượng', kind: 'select', required: true, options: [{ value: 'all_learners', label: 'Toàn bộ học viên' }, { value: 'active_learners', label: 'Học viên đang học' }, { value: 'course_learners', label: 'Theo khóa học' }] }, { key: 'course_id', label: 'Khóa học (chỉ khi gửi theo khóa)', kind: 'select', options: courseOptions }, { key: 'action_url', label: 'Đường dẫn trong app' }];
    default: return [];
  }
}

export function draftFromRow(section: SectionId, row: Row | null, data: ProductionData): Record<string, string> {
  if (!row) {
    if (section === 'announcements') return { audience: 'all_learners' };
    if (section === 'dashboardHero') return { label: 'Khung giờ mới', start_time: '09:00', end_time: '17:00', asset_key: 'sleeping_meow', alt_text: 'Mascot dashboard', sort_order: '0', is_active: 'true' };
    return { status: 'draft' };
  }
  const value = (key: string) => text(row[key]);
  if (section === 'questions') {
    const options = asTextList(row.options);
    return { id: value('id'), assessment_id: value('assessment_id'), prompt: value('prompt'), option_1: options[0] ?? '', option_2: options[1] ?? '', option_3: options[2] ?? '', option_4: options[3] ?? '', correct_option: String(Math.max(0, options.indexOf(value('correct_answer')))), explanation: value('explanation'), order_index: value('order_index') };
  }
  if (section === 'vocabulary') return { id: value('id'), term: value('term'), reading: value('reading'), pronunciation: value('pronunciation'), translation: value('translation'), level: value('level'), tags: asTextList(row.tags).join(', '), example_sentence: value('example_sentence'), audio_url: value('audio_url') };
  if (section === 'lessons') return { id: value('id'), course_id: value('course_id'), module_id: value('module_id'), title: value('title'), description: value('description'), lesson_type: value('lesson_type'), duration_minutes: value('duration_minutes'), objectives: asTextList(row.objectives).join('\n'), content_markdown: value('content_markdown'), order_index: value('order_index'), status: value('status') || 'draft' };
  if (section === 'documents') return { id: value('id'), course_id: value('course_id'), title: value('title'), summary: value('summary'), document_type: value('document_type'), content_markdown: value('content_markdown'), external_url: value('external_url'), read_time_minutes: value('read_time_minutes'), status: value('status') || 'draft' };
  if (section === 'audio') return { id: value('id'), course_id: value('course_id'), lesson_id: value('lesson_id'), title: value('title'), summary: value('summary'), external_url: value('external_url'), duration_minutes: value('duration_minutes'), status: value('status') || 'draft' };
  if (section === 'lessonAssets') return { id: value('id'), lesson_id: value('lesson_id'), title: value('title'), asset_type: value('asset_type'), description: value('description'), external_url: value('external_url') };
  if (section === 'lessonExercises') return { id: value('id'), lesson_id: value('lesson_id'), exercise_type: value('exercise_type'), prompt: value('prompt'), choices: asTextList(row.choices).join('\n'), answer: value('answer'), order_index: value('order_index') };
  if (section === 'lessonVocabulary') return { id: value('lesson_id'), lesson_id: value('lesson_id'), vocabulary_ids: value('vocabulary_ids') };
  if (section === 'reviewQuestions') {
    const options = data.reviewOptions.filter((item) => item.question_id === value('id')).sort((left, right) => left.order_index - right.order_index);
    return { id: value('id'), lesson_id: value('lesson_id'), prompt: value('prompt'), option_1: options[0]?.label ?? '', option_2: options[1]?.label ?? '', option_3: options[2]?.label ?? '', option_4: options[3]?.label ?? '', correct_option: String(Math.max(0, options.findIndex((item) => item.is_correct))), explanation: value('explanation'), order_index: value('order_index') };
  }
  if (section === 'grammarTopics') return { id: value('id'), slug: value('slug'), title: value('title'), level: value('level'), category: value('category'), summary: value('summary'), course_ids: data.grammarTopicCourses.filter((item) => item.topic_id === value('id')).map((item) => item.course_id).join(','), order_index: value('order_index'), status: value('status') || 'draft' };
  if (section === 'grammarRules') return { id: value('id'), topic_id: value('topic_id'), title: value('title'), body_markdown: value('body_markdown'), order_index: value('order_index') };
  if (section === 'grammarExamples') return { id: value('id'), topic_id: value('topic_id'), japanese_text: value('japanese_text'), vietnamese_text: value('vietnamese_text'), explanation: value('explanation'), order_index: value('order_index') };
  if (section === 'speakingPrompts') return { id: value('id'), course_id: value('course_id'), title: value('title'), instructions: value('instructions'), rubric_criteria: rubricCriteria(row.rubric).join('\n'), order_index: value('order_index'), status: value('status') || 'draft' };
  if (section === 'packages') return { id: value('id'), name: value('name'), description: value('description'), price_cents: value('price_cents'), currency: value('currency'), ai_monthly_quota: value('ai_monthly_quota'), course_ids: data.packageCourses.filter((item) => item.package_id === value('id')).map((item) => item.course_id).join(','), status: value('status') };
  if (section === 'prompts') return { id: value('id'), name: value('name'), provider: value('provider'), purpose: value('purpose'), prompt_body: value('prompt_body'), status: value('status') };
  if (section === 'sitePages') return { id: value('slug'), slug: value('slug'), title: value('title'), body_markdown: value('body_markdown'), status: value('status') || 'draft' };
  if (section === 'dashboardHero') return { id: value('id'), label: value('label'), start_time: value('start_time').slice(0, 5), end_time: value('end_time').slice(0, 5), asset_key: value('asset_key'), alt_text: value('alt_text'), sort_order: value('sort_order'), is_active: value('is_active') === 'false' ? 'false' : 'true' };
  if (section === 'alerts') return { id: value('id'), severity: value('severity'), title: value('title'), body: value('body'), status: value('status') };
  if (section === 'modules') return { id: value('id'), course_id: value('course_id'), title: value('title'), description: value('description'), level: value('level'), order_index: value('order_index'), status: value('status') || 'draft' };
  if (section === 'assessments') return { id: value('id'), course_id: value('course_id'), title: value('title'), assessment_type: value('assessment_type'), passing_score: value('passing_score'), order_index: value('order_index'), status: value('status') || 'draft' };
  return { id: value('id'), slug: value('slug'), title: value('title'), level: value('level'), description: value('description'), order_index: value('order_index'), theme_color: value('theme_color'), status: value('status') || 'draft' };
}
