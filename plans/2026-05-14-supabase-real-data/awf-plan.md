# AWF Plan: Supabase Real Data Foundation

Ngày tạo: 2026-05-14
Feature: Tạo dữ liệu Supabase thật cho TOKUTEI GINO
Trạng thái: planning
Next workflow: `/awf-design`

---

## 1. Goal

Chuyển dự án từ mockdata frontend-only sang nền dữ liệu Supabase thật, đủ để admin dashboard và trải nghiệm học theo khóa dùng chung một nguồn dữ liệu có thể seed, đọc, kiểm tra và mở rộng.

Mục tiêu không phải làm toàn bộ backend sản phẩm ngay, mà là tạo data foundation sạch:

- Có Supabase project/local setup rõ ràng.
- Có migration/seed dữ liệu thật ở mức curated, không random rời rạc.
- Có dữ liệu khóa học, bài học, từ vựng, tài liệu, bài kiểm tra, podcast/audio, gói học, học viên/progress đủ cho UI hiện tại.
- Có đường handoff rõ để `/awf-design` chốt schema, RLS, API/repository và seed strategy chi tiết.

---

## 2. Product Direction

- Loại công việc: backend/data foundation cho education platform.
- Product surface được ưu tiên: admin dashboard, course learning workspace, course/package management.
- Data direction: Supabase là source of truth; mockdata hiện tại là bản tham chiếu để thiết kế seed v1.
- MVP approach: read-first integration, seed-first data, chưa vội CRUD đầy đủ.
- Security direction: không commit secret; không dùng thông tin cá nhân thật; học viên seed phải synthetic/anonymized.

Dữ liệu Supabase v1 nên làm cho app có cảm giác “đã có backend thật”, nhưng vẫn kiểm soát scope để không biến thành rewrite toàn bộ app.

---

## 3. Scope In

Phase đầu nên có:

- Supabase setup cho development:
  - dependency/client config
  - env variables mẫu
  - migration folder
  - seed workflow
- Data model cấp cao cho các nhóm chính:
  - courses
  - course modules
  - lessons
  - lesson assets
  - lesson exercises
  - vocabulary
  - assessments/exams/questions
  - documents/posts
  - audio/podcast metadata
  - students/profiles synthetic
  - enrollments/progress/activity
  - packages/plans
  - admin alerts/activity logs
  - AI prompt/API-key metadata ở mức an toàn, không lưu secret thật
- Seed data v1 chuyển từ mockdata hiện tại sang dataset nhất quán.
- Read layer cho frontend để dần thay mock imports bằng repository/service.
- Basic data quality checks:
  - foreign-key consistency
  - required fields
  - no orphan course content
  - no real PII/secrets
- Verification path:
  - migration/seed chạy được
  - type/lint/build pass
  - một hoặc hai màn đọc data thật thành công sau design/code phase

---

## 4. Scope Out

Chưa làm trong phase đầu:

- Full Supabase Auth và phân quyền admin hoàn chỉnh.
- Payment/subscription thật.
- CRUD admin đầy đủ cho mọi bảng.
- Realtime collaboration.
- Analytics pipeline production.
- Upload/processing media thật ở quy mô lớn.
- AI generation thật hoặc lưu API key raw.
- Import/export CSV phức tạp.
- Multi-tenant nhiều trường/học viện.
- DB schema/API contract chi tiết trong plan này.

Các phần này chuyển sang `/awf-design` hoặc phase sau khi foundation ổn.

---

## 5. Assumptions

- Repo hiện là React/Vite frontend, chưa có Supabase integration trong app files.
- Admin dashboard hiện dùng mockdata typed trong `src/data/admin/*`.
- Course learning hiện cần dữ liệu gắn theo khóa: vocabulary, MCQ review, documents/posts, games, exams, podcast/audio.
- Supabase v1 nên ưu tiên đọc dữ liệu thật trước, sau đó mới thêm create/edit forms.
- Seed data phải đủ đẹp để demo, nhưng không chứa PII hay secret thật.
- Nếu chưa có Supabase project production, có thể bắt đầu bằng local/dev project và env placeholder.

---

## 6. Phase Breakdown

### Phase 01 — Setup and source-of-truth decision

Mục tiêu: chốt cách dự án kết nối Supabase mà không phá mock UI hiện tại.

Tasks:

- Xác định môi trường dùng trước: Supabase local, dev cloud project, hoặc cả hai.
- Chốt naming convention cho migration/seed.
- Thêm dependency và env contract ở phase code, không hardcode key.
- Chốt nguyên tắc chuyển đổi: mockdata chỉ còn làm reference/fallback dev, Supabase là source of truth.

Output mong muốn:

- Setup path rõ để design/code làm tiếp.
- Không có secret trong repo.

---

### Phase 02 — Data inventory and domain mapping

Mục tiêu: gom toàn bộ mock domain hiện có thành bản đồ data thật.

Tasks:

- Inventory admin data: courses, students, vocabulary, content, packages, AI operations, alerts.
- Inventory learner data: course list, course detail, course learning workspace, exams, grammar/vocabulary views.
- Phân nhóm domain theo owner:
  - academic content
  - learner progress
  - monetization/packages
  - admin operations
  - AI/admin metadata
- Chọn dataset v1 tối thiểu đủ cho demo end-to-end.

Output mong muốn:

- Danh sách table families cần thiết ở mức cao.
- Mapping mock module nào sẽ seed vào domain nào.

---

### Phase 03 — Supabase schema and seed design

Mục tiêu: chuẩn bị thiết kế chi tiết cho DB mà chưa implement trong plan này.

Tasks cho `/awf-design`:

- Chốt schema chi tiết, relationships, indexes và constraints.
- Chốt RLS baseline theo public learner read/admin write hoặc auth-gated route.
- Chốt seed format: SQL seed, TypeScript seed script, hoặc hybrid.
- Chốt storage strategy cho PDF/audio/images nếu cần.
- Chốt cách validate seed trước khi chạy.

Output mong muốn:

- Design spec đủ để code migration/seed an toàn.

---

### Phase 04 — Seed data v1

Mục tiêu: tạo dataset thật, nhất quán, demo được ngay.

Nhóm seed đề xuất:

- 6-8 khóa học A1/A2/B1.
- Mỗi khóa có modules, lessons, exercises, assets.
- Bộ vocabulary theo khóa/module, có example/audio status/error rate.
- Bộ review questions/MCQ gắn với vocabulary hoặc lesson.
- Bộ documents/posts/PDF metadata.
- Bộ exams/mock exams gắn theo khóa.
- Podcast/audio metadata gắn theo khóa.
- Students synthetic + enrollments + progress/activity.
- Packages/plans gắn với course bundles.
- Admin alerts/activity logs sinh từ trạng thái data.

Output mong muốn:

- Seed chạy lại được nhiều lần ở dev.
- UI có dữ liệu thật tương đương hoặc tốt hơn mock hiện tại.

---

### Phase 05 — Frontend read integration

Mục tiêu: thay dần mock imports bằng data access layer đọc Supabase.

Tasks:

- Tạo Supabase client/config an toàn.
- Tạo service/repository layer theo domain thay vì gọi Supabase trực tiếp trong component lớn.
- Ưu tiên read flows:
  - admin overview
  - course management
  - course learning workspace
  - packages
- Thiết kế loading/error/empty states ở biên UI.
- Giữ kiểu dữ liệu TypeScript rõ ràng và mapping immutable.

Output mong muốn:

- Ít nhất một admin flow và một learner course flow đọc từ Supabase thật.

---

### Phase 06 — Data quality, security, and operations readiness

Mục tiêu: đảm bảo data thật không tạo nợ bảo mật hoặc vận hành.

Tasks:

- Kiểm tra seed không chứa email/số điện thoại/secret thật.
- Kiểm tra relationship không orphan.
- Kiểm tra RLS/policy ở mức phù hợp với auth phase hiện tại.
- Kiểm tra API key metadata chỉ lưu masked/status, không lưu raw secret.
- Xác định rollback/dev reset workflow.

Output mong muốn:

- Có checklist data safety trước khi dùng cloud project.

---

### Phase 07 — Verification and handoff

Mục tiêu: chứng minh foundation dùng được trước khi mở rộng CRUD.

Verification đề xuất:

- Supabase migration/seed chạy sạch ở local/dev.
- `npm run lint` pass.
- `npm run build` pass.
- Browser QA cho route admin và course learning nếu UI đã đọc Supabase.
- Spot check dữ liệu: course -> modules -> lessons -> vocabulary/exams/documents.

Output mong muốn:

- Dự án sẵn sàng sang phase CRUD/admin forms hoặc auth/RLS chi tiết.

---

## 7. Risks and Mitigations

- Risk: Làm schema quá rộng ngay từ đầu.
  - Mitigation: seed/read-first, table families tối thiểu, CRUD để phase sau.
- Risk: Lẫn dữ liệu mock đẹp nhưng quan hệ DB không thật.
  - Mitigation: foreign keys, required constraints, seed validation.
- Risk: Lộ secret/API key khi đưa Supabase vào repo.
  - Mitigation: env-only, `.env.example`, masked metadata, security review trước completion.
- Risk: UI bị rewrite lớn khi đổi data source.
  - Mitigation: repository layer và mapping types giữ component ổn định.
- Risk: RLS/auth chưa rõ làm dev chậm.
  - Mitigation: `/awf-design` chốt auth boundary trước khi code migration.

---

## 8. Open Questions

1. Anh muốn dùng Supabase local trước hay nối thẳng dev cloud project?
2. Phase đầu có cần đăng nhập admin thật không, hay chỉ cần data thật cho demo nội bộ?
3. Dữ liệu học viên nên hoàn toàn synthetic hay anh có bộ data mẫu cần import/anonymize?
4. Course domain chính vẫn là tiếng Đức, hay cần chuẩn bị mở rộng Tokutei/JFT như mock course learning hiện có?

---

## 9. Design Handoff

`/awf-design` nên chốt:

- DB schema chi tiết và relationship diagram.
- RLS/auth boundary.
- Migration + seed implementation strategy.
- Supabase storage bucket strategy.
- TypeScript repository/service contracts.
- Screen-by-screen data replacement order.
- Test outline: seed validation, repository tests, build/lint, browser QA.
