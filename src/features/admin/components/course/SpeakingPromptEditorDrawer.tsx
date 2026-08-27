import { useEffect, useState } from "react";
import type { Tables } from "@/src/features/supabase/lib/database.types";
import { EditorDrawer } from "@/src/features/admin/components/EditorDrawer";
import { EditorField, editorControlClass } from "./EditorFields";
import { saveAdminSpeakingPrompt } from "@/src/features/admin/repositories/adminRepository";

type SpeakingPrompt = Tables<"speaking_prompts">;

interface SpeakingPromptDraft {
  title: string;
  instructions: string;
  rubricCriteria: string;
  orderIndex: string;
}

function criteriaFromRubric(rubric: SpeakingPrompt["rubric"]): string {
  if (!rubric || typeof rubric !== "object" || Array.isArray(rubric)) return "";
  const criteria = (rubric as Record<string, unknown>).criteria;
  return Array.isArray(criteria)
    ? criteria
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .join("\n")
    : "";
}

function draftFor(prompt: SpeakingPrompt | null): SpeakingPromptDraft {
  return prompt
    ? {
        title: prompt.title,
        instructions: prompt.instructions,
        rubricCriteria: criteriaFromRubric(prompt.rubric),
        orderIndex: String(prompt.order_index),
      }
    : { title: "", instructions: "", rubricCriteria: "", orderIndex: "0" };
}

export function SpeakingPromptEditorDrawer({
  open,
  courseId,
  prompt,
  onClose,
  onSaved,
}: {
  open: boolean;
  courseId: string;
  prompt: SpeakingPrompt | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [draft, setDraft] = useState<SpeakingPromptDraft>(() =>
    draftFor(prompt),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(draftFor(prompt));
    setError(null);
  }, [open, prompt]);

  function set(key: keyof SpeakingPromptDraft, value: string): void {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function save(): Promise<void> {
    const title = draft.title.trim();
    const instructions = draft.instructions.trim();
    const orderIndex = Number(draft.orderIndex);
    if (!title || !instructions) {
      setError("Hãy nhập tên đề và hướng dẫn cho học viên.");
      return;
    }
    if (!Number.isFinite(orderIndex) || orderIndex < 0) {
      setError("Thứ tự cần là số không âm.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await saveAdminSpeakingPrompt({
        id: prompt?.id ?? crypto.randomUUID(),
        isNew: !prompt,
        course_id: courseId,
        title,
        instructions,
        rubric: {
          criteria: draft.rubricCriteria
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        },
        order_index: Math.round(orderIndex),
        status: prompt?.status ?? "draft",
      });
      await onSaved();
      onClose();
    } catch {
      setError("Không lưu được đề giao tiếp. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <EditorDrawer
      open={open}
      title={prompt ? "Chỉnh sửa đề giao tiếp" : "Tạo đề giao tiếp"}
      description="Đề này chỉ thuộc khóa học đang mở; gửi duyệt hoặc xuất bản ở danh sách đề."
      onRequestClose={onClose}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 rounded-xl border border-[#D9CBB9] bg-white px-4 text-sm font-semibold text-[#315C73] disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving}
            className="min-h-11 rounded-xl bg-[#315C73] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Lưu đề giao tiếp"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <EditorField id="speaking-prompt-title" label="Tên đề" required>
          <input
            id="speaking-prompt-title"
            value={draft.title}
            onChange={(event) => set("title", event.target.value)}
            className={editorControlClass}
          />
        </EditorField>
        <EditorField
          id="speaking-prompt-instructions"
          label="Hướng dẫn cho học viên"
          required
        >
          <textarea
            id="speaking-prompt-instructions"
            value={draft.instructions}
            onChange={(event) => set("instructions", event.target.value)}
            className={editorControlClass + " min-h-36 resize-y"}
          />
        </EditorField>
        <EditorField
          id="speaking-prompt-rubric"
          label="Tiêu chí chấm"
          hint="Mỗi tiêu chí trên một dòng. Có thể để trống nếu chưa cần rubric."
        >
          <textarea
            id="speaking-prompt-rubric"
            value={draft.rubricCriteria}
            onChange={(event) => set("rubricCriteria", event.target.value)}
            className={editorControlClass + " min-h-28 resize-y"}
          />
        </EditorField>
        <EditorField id="speaking-prompt-order" label="Thứ tự">
          <input
            id="speaking-prompt-order"
            type="number"
            min="0"
            value={draft.orderIndex}
            onChange={(event) => set("orderIndex", event.target.value)}
            className={editorControlClass}
          />
        </EditorField>
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        )}
      </div>
    </EditorDrawer>
  );
}
