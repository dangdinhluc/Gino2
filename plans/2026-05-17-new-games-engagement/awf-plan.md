> ⚠️ SUPERSEDED (2026-07-11): Sản phẩm là Tokutei Ginou (tiếng Nhật công việc), KHÔNG phải German. Các mô tả "German", "tiếng Đức" trong plan này là lỗi domain đã được sửa ở `plans/2026-07-11-tokutei-full-migration/awf-plan.md`. Đọc plan đó trước khi tiếp tục bất kỳ implementation nào dựa trên file này.

# AWF Plan: New Engagement Games

Ngày tạo: 2026-05-17
Feature: Thêm 4 game học tập mới (Memory Match, Word Builder, Listening Lab, Story Quest) để đa dạng hóa Game Zone và tăng engagement học viên
Trạng thái: planning
Next workflow: `/awf-design`

---

## 1. Goal

Game Zone hiện tại chỉ có 3 game (VocabSprint, FlappyVocab, SituationGame) với 2/3 cơ chế "multiple choice text" giống nhau → học viên dễ chán.

Mục tiêu MVP: thêm **2 game mới (Memory Match + Word Builder)** để mở rộng cơ chế chơi, ship sớm để đo engagement; sau đó mới quyết định mở rộng thêm Listening Lab + Story Quest ở phase tương lai.

Kết quả mong muốn (MVP):
- Game Zone đi từ 3 → 5 game
- 2 trục cơ chế mới: **trí nhớ trực quan (Memory Match)** + **chính tả/Umlaut (Word Builder)**
- Reuse `GameShell` + `gameStore` pattern → không phá kiến trúc hiện tại
- Tích hợp với courseGameStore (chơi từ tab Game của khóa học)
- Lint/build pass, browser smoke test xong

### Quyết định scope (đã chốt 2026-05-17)
- ✅ **MVP (chạy `/awf-design` rồi `/awf-code` ngay):** Memory Match + Word Builder
- ⏳ **Future (mở plan mới khi có dữ liệu engagement):** Listening Lab + Story Quest

---

## 2. Search-First Findings

### Code đã có
- `src/features/games/GameShell.tsx` — shell chung, dùng được cho game tĩnh (3 game cũ đều dùng)
- `src/features/games/gameStore.ts` — Zustand store: score/combo/round/feedback
- `src/features/games/courseGameStore.ts` — store truyền course context sang game
- `src/features/games/types.ts` — đã reserve `GameId` cho 6 game German chưa implement
- `src/features/games/data/vocabData.ts` — có 20 vocab rounds (đang là tiếng Nhật, sẽ migrate sang Đức ở plan course-games)

### Lib check
- `motion` + `framer-motion` ✅ (animation)
- `zustand` ✅ (state)
- `lucide-react` ✅ (icons)
- `@dnd-kit/*` ❌ chưa cài — Word Builder/Story Quest dùng tap-to-place thay drag-and-drop
- `SpeechSynthesis` API ✅ native — Listening Lab dùng được, không cần dep mới
- `tailwind` v4 ✅

### Decision Matrix
| Tín hiệu | Kết luận |
|----------|----------|
| GameShell + gameStore reuse được | **Adopt** — tất cả game mới render trong GameShell |
| Pattern data/{game}Data.ts đã có | **Extend** — thêm `memoryData.ts`, `builderData.ts`, `listeningData.ts`, `storyData.ts` |
| Không có lib game đặc biệt cần cài | **Build** — custom logic, code mỏng (~150-300 LOC mỗi game) |
| TTS native | **Adopt** — `window.speechSynthesis` cho Listening Lab |

Quyết định: **Build custom với foundation reuse**. Không cài dep mới ở phase này.

---

## 3. Scope In (MVP)

- 2 game implementations: **Memory Match**, **Word Builder**
- 2 file data riêng (mock, dùng vocab có sẵn)
- Mở rộng `types.ts` thêm 2 GameId mới + round types (`memory-match`, `word-builder`)
- Hub page (LearningHubPage) thêm 2 game card mới (5 cards total)
- Route mapping trong `GameScreen.tsx` cho 2 game mới
- Game-Course integration: 2 game đều nhận `rounds?: T[]` prop → tương thích courseGameStore
- Game Result reuse component sẵn có
- Lint + build pass

## 4. Scope Out (MVP)

### Đẩy sang Future Phase (plan riêng sau khi có metric)
- **Listening Lab** (TTS browser native, replay/slow mode)
- **Story Quest** (câu chuyện rẽ nhánh, multiple endings)

### Out of scope toàn bộ feature
- Supabase backend cho game data (dùng mock TS file trước)
- Pre-recorded audio, AI-generated content
- Multiplayer / leaderboard
- Drag-and-drop thật (chỉ tap-to-place)
- Animation/asset 3D, lottie
- Admin CRUD game content
- Localization mở rộng
- Daily Challenge tích hợp với game mới (xem lại sau MVP)

---

## 5. Assumptions

- Người dùng dùng Chrome/Safari mobile + desktop, có TTS hỗ trợ tiếng Đức
- 20-30 vocab items per game đủ cho MVP
- Không cần backend persist score riêng cho 4 game này (đã có `gameStore` + `progressStore.recordGameComplete`)
- React 19 + Vite 6 stable cho các pattern hiện tại
- Học viên đã quen GameShell layout từ 3 game cũ → giảm cost UX onboarding

---

## 6. Phase Breakdown

### Phase 01 — Foundation: Types + Hub Cards

Tasks:
- Cập nhật `src/features/games/types.ts`: thêm `GameId` mới `memory-match | word-builder`
- Tạo round type interfaces cho 2 game (sẽ chi tiết ở `/awf-design`)
- Cập nhật `LearningHubPage.tsx` thêm 2 game card mới (icon + accent + level badge)
- Cập nhật route map trong `GameScreen.tsx` (chưa render thật, return placeholder)
- Lint pass

Output: Hub hiển thị 5 game card, click vào game mới chưa chơi được nhưng route resolve.

### Phase 02 — Memory Match

Tasks:
- Tạo `src/features/games/data/memoryData.ts`: pairs (German word ↔ nghĩa Việt), 6-10 cặp/round
- Tạo `src/features/games/MemoryMatch.tsx`:
  - Grid 4×3 hoặc 4×4 cards (responsive)
  - State machine: idle → first-flip → second-flip → match-check → reset/lock
  - Animation flip card (motion 3D rotateY)
  - Score = số cặp ghép trong thời gian giới hạn; combo = ghép liên tục không sai
  - Wrong → cards flip lại sau 800ms
- Wire vào `GameShell` (header score/combo, footer feedback)
- Wire wrong pairs → SRS qua `progressStore.addToSrs`

Output: 1 round Memory Match end-to-end (start → ghép xong → result screen).

### Phase 03 — Word Builder

Tasks:
- Tạo `src/features/games/data/builderData.ts`: list từ tiếng Đức + nghĩa, mỗi từ generate scrambled letters + decoy letters
- Tạo `src/features/games/WordBuilder.tsx`:
  - Hiển thị nghĩa Việt + slot trống = số chữ cái
  - Pool chữ cái phía dưới (tap to place vào slot kế tiếp)
  - Tap slot đã đặt → trả chữ về pool
  - Hint button (-50 pts) → reveal 1 chữ
  - Submit khi đầy slot → check; sai → shake + cho fix
- Special case: Umlaut (ä, ö, ü, ß) — chữ đặc biệt nổi bật trong pool
- Score: base 100 + time bonus + combo

Output: Word Builder chơi được, hint hoạt động, Umlaut tap được.

### Phase 04 — Polish + Verify (MVP exit)

Tasks:
- Responsive QA: 1440 / 1024 / 768 / 375
- Accessibility: keyboard nav, focus rings, aria labels cho card flip + letter pool
- Honor `prefers-reduced-motion` (giảm flip animation)
- Loading/empty/error states cho mỗi game
- Lint pass: `npm run lint`
- Build pass: `npm run build`
- Browser smoke test 2 game (Chrome desktop + mobile viewport)
- Update `.brain/session.json` với artifacts mới

Output: Ship-ready, 5 game đa dạng cơ chế trong Hub.

---

### Future Phase (NEXT, ngoài MVP)

> Sau khi MVP ship và có metric engagement, mở plan riêng cho 2 game còn lại.

- **Future-A — Listening Lab**: TTS browser (`SpeechSynthesis`), play/replay/slow, fallback no-TTS, 4 option chọn nghĩa Việt
- **Future-B — Story Quest**: 3 mini-story rẽ nhánh, multiple endings, reuse GameShell

Lý do tách: Memory Match + Word Builder dùng asset đơn giản (text + vocab có sẵn). Listening Lab cần test TTS đa nền tảng + curate audio script; Story Quest cần đầu tư content (kịch bản tiếng Đức) — nên đẩy sau khi đã có data engagement xác nhận hướng đi đúng.

---

## 7. Phase Dependencies

| Phase | Depends on |
|-------|-----------|
| 01 | — |
| 02 | 01 |
| 03 | 01 |
| 04 (Polish) | 02 + 03 |
| Future-A (Listening Lab) | MVP shipped + có metric |
| Future-B (Story Quest) | MVP shipped + có content kịch bản |

Phase 02 và 03 chạy song song được sau khi 01 xong.

---

## 8. Tasks Breakdown (mức vừa đủ — chi tiết DB/API/component sang `/awf-design`)

### Phase 01 (Foundation)
- [ ] Mở rộng `GameId` union trong types.ts (`memory-match`, `word-builder`)
- [ ] Định nghĩa `MemoryRound`, `BuilderRound` types
- [ ] Thêm 2 GameConfig vào hub data source
- [ ] Cập nhật route normalizer trong GameScreen
- [ ] Visual: 2 icon mới từ lucide-react (Brain, Hammer)

### Phase 02 (Memory Match)
- [ ] Data file: 4 round, mỗi round 6-8 cặp
- [ ] Component: grid + flip + match logic
- [ ] Animation: rotateY 180° flip
- [ ] Tích hợp gameStore + courseGameStore prop

### Phase 03 (Word Builder)
- [ ] Data file: 15-20 từ kèm nghĩa
- [ ] Component: slot system, letter pool, hint, submit
- [ ] Umlaut handling
- [ ] Tích hợp gameStore + courseGameStore prop

### Phase 04 (Polish)
- [ ] Responsive sweep
- [ ] A11y sweep
- [ ] Lint/build
- [ ] Browser QA cho 2 game

---

## 9. Risks và Mitigation

| Risk | Mitigation |
|------|-----------|
| TTS tiếng Đức không có trên thiết bị | Fallback "đọc text" mode + thông báo bằng UI |
| Memory Match flip animation jank trên mobile cũ | Honor `prefers-reduced-motion`, dùng opacity fallback |
| Word Builder slot không đủ rộng cho từ dài (Geschwindigkeitsbegrenzung) | Giới hạn từ ≤12 chữ cái cho MVP, dài hơn → split hint |
| Story Quest data dài → maintain mệt | MVP chỉ 3 stories curated, mở rộng sau qua admin (out of scope) |
| Engagement không tăng như kỳ vọng | Mỗi game có Daily Challenge mode hook (out of scope phase này, để pending) |
| Tiếng Đức data thiếu — vocab hiện đang là tiếng Nhật | Plan course-games đã có Phase 1 "migrate mock to German"; plan này chạy song song hoặc sau plan đó |

---

## 10. Open Questions

Đã chốt tại 2026-05-17:

1. ✅ **Phạm vi MVP**: làm 2 game trước (Memory Match + Word Builder), ship sớm rồi mới quyết định Listening Lab + Story Quest dựa trên metric.
2. ⏳ **Story Quest content** — đẩy sang Future Phase, sẽ quyết định khi mở plan riêng.
3. ⏳ **Daily Challenge** — đẩy sang Future Phase, sau khi MVP có metric.

---

## 11. Handoff

Plan này chốt scope và phase. Bước tiếp theo:

- `/awf-design` để vào chi tiết:
  - Component tree + props
  - Data schema chính xác (TypeScript interface)
  - State machine cho từng game
  - Animation timing + a11y plan
  - Game-Course integration spec
  - Test outline (manual checklist + tsx test cho generators)

Critical path: Phase 01 → Phase 02 (Memory Match) là đường ngắn nhất để có 1 game mới chơi được.
