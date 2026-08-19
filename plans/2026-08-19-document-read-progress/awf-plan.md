# AWF Plan: Document "Đã đọc X/Y" badge (tái dùng learning_activity_events)

Ngày: 2026-08-19
Mục tiêu: Thêm badge tiến độ đọc tài liệu vào tab Tài liệu (DocumentsPanel) mà KHÔNG cần migration mới.

## Quyết định thiết kế
- **Tái dùng bảng `public.learning_activity_events`** (đã tồn tại):
  - `event_type` là `text not null` KHÔNG có check constraint → ghi được `'document_opened'`.
  - RLS insert `learning_activity_events_insert_own` và select `learning_activity_events_select` (own) đã có.
  - `get_learner_stats` chỉ cộng XP cho vài event_type cố định → `document_opened` không cộng XP.
- **Không cần migration, không cần DB password, không đụng Docker.**

## Luồng
1. Khi học viên mở tài liệu (selectedDocument.id đổi) → `recordDocumentOpened(courseId, documentId, title)`.
2. `fetchReadDocumentIds(courseId)` đọc lại các event `document_opened` → Set documentId đã đọc.
3. Hiển thị:
   - `DocumentStats`: thêm cột "Đã đọc X/Y".
   - `DocumentCardItem`: thêm badge check khi đã đọc.

## File
- NEW `src/features/documents/repositories/documentProgressRepository.ts`
- EDIT `src/features/documents/components/DocumentStats.tsx`
- EDIT `src/features/documents/components/DocumentCardItem.tsx`
- EDIT `src/features/courses/components/CourseLearningResourcePanels.tsx` (DocumentsPanel nhận courseId + state)
- EDIT `src/features/courses/pages/CourseLearningPage.tsx` (truyền courseId)

## Không làm (gác lại)
- "Ngày mai mở khóa" (anticipation) — cần khái niệm prerequisite/unlock riêng, chưa có data nguồn.
