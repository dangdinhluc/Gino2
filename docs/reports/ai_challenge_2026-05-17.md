# AWF AI Review Challenge

**Decision:** `REVISE_DESIGN` (3 issue P1 cần sửa trước `/awf-ready`, không blocker)

Date: 2026-05-17  
Source phản biện: `docs/design/new-games-mvp.md` (Memory Match + Word Builder MVP)  
Persona: Linh — AI phản biện độc lập

---

## Summary

- **Challenge source:** Design v1 cho 2 game MVP (Memory Match, Word Builder); cross-check với plan, spec, và code hiện có (`gameStore`, `GameShell`, `GameResult`, `progressStore`)
- **Main correction:** Design solid về kiến trúc và scope, nhưng có 3 chỗ làm UX/logic dễ thiếu khi `/awf-code`: Word Builder auto-submit cướp khoảnh khắc undo của user, Memory Match timer expire chưa có flow + AC, và hint scoring chưa rõ sẽ implement vào `gameStore` ra sao.
- **Confidence:** Cao cho 3 issue P1 (verify được trong code/design hiện tại). Trung bình cho perf Android cũ (cần đo, không blocker).

---

## Challenge Matrix

| # | Area | Verdict | Evidence | Action |
|---|------|---------|----------|--------|
| 1 | **Word Builder auto-submit khi slots full** | REVISED | Design §3.2 ghi "auto check (delay 300ms)". 300ms quá ngắn để user hủy nếu vừa tap nhầm chữ cuối. Vi phạm nguyên tắc undo trong UX form. | Đổi sang **manual Submit button** (sticky bottom), hoặc giữ auto-submit nhưng tăng delay lên **1.2-1.5s** + có nút "Hủy/Sửa lại" hiện rõ trong delay đó. |
| 2 | **Memory Match timer expire chưa có flow + AC** | MISSED | `MemoryRound.data.timeLimitSec` (default 90s) có trong types nhưng: (a) state machine §4.1 không vẽ nhánh timer expire; (b) AC-MM-01..11 không có AC cho timer; (c) flow §5 không nhắc. | Bổ sung: AC "Timer expire → completeGame với score hiện tại, hiển thị result". State machine thêm transition `playing -- timer:0 --> result`. UI: TimerBar có visual countdown. |
| 3 | **Hint scoring API trong `gameStore`** | MISSED | `gameStore` hiện có `answerCorrect(points = 100)` nhưng không có `deductScore(n)` hoặc `applyHintPenalty()`. Design §3.2 nói hint −50 nhưng không nêu sẽ chạy qua đâu. | Hai lựa chọn: (a) extend `gameStore` thêm `deductPoints(amount: number)`; (b) trừ trong local state component rồi truyền vào `answerCorrect` (points = 100 - 50 * hintsUsed). Em đề xuất (a) — clean hơn, reusable cho game tương lai. |
| 4 | **Hint reveal logic Word Builder** | NEEDS_EVIDENCE | AC-WB-07 nói "reveal 1 slot trống đầu tiên với chữ đúng". Nhưng nếu user đã đặt sai ở slot 0,1 → "slot trống đầu tiên" là slot 2 → reveal letter slot 2. Khi user submit, slot 0,1 vẫn sai → vô nghĩa. | Spec rõ: hint phải tìm **slot đầu tiên có chữ sai hoặc chưa đặt** so với word đáp án, replace bằng letter đúng. Nếu slot có chữ → trả chữ về pool trước. |
| 5 | **SRS push khi dùng hint** | MISSED | AC-WB-11 ghi "wrong rounds → SRS". Nhưng nếu user dùng 2 hint rồi vẫn submit đúng → có push không? Logic "cần ôn" hay "đã hỗ trợ"? | Quyết định rõ: dùng ≥1 hint → vẫn push vào SRS (vì user chưa thuộc tự nhiên). Update AC-WB-11. |
| 6 | **Combo cross-round Memory Match** | NEEDS_EVIDENCE | gameStore.nextRound() KHÔNG reset combo. Plan ghi "ghép liên tục đúng". Round 1 cuối match đúng → round 2 đầu miss → combo về 0. Round 1 cuối match → round 2 đầu match → combo +1 (cross-round). Có ý đồ hay bug? | Decide rõ trong design: combo Memory Match **giữ cross-round** (reward streak dài) hoặc **reset mỗi round** (fair perception). Em lean về **giữ cross-round** vì đã là pattern gameStore hiện tại. |
| 7 | **Performance Memory Match grid trên Android cũ** | NEEDS_EVIDENCE | 16 cards × 3D rotateY transform có thể drop FPS trên Android Go / iPhone < 2018. AC-MM-01 nói "render < 500ms" nhưng không cover frame-rate khi flip. | Bổ sung AC: "Trên Chrome Android, flip animation duy trì ≥ 50fps trên Pixel 4a (proxy thiết bị tầm trung). Nếu fail → fallback CSS rotateZ thay rotateY". Test manual khi Polish phase. |
| 8 | **Reduced-motion fallback Word Builder** | REVISED | Design §8 ghi "shake → flash đỏ" nhưng không spec màu, duration, hoặc thay thế khi `prefers-reduced-motion`. | Cụ thể: bg slot flash `#EF4444` → `transparent` 200ms linear. Đủ để user nhận lỗi không cần motion. |
| 9 | **Round count Memory Match = 3** (open question 1) | UPHELD | 3 round × 8 pairs ≈ 4 phút. Phù hợp session ngắn. | Giữ default 3. |
| 10 | **Hint pricing −50 fixed** (open question 2) | UPHELD | Đơn giản, dễ hiểu, đủ trừng phạt. | Giữ default. |
| 11 | **Hub layout grid 2 cột dưới hero** (open question 3) | UPHELD | Pattern an toàn, không phá hero Flappy hiện tại. | Giữ default. |
| 12 | **Reuse GameShell/gameStore/courseGameStore** | UPHELD | Verified trong code: pattern y hệt VocabSprint/SituationGame. Consistency cao. | Không đổi. |
| 13 | **No new dependency** | UPHELD | Verified package.json. tap-to-place + native CSS 3D + zustand đủ. | Giữ. |
| 14 | **Generator pattern theo `fromCourseVocab.ts`** | UPHELD | Verified file existing. Memory + Builder generator follow đúng signature. | OK. |
| 15 | **Test outline 10 unit tests cho generator** | UPHELD | Đủ cho MVP. Project có `npm run test` → `tsx src/test/run-tests.ts`. | Giữ. |
| 16 | **`courseGameStore.selectedGameType` field** | NEEDS_EVIDENCE | Field optional tồn tại trong type nhưng design không nói có set khi navigate sang Memory/Builder không. Có thể là dead field. | Confirm ai dùng nếu có; nếu không → để default undefined OK. Không blocking. |
| 17 | **`getCourseLearningWorkspace(courseId)` throw nếu courseId không tồn tại** | NEEDS_EVIDENCE | `GameScreen.buildCourseContext` gọi function này không try/catch. Pattern hiện tại của 3 game cũ đã chấp nhận risk này. | Out of scope MVP — đã là issue chung cả game zone, plan riêng để fix. Note vào pending. |

---

## Missed Risks

- **R1 (P1):** Auto-submit Word Builder gây UX chasm — user mất quyền undo trước khi check
- **R2 (P1):** Timer expire Memory Match thiếu flow + AC + state machine transition
- **R3 (P1):** Hint scoring không có entry point trong gameStore → khi `/awf-code` dễ improvise sai
- **R4 (P2):** Hint reveal Word Builder logic mơ hồ khi user đã đặt sai
- **R5 (P2):** SRS push khi dùng hint chưa có decision (push hay không)
- **R6 (P2):** Combo cross-round Memory Match chưa quyết
- **R7 (P2):** Frame-rate Android cũ chưa có target/test
- **R8 (P3):** Reduced-motion fallback Builder chưa rõ visual

**Không thấy (good):** không có risk security, data, privacy, hoặc accessibility blocker. SRS integration sạch. courseGameStore integration đúng pattern hiện tại.

---

## Revised Priority

### P0 (Blocker `/awf-ready`)
*Không có.* Design đủ tốt để đi tiếp với chỉnh sửa nhỏ.

### P1 (Sửa trước `/awf-code`)
1. **Word Builder submit UX:** đổi sang manual Submit, hoặc tăng delay 1.2s + cancel button
2. **Memory Match timer expire:** thêm flow + AC + state machine transition + UI countdown
3. **Hint scoring API:** chốt cách implement (extend `gameStore.deductPoints` recommend) và update §10 file plan

### P2 (Update design nhanh, có thể vào lúc Foundation phase)
4. **Hint reveal Word Builder:** clarify "slot trống hoặc sai đầu tiên"
5. **SRS push khi hint:** quyết định "có push" và update AC-WB-11
6. **Combo cross-round Memory:** quyết định "giữ cross-round" và note vào design

### P3 (Polish phase / Cleanup)
7. **Reduced-motion Builder shake:** spec rõ flash `#EF4444` 200ms linear
8. **Frame-rate Android cũ:** thêm AC + test manual trong Polish

### Backlog (không thuộc MVP)
9. `getCourseLearningWorkspace` throw safety — issue chung Game Zone, plan riêng

---

## Next Step

- **Recommended:** chỉnh design 3 issue P1 (mất ~10 phút), rồi `/awf-ready` để đi `/awf-code`. Có thể em làm luôn chỉnh design ngay nếu anh đồng ý.
- **Alternative:** chỉnh tất P1+P2 cùng lúc (thêm ~5 phút) để tránh phải edit lại khi code → sạch hơn.
- **Skip:** nếu anh chấp nhận risk, đi thẳng `/awf-code` và để dev decisions (em sẽ implement theo lựa chọn em recommend trong matrix).

Em đề xuất **Alternative**: fix P1 + P2 trong design rồi mới `/awf-ready`. P3 để Polish phase tự lo.

---

## Confidence Notes

- Verdict #1, #2, #3 (P1): **High confidence** — verify được trong code (`gameStore.ts` không có deductPoints, `GameShell` không có timer slot, design §3.2 ghi 300ms rõ ràng).
- Verdict #4, #5, #6: **Medium confidence** — là decision gap chứ không phải lỗi logic; em đã đề xuất default an toàn.
- Verdict #7: **Lower confidence** — chưa đo thật, là risk preventive.

---

Tạo bởi AWF v4.1 /awf-ai
