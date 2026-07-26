# AWF Plan: Dọn sạch 100% nội dung tiếng Đức, chuyển toàn bộ app về Tokutei

Ngày tạo: 2026-07-11
Feature: Xóa/thay toàn bộ nội dung, branding, mock data liên quan tiếng Đức (German) — app CHỈ học/luyện thi Tokutei Ginou (kỹ năng đặc định Nhật Bản), không liên quan tiếng Đức
Trạng thái: planning
Next workflow: `/awf-design` (cho phần data/content mới) rồi `/awf-code`

---

## 1. Goal

App tên "TOKUTEI GINO" nhưng một phần lớn codebase (games, admin mock data, Supabase seed, docs) đã bị agent trước chuyển nhầm sang nội dung/branding tiếng Đức (der/die/das, Umlaut, "German learners"...). Đây là lỗi domain nghiêm trọng: học viên vào app học Tokutei nhưng gặp nội dung tiếng Đức ở games, admin panel, và ngay trong dữ liệu backend.

Mục tiêu: **Xóa bỏ hoàn toàn dấu vết tiếng Đức**, thay bằng nội dung Tokutei Ginou thật (tiếng Nhật công việc: chào hỏi, báo cáo, an toàn, phỏng vấn, hồ sơ...) nhất quán trên toàn bộ app — từ UI học viên, admin, đến Supabase backend.

Kết quả mong muốn:
- 0 kết quả grep cho `german|German|Deutsch|Umlaut|der die das` (trừ nơi cố ý giữ lại như tên biến kỹ thuật không liên quan ngôn ngữ)
- Games (Memory Match, Word Builder) dùng vocab tiếng Nhật công việc Tokutei
- Admin mock data (vocab, courses, AI prompts, students, packages) nói về Tokutei, không phải German
- Supabase seed data (courses/lessons/vocabulary_items/exercises) là tiếng Nhật Tokutei
- Docs/design system mô tả đúng "Tokutei Ginou learners", không phải "German learners"
- Lint + build pass, không phá vỡ logic/kiến trúc hiện tại (chỉ đổi *nội dung*, không đổi *cấu trúc code*)

### Nguyên tắc khi thực thi
- **Chỉ đổi nội dung (content), giữ nguyên kiến trúc/logic/component structure.** Đây không phải refactor code, là data/content migration.
- Field kỹ thuật đặc thù tiếng Đức không còn ý nghĩa khi đổi sang tiếng Nhật (ví dụ `article: der/die/das`, `isUmlaut`) cần đánh giá: xóa field hay giữ nhưng luôn `false`/rename theo khái niệm mới (ví dụ furigana, kanji-reading). Quyết định cụ thể ở Phase tương ứng.
- Không động vào `src/data/phaseOneMock.ts` và `src/features/courses/mock/courseLearningMock.ts` — đã xác nhận sạch, đúng chuẩn Tokutei.

---

## 2. Search-First Findings (đã audit qua context-gatherer)

### Nhóm bị lỗi (cần sửa nội dung)
| Nhóm | File | Vấn đề |
|------|------|--------|
| Games | `src/features/games/data/memoryData.ts` | 3 round vocab tiếng Đức (der Tisch, die Mutter...) |
| Games | `src/features/games/data/builderData.ts` | 20 từ tiếng Đức + Umlaut regex |
| Games | `src/features/games/types.ts` | Comment mô tả "từ tiếng Đức", field `article`, `isUmlaut`; `GameId` union còn rác `der-die-das`, `wortschmiede`, `satzpuzzle`, `kasus-kampf`, `diktat-sprint`, `aussprache-echo` (chưa implement, để tên tiếng Đức) |
| Games | `src/features/games/generators/fromCourseVocabBuilder.ts` | UMLAUT_REGEX logic |
| Games test | `src/test/games/memoryGenerator.test.ts`, `builderGenerator.test.ts` | Test data tiếng Đức |
| Admin data | `src/data/admin/adminVocabulary.ts` | 8 từ vựng tiếng Đức thật (Beruf, Prüfung...) |
| Admin data | `src/data/admin/adminAiOperations.ts` | 4 AI prompt mock nói "học tiếng Đức", sample câu Đức |
| Admin data | `src/data/admin/adminCourses.ts` | Course title "A1 Alltag Deutsch", "German Vocabulary Sprint", "Goethe Exam Prep" |
| Admin data | `src/data/admin/adminCourseContent.ts` | Module "Starter German essentials", exercise "W-Fragen word order" |
| Admin data | `src/data/admin/adminPackages.ts` | Package "Lifetime German Toolkit", "Goethe Exam Prep" |
| Admin data | `src/data/admin/adminStudents.ts` | Student "Anna Müller" |
| Admin data | `src/data/admin/adminOperations.ts` | Alert nhắc "Anna Müller", "Prüfung, Krankenkasse, Wohnung", "W-Fragen" |
| Supabase | `supabase/seed.sql` | courses/lessons/vocabulary_items/exercises/assessments toàn tiếng Đức, kể cả bên trong `course-tokutei` (tên đúng nhưng nội dung sai) |
| Supabase | `supabase/config.toml` | `project_id = "gino-german-local"` |
| Docs | `design-system/MASTER.md` | "Primary audience: adult German learners" |
| Docs | `design-system/pages/admin-dashboard.md` | "Anna Müller" trong mockup |
| Docs | `docs/DESIGN.md` | "Ghép cặp từ Đức - Việt", "Wortstellung" |
| Docs | `docs/design-specs.md` | "người lớn học tiếng Đức" |
| Docs | `docs/design/new-games-mvp.md` | GameId cũ tiếng Đức, "Xếp chữ thành từ tiếng Đức" |
| Docs | `docs/specs/new-games-engagement.md` | "chuẩn bị sang lao động ở Đức" — mâu thuẫn hoàn toàn bản chất Tokutei (đi Nhật) |
| Docs | `docs/specs/admin-dashboard.md` | "app học tiếng Đức TOKUTEI GINO" — tự mâu thuẫn |
| Config | `package.json` | `name: "react-example"` — nên đổi tên phù hợp luôn |

### Nhóm đã đúng, KHÔNG động vào
- `src/data/phaseOneMock.ts` (lessonShell, examShell, flashcards, aiPromptChips) — sạch, đúng Tokutei
- `src/features/courses/mock/courseLearningMock.ts` — sạch, đúng Tokutei
- `supabase/migrations/202605140001_supabase_real_data_foundation.sql` — chỉ DDL schema, không có nội dung ngôn ngữ
- `.env`, `.env.example` — sạch

### Plan cũ (lịch sử — nguồn gốc lỗi, không sửa nhưng note)
- `plans/2026-05-17-new-games-engagement/awf-plan.md`, `plans/2026-05-16-game-zone/awf-plan.md` — đã lên kế hoạch migrate sang German, đây chính là nguồn lỗi. Sẽ thêm dòng note "SUPERSEDED" ở đầu 2 file này sau khi dọn xong để agent tương lai không lặp lại.

---

## 3. Scope In

1. **Games content**: Memory Match + Word Builder đổi 100% sang vocab công việc Tokutei (tiếng Nhật + phiên âm romaji + nghĩa Việt, theo đúng pattern đã dùng ở `phaseOneMock.ts`: houkoku, kyukei, zairyu card, mensetsu, aisatsu, anzen...). Field `article`/`isUmlaut` xử lý lại phù hợp (xem Phase 02).
2. **GameId cleanup**: xóa các game ID rác tiếng Đức chưa implement (`der-die-das`, `wortschmiede`, `satzpuzzle`, `kasus-kampf`, `diktat-sprint`, `aussprache-echo`) khỏi `types.ts` và `docs/design/new-games-mvp.md`.
3. **Admin mock data**: đổi toàn bộ 6 file admin (`adminVocabulary`, `adminAiOperations`, `adminCourses`, `adminCourseContent`, `adminPackages`, `adminStudents`, `adminOperations`) sang nội dung Tokutei — vocab tiếng Nhật, tên học viên trung lập/Việt Nam, tên khóa học/package theo Tokutei, AI prompt nói về "học tiếng Nhật công việc Tokutei" thay vì "học tiếng Đức".
4. **Supabase seed.sql**: viết lại toàn bộ courses/modules/lessons/exercises/vocabulary_items/review_questions/assessments/packages bằng nội dung Tokutei tiếng Nhật, giữ nguyên schema/cột/kiểu dữ liệu, chỉ đổi nội dung text.
5. **Supabase config.toml**: đổi `project_id` sang tên không nhắc "german" (ví dụ `tokutei-gino-local`) — lưu ý rủi ro (xem Risks).
6. **Docs & design system**: cập nhật `MASTER.md`, `DESIGN.md`, `design-specs.md`, `new-games-mvp.md`, `specs/new-games-engagement.md`, `specs/admin-dashboard.md`, `design-system/pages/admin-dashboard.md` — thay mọi mô tả "German learners" / "tiếng Đức" bằng "Tokutei Ginou learners" / nội dung tương ứng.
7. **package.json**: đổi `name` từ `react-example` sang tên phù hợp (ví dụ `tokutei-gino`).
8. **Note lịch sử**: thêm dòng "⚠️ SUPERSEDED — sản phẩm là Tokutei (tiếng Nhật), không phải German" ở đầu 2 file plan cũ liên quan.
9. Test tương ứng (`memoryGenerator.test.ts`, `builderGenerator.test.ts`) cập nhật data test theo vocab Tokutei mới.
10. Lint (`npm run lint`) + test (`npm run test`) + build (`npm run build`) pass sau khi đổi.

## 4. Scope Out

- Không đổi kiến trúc/component/route/state logic — chỉ đổi nội dung dữ liệu.
- Không động vào tên thư mục root `gino-german` (ngoài khả năng của tool, anh tự rename nếu muốn).
- Không đổi domain/URL, không đổi branding logo/màu sắc UI.
- Không viết thêm feature mới (SRS thật, exam chấm điểm thật...) — đó là việc của các plan khác đã review trước (để riêng, tránh trộn scope).
- Không migrate Supabase Storage/audio thật — vẫn giữ metadata-only như hiện tại.
- Không đổi `src/data/phaseOneMock.ts` / `courseLearningMock.ts` (đã đúng).

---

## 5. Assumptions

- Vocab Tokutei tiếng Nhật dùng lại pattern đã có trong `phaseOneMock.ts` (romaji + nghĩa Việt, không cần chữ Kanji/Hiragana thật vì app hiện tại không hiển thị chữ Nhật gốc ở đâu — giữ nhất quán romaji cho học viên Việt Nam mới học).
- Trường `article` (der/die/das) trong Word Builder sẽ **bỏ hẳn** vì tiếng Nhật không có khái niệm giống từ — thay bằng field mới hoặc bỏ trống, cần quyết định ở `/awf-design`.
- Trường `isUmlaut` trong `LetterChip` sẽ **bỏ hẳn** (tiếng Nhật romaji không có Umlaut) — đơn giản hóa type, không cần feature tương đương.
- Đổi `project_id` trong `config.toml` là an toàn cho môi trường local dev (không ảnh hưởng production), nhưng cần confirm với anh vì nó có thể đổi tên container Docker và cần `supabase stop && supabase start` lại.
- Không cần giữ backward-compat cho `der-die-das`/`wortschmiede`... GameId cũ vì chúng chưa được implement ở đâu (chỉ tồn tại trong type union, chưa có route/component thật).

---

## 6. Phase Breakdown

### Phase 01 — Games Content Migration (ưu tiên cao nhất, user-facing)

Tasks:
- Viết lại `memoryData.ts`: 3 round vocab Tokutei tiếng Nhật theo chủ đề (Hồ sơ & giấy tờ / Vào ca & giao tiếp / Gia đình & phỏng vấn) — dùng lại các từ đã có sẵn trong `phaseOneMock.ts`/`courseLearningMock.ts` để nhất quán (houkoku, kyukei, zairyu card, mensetsu, aisatsu, tenchou, anzen...) mở rộng thêm để đủ 6-8 cặp/round
- Viết lại `builderData.ts`: 15-20 từ Tokutei dạng romaji (bỏ `article` field, bỏ Umlaut decoy logic — decoy dựa trên chữ cái latin thường gây nhầm)
- Cập nhật `types.ts`: xóa `article` khỏi `BuilderRound.data`, xóa `isUmlaut` khỏi `LetterChip`, xóa GameId rác tiếng Đức chưa dùng
- Cập nhật `fromCourseVocabBuilder.ts`: bỏ UMLAUT_REGEX, đơn giản hóa decoy generation (random chữ cái không trùng)
- Cập nhật test: `memoryGenerator.test.ts`, `builderGenerator.test.ts` dùng data mới, bỏ assertion liên quan umlaut/article

Output: Memory Match + Word Builder chơi bằng vocab Tokutei tiếng Nhật, không còn dấu vết Đức nào.

### Phase 02 — Admin Mock Data Migration

Tasks:
- `adminVocabulary.ts`: thay 8 từ Đức bằng 8 từ Tokutei tiếng Nhật (履歴書/rirekisho - hồ sơ, 面接/mensetsu - phỏng vấn, 保険/hoken - bảo hiểm, v.v., giữ field structure hiện có, bỏ field `article` nếu không còn ý nghĩa)
- `adminAiOperations.ts`: sửa 4 prompt mock — promptBody/sampleInput/sampleOutput đổi từ "học tiếng Đức" sang "học tiếng Nhật công việc Tokutei"
- `adminCourses.ts`: đổi title course Đức → Tokutei (ví dụ "A1 Alltag Deutsch" → "Tokutei Cơ bản: Giao tiếp hàng ngày", "Goethe Exam Prep" → "JFT Exam Prep")
- `adminCourseContent.ts`: đổi module/exercise title tương ứng
- `adminPackages.ts`: đổi package name/description
- `adminStudents.ts`: đổi tên học viên mẫu (bỏ "Anna Müller")
- `adminOperations.ts`: đổi nội dung alert tương ứng với vocab/course mới

Output: Toàn bộ Admin Dashboard hiển thị nội dung Tokutei nhất quán.

### Phase 03 — Supabase Backend Content Migration

Tasks:
- Viết lại `supabase/seed.sql`: courses (2 course Tokutei rõ ràng, ví dụ "Tokutei Ginou Cơ bản" + "Tokutei Nâng cao — Phỏng vấn & Hồ sơ"), modules, lessons, lesson_exercises, vocabulary_items, lesson_vocabulary, review_questions/options, assessments/assessment_questions, documents, podcast_episodes, packages — tất cả bằng tiếng Nhật Tokutei, giữ nguyên schema/column/kiểu dữ liệu, chỉ đổi text content
- Đổi `supabase/config.toml`: `project_id` (cần confirm với anh trước khi làm, xem Risks)
- Test lại: `supabase db reset` (hoặc tương đương) để re-seed, verify bằng psql giống lần khôi phục DB trước

Output: Supabase local trả về dữ liệu Tokutei nhất quán khi FE query qua `coursesRepository`.

### Phase 04 — Docs, Design System & Metadata Cleanup

Tasks:
- `design-system/MASTER.md`: đổi "adult German learners" → "Tokutei Ginou learners"
- `design-system/pages/admin-dashboard.md`: đổi "Anna Müller" trong mockup
- `docs/DESIGN.md`: đổi "Ghép cặp từ Đức - Việt", "Wortstellung" → mô tả tương ứng Tokutei
- `docs/design-specs.md`: đổi "người lớn học tiếng Đức" → "người lao động chuẩn bị Tokutei Ginou"
- `docs/design/new-games-mvp.md`: xóa GameId tiếng Đức cũ trong type union, đổi mô tả UI text
- `docs/specs/new-games-engagement.md`: sửa US1/US3/US4 — bỏ "chuẩn bị sang lao động ở Đức", thay bằng ngữ cảnh Tokutei Nhật Bản
- `docs/specs/admin-dashboard.md`: sửa mô tả tự mâu thuẫn "app học tiếng Đức TOKUTEI GINO"
- `package.json`: đổi `name` → `tokutei-gino`
- Thêm note "SUPERSEDED" đầu `plans/2026-05-17-new-games-engagement/awf-plan.md` và `plans/2026-05-16-game-zone/awf-plan.md`

Output: Toàn bộ tài liệu tham chiếu nhất quán với bản chất Tokutei, tránh agent tương lai đọc nhầm lại.

### Phase 05 — Verify & Handoff

Tasks:
- Grep toàn repo lần cuối: `german|German|Deutsch|Umlaut` — phải về 0 kết quả (trừ note SUPERSEDED cố ý giữ để giải thích lịch sử)
- `npm run lint` pass
- `npm run test` pass
- `npm run build` pass
- Browser smoke test: Hub → Memory Match, Word Builder; Admin → Vocabulary, Courses, AI Operations, Students, Packages
- Update `.brain/session.json` + `.brain/project-context.md` xác nhận domain đã fix

Output: Ship-ready, sản phẩm nhất quán 100% Tokutei.

---

## 7. Phase Dependencies

| Phase | Depends on |
|-------|-----------|
| 01 (Games) | — |
| 02 (Admin data) | — (độc lập, chạy song song 01) |
| 03 (Supabase) | — (độc lập, chạy song song 01/02) |
| 04 (Docs) | Tốt nhất sau 01-03 để mô tả đúng nội dung đã đổi, nhưng có thể chạy song song |
| 05 (Verify) | 01 + 02 + 03 + 04 |

Phase 01, 02, 03 không phụ thuộc nhau — có thể làm song song hoặc theo thứ tự ưu tiên user-facing trước (01 → 02 → 03 → 04).

---

## 8. Risks và Mitigation

| Risk | Mitigation |
|------|-----------|
| Đổi `project_id` trong `config.toml` làm Docker container bị tạo lại từ đầu, mất data hiện tại | Confirm với anh trước; nếu đổi, chạy `supabase stop` trước, backup nếu cần, rồi `supabase start` lại sạch |
| Xóa field `article`/`isUmlaut` phá vỡ type ở nơi khác đang dùng | Grep toàn bộ usage trước khi xóa field, cập nhật đồng bộ component/test dùng field đó |
| Vocab Tokutei mới không đủ đa dạng cho 20 từ Word Builder | Mở rộng thêm từ vựng công việc Tokutei ngoài các từ đã có (hỏi thêm nếu cần domain expert review độ chính xác tiếng Nhật) |
| Seed.sql mới có lỗi cú pháp SQL | Test bằng `supabase db reset` local trước khi coi là xong |
| Một số nội dung tiếng Nhật cần romaji chuẩn xác — rủi ro sai chính tả romaji nếu tự viết | Ưu tiên tái dùng từ đã có trong `phaseOneMock.ts` (đã có sẵn, đã qua review trước), chỉ thêm từ mới khi cần và ghi rõ để anh review lại |

---

## 9. Open Questions (cần anh xác nhận trước khi vào `/awf-design`)

1. **Đổi `project_id` trong `supabase/config.toml`?** Có nên đổi (rủi ro phải tạo lại Docker container) hay giữ tên cũ `gino-german-local` (chỉ là ID nội bộ, không hiển thị cho học viên) và bỏ qua bước này?
2. **Có cần chữ Nhật gốc (Kanji/Hiragana) hay giữ romaji-only** như `phaseOneMock.ts` hiện tại đang làm (báo cáo → houkoku)?
3. **Vocab Tokutei mới cho Games/Admin** — anh có bộ từ vựng cụ thể muốn dùng, hay để em tự soạn dựa trên các từ đã có sẵn trong app (mở rộng thêm chủ đề: nhà hàng, xây dựng, điều dưỡng... theo các ngành Tokutei phổ biến)?
4. Có cần đổi tên thư mục project / tên hiển thị trong `package.json` thành gì cụ thể, hay `tokutei-gino` là đủ?

---

## 10. Handoff

Plan này chốt scope dọn dẹp toàn bộ nội dung tiếng Đức. Bước tiếp theo:

- Nếu anh confirm Open Questions ở mục 9 → chạy `/awf-design` để chốt chi tiết vocab list mới (Games + Admin + Seed) trước khi code, tránh phải sửa lại nhiều lần.
- Nếu anh muốn làm ngay không cần design chi tiết thêm → có thể chạy `/awf-code` trực tiếp theo Phase 01 trước (games, ảnh hưởng học viên trực tiếp nhất), rồi lần lượt Phase 02-05.

Critical path: Phase 01 (Games) → ảnh hưởng trực tiếp trải nghiệm học viên, nên làm trước nếu cần ship nhanh một phần.
