import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Pencil,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AdminEmptyState,
  AdminErrorState,
  AdminPageSkeleton,
} from "@/src/features/admin/components/AdminState";
import { AdminPageHeader } from "@/src/features/admin/components/AdminPageHeader";
import { ConfirmDialog } from "@/src/features/admin/components/ConfirmDialog";
import { SearchFilterBar } from "@/src/features/admin/components/SearchFilterBar";
import { StatusBadge } from "@/src/features/admin/components/StatusBadge";
import { GrammarExamplesPanel } from "@/src/features/admin/components/grammar/GrammarExamplesPanel";
import { GrammarRulesPanel } from "@/src/features/admin/components/grammar/GrammarRulesPanel";
import { GrammarTopicEditorDrawer } from "@/src/features/admin/components/grammar/GrammarTopicEditorDrawer";
import { useAdminQuery } from "@/src/features/admin/hooks/useAdminQuery";
import { useAdminLayoutContext } from "@/src/features/admin/layouts/AdminLayout";
import {
  deleteAdminGrammarTopic,
  listAdminCourses,
  listAdminGrammarExamples,
  listAdminGrammarRules,
  listAdminGrammarTopicCourses,
  listAdminGrammarTopics,
  publishAdminContent,
  saveAdminGrammarTopic,
} from "@/src/features/admin/repositories/adminRepository";
import type { Tables } from "@/src/features/supabase/lib/database.types";

type Topic = Tables<"grammar_topics">;
type GrammarTab = "overview" | "rules" | "examples" | "courses";

interface GrammarData {
  courses: Tables<"courses">[];
  topics: Topic[];
  rules: Tables<"grammar_rules">[];
  examples: Tables<"grammar_examples">[];
  links: Tables<"grammar_topic_courses">[];
}

export default function AdminGrammarPage() {
  const { role } = useAdminLayoutContext();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("course") ?? "";
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<GrammarTab>("overview");
  const [editorTopic, setEditorTopic] = useState<Topic | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTopic, setDeleteTopic] = useState<Topic | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const load = useCallback(async (): Promise<GrammarData> => {
    const [courses, topics, rules, examples, links] = await Promise.all([
      listAdminCourses(),
      listAdminGrammarTopics(),
      listAdminGrammarRules(),
      listAdminGrammarExamples(),
      listAdminGrammarTopicCourses(),
    ]);
    return { courses, topics, rules, examples, links };
  }, []);
  const { data, loading, error, refresh } = useAdminQuery<GrammarData>(load);
  const courseFilter = data?.courses.find((course) => course.id === courseId);
  const scopedTopicIds = useMemo(
    () =>
      courseId
        ? new Set(
            (data?.links ?? [])
              .filter((link) => link.course_id === courseId)
              .map((link) => link.topic_id),
          )
        : null,
    [courseId, data?.links],
  );
  const filteredTopics = useMemo(
    () =>
      (data?.topics ?? []).filter(
        (topic) =>
          (!scopedTopicIds || scopedTopicIds.has(topic.id)) &&
          (!query.trim() ||
            [topic.title, topic.slug, topic.level, topic.category, topic.summary]
              .join(" ")
              .toLocaleLowerCase("vi-VN")
              .includes(query.trim().toLocaleLowerCase("vi-VN"))),
      ),
    [data?.topics, query, scopedTopicIds],
  );
  useEffect(() => {
    if (!selectedId || !filteredTopics.some((topic) => topic.id === selectedId))
      setSelectedId(filteredTopics[0]?.id ?? null);
  }, [filteredTopics, selectedId]);
  const selected =
    filteredTopics.find((topic) => topic.id === selectedId) ?? null;
  const selectedRules =
    data?.rules.filter((rule) => rule.topic_id === selected?.id) ?? [];
  const selectedExamples =
    data?.examples.filter((example) => example.topic_id === selected?.id) ?? [];
  const selectedCourseIds =
    data?.links
      .filter((link) => link.topic_id === selected?.id)
      .map((link) => link.course_id) ?? [];
  function create(): void {
    setEditorTopic(null);
    setEditorOpen(true);
  }
  function edit(topic: Topic): void {
    setEditorTopic(topic);
    setEditorOpen(true);
  }
  async function remove(): Promise<void> {
    if (!deleteTopic || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      await deleteAdminGrammarTopic(deleteTopic.id);
      setDeleteTopic(null);
      setSelectedId(null);
      await refresh();
    } catch {
      setActionError(
        "Không xóa được chủ điểm. Vui lòng kiểm tra nội dung liên quan rồi thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function changeWorkflow(): Promise<void> {
    if (!selected || saving) return;
    setSaving(true);
    setActionError(null);
    try {
      if (role === "owner") {
        await publishAdminContent("grammar_topic", selected.id, "published");
        setNotice("Chủ điểm đã được xuất bản.");
      } else {
        await saveAdminGrammarTopic({ id: selected.id, status: "in_review" });
        setNotice("Chủ điểm đã được gửi để Owner duyệt.");
      }
      await refresh();
    } catch {
      setActionError("Không cập nhật được trạng thái chủ điểm.");
    } finally {
      setSaving(false);
    }
  }
  const tabs: Array<{ id: GrammarTab; label: string }> = [
    { id: "overview", label: "Tổng quan" },
    { id: "rules", label: "Quy tắc" },
    { id: "examples", label: "Ví dụ" },
    { id: "courses", label: "Khóa học" },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Nội dung"
        title="Ngữ pháp"
        description={
          courseFilter
            ? "Đang xem các chủ điểm liên kết với " + courseFilter.title + "."
            : "Chủ điểm, quy tắc và ví dụ được quản lý theo một cấu trúc phân cấp."
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {courseFilter && (
              <Link
                to="/admin/content/grammar"
                className="inline-flex min-h-11 items-center rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73]"
              >
                Xem tất cả
              </Link>
            )}
            <button
              type="button"
              onClick={create}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
            >
              <Plus aria-hidden="true" size={17} />
              Tạo chủ điểm
            </button>
          </div>
        }
      />
      <SearchFilterBar
        value={query}
        onChange={setQuery}
        placeholder="Tìm chủ điểm, slug, cấp độ…"
      />
      {courseFilter && (
        <p className="rounded-xl border border-[#D9CBB9] bg-[#F0E8DC] px-4 py-3 text-sm font-semibold text-[#315C73]">
          Phạm vi khóa học: {courseFilter.title}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800"
        >
          {notice}
        </p>
      )}
      {actionError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"
        >
          {actionError}
        </p>
      )}
      {loading && !data ? (
        <AdminPageSkeleton rows={5} />
      ) : error || !data ? (
        <AdminErrorState
          title="Không tải được ngữ pháp"
          onRetry={() => void refresh()}
        />
      ) : (
        <section className="grid gap-5 xl:grid-cols-[minmax(18rem,0.82fr)_minmax(0,1.18fr)]">
          <div className="overflow-hidden rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7]">
            <div className="divide-y divide-[#EDE4D8]">
              {filteredTopics.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(topic.id);
                    setTab("overview");
                  }}
                  className={`w-full p-4 text-left transition ${topic.id === selectedId ? "bg-[#F0E8DC]" : "hover:bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <strong className="block truncate text-sm">
                        {topic.title}
                      </strong>
                      <p className="mt-1 truncate text-xs text-[#7B8796]">
                        {[topic.level, topic.category]
                          .filter(Boolean)
                          .join(" · ") || "Chưa phân loại"}
                      </p>
                    </div>
                    <StatusBadge status={topic.status} />
                  </div>
                </button>
              ))}
              {filteredTopics.length === 0 && (
                <div className="p-4">
                  <AdminEmptyState
                    title="Chưa có chủ điểm phù hợp"
                    description="Tạo chủ điểm mới hoặc thay đổi tìm kiếm."
                    action={
                      <button
                        type="button"
                        onClick={create}
                        className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white"
                      >
                        Tạo chủ điểm
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
          <section className="min-w-0 rounded-2xl border border-[#E4D8C9] bg-[#FFFCF7] p-4 sm:p-5">
            {selected ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#EDE4D8] pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold">{selected.title}</h2>
                      <StatusBadge status={selected.status} />
                    </div>
                    <p className="mt-1 text-sm text-[#5F6B7C]">
                      {selected.summary || "Chưa có tóm tắt."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => edit(selected)}
                      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                    >
                      <Pencil aria-hidden="true" size={15} />
                      Sửa
                    </button>
                    {selected.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => void changeWorkflow()}
                        disabled={saving}
                        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#315C73] px-3 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <Send aria-hidden="true" size={15} />
                        {role === "owner" ? "Xuất bản" : "Gửi duyệt"}
                      </button>
                    )}
                    {role === "owner" && (
                      <button
                        type="button"
                        onClick={() => setDeleteTopic(selected)}
                        aria-label={`Xóa ${selected.title}`}
                        className="grid min-h-10 min-w-10 place-items-center rounded-lg border border-red-200 bg-white text-red-700"
                      >
                        <Trash2 aria-hidden="true" size={15} />
                      </button>
                    )}
                  </div>
                </div>
                <nav
                  aria-label="Nội dung chủ điểm"
                  className="mt-4 flex gap-1 overflow-x-auto no-scrollbar"
                >
                  {tabs.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTab(item.id)}
                      aria-current={tab === item.id ? "page" : undefined}
                      className={`min-h-10 shrink-0 rounded-lg px-3 text-sm font-semibold ${tab === item.id ? "bg-[#F0E8DC] text-[#315C73]" : "text-[#5F6B7C] hover:bg-white"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </nav>
                <div className="mt-5">
                  {tab === "overview" && (
                    <div className="grid gap-3 sm:grid-cols-3">
                      <article className="rounded-xl border border-[#E4D8C9] bg-white p-4">
                        <p className="text-xs text-[#7B8796]">Quy tắc</p>
                        <strong className="mt-1 block text-2xl">
                          {selectedRules.length}
                        </strong>
                      </article>
                      <article className="rounded-xl border border-[#E4D8C9] bg-white p-4">
                        <p className="text-xs text-[#7B8796]">Ví dụ</p>
                        <strong className="mt-1 block text-2xl">
                          {selectedExamples.length}
                        </strong>
                      </article>
                      <article className="rounded-xl border border-[#E4D8C9] bg-white p-4">
                        <p className="text-xs text-[#7B8796]">
                          Khóa học liên kết
                        </p>
                        <strong className="mt-1 block text-2xl">
                          {selectedCourseIds.length}
                        </strong>
                      </article>
                    </div>
                  )}
                  {tab === "rules" && (
                    <GrammarRulesPanel
                      topicId={selected.id}
                      rules={selectedRules}
                      onUpdated={refresh}
                    />
                  )}
                  {tab === "examples" && (
                    <GrammarExamplesPanel
                      topicId={selected.id}
                      examples={selectedExamples}
                      onUpdated={refresh}
                    />
                  )}
                  {tab === "courses" && (
                    <section>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-bold">Khóa học liên kết</h3>
                          <p className="mt-1 text-sm text-[#5F6B7C]">
                            Các khóa học dùng chủ điểm này.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => edit(selected)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#D9CBB9] bg-white px-3 text-sm font-semibold text-[#315C73]"
                        >
                          Chỉnh sửa liên kết
                          <ChevronRight aria-hidden="true" size={15} />
                        </button>
                      </div>
                      <div className="mt-4 space-y-2">
                        {data.courses
                          .filter((course) =>
                            selectedCourseIds.includes(course.id),
                          )
                          .map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center gap-2 rounded-xl border border-[#E4D8C9] bg-white p-3 text-sm"
                            >
                              <BookOpen
                                aria-hidden="true"
                                className="text-[#315C73]"
                                size={16}
                              />
                              {course.title}
                            </div>
                          ))}
                        {selectedCourseIds.length === 0 && (
                          <p className="rounded-xl border border-dashed border-[#D9CBB9] bg-white p-4 text-sm text-[#5F6B7C]">
                            Chưa liên kết khóa học nào.
                          </p>
                        )}
                      </div>
                    </section>
                  )}
                </div>
              </>
            ) : (
              <AdminEmptyState
                title="Chọn chủ điểm"
                description="Chọn chủ điểm ở cột bên trái để quản lý quy tắc và ví dụ."
              />
            )}
          </section>
        </section>
      )}
      <GrammarTopicEditorDrawer
        open={editorOpen}
        topic={editorTopic}
        courses={data?.courses ?? []}
        linkedCourseIds={
          editorTopic
            ? (data?.links
                .filter((link) => link.topic_id === editorTopic.id)
                .map((link) => link.course_id) ?? [])
            : courseFilter
              ? [courseFilter.id]
              : []
        }
        onClose={() => setEditorOpen(false)}
        onSaved={refresh}
      />
      <ConfirmDialog
        open={Boolean(deleteTopic)}
        title={`Xóa “${deleteTopic?.title ?? ""}”?`}
        description="Thao tác này không thể hoàn tác."
        confirmLabel="Xóa chủ điểm"
        pending={saving}
        onCancel={() => setDeleteTopic(null)}
        onConfirm={() => void remove()}
      />
    </div>
  );
}
