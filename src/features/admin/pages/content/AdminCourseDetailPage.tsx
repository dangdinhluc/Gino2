import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  FileAudio,
  FileText,
  FolderTree,
  Mic2,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageSkeleton,
} from "@/src/features/admin/components/AdminState";
import { AdminPageHeader } from "@/src/features/admin/components/AdminPageHeader";
import { ConfirmDialog } from "@/src/features/admin/components/ConfirmDialog";
import { StatusBadge } from "@/src/features/admin/components/StatusBadge";
import { CourseEditorDrawer } from "@/src/features/admin/components/course/CourseEditorDrawer";
import { LessonEditorDrawer } from "@/src/features/admin/components/course/LessonEditorDrawer";
import { ModuleEditorDrawer } from "@/src/features/admin/components/course/ModuleEditorDrawer";
import { SpeakingPromptEditorDrawer } from "@/src/features/admin/components/course/SpeakingPromptEditorDrawer";
import { useAdminQuery } from "@/src/features/admin/hooks/useAdminQuery";
import { useAdminLayoutContext } from "@/src/features/admin/layouts/AdminLayout";
import {
  deleteAdminLesson,
  deleteAdminModule,
  deleteAdminSpeakingPrompt,
  fetchAdminCourseWorkspace,
  publishAdminContent,
  saveAdminSpeakingPrompt,
  updateAdminCourse,
  type AdminCourseWorkspace,
} from "@/src/features/admin/repositories/adminRepository";
import type { Tables } from "@/src/features/supabase/lib/database.types";
import { formatAdminDate } from "@/src/features/admin/lib/adminFormat";

type CourseTab =
  | "overview"
  | "curriculum"
  | "vocabulary"
  | "grammar"
  | "exams"
  | "documents"
  | "speaking"
  | "settings";
type Module = Tables<"course_modules">;
type Lesson = Tables<"lessons">;
type SpeakingPrompt = Tables<"speaking_prompts">;
type DeleteTarget = {
  kind: "module" | "lesson" | "speaking";
  id: string;
  title: string;
} | null;

function rubricCriteriaCount(prompt: SpeakingPrompt): number {
  const rubric = prompt.rubric;
  if (!rubric || typeof rubric !== "object" || Array.isArray(rubric)) return 0;
  const criteria = (rubric as Record<string, unknown>).criteria;
  return Array.isArray(criteria)
    ? criteria.filter((item) => typeof item === "string" && item.trim()).length
    : 0;
}

function Metric({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <article className="rounded-xl border border-[#E4D8C9] bg-white p-4">
      <p className="text-xs font-semibold text-[#7B8796]">{label}</p>
      <strong className="mt-1 block text-2xl font-bold text-[#172033]">
        {value}
      </strong>
      <p className="mt-1 text-xs text-[#7B8796]">{description}</p>
    </article>
  );
}

export default function AdminCourseDetailPage() {
  const { courseId = "" } = useParams();
  const { role } = useAdminLayoutContext();
  const load = useCallback(
    () => fetchAdminCourseWorkspace(courseId),
    [courseId],
  );
  const { data, loading, error, refresh } =
    useAdminQuery<AdminCourseWorkspace>(load);
  const [tab, setTab] = useState<CourseTab>("overview");
  const [courseEditorOpen, setCourseEditorOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [moduleEditorOpen, setModuleEditorOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonDefaultModuleId, setLessonDefaultModuleId] = useState("");
  const [lessonEditorOpen, setLessonEditorOpen] = useState(false);
  const [editingSpeakingPrompt, setEditingSpeakingPrompt] =
    useState<SpeakingPrompt | null>(null);
  const [speakingEditorOpen, setSpeakingEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const vocabularyCountByLesson = useMemo(() => {
    const counts = new Map<string, number>();
    for (const link of data?.lessonVocabulary ?? [])
      counts.set(link.lesson_id, (counts.get(link.lesson_id) ?? 0) + 1);
    return counts;
  }, [data?.lessonVocabulary]);
  const lessonsByModule = useMemo(() => {
    const grouped = new Map<string, Lesson[]>();
    for (const lesson of data?.lessons ?? [])
      grouped.set(lesson.module_id, [
        ...(grouped.get(lesson.module_id) ?? []),
        lesson,
      ]);
    return grouped;
  }, [data?.lessons]);

  function openNewModule(): void {
    setEditingModule(null);
    setModuleEditorOpen(true);
  }
  function openEditModule(module: Module): void {
    setEditingModule(module);
    setModuleEditorOpen(true);
  }
  function openNewLesson(moduleId: string): void {
    setEditingLesson(null);
    setLessonDefaultModuleId(moduleId);
    setLessonEditorOpen(true);
  }
  function openEditLesson(lesson: Lesson): void {
    setEditingLesson(lesson);
    setLessonDefaultModuleId(lesson.module_id);
    setLessonEditorOpen(true);
  }
  function openNewSpeakingPrompt(): void {
    setEditingSpeakingPrompt(null);
    setSpeakingEditorOpen(true);
  }
  function openEditSpeakingPrompt(prompt: SpeakingPrompt): void {
    setEditingSpeakingPrompt(prompt);
    setSpeakingEditorOpen(true);
  }

  async function updateCourseWorkflow(): Promise<void> {
    if (!data || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (role === "owner") {
        await publishAdminContent("course", data.course.id, "published");
        setNotice("Khóa học đã được xuất bản.");
      } else {
        await updateAdminCourse(data.course.id, { status: "in_review" });
        setNotice("Khóa học đã được gửi để Owner duyệt.");
      }
      await refresh();
    } catch {
      setActionError(
        "Không cập nhật được trạng thái khóa học. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(): Promise<void> {
    if (!deleteTarget || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (deleteTarget.kind === "module")
        await deleteAdminModule(deleteTarget.id);
      else if (deleteTarget.kind === "lesson")
        await deleteAdminLesson(deleteTarget.id);
      else await deleteAdminSpeakingPrompt(deleteTarget.id);
      setDeleteTarget(null);
      setNotice(
        deleteTarget.kind === "module"
          ? "Đã xóa module."
          : deleteTarget.kind === "lesson"
            ? "Đã xóa bài học."
            : "Đã xóa đề giao tiếp.",
      );
      await refresh();
    } catch {
      setActionError(
        "Không xóa được nội dung. Vui lòng kiểm tra các quan hệ hiện có rồi thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateSpeakingWorkflow(prompt: SpeakingPrompt): Promise<void> {
    if (saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (role === "owner") {
        await publishAdminContent("speaking_prompt", prompt.id, "published");
        setNotice("Đề giao tiếp đã được xuất bản.");
      } else {
        await saveAdminSpeakingPrompt({ id: prompt.id, status: "in_review" });
        setNotice("Đề giao tiếp đã được gửi để Owner duyệt.");
      }
      await refresh();
    } catch {
      setActionError(
        "Không cập nhật được trạng thái đề giao tiếp. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!courseId) return <AdminErrorState title="Thiếu khóa học cần mở" />;
  if (loading && !data)
    return (
      <>
        <AdminPageHeader
          eyebrow="Nội dung / Khóa học"
          title="Đang mở khóa học"
          description="Đang tải curriculum và tài nguyên liên quan."
        />
        <div className="mt-6">
          <AdminPageSkeleton rows={6} />
        </div>
      </>
    );
  if (error || !data)
    return (
      <>
        <AdminPageHeader
          eyebrow="Nội dung / Khóa học"
          title="Không mở được khóa học"
          description="Khóa học không được tải hoặc bạn không còn quyền truy cập."
        />
        <div className="mt-6">
          <AdminErrorState
            title="Không tải được khóa học"
            onRetry={() => void refresh()}
          />
        </div>
      </>
    );

  const {
    course,
    modules,
    lessons,
    assessments,
    documents,
    audio,
    speakingPrompts,
  } = data;
  const draftLessons = lessons.filter(
    (lesson) => lesson.status !== "published",
  ).length;
  const tabs: Array<{ id: CourseTab; label: string }> = [
    { id: "overview", label: "Tổng quan" },
    { id: "curriculum", label: "Curriculum" },
    { id: "vocabulary", label: "Từ vựng" },
    { id: "grammar", label: "Ngữ pháp" },
    { id: "exams", label: "Thi thử" },
    { id: "documents", label: "Tài liệu" },
    { id: "speaking", label: "Giao tiếp" },
    { id: "settings", label: "Cài đặt" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Nội dung / Khóa học"
        title={course.title}
        description={course.description}
        actions={
          <>
            <Link
              to="/admin/content/courses"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
            >
              <ArrowLeft aria-hidden="true" size={16} />
              Khóa học
            </Link>
            <button
              type="button"
              onClick={() => setCourseEditorOpen(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
            >
              <Pencil aria-hidden="true" size={16} />
              Chỉnh sửa
            </button>
            {course.status !== "published" && (
              <button
                type="button"
                onClick={() => void updateCourseWorkflow()}
                disabled={saving}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Send aria-hidden="true" size={16} />
                {role === "owner" ? "Xuất bản" : "Gửi duyệt"}
              </button>
            )}
          </>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={course.status} />
          <span className="text-xs text-[#7B8796]">
            Cập nhật {formatAdminDate(course.updated_at)}
          </span>
        </div>
      </AdminPageHeader>
      {actionError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {actionError}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
        >
          {notice}
        </p>
      )}
      <nav
        aria-label="Nội dung khóa học"
        className="-mx-1 flex gap-1 overflow-x-auto border-b border-[#E4D8C9] px-1 no-scrollbar"
      >
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? "page" : undefined}
            className={`min-h-11 shrink-0 border-b-2 px-3 text-sm font-semibold ${tab === item.id ? "border-[#315C73] text-[#315C73]" : "border-transparent text-[#5F6B7C] hover:text-[#315C73]"}`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {tab === "overview" && (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Module"
              value={modules.length}
              description="Khối nội dung trong khóa"
            />
            <Metric
              label="Bài học"
              value={lessons.length}
              description={`${draftLessons} bài chưa xuất bản`}
            />
            <Metric
              label="Liên kết từ"
              value={data.lessonVocabulary.length}
              description="Từ vựng gắn vào bài"
            />
            <Metric
              label="Tài nguyên"
              value={
                assessments.length +
                documents.length +
                audio.length +
                speakingPrompts.length
              }
              description={`${assessments.length} đề · ${documents.length} tài liệu · ${audio.length} audio · ${speakingPrompts.length} giao tiếp`}
            />
          </section>
          <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
              <h2 className="font-bold">Cần chú ý</h2>
              <div className="mt-4 space-y-3">
                {draftLessons > 0 ? (
                  <div className="rounded-xl border border-[#E9C98C] bg-[#FFF7E5] p-3 text-sm leading-6 text-[#5C4415]">
                    <strong>{draftLessons} bài học</strong> chưa được xuất bản.
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                    Tất cả bài học hiện tại đã được xuất bản.
                  </div>
                )}
                {modules.length === 0 && (
                  <div className="rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm text-[#5F6B7C]">
                    Khóa học chưa có module. Hãy thêm module để tạo curriculum.
                  </div>
                )}
                {lessons.length > 0 && data.lessonVocabulary.length === 0 && (
                  <div className="rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm text-[#5F6B7C]">
                    Các bài học chưa có liên kết từ vựng.
                  </div>
                )}
              </div>
            </article>
            <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
              <h2 className="font-bold">Đi tới workflow</h2>
              <div className="mt-3 space-y-2">
                <button
                  type="button"
                  onClick={() => setTab("curriculum")}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D9CBB9] bg-white px-3 text-left text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                >
                  Curriculum
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTab("exams")}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D9CBB9] bg-white px-3 text-left text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                >
                  Thi thử
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTab("grammar")}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D9CBB9] bg-white px-3 text-left text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                >
                  Ngữ pháp
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTab("documents")}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D9CBB9] bg-white px-3 text-left text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                >
                  Tài liệu & media
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setTab("speaking")}
                  className="flex min-h-11 w-full items-center justify-between rounded-xl border border-[#D9CBB9] bg-white px-3 text-left text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                >
                  Giao tiếp
                  <ChevronRight aria-hidden="true" size={16} />
                </button>
              </div>
            </article>
          </section>
        </div>
      )}
      {tab === "curriculum" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Curriculum</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Module và bài học được quản lý ngay trong khóa học.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewModule}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
            >
              <Plus aria-hidden="true" size={16} />
              Thêm module
            </button>
          </div>
          {modules.length === 0 ? (
            <AdminEmptyState
              title="Chưa có module"
              description="Thêm module đầu tiên để bắt đầu xây dựng curriculum."
              action={
                <button
                  type="button"
                  onClick={openNewModule}
                  className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
                >
                  Thêm module
                </button>
              }
            />
          ) : (
            modules.map((module) => {
              const moduleLessons = lessonsByModule.get(module.id) ?? [];
              return (
                <details
                  key={module.id}
                  open
                  className="group rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]"
                >
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <FolderTree
                          aria-hidden="true"
                          className="text-[#315C73]"
                          size={18}
                        />
                        <strong className="truncate">{module.title}</strong>
                        <StatusBadge status={module.status} />
                      </div>
                      <p className="mt-1 truncate text-sm text-[#5F6B7C]">
                        {moduleLessons.length} bài học · {module.description}
                      </p>
                    </div>
                    <ChevronRight
                      aria-hidden="true"
                      className="shrink-0 text-[#7B8796] transition group-open:rotate-90"
                      size={18}
                    />
                  </summary>
                  <div className="border-t border-[#EDE4D8] p-3 sm:p-4">
                    <div className="mb-3 flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModule(module)}
                        className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                      >
                        Sửa module
                      </button>
                      {role === "owner" && (
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              kind: "module",
                              id: module.id,
                              title: module.title,
                            })
                          }
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-semibold text-red-700"
                        >
                          <Trash2 aria-hidden="true" size={15} />
                          Xóa
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {moduleLessons.map((lesson) => (
                        <article
                          key={lesson.id}
                          className="flex flex-col gap-3 rounded-xl border border-[#E4D8C9] bg-white p-3 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <strong className="truncate text-sm">
                                {lesson.title}
                              </strong>
                              <StatusBadge status={lesson.status} />
                            </div>
                            <p className="mt-1 text-xs text-[#7B8796]">
                              {vocabularyCountByLesson.get(lesson.id) ?? 0} từ
                              vựng · {lesson.duration_minutes} phút ·{" "}
                              {lesson.lesson_type}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <button
                              type="button"
                              onClick={() => openEditLesson(lesson)}
                              className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                            >
                              Mở bài học
                            </button>
                            {role === "owner" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteTarget({
                                    kind: "lesson",
                                    id: lesson.id,
                                    title: lesson.title,
                                  })
                                }
                                aria-label={`Xóa ${lesson.title}`}
                                className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"
                              >
                                <Trash2 aria-hidden="true" size={15} />
                              </button>
                            )}
                          </div>
                        </article>
                      ))}
                      {moduleLessons.length === 0 && (
                        <p className="rounded-xl bg-white p-3 text-sm text-[#5F6B7C]">
                          Chưa có bài học trong module này.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => openNewLesson(module.id)}
                      className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-dashed border-[#B7A891] bg-white px-4 text-sm font-semibold text-[#315C73] hover:bg-[#F8F2EA]"
                    >
                      <Plus aria-hidden="true" size={16} />
                      Thêm bài học
                    </button>
                  </div>
                </details>
              );
            })
          )}
        </section>
      )}
      {tab === "vocabulary" && (
        <section className="space-y-4">
          <div>
            <h2 className="font-bold">Từ vựng trong khóa</h2>
            <p className="mt-1 text-sm text-[#5F6B7C]">
              Hiện có {data.lessonVocabulary.length} liên kết từ vựng trên{" "}
              {lessons.length} bài học.
            </p>
          </div>
          <div className="divide-y overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <strong className="text-sm">{lesson.title}</strong>
                  <p className="mt-1 text-xs text-[#7B8796]">
                    {vocabularyCountByLesson.get(lesson.id) ?? 0} từ vựng liên
                    kết
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEditLesson(lesson)}
                  className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                >
                  Mở bài học
                </button>
              </div>
            ))}
            {lessons.length === 0 && (
              <p className="p-4 text-sm text-[#5F6B7C]">
                Thêm bài học trước khi gắn từ vựng.
              </p>
            )}
          </div>
        </section>
      )}
      {tab === "grammar" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-bold">
                <BookOpen aria-hidden="true" className="text-[#315C73]" size={18} />
                Ngữ pháp
              </h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Quản lý các chủ điểm, quy tắc và ví dụ được liên kết với khóa học này.
              </p>
            </div>
            <Link
              to={"/admin/content/grammar?course=" + course.id}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
            >
              Mở workflow ngữ pháp
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
            <p className="text-sm leading-6 text-[#5F6B7C]">
              Khi mở workflow, danh sách sẽ chỉ hiển thị chủ điểm của{" "}
              <strong className="text-[#172033]">{course.title}</strong>. Bạn có thể
              chỉnh sửa quy tắc, ví dụ và liên kết thêm chủ điểm mà không phải
              nhập mã kỹ thuật.
            </p>
          </article>
        </section>
      )}
      {tab === "exams" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Thi thử</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Đề thi thuộc khóa học hiện tại.
              </p>
            </div>
            <Link
              to={`/admin/content/exams?course=${course.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]"
            >
              Quản lý đề thi
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="space-y-2">
            {assessments.map((assessment) => (
              <article
                key={assessment.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"
              >
                <div>
                  <strong>{assessment.title}</strong>
                  <p className="mt-1 text-sm text-[#5F6B7C]">
                    {assessment.assessment_type} · đạt từ{" "}
                    {assessment.passing_score}%
                  </p>
                </div>
                <StatusBadge status={assessment.status} />
              </article>
            ))}
            {assessments.length === 0 && (
              <AdminEmptyState
                title="Chưa có đề thi"
                description="Tạo đề thi cho khóa học này trong workflow Thi thử."
              />
            )}
          </div>
        </section>
      )}
      {tab === "documents" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Tài liệu & media</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Tài liệu và audio liên quan trực tiếp tới khóa học.
              </p>
            </div>
            <Link
              to={`/admin/content/media?course=${course.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]"
            >
              Quản lý media
              <ChevronRight aria-hidden="true" size={16} />
            </Link>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4">
              <div className="flex items-center gap-2">
                <FileText
                  aria-hidden="true"
                  className="text-[#315C73]"
                  size={18}
                />
                <h3 className="font-bold">Tài liệu ({documents.length})</h3>
              </div>
              <div className="mt-3 space-y-2">
                {documents.slice(0, 5).map((document) => (
                  <div key={document.id} className="rounded-lg bg-white p-3">
                    <p className="text-sm font-semibold">{document.title}</p>
                    <p className="mt-1 text-xs text-[#7B8796]">
                      {document.document_type} · {document.read_time_minutes}{" "}
                      phút
                    </p>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-sm text-[#5F6B7C]">Chưa có tài liệu.</p>
                )}
              </div>
            </article>
            <article className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4">
              <div className="flex items-center gap-2">
                <FileAudio
                  aria-hidden="true"
                  className="text-[#315C73]"
                  size={18}
                />
                <h3 className="font-bold">Audio ({audio.length})</h3>
              </div>
              <div className="mt-3 space-y-2">
                {audio.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg bg-white p-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-[#7B8796]">
                      {item.duration_minutes} phút
                    </p>
                  </div>
                ))}
                {audio.length === 0 && (
                  <p className="text-sm text-[#5F6B7C]">Chưa có audio.</p>
                )}
              </div>
            </article>
          </div>
        </section>
      )}
      {tab === "speaking" && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold">Giao tiếp</h2>
              <p className="mt-1 text-sm text-[#5F6B7C]">
                Đề luyện nói và rubric thuộc trực tiếp khóa học này.
              </p>
            </div>
            <button
              type="button"
              onClick={openNewSpeakingPrompt}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
            >
              <Plus aria-hidden="true" size={16} />
              Thêm đề giao tiếp
            </button>
          </div>
          <div className="space-y-3">
            {speakingPrompts.map((prompt) => (
              <article
                key={prompt.id}
                className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Mic2
                        aria-hidden="true"
                        className="text-[#315C73]"
                        size={18}
                      />
                      <strong>{prompt.title}</strong>
                      <StatusBadge status={prompt.status} />
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#5F6B7C]">
                      {prompt.instructions}
                    </p>
                    <p className="mt-2 text-xs text-[#7B8796]">
                      {rubricCriteriaCount(prompt)} tiêu chí chấm · Thứ tự{" "}
                      {prompt.order_index}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSpeakingPrompt(prompt)}
                      className="min-h-10 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                    >
                      Chỉnh sửa
                    </button>
                    {prompt.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => void updateSpeakingWorkflow(prompt)}
                        disabled={saving}
                        className="min-h-10 rounded-lg bg-[#315C73] px-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        {role === "owner" ? "Xuất bản" : "Gửi duyệt"}
                      </button>
                    )}
                    {role === "owner" && (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            kind: "speaking",
                            id: prompt.id,
                            title: prompt.title,
                          })
                        }
                        aria-label={`Xóa ${prompt.title}`}
                        className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
            {speakingPrompts.length === 0 && (
              <AdminEmptyState
                title="Chưa có đề giao tiếp"
                description="Tạo đề đầu tiên để học viên có nội dung luyện nói trong khóa học."
                action={
                  <button
                    type="button"
                    onClick={openNewSpeakingPrompt}
                    className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
                  >
                    Thêm đề giao tiếp
                  </button>
                }
              />
            )}
          </div>
        </section>
      )}
      {tab === "settings" && (
        <section className="rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-5">
          <h2 className="font-bold">Cài đặt khóa học</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[#5F6B7C]">
            Chỉnh sửa tên, slug, mô tả, cấp độ và thứ tự. Chi tiết kỹ thuật
            không cần thiết cho workflow thường ngày.
          </p>
          <button
            type="button"
            onClick={() => setCourseEditorOpen(true)}
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
          >
            <Pencil aria-hidden="true" size={16} />
            Chỉnh sửa khóa học
          </button>
        </section>
      )}
      <CourseEditorDrawer
        open={courseEditorOpen}
        course={course}
        onClose={() => setCourseEditorOpen(false)}
        onSaved={refresh}
      />
      <ModuleEditorDrawer
        open={moduleEditorOpen}
        courseId={course.id}
        module={editingModule}
        onClose={() => setModuleEditorOpen(false)}
        onSaved={refresh}
      />
      <LessonEditorDrawer
        open={lessonEditorOpen}
        courseId={course.id}
        modules={modules}
        lesson={editingLesson}
        defaultModuleId={lessonDefaultModuleId}
        onClose={() => setLessonEditorOpen(false)}
        onSaved={refresh}
      />
      <SpeakingPromptEditorDrawer
        open={speakingEditorOpen}
        courseId={course.id}
        prompt={editingSpeakingPrompt}
        onClose={() => setSpeakingEditorOpen(false)}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={
          deleteTarget?.kind === "module"
            ? `Xóa module “${deleteTarget.title}”?`
            : deleteTarget?.kind === "lesson"
              ? `Xóa bài học “${deleteTarget.title}”?`
              : `Xóa đề giao tiếp “${deleteTarget?.title ?? ""}”?`
        }
        description="Thao tác này không thể hoàn tác. Hãy kiểm tra nội dung liên quan trước khi tiếp tục."
        confirmLabel={
          deleteTarget?.kind === "module"
            ? "Xóa module"
            : deleteTarget?.kind === "lesson"
              ? "Xóa bài học"
              : "Xóa đề giao tiếp"
        }
        pending={saving}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
