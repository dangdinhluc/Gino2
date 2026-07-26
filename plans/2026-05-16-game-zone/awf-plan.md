> ⚠️ SUPERSEDED (2026-07-11): Sản phẩm là Tokutei Ginou (tiếng Nhật công việc), KHÔNG phải German. Các mô tả "German", "tiếng Đức", "Wortschmiede", TTS `de-DE` trong plan này là lỗi domain đã được sửa ở `plans/2026-07-11-tokutei-full-migration/awf-plan.md`. Đọc plan đó trước khi tiếp tục bất kỳ implementation nào dựa trên file này.

# AWF Plan: Game Zone Learning Games

Ngày tạo: 2026-05-16
Feature: 6 game học tập tiếng Đức thật thay thế mock quiz
Trạng thái: planning
Next workflow: `/awf-code`

---

## 1. Goal

Thay thế hệ thống game mock (1 cơ chế quiz lặp 5 lần, nội dung tiếng Nhật cũ) bằng 6 game học tập thật cho tiếng Đức, mỗi game một cơ chế riêng, gắn với kỹ năng CEFR cụ thể.

Kết quả mong muốn:
- Learner có lý do quay lại mỗi ngày (Daily Challenge + streak)
- Mỗi game luyện 1 kỹ năng khác nhau (gender, compound, word order, cases, listening, speaking)
- Sai → vào SRS queue → ôn lại ở ReviewCenter
- Data từ Supabase vocabulary/review_questions, không hardcode

---

## 2. Scope In

- Shared GameShell component (dark immersive, full viewport)
- Hub page redesign (6 game cards + Daily Challenge)
- 6 game implementations với gameplay riêng
- Game round data generator từ Supabase vocabulary
- SRS integration (wrong answers → review queue)
- Streak/XP tracking (Zustand + Supabase)
- Route restructure: game screens thoát MainLayout

## 3. Scope Out

- Leaderboard / multiplayer
- AI-generated rounds (dùng static/seeded data trước)
- Offline mode
- Admin CRUD cho game content
- Audio file upload/management
- Gamification beyond streak/XP (badges, levels)

---

## 4. Assumptions

- Supabase `vocabulary_items` đã có data tiếng Đức (từ seed)
- `review_questions` + `review_options` có thể dùng cho Kasus Kampf
- Browser Speech APIs đủ cho MVP (Chrome desktop primary)
- `@dnd-kit/core` compatible với React 19 + Vite 6
- Game screens render ngoài MainLayout nhưng vẫn cần auth

---

## 5. Phase Breakdown

### Phase 01 — Foundation: GameShell + Route + Store

Tasks:
- Tạo `src/features/games/` feature folder
- Tạo shared `GameShell` component (top bar, progress, feedback, gameplay slot)
- Tạo `gameStore.ts` (Zustand): score, combo, round index, game state
- Restructure routes: game screens render outside MainLayout but inside ProtectedRoute
- Tạo game types: `GameConfig`, `GameRound`, `GameResult`
- Tạo `useGameSession` hook (manages round flow, scoring, completion)

Output: GameShell renders empty placeholder, route works, store functional.

---

### Phase 02 — Hub Redesign

Tasks:
- Rewrite `LearningHubPage.tsx` với 6 game cards mới (tiếng Đức)
- Daily Challenge card (random 5 rounds từ 3 games)
- Stats strip (streak + weekly XP)
- Game card component với accent color, level badge, progress dots
- Remove old `gameShells` mock data từ `phaseOneMock.ts`

Output: Hub page hiển thị 6 game mới, click vào navigate đúng route.

---

### Phase 03 — Der/Die/Das Rush

Tasks:
- Tạo `DerDieDasRush.tsx` gameplay component
- Game logic: từ xuất hiện → user tap DER/DIE/DAS → feedback → next
- Timer/speed mechanic: tốc độ tăng theo combo
- Round generator: query `vocabulary_items` có gender field → tạo rounds
- Mock fallback data nếu Supabase chưa available
- Animation: correct glow, wrong shake, combo particle

Output: Game chơi được end-to-end, score + combo hoạt động.

---

### Phase 04 — Satzpuzzle (Word Order)

Tasks:
- Tạo `Satzpuzzle.tsx` gameplay component
- Install `@dnd-kit/core` + `@dnd-kit/sortable`
- Drag-and-drop word chips vào slot positions
- Tap-to-place fallback cho mobile
- Round data: câu tiếng Đức split thành tokens + correct order
- Difficulty levels: V2 rule → Nebensatz → TeKaMoLo
- Check logic: compare user order vs correct order, highlight errors

Output: Drag-and-drop functional, rounds playable.

---

### Phase 05 — Kasus Kampf (Case Selection)

Tasks:
- Tạo `KasusKampf.tsx` gameplay component
- Hearts system (5 lives, game over when depleted)
- Sentence with 1-2 blanks, user picks article
- Rule explainer panel: shows grammar rule on wrong answer
- Round data: sentences with case annotations from seed
- Difficulty: Akkusativ only → Dativ only → mixed

Output: Game with hearts, rule feedback, progressive difficulty.

---

### Phase 06 — Wortschmiede (Compound Builder)

Tasks:
- Tạo `Wortschmiede.tsx` gameplay component
- Piece chips + build zone (drag or tap-to-combine)
- Compound validation: check if combination is valid German compound
- Round data: compound word list with component parts
- Unlock animation: show meaning + example on correct compound
- Seed data: add compound word entries to vocabulary or separate table

Output: Compound building functional with validation.

---

### Phase 07 — Diktat Sprint (Dictation)

Tasks:
- Tạo `DiktatSprint.tsx` gameplay component
- TTS: `SpeechSynthesis` API with German voice (`de-DE`)
- Text input with submit
- Token-level diff: compare user input vs correct sentence
- Highlight: green (correct), red (wrong), amber (close/Umlaut)
- Capitalization check: flag uncapitalized nouns
- Fallback: if no TTS available, show "read and type" mode

Output: Listen → type → diff feedback working.

---

### Phase 08 — Aussprache Echo (Pronunciation)

Tasks:
- Tạo `AussprecheEcho.tsx` gameplay component
- Play reference audio (TTS)
- Record user speech: `webkitSpeechRecognition` API
- Compare transcript vs target sentence → percentage score
- Hold-to-speak button with recording state animation
- Pronunciation tips for common Vietnamese→German errors
- Graceful fallback: if Speech Recognition unavailable, skip or show text comparison

Output: Speak → compare → score working on Chrome.

---

### Phase 09 — SRS Integration + Daily Challenge

Tasks:
- Wrong answers from all games → push to SRS queue in `progressStore`
- Wire SRS queue to ReviewCenter's flashcard session
- Daily Challenge: pick 5 random rounds from 3 different games
- Streak tracking: consecutive days with ≥1 game completed
- XP calculation: base per round + combo bonus
- Persist streak/XP to Supabase `learning_activity_events`

Output: Cross-game learning loop complete.

---

### Phase 10 — Polish + Verification

Tasks:
- Responsive QA: 1440px, 1024px, 768px, 375px
- Accessibility: keyboard navigation, focus rings, screen reader announcements
- Reduced motion: honor `prefers-reduced-motion`
- Loading/empty/error states for all games
- Remove old mock game code from `phaseOneMock.ts`
- `npm run lint` + `npm run build` pass
- Browser QA: play each game end-to-end

Output: Ship-ready game zone.

---

## 6. Dependencies

| Phase | Depends on |
|-------|-----------|
| 01 | — |
| 02 | 01 |
| 03 | 01 |
| 04 | 01, `@dnd-kit/core` install |
| 05 | 01 |
| 06 | 01, compound data in seed |
| 07 | 01 |
| 08 | 01 |
| 09 | 03-08 (at least 2 games done) |
| 10 | all above |

Phases 03-08 can be done in parallel after 01 is complete.

---

## 7. Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| `@dnd-kit` incompatible with React 19 | Test install first; fallback to tap-to-place only |
| Speech Recognition poor on Safari/mobile | Graceful fallback; Echo game marked "Chrome recommended" |
| TTS German voice quality varies | Allow "Play again" + future pre-recorded audio upgrade |
| Compound word validation complex | Start with curated list, not algorithmic validation |
| Game data insufficient in current seed | Add game-specific seed entries in Phase 03-08 |
| Full viewport game breaks auth flow | Game routes still inside ProtectedRoute, just outside MainLayout |

---

## 8. Tech Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Drag-and-drop | `@dnd-kit/core` | Lightweight, accessible, React-native |
| TTS | Native `SpeechSynthesis` | Free, no API key, works offline |
| Speech Recognition | Native `webkitSpeechRecognition` | Free, Chrome-first acceptable for MVP |
| State | Zustand `gameStore` | Consistent with app pattern |
| Animation | `motion` (already installed) | Reuse existing dep |
| Game data | Supabase query + mock fallback | Same pattern as coursesRepository |

---

## 9. Open Questions

Không còn — visual đã chốt, tech đã chọn, scope rõ.

---

## 10. Handoff

`/awf-code` nên bắt đầu từ Phase 01 (GameShell + route + store), sau đó Phase 02 (Hub), rồi Phase 03 (Der/Die/Das Rush) — đây là critical path ngắn nhất để có 1 game chơi được.
