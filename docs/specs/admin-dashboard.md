# Spec: Admin Management Dashboard

Ngày tạo: 2026-05-10
Feature: Admin management dashboard
Product: TOKUTEI GINO
Status: planning

---

## 1. Executive Summary

Trang admin là khu quản trị nội bộ cho app học tiếng Đức TOKUTEI GINO. Mục tiêu là giúp người quản lý nhìn nhanh tình hình học tập, chất lượng nội dung, tiến độ học viên và các điểm cần xử lý.

Phase đầu sẽ làm UI + mockdata phong phú, chưa nối backend thật. Bản này cần đủ đẹp và đủ dữ liệu để demo như một sản phẩm thật.

---

## 2. Primary Users

### Admin/Operator

Người quản lý tổng thể app học:

- xem số liệu vận hành
- kiểm tra học viên có nguy cơ bỏ học
- theo dõi chất lượng khóa học/nội dung
- rà soát từ vựng, bài kiểm tra, tài liệu

### Teacher/Content Manager

Người phụ trách nội dung học:

- xem khóa học và bài học
- kiểm tra từ vựng thiếu ví dụ/audio
- xem quiz/bài kiểm tra có điểm thấp
- xử lý nội dung cần review

---

## 3. User Stories

- Là admin, anh muốn xem dashboard tổng quan để biết app đang hoạt động tốt hay có vấn đề.
- Là admin, anh muốn lọc học viên theo trạng thái rủi ro để biết ai cần nhắc học.
- Là admin, anh muốn xem khóa học nào có điểm thấp hoặc tỷ lệ hoàn thành thấp để cải thiện nội dung.
- Là content manager, anh muốn xem từ vựng nào thiếu audio/ví dụ hoặc bị sai nhiều để ưu tiên sửa.
- Là content manager, anh muốn xem bài kiểm tra/tài liệu/game/audio nào đang draft hoặc pending review.
- Là người demo sản phẩm, anh muốn admin page có dữ liệu thật mắt để trình bày luồng quản lý đầy đủ.

---

## 4. Feature List

### 4.1 Admin Overview

- KPI cards
- Learning trend mock
- Level distribution
- Top courses
- Students at risk
- Content quality alerts
- Recent activity feed

### 4.2 Course Management

- Course table
- Filter by level/status
- Completion and score metrics
- Enrolled student count
- Course status badges
- Detail drawer with linked lessons, vocabulary, tests, documents

### 4.3 Student Management

- Student table
- Filter by level/course/risk/status
- Progress, streak, score, last active
- Risk classification
- Detail drawer with learning summary and recommended action

### 4.4 Vocabulary Management

- Vocabulary table
- Filter by level/topic/article/review status
- Audio/example quality indicators
- Error rate and difficulty
- High-error vocabulary list

### 4.5 Assessment and Content Operations

- Quiz/test summary table
- Documents table
- Game/audio/podcast content cards
- Pending review queue
- Low-score or incomplete-content alerts

### 4.6 Mock Interactions

- Search
- Filter
- Sort
- Row selection
- Detail drawer/panel
- Mock action buttons such as Review, Publish, Archive, Message Student

Actions do not need real persistence in phase đầu.

---

## 5. Non-Goals

- Real authentication
- Real authorization roles
- Real backend/database
- Real CRUD persistence
- Real notification sending
- Real billing
- Real AI/audio generation
- Real analytics pipeline
- Real import/export

---

## 6. Integration Notes

- Current repo is frontend-only and mockdata-heavy.
- Admin data should follow existing mockdata approach under `src/data`.
- Use React Router route-driven screen pattern.
- Keep immutable updates if local UI state is needed.
- Use existing visual language but increase density for admin use.
- Avoid introducing API/service layers until backend work is explicitly planned.

---

## 7. Suggested Routes

Final route should be confirmed in `/awf-design`.

Recommended options:

1. `/app/admin` — easiest to fit current app shell/demo flow.
2. `/admin` — cleaner long-term if admin becomes separate product area.

Default recommendation for phase đầu: `/app/admin`, unless anh wants admin as a fully separate surface.

---

## 8. Success Criteria

Phase đầu is successful when:

- Admin page opens from a clear route.
- Dashboard overview shows meaningful KPI/alert/analytics mock data.
- Courses, students, vocabulary, assessments/content sections are visible and usable.
- Search/filter/detail interactions work locally.
- UI feels dense and professional, not empty/demo-only.
- `npm run lint` and `npm run build` pass after implementation.
- Browser QA confirms desktop and smaller viewport layouts do not break.

---

## 9. Open Questions

1. Admin should live inside learner app shell or as a separate admin shell?
2. Does anh want admin optimized for desktop first, with mobile fallback, or equal mobile priority?
3. Should phase đầu include visible mock create/edit forms, or only tables/detail/actions?

---

## 10. Design Handoff

`/awf-design` should produce:

- layout/wireframe for overview and management modules
- exact component list
- mockdata file structure
- responsive table/card strategy
- visual density rules
- test outline before `/awf-code`
