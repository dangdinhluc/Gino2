# Spec: New Engagement Games

Ngày tạo: 2026-05-17  
Plan path: `plans/2026-05-17-new-games-engagement/awf-plan.md`  
Trạng thái: spec sketch (chi tiết design sẽ thêm khi `/awf-design` chạy)

---

## Executive Summary

Game Zone hiện có 3 game (VocabSprint, FlappyVocab, SituationGame) với 2 trong 3 cùng cơ chế multiple-choice text → trải nghiệm đơn điệu.

Spec này định nghĩa **MVP 2 game mới** (Memory Match + Word Builder) — 2 cơ chế khác hẳn các game cũ — để **đa dạng hóa Game Zone, ship nhanh, đo engagement** trước khi mở rộng.

**Listening Lab** và **Story Quest** giữ trong spec này như **Future Scope (NEXT)**, sẽ chốt và build ở plan/spec riêng sau khi MVP có metric.

> ⚠️ Cập nhật 2026-07-11: Vocab thật đã đổi từ tiếng Đức sang tiếng Nhật romaji (Tokutei Ginou). Umlaut (ä/ö/ü/ß) không còn áp dụng — Word Builder hiện xếp chữ cái Latin thường (romaji), không có ký tự đặc biệt. US2 và các mục nhắc Umlaut dưới đây là tài liệu lịch sử, không phản ánh implementation thật (`src/features/games/types.ts`, `builderData.ts`).

### Quyết định scope (2026-05-17)
- ✅ MVP: Memory Match + Word Builder
- ⏳ NEXT: Listening Lab + Story Quest

---

## User Stories

### US1 — Visual Learner muốn ghi nhớ qua hình ảnh (MVP)
> Là một học viên nhớ tốt qua trực giác, em muốn có game ghép cặp lật bài để não bộ liên kết từ tiếng Nhật và nghĩa Việt qua không gian + chuyển động, thay vì phải đọc-chọn liên tục.

### US2 — Học viên hay sai chính tả Umlaut (MVP)
> Là một học viên thường viết sai ä/ö/ü/ß, em muốn có game xếp chữ cái để luyện kỹ năng spelling chính xác, có hint khi bí.

### US5 — Power user muốn đa dạng (MVP)
> Là một học viên đã chơi hết game cũ, em muốn lựa chọn rộng hơn để mỗi ngày chơi 1 game khác nhau, không bị nhàm chán.

---

### Future User Stories (NEXT)

### US3 — Học viên muốn luyện nghe trước khi sang Nhật
> Là một học viên chuẩn bị sang lao động Nhật Bản theo diện Tokutei Ginou, em muốn nghe TTS đọc câu/từ rồi chọn nghĩa đúng để rèn phản xạ nghe — kỹ năng yếu nhất của em.

### US4 — Học viên muốn học qua tình huống thực
> Là một học viên muốn áp dụng tiếng Nhật vào đời sống và công việc, em muốn chơi game kể chuyện rẽ nhánh — mỗi quyết định ảnh hưởng kết cục — để học cảm xúc, ngữ cảnh, không chỉ mỗi từ rời.

---

## Feature List (MVP)

### F1. Memory Match (Ghép cặp ghi nhớ) — MVP
- Grid lật bài 4×3 hoặc 4×4
- Cặp = từ tiếng Nhật ↔ nghĩa Việt
- Animation flip 3D
- Score = số cặp đúng - số lần lật sai
- Combo khi ghép liên tục đúng
- Wrong pairs → SRS queue

### F2. Word Builder (Xếp chữ) — MVP
- Hiển thị nghĩa Việt + slot trống
- Pool chữ cái dưới, tap chọn vào slot
- Đặt sai có thể tap chữ trong slot để trả lại
- Hint button (-50pt) reveal 1 chữ
- Umlaut chip nổi bật
- Submit → check, sai → shake animation

---

## Future Scope (NEXT — không thuộc MVP)

### F3. Listening Lab (Lab nghe) — NEXT
- TTS browser (`SpeechSynthesis`) đọc từ/câu tiếng Nhật
- Auto play khi vào round; có nút Replay (∞), Slow mode (rate 0.7)
- 4 option đáp án nghĩa Việt
- Fallback "Read mode" khi không có TTS
- Highlight đáp án đúng khi sai

### F4. Story Quest (Phiêu lưu hội thoại) — NEXT
- 3 mini-story (ngày đầu đi làm, gọi điện sếp xin nghỉ, gặp bác sĩ)
- Mỗi story có 3-5 nodes
- Mỗi node: scene description (Việt) + dialogue (tiếng Nhật) + 2-3 choice buttons (tiếng Nhật)
- Chọn đúng → next node + score; chọn không tối ưu → branch khác (vẫn playable, ending khác)
- Multiple endings: Tốt / Tạm / Cần luyện lại

> **Lý do tách:** Memory Match + Word Builder dùng asset đơn giản, build nhanh, ship sớm để đo engagement. Listening Lab cần test TTS đa nền tảng + curate audio script; Story Quest cần đầu tư content kịch bản tiếng Nhật — cả hai đẩy sau khi có metric MVP.

---

## Non-Goals

- Không build Supabase backend cho game data (mock TS file trước)
- Không thu âm pre-recorded audio (chỉ TTS)
- Không multiplayer / leaderboard / friend challenge
- Không drag-and-drop thật (chỉ tap-to-place)
- Không AI sinh story động (story curated)
- Không admin CRUD nội dung game ở phase này
- Không Daily Challenge tích hợp với 4 game mới (để phase sau, nếu engagement tăng)

---

## Integration Notes (cấp cao)

### Reuse từ kiến trúc hiện tại
- `GameShell` — mọi game mới render trong shell này (header score/combo, footer feedback)
- `gameStore` (Zustand) — score/combo/round/feedback state
- `courseGameStore` — nhận `rounds?: T[]` prop để chơi từ tab Game của khóa học
- `progressStore.recordGameComplete` + `addToSrs` — persist score + SRS queue
- `GameResult` component — màn hình kết quả cuối game
- Routing: thêm vào `GameScreen.tsx` normalizer như 3 game hiện tại

### Mở rộng cần làm
- `types.ts`: thêm 4 GameId + 4 round/node types
- `data/`: thêm 4 file mock data
- Hub `LearningHubPage.tsx`: thêm 4 game card
- Route map trong `GameScreen.tsx`: thêm 4 case render

### Data flow chuẩn của 1 game
```
Hub → click card → navigate /app/game/:gameId
GameScreen → pick component theo gameId
Component → gọi useGameStore.startGame(gameId, totalRounds)
Component → render UI dựa trên roundIndex + rounds prop (hoặc default mock)
Component → user action → gameStore.answerCorrect/answerWrong + showFeedback
User dismiss feedback → nextRound → repeat
Kết thúc → status = 'complete' → render GameResult
```

### Game-Course integration
- Khi học viên vào tab Game của khóa học → courseGameStore.context được set với vocabulary của khóa
- 4 game mới đều nhận `rounds?: T[]` prop
- Nếu courseContext có → generator (sẽ define ở `/awf-design`) tạo rounds từ course vocabulary
- Nếu không có → fallback mock data ở `data/{game}Data.ts`

### Browser API dependency
| Game | Browser API |
|------|-------------|
| Memory Match | none (CSS 3D transform) |
| Word Builder | none |
| Listening Lab | `window.speechSynthesis` (có fallback) |
| Story Quest | none |

---

## Acceptance Criteria — MVP (Memory Match + Word Builder)

- [ ] 2 game mới hiển thị trên Hub với icon + accent + level badge riêng
- [ ] Mỗi game start → play → end → result mượt
- [ ] Memory Match: flip animation < 16ms/frame trên iPhone đời 2020+
- [ ] Word Builder: hỗ trợ Umlaut input, Hint hoạt động, Submit check chính xác
- [ ] Game-Course integration: chơi từ tab Game khóa học hoạt động (nếu courseGameStore có context)
- [ ] Lint pass, build pass
- [ ] Wrong items → SRS queue
- [ ] Responsive 375 → 1440px
- [ ] Honor `prefers-reduced-motion`

---

## Success Metrics (post-launch, không thuộc scope dev)

- Game Zone DAU tăng ≥ 20% sau 2 tuần
- Avg session duration tăng ≥ 30%
- Mỗi game mới đạt ≥ 100 plays trong tuần đầu
- Memory Match + Word Builder tỷ lệ replay (cùng phiên) ≥ 30%

---

## Open Questions

Đã chốt tại 2026-05-17:

1. ✅ **Phạm vi MVP**: làm 2 game (Memory Match + Word Builder) trước, ship sớm rồi đo metric.
2. ⏳ **Story Quest content**: đẩy sang Future Phase, mở plan riêng sau.
3. ⏳ **Daily Challenge** mix game mới: Future Phase, sau khi MVP có metric.

---

## Next Workflow

`/awf-design` — đi vào (cho 2 game MVP):
- Component tree + props chi tiết Memory Match & Word Builder
- Data schema TypeScript chính xác (`MemoryRound`, `BuilderRound`)
- State machine diagram cho Memory Match
- Animation timing tables (flip + shake)
- Test plan (manual checklist + generator unit tests)
- Game-Course integration sequence diagram
- A11y plan
