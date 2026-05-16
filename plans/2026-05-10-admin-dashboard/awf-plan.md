# AWF Plan: Admin Management Dashboard

Ngày tạo: 2026-05-10
Feature: Trang quản lý admin cho TOKUTEI GINO
Trạng thái: planning
Next workflow: `/awf-design`

---

## 1. Goal

Xây dựng một trang admin mock-first để anh nhìn và test được cảm giác quản lý app học tiếng Đức như sản phẩm thật.

Trang admin cần quản lý được các mảng chính:

- Khóa học
- Học viên
- Từ vựng
- Bài kiểm tra
- Tài liệu học
- Game/luyện tập
- Podcast/audio
- Cảnh báo vận hành và thống kê

Mục tiêu phase đầu không phải là CRUD/backend thật, mà là UI dữ liệu dày, mockdata phong phú, route chạy được, và các màn đủ thuyết phục để sau này nối backend.

---

## 2. Product Direction

- Loại sản phẩm: internal admin dashboard
- UI direction: data-heavy admin, nhưng vẫn giữ chất premium education của TOKUTEI GINO
- Data direction: mockdata phong phú, nhiều trạng thái gần thật
- Runtime hiện tại: frontend-only React/Vite
- Backend/API: chưa làm trong phase này

Admin nên có cảm giác là một “trung tâm điều hành học viện”, không chỉ là vài bảng dữ liệu tĩnh.

---

## 3. Scope In

### Phase 1 nên có

- Admin route/shell riêng
- Dashboard tổng quan nhiều KPI
- Analytics cards và chart giả lập bằng UI đơn giản
- Bảng quản lý khóa học
- Bảng quản lý học viên
- Bảng quản lý từ vựng
- Bảng bài kiểm tra/tài liệu/game/audio ở mức đủ demo
- Search/filter/sort mock ở client
- Detail drawer hoặc detail panel khi chọn item
- Mockdata giàu trạng thái:
  - active/completed/at-risk/paused students
  - draft/published/archived courses
  - missing-audio/missing-example/high-error vocabulary
  - low-score quizzes
  - pending content review
- Empty/loading/error state ở mức UI shell nếu hợp lý

---

## 4. Scope Out

Chưa làm trong phase đầu:

- Đăng nhập/phân quyền admin thật
- Backend/database thật
- CRUD lưu thật
- Import/export CSV thật
- Thanh toán thật
- Notification automation thật
- AI/audio generation thật
- Multi-tenant hoặc nhiều trường/học viện
- API contract chi tiết

Những phần này để sau khi UI và data model mock ổn.

---

## 5. Assumptions

- Dự án hiện là React/Vite frontend-only, nên phase này tiếp tục mock-first.
- Mockdata nên đặt trong `src/data` hoặc module con tương tự pattern hiện tại.
- Admin có thể dùng route riêng như `/app/admin` hoặc `/admin`; `/awf-design` sẽ chốt route cuối cùng.
- Không đổi kiến trúc lớn của app trong phase này.
- Visual admin cần dày dữ liệu hơn learner app, nhưng vẫn dùng palette ấm/sang đã có: cream, navy, refined orange, subtle plum.

---

## 6. Phase Breakdown

### Phase 01 — Setup and admin entry

Mục tiêu: tạo nền để admin tồn tại rõ ràng trong app.

Tasks:

- Chọn route admin demo.
- Xác định admin shell: sidebar, topbar, content area, right detail panel/drawer.
- Xác định cách vào admin trong demo: direct route hoặc CTA tạm trong app.
- Reuse style tokens hiện có, tránh tạo design system mới.

Output mong muốn:

- Admin route chạy được.
- Layout shell có cấu trúc rõ.

---

### Phase 02 — Admin mockdata foundation

Mục tiêu: tạo dữ liệu đủ dày để UI nhìn như sản phẩm thật.

Nhóm dữ liệu cần có:

- `adminCourses`
- `adminStudents`
- `adminVocabulary`
- `adminAssessments`
- `adminDocuments`
- `adminActivities`
- `adminAlerts`
- `adminAudioContent` hoặc podcast/audio mocks

Mỗi nhóm nên có trạng thái vận hành, không chỉ name/title.

Ví dụ field cấp cao:

- courses: level, lessons, enrolled, completionRate, avgScore, status, revenueMock, updatedAt
- students: level, activeCourse, progress, streak, avgScore, vocabularyKnown, lastActiveAt, riskStatus
- vocabulary: level, topic, article, translation, example, hasAudio, errorRate, difficulty, reviewStatus
- alerts: severity, category, title, relatedEntity, createdAt, recommendedAction

Output mong muốn:

- Một nguồn mockdata admin có thể dùng cho nhiều màn.
- Data đủ để filter, sort, KPI, alerts, detail panel.

---

### Phase 03 — Admin data views and interaction model

Mục tiêu: chốt cách admin xem và thao tác dữ liệu trước khi làm UI chi tiết.

Tasks:

- Xác định tabs hoặc sections chính:
  - Overview
  - Courses
  - Students
  - Vocabulary
  - Assessments
  - Content
  - Reports
- Xác định filter global:
  - level
  - status
  - risk
  - date range mock
  - content quality issues
- Xác định interaction cơ bản:
  - click row mở detail drawer
  - filter thay đổi dữ liệu hiển thị
  - search client-side
  - action buttons chỉ mock UI, không lưu thật

Output mong muốn:

- Clear UX flow cho admin trước khi code màn lớn.

---

### Phase 04 — Dashboard overview UI

Mục tiêu: tạo trang overview nhìn “đã mắt” và có giá trị quản trị.

Sections đề xuất:

- KPI row:
  - total students
  - active today
  - course completion
  - average quiz score
  - vocabulary practiced
  - at-risk students
- Learning activity trend mock
- Level distribution A1/A2/B1
- Top performing courses
- Students at risk
- Vocabulary/content quality issues
- Recent admin/activity feed

Output mong muốn:

- Một dashboard đủ đẹp để demo ngay.
- Không dùng chart phức tạp nếu chưa cần; ưu tiên bars, progress capsules, mini trend cards.

---

### Phase 05 — Management modules UI

Mục tiêu: tạo các bảng quản lý chính.

Modules phase đầu:

1. Courses
   - course table
   - status badges
   - progress/score metrics
   - course detail drawer

2. Students
   - student table
   - risk/status badges
   - progress/streak/score
   - student detail drawer

3. Vocabulary
   - vocabulary table
   - article/topic/level badges
   - audio/example/review status
   - high-error words view

4. Content Operations
   - assessments
   - documents
   - game/audio/podcast content
   - pending review list

Output mong muốn:

- Admin có thể chuyển giữa các module và hiểu app đang vận hành ra sao.
- Data table có density cao nhưng vẫn đọc được.

---

### Phase 06 — Verification and handoff

Mục tiêu: đảm bảo bản demo chạy ổn trước khi báo hoàn thành.

Verification cần làm khi implement:

- `npm run lint`
- `npm run build`
- chạy dev server
- browser QA route admin
- test responsive desktop/tablet/mobile cơ bản
- kiểm tra search/filter/detail drawer không vỡ UI

Output mong muốn:

- Admin demo không lỗi TypeScript/build.
- UI được kiểm tra bằng browser, không chỉ nhìn code.

---

## 7. Recommended Build Order

1. Tạo mockdata admin.
2. Tạo admin route + shell.
3. Tạo shared admin components: KPI card, table shell, filter bar, status badge, detail drawer.
4. Làm Overview dashboard.
5. Làm Courses/Students/Vocabulary modules.
6. Làm Content Ops modules ở mức compact.
7. Browser QA và polish.

---

## 8. Risks

- Data-heavy UI có thể lệch khỏi phong cách ấm/friendly hiện tại nếu quá giống enterprise SaaS.
- Nếu mockdata quá lớn trong một file, file dễ phình; nên chia theo domain nếu code bắt đầu dài.
- Table nhiều cột có thể khó dùng trên mobile; design cần có responsive card/list fallback.
- Không có backend nên action buttons cần copy rõ là mock/demo để tránh hiểu nhầm đã lưu thật.

---

## 9. Open Questions for `/awf-design`

1. Admin route nên là `/admin` độc lập hay `/app/admin` trong app shell hiện tại?
2. Có cần hiển thị entry admin trong UI learner app không, hay chỉ dùng direct route khi demo?
3. Phase đầu ưu tiên desktop admin trước, hay cần mobile admin hoàn chỉnh ngay?

---

## 10. Handoff

Recommended next step: `/awf-design`

`/awf-design` nên chốt:

- wireframe từng screen/section
- route cuối cùng
- component breakdown
- mockdata file structure
- responsive behavior
- exact visual hierarchy
- test outline trước khi implement
