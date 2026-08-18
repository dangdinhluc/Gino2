# AWF Plan: Workspace Engagement — "Nhiệm vụ hôm nay" (Daily Quest)

Ngày tạo: 2026-08-19
Feature: Thêm tầng reward + hướng dẫn bước tiếp vào Course Learning Workspace
Trạng thái: in-progress (feature 1 đang triển khai)
Next workflow: thủ công (đã có người triển khai)

---

## 1. Goal

5 tab học tập hiện là "catalog" ngang hàng nhau — học viên mở workspace không biết bắt đầu từ đâu.
Thêm **1 lớp chủ đạo**: thanh "Nhiệm vụ hôm nay" nằm ngay dưới header, rút dữ liệu THẬT từ
`get_learner_stats`, tự fill khi học viên học, có ring tiến độ + reward nhẹ khi hoàn thành.

Nguyên tắc (skill learning-product-ux): mở app biết ngay làm gì / mất bao lâu / làm xong được gì.

---

## 2. Scope

### ✅ Feature 1 (đang làm) — Daily Quest header
- Component mới `CourseDailyQuest` render ngay dưới header workspace.
- 3 quest dùng dữ liệu thật từ `LearnerStatsSnapshot`:
  1. **Ôn từ đến hạn** — `reviewedToday` / `dueVocabulary`
  2. **XP hôm nay** — `dailyXp` / 50 (target mềm)
  3. **Duy trì streak** — `currentStreak >= 1`
- Ring tổng = trung bình 3 quest. CTA "Tiếp tục học" → tab Từ vựng.

### ⏳ Feature 2 — Session Complete + XP reward (flashcard & practice)
- Flashcard: kết thúc phiên → màn "Session Complete" (confetti + số từ nhớ/ôn lại).
- Practice: thêm combo "Đang vào form! 🔥" khi đúng 5 liên tiếp.

### ⏳ Feature 3 — Anticipation + progress badge (tài liệu & thi thử)
- Tài liệu: badge "đã đọc X/Y", heatmap 30 ngày mini, highlight nhiều màu.
- Thi thử: card "Ngày mai mở khóa", ring điểm vàng kim.

---

## 3. Files (Feature 1)

- Create: `src/features/courses/components/CourseDailyQuest.tsx`
- Modify: `src/features/courses/pages/CourseLearningPage.tsx` (import + render)

## 4. Verify (Feature 1)

```bash
npm run lint     # tsc --noEmit phải pass sạch
npm run build    # vite build ra /Gino2/
```

## 5. Commit (Feature 1)

```bash
git add src/features/courses/components/CourseDailyQuest.tsx src/features/courses/pages/CourseLearningPage.tsx
git commit -m "feat: add Daily Quest header to course workspace"
```

> ⚠️ Cây repo đang bẩn (nhiều file modified + deleted chưa commit). Chỉ `git add` đúng 2 file trên,
> không `git add -A`, không commit nhầm WIP của Codex.
