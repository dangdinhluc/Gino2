# AWF Plan: Course-Driven Games

Ngày tạo: 2026-05-17
Feature: Game trong tab Game của khóa học lấy dữ liệu vocabulary/review của khóa đó
Trạng thái: planning
Next workflow: `/awf-code`

---

## 1. Goal

Khi learner vào Course Learning Workspace → tab "Game", các game phải dùng **vocabulary và review questions của khóa học đó** thay vì data cố định. Mỗi khóa có bộ từ riêng → game sinh rounds từ bộ từ đó.

---

## 2. Scope In

- Round generators: nhận `CourseVocabularyItem[]` → trả về rounds cho Vocab Sprint, Flappy Vocab
- Round generators: nhận `CourseReviewQuestion[]` → trả về rounds cho Situation Game
- GamesPanel trong Course Learning hiển thị game types khả dụng dựa trên data khóa
- Khi bấm "Chơi ngay" → navigate `/app/game/:type?courseId=:id`
- GameScreen đọc `courseId` param → load course data → generate rounds → render game
- Không có courseId → dùng default data (Hub mode, như hiện tại)

## 3. Scope Out

- Supabase integration (dùng mock trước)
- Tạo game types mới
- Admin CRUD cho game content

---

## 4. Phase Breakdown

### Phase 01 — Round Generators

Tasks:
- Tạo `src/features/games/generators/fromCourseVocab.ts`
  - `generateVocabRounds(vocab: CourseVocabularyItem[])` → VocabRound[]
  - `generateFlappyRounds(vocab: CourseVocabularyItem[])` → VocabRound[] (same format)
- Tạo `src/features/games/generators/fromCourseReview.ts`
  - `generateSituationRounds(questions: CourseReviewQuestion[])` → SituationRound[]
- Logic: shuffle, pick distractors từ cùng pool, đảm bảo ≥4 options

### Phase 02 — Course Game Store (truyền data qua URL + store)

Tasks:
- Tạo `courseGameStore.ts` (Zustand, không persist): lưu tạm course vocabulary khi navigate sang game
- Khi user bấm "Chơi" từ Course → set store data + navigate
- GameScreen check store: có data → dùng generators; không có → fallback default

### Phase 03 — Wire GamesPanel + GameScreen

Tasks:
- GamesPanel: thay danh sách game mock bằng game types thật (Vocab Sprint, Flappy Vocab, Tình huống)
- Mỗi game card hiển thị số rounds khả dụng dựa trên vocab count
- Bấm "Chơi ngay" → set courseGameStore + navigate `/app/game/:type`
- GameScreen: đọc courseGameStore → generate rounds → render game component
- Game kết thúc → option "Về khóa học" bên cạnh "Về Hub"

### Phase 04 — Validate + Polish

Tasks:
- Lint + build
- Test flow: Course → Game → Result → Course
- Ẩn game type nếu data không đủ (< 4 vocab items)

---

## 5. Risks

| Risk | Mitigation |
|------|-----------|
| Vocabulary quá ít cho game | Ẩn game nếu < 4 items; hiện thông báo "Học thêm từ để mở game" |
| Store bị clear khi refresh | Fallback về default data — game vẫn chơi được |

---

## 6. Open Questions

Không còn.
