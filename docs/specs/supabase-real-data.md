# Spec: Supabase Real Data Foundation

Ngày tạo: 2026-05-14
Feature: Supabase real data foundation
Product: TOKUTEI GINO
Status: planning

---

## 1. Executive Summary

TOKUTEI GINO hiện có nhiều mockdata giàu trạng thái cho admin dashboard và learner flows. Bước tiếp theo là tạo nền dữ liệu Supabase thật để app có một source of truth có thể seed, đọc, kiểm tra và mở rộng.

MVP của feature này là Supabase-backed data foundation: dữ liệu thật ở dev/local, seed nhất quán, frontend đọc qua service/repository layer, chưa cần full CRUD hay production auth hoàn chỉnh.

---

## 2. Primary Users

### Admin/Operator

Người quản lý cần xem dashboard, khóa học, học viên, tiến độ, cảnh báo và gói học từ dữ liệu thật thay vì mock arrays.

### Teacher/Content Manager

Người phụ trách nội dung cần quản lý khóa, module, lesson, vocabulary, documents, exams và audio/podcast theo quan hệ dữ liệu rõ ràng.

### Learner

Học viên cần trải nghiệm học theo khóa lấy từ cùng nguồn dữ liệu: vocabulary, MCQ review, documents/posts, games, exams và podcast/audio.

### Developer/Admin Maintainer

Người phát triển cần migration/seed workflow có thể chạy lại, kiểm tra được, không chứa secret hoặc PII thật.

---

## 3. User Stories

- Là admin, anh muốn dashboard đọc số liệu từ Supabase để dữ liệu demo giống sản phẩm thật hơn.
- Là content manager, anh muốn khóa học có module, lesson, asset và exercise liên kết rõ thay vì dữ liệu rời.
- Là content manager, anh muốn vocabulary gắn với khóa/module để tạo review, game và cảnh báo chất lượng.
- Là admin, anh muốn quản lý gói học dựa trên course bundles thật.
- Là learner, anh muốn màn học một khóa lấy đúng vocabulary, MCQ, tài liệu, exam và podcast của khóa đó.
- Là developer, anh muốn seed lại database nhanh mà không sợ mất secret hoặc đưa PII thật vào repo.

---

## 4. Feature List

### 4.1 Supabase Development Foundation

- Supabase dependency/client config.
- Environment variable contract.
- Migration folder and seed workflow.
- Local/dev setup path.

### 4.2 Academic Content Data

- Courses.
- Course modules.
- Lessons.
- Lesson assets.
- Lesson exercises.
- Vocabulary.
- Assessments/exams/questions.
- Documents/posts.
- Audio/podcast metadata.

### 4.3 Learner Progress Data

- Synthetic learner profiles.
- Enrollments.
- Course progress.
- Vocabulary status/strength.
- Review attempts.
- Activity events.

### 4.4 Monetization Data

- Packages/plans.
- Included course bundles.
- Pricing/status metadata.
- Subscriber/revenue demo metrics where appropriate.

### 4.5 Admin Operations Data

- Admin alerts.
- Activity logs.
- Content review statuses.
- AI prompt metadata.
- API key metadata with masked values only.

### 4.6 Frontend Read Integration

- Repository/service layer per domain.
- Supabase row-to-UI model mapping.
- Loading/error/empty states.
- Initial replacement for admin overview and course learning data.

---

## 5. Non-Goals

- Production-ready auth/authorization for all roles.
- Full CRUD admin forms for every domain.
- Payment gateway integration.
- Real AI generation or raw API key storage.
- Real student PII import.
- Full analytics warehouse.
- Realtime subscriptions.
- Multi-tenant architecture.
- Deep DB schema details in this spec; that belongs to `/awf-design`.

---

## 6. Integration Notes

- Current admin mockdata under `src/data/admin/*` should be treated as seed reference, not final architecture.
- Current course learning data should stay course-centered: course -> vocabulary -> MCQ review -> documents/posts -> games -> exams -> podcast/audio.
- Frontend should not call Supabase directly from large page components; use services/repositories to isolate data source changes.
- Secret handling must be env-only; repository may include `.env.example` but never real keys.
- Student seed identities should be synthetic/anonymized.
- API key records should store only provider/status/masked metadata, never raw keys.

---

## 7. Suggested Data Domains

`/awf-design` should turn these into exact tables/relationships:

1. Course catalog and structure.
2. Lesson content and assets.
3. Vocabulary and review questions.
4. Exams/assessments.
5. Documents/posts and media metadata.
6. Learners, enrollments, progress, activity.
7. Packages/plans and course bundles.
8. Admin alerts/activity logs.
9. AI/admin configuration metadata.

---

## 8. Success Criteria

Phase đầu thành công khi:

- Supabase setup được mô tả rõ và có thể implement bằng migration/seed.
- Seed dataset v1 đủ cho admin dashboard và course learning demo.
- Dữ liệu có quan hệ nhất quán, không orphan content.
- Không có secret hoặc PII thật trong repo/seed.
- Frontend có kế hoạch thay mock bằng repository/service layer.
- `/awf-design` có đủ input để chốt schema, RLS, seed và integration order.

---

## 9. Design Decisions

Anh đã chốt cho `/awf-design`:

1. Bắt đầu bằng Supabase local, chưa nối thẳng dev cloud project.
2. `/admin` cần Supabase Auth để test, không để public như mock demo nữa.
3. Learner routes cũng cần Supabase Auth trong phase 1.
4. Phase 1 chỉ cần role `admin`, chưa thêm `content_manager`.
5. Dữ liệu phase 1 vẫn dùng mẫu/curated seed từ mock hiện tại, không import dữ liệu học viên thật.
6. Không dùng Supabase Storage cho audio phase 1; audio/podcast chỉ lưu metadata hoặc sample external URL nếu cần.
7. Sample local admin credentials sẽ được tạo bởi seed và ghi rõ trong setup/seed output local-only, không coi là production secret.
8. Supabase là source of truth cho flow mới, mockdata cũ là seed reference/fallback có kiểm soát.

### Remaining Open Questions

Không còn open question bắt buộc trước `/awf-code`.

---

## 10. Design Handoff

`/awf-design` cần tạo:

- ERD/schema chi tiết.
- Migration plan.
- Seed strategy and validation checks.
- RLS/auth policy direction.
- Supabase Storage direction.
- Repository/service contract cho frontend.
- Test and browser QA outline trước `/awf-code`.
