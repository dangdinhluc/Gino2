# DESIGN: TOKUTEI GINO UI Expansion

Ngày tạo: 2026-05-06
Dựa trên: chưa có `docs/SPECS.md`; bản này dựa trên audit code hiện tại và yêu cầu thiết kế UI/mockdata trước.

---

## 0. Mục tiêu thiết kế

Mục tiêu trước mắt là làm app có cảm giác đầy đủ luồng học, dù dữ liệu vẫn là mockdata.

Nói đơn giản: hiện app giống một trung tâm học đẹp, nhưng nhiều cánh cửa bấm vào chưa mở được. Bản thiết kế này xác định cần thêm những phòng nào, mỗi phòng trông ra sao, và user đi qua các phòng như thế nào.

Ưu tiên:

1. Thiết kế UI trước, dùng mockdata.
2. Không nối backend thật trong phase này.
3. Không nối Gemini/audio thật trong phase này, chỉ tạo khung UI để sau này gắn thật.
4. Tận dụng style hiện có: nền kem, card bo lớn, gradient cam, mascot, micro-interaction bằng `motion`.
5. Mỗi CTA quan trọng nên dẫn tới một màn cụ thể, tránh card tĩnh hoặc alert.

---

## 1. Cách lưu thông tin tạm thời

Trong phase UI/mockdata, app chưa cần database thật. Ta lưu dữ liệu trong các file mock giống như nhiều sheet Excel.

```
┌─────────────────────────────────────────────────────────────┐
│ USER PROFILE                                                │
│ Lưu người học là ai, level nào, streak, XP, mục tiêu ngày.  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LEARNING PATH                                               │
│ Danh sách khóa học, module, bài học, bài nào khóa/mở/xong. │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ LESSON EXERCISES                                            │
│ Câu hỏi trong bài: chọn đáp án, điền từ, nghe, word bank.   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ VOCABULARY + FLASHCARDS                                     │
│ Từ vựng, nghĩa, ví dụ, phát âm, độ nhớ, ngày cần ôn lại.    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ REVIEW SESSIONS                                             │
│ Mỗi phiên ôn: bao nhiêu thẻ, đúng/sai, XP, kết quả cuối.    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ EXAMS                                                       │
│ Đề thi, kỹ năng, câu hỏi, đáp án, timer, kết quả giả lập.  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AI PRACTICE                                                 │
│ Bài writing, phiên speaking, chat tutor, feedback mock.     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COMMUNITY + ACHIEVEMENTS                                    │
│ Bạn bè, tin nhắn, bảng xếp hạng, huy hiệu, thông báo.       │
└─────────────────────────────────────────────────────────────┘
```

Gợi ý tổ chức mockdata sau này:

| Nhóm dữ liệu | File gợi ý | Dùng cho màn |
|---|---|---|
| Hồ sơ học | `src/data/mockProfile.ts` | Dashboard, Profile, Stats |
| Khóa học | `src/data/mockCourses.ts` | Course list/detail, Lesson player |
| Câu hỏi bài học | `src/data/mockExercises.ts` | Lesson player, game shell |
| Đề thi | `src/data/mockExams.ts` | Exam runner, result |
| Thẻ nhớ | `src/data/mockFlashcards.ts` | Review session, vocabulary detail |
| Game | `src/data/mockGames.ts` | Learning hub, game detail |
| AI mock | `src/data/mockAiSessions.ts` | AI chat, writing history, speaking history |
| Cộng đồng | `src/data/mockCommunity.ts` | Friends, messages, leaderboard |

---

## 2. Danh sách màn hình cần bổ sung

### Phase 1: Màn lõi nên làm trước

| # | Màn | Route gợi ý | Mục đích | Vì sao ưu tiên |
|---|---|---|---|---|
| 1 | Lesson Player | `/app/courses/:id/lessons/:lessonId` | Học một bài tương tác | Lõi của app học |
| 2 | Exam Runner | `/app/exams/:id/start` | Làm đề thi có timer | Nút “Làm bài ngay” đang thiếu luồng |
| 3 | Exam Result | `/app/exams/:id/result` | Xem điểm và lỗi sau thi | Làm xong cần feedback |
| 4 | Flashcard SRS Session | `/app/review/flashcards` | Ôn thẻ nhớ tới hạn | Landing quảng cáo SRS nhưng chưa có màn |
| 5 | Game Detail Shell | `/app/hub/:gameId` | Chơi game từ LearningHub | Hub hiện toàn card tĩnh |
| 6 | AI Tutor Chat | `/app/ai-chat` | Chat học gino với AI mock | Dashboard có “Chat gino”, mascot AI chưa mở được |
| 7 | Stats + Achievements | `/app/stats` | Xem tiến độ, huy hiệu, streak | Nút “Xem chi tiết” đang chưa có đích |

### Phase 2: Màn mở rộng

| # | Màn | Route gợi ý | Mục đích |
|---|---|---|---|
| 8 | Onboarding + Placement | `/onboarding` | Chọn mục tiêu, level, lịch học |
| 9 | Friends | `/app/friends` | Bạn học, leaderboard nhỏ |
| 10 | Messages | `/app/messages` | Tin nhắn/mock community |
| 11 | Grammar Topic Detail | `/app/grammar/:id` | Đọc một chủ điểm ngữ pháp |
| 12 | Vocabulary Detail | `/app/vocabulary/:wordId` | Xem chi tiết một từ |
| 13 | Writing History | `/app/ai-lab/history` | Xem các bài viết đã chấm |
| 14 | Speaking History | `/app/ai-speak/history` | Xem phiên nói đã luyện |
| 15 | Markdown Journal | `/app/journal` | Nhật ký luyện viết |
| 16 | Settings Shell | `/app/settings` | Cài đặt app, thông báo, bảo mật, trợ giúp |
| 17 | Terms | `/terms` | Điều khoản |
| 18 | Privacy | `/privacy` | Bảo mật |

---

## 3. Thiết kế chi tiết từng màn Phase 1

### 3.1. Lesson Player

Mục đích: biến “bài học” thành một phiên học thật, không còn alert.

Bố cục:

```
┌─────────────────────────────────────────────────────────────┐
│ Top bar: Back | Lesson title | Hearts | XP                 │
├─────────────────────────────────────────────────────────────┤
│ Progress bar: câu 3/10                                      │
├─────────────────────────────────────────────────────────────┤
│ Prompt card                                                  │
│ "Chọn nghĩa đúng của: die Stadtrundfahrt"                   │
│ [audio button] [hint]                                       │
├─────────────────────────────────────────────────────────────┤
│ Answer area                                                  │
│ [A] tour thành phố                                          │
│ [B] xe đạp                                                  │
│ [C] lễ hội                                                  │
│ [D] bơi lội                                                 │
├─────────────────────────────────────────────────────────────┤
│ Bottom feedback sheet                                        │
│ Đúng/Sai, giải thích ngắn, nút Tiếp tục                     │
└─────────────────────────────────────────────────────────────┘
```

Các dạng câu hỏi mock nên có:

- Chọn đáp án.
- Ghép cặp từ tiếng Nhật - Việt.
- Xếp từ thành câu đúng.
- Điền từ còn thiếu.
- Nghe audio giả lập rồi chọn đáp án.
- Gõ câu ngắn.

Quy tắc UI:

- Sai không làm user sợ: dùng đỏ nhẹ, giải thích rõ.
- Dù sai, progress vẫn tiến nhẹ để user không thấy bị kẹt.
- Kết thúc bài có màn “Lesson Complete”: XP, streak, từ mới học, nút ôn lại.

### 3.2. Exam Runner

Mục đích: tạo cảm giác đang làm đề JFT-Basic/Tokutei thật.

Bố cục desktop:

```
┌─────────────────────────────────────────────────────────────┐
│ Exam top bar: JFT-Basic B1 | Timer 02:45:00 | Nộp bài        │
├───────────────┬─────────────────────────────────────────────┤
│ Skill sidebar │ Question workspace                          │
│ Lesen         │ Đề bài, đoạn văn, câu hỏi                   │
│ Hören         │                                             │
│ Schreiben     │ Answer controls                             │
│ Sprechen      │                                             │
├───────────────┴─────────────────────────────────────────────┤
│ Answer sheet: 1 2 3 4 5 ... trạng thái đã làm/chưa làm      │
└─────────────────────────────────────────────────────────────┘
```

Mobile:

- Top sticky timer.
- Skill switcher dạng tab ngang.
- Answer sheet mở bằng bottom drawer.
- Nút “Nộp bài” cố định dưới cùng.

Mock interaction:

- Chọn đáp án cập nhật answer sheet.
- Câu writing có textarea.
- Speaking có card “ghi âm mock”.
- Hết giờ hiện modal xác nhận nộp.

### 3.3. Exam Result

Mục đích: sau khi nộp bài, user biết mình mạnh/yếu ở đâu.

Bố cục:

- Hero kết quả: tổng điểm, pass/fail mock, thời gian làm.
- 4 card kỹ năng: Lesen, Hören, Schreiben, Sprechen.
- Danh sách lỗi đáng sửa.
- CTA: “Luyện lại phần yếu”, “Xem đáp án”, “Làm đề khác”.

### 3.4. Flashcard SRS Session

Mục đích: tạo phiên ôn thẻ nhớ đúng nghĩa.

Bố cục:

```
┌─────────────────────────────────────────────────────────────┐
│ Review top: 12 thẻ tới hạn | progress 4/12                 │
├─────────────────────────────────────────────────────────────┤
│ Flashcard lớn                                                │
│ Front: "das Brot"                                           │
│ Button: Lật thẻ                                              │
│ Back: nghĩa, ví dụ, phát âm                                  │
├─────────────────────────────────────────────────────────────┤
│ Rating buttons                                               │
│ Quên | Khó | Nhớ | Rất nhớ                                  │
└─────────────────────────────────────────────────────────────┘
```

Quy tắc:

- Trước khi lật thẻ chỉ hiện từ/câu hỏi.
- Sau khi lật mới hiện nghĩa và 4 nút đánh giá.
- Kết thúc phiên: số thẻ nhớ tốt, số thẻ cần ôn lại, XP.

### 3.5. Game Detail Shell

Mục đích: một khung game chung để 13 game trong LearningHub không còn là card tĩnh.

Bắt đầu làm 3 game:

1. Gino Runner: chọn đáp án đúng để mascot chạy tiếp.
2. Nối từ: kéo hoặc bấm ghép cặp tiếng Nhật - Việt.
3. Word Order: xếp từ đúng thứ tự trong câu.

Shell chung:

- Header: tên game, level, điểm, combo.
- Play area: vùng tương tác chính.
- Feedback: đúng/sai, combo, XP.
- Result: điểm, huy hiệu nhỏ, chơi lại.

### 3.6. AI Tutor Chat

Mục đích: mascot AI có nơi để user hỏi bài, dù câu trả lời đang mock.

Bố cục:

- Sidebar nhỏ: chủ đề nhanh “Sửa câu”, “Giải thích ngữ pháp”, “Luyện hội thoại”.
- Chat area: bubble user/AI.
- Prompt chips: câu hỏi mẫu.
- Input box sticky bottom.
- Card “AI đang nghĩ” bằng animation.

Mock behavior:

- User gửi câu bất kỳ.
- App trả một trong vài câu feedback mock theo intent.
- Có nút “Lưu vào thư viện” nhưng phase đầu chỉ toast/mock.

### 3.7. Stats + Achievements

Mục đích: biến XP/streak/huy hiệu thành động lực rõ ràng.

Bố cục:

- Hero: streak, XP, level progress.
- Calendar heatmap 30 ngày.
- Skill radar hoặc 4 thanh kỹ năng: vocab, grammar, listening, speaking.
- Achievements grid: locked/unlocked badges.
- Weekly summary: ngày nào học gì.

---

## 4. Luồng hoạt động chính

### Luồng 1: Học một bài

1. User vào Course Detail.
2. Bấm bài học đang mở.
3. App mở Lesson Player.
4. User làm 8-10 câu tương tác.
5. Mỗi câu có feedback ngay.
6. Kết thúc thấy XP, từ mới, streak.
7. User chọn học tiếp hoặc ôn lại.

### Luồng 2: Làm đề thi

1. User vào Exam Center.
2. Bấm “Làm bài ngay”.
3. App mở Exam Runner.
4. User chuyển qua 4 kỹ năng.
5. User nộp bài hoặc hết giờ.
6. App mở Exam Result.
7. User chọn luyện lại phần yếu.

### Luồng 3: Ôn thẻ nhớ

1. User vào Review Center.
2. Bấm “Thẻ nhớ tới hạn”.
3. App mở Flashcard Session.
4. User lật từng thẻ và tự đánh giá.
5. App hiện tổng kết phiên ôn.
6. User quay lại Review Center.

### Luồng 4: Chơi game

1. User vào LearningHub.
2. Chọn một game.
3. App mở Game Detail Shell.
4. User chơi 60-90 giây.
5. App hiện điểm, combo, XP.
6. User chơi lại hoặc về Hub.

### Luồng 5: Hỏi AI tutor

1. User bấm mascot AI hoặc “Chat gino”.
2. App mở AI Tutor Chat.
3. User chọn prompt hoặc nhập câu.
4. AI trả feedback mock.
5. User có thể lưu câu vào thư viện.

---

## 5. Checklist kiểm tra hoàn thành

### Lesson Player

- [ ] Bấm lesson mở màn học, không còn alert.
- [ ] Có progress câu hỏi.
- [ ] Có ít nhất 4 dạng exercise mock.
- [ ] Chọn đúng/sai hiện feedback rõ.
- [ ] Kết thúc bài hiện Lesson Complete.
- [ ] Hoạt động tốt trên mobile.

### Exam Runner + Result

- [ ] Bấm “Làm bài ngay” mở runner.
- [ ] Timer hiển thị rõ.
- [ ] Chuyển được giữa 4 kỹ năng.
- [ ] Chọn đáp án cập nhật answer sheet.
- [ ] Nộp bài mở result.
- [ ] Result hiển thị điểm từng kỹ năng.

### Flashcard SRS

- [ ] Có danh sách thẻ tới hạn từ mockdata.
- [ ] Lật thẻ được.
- [ ] Chấm mức nhớ được: Quên/Khó/Nhớ/Rất nhớ.
- [ ] Progress tăng sau mỗi thẻ.
- [ ] Kết thúc phiên có summary.

### Game Detail

- [ ] LearningHub card mở route game detail.
- [ ] Ít nhất 3 game có UI riêng.
- [ ] Có điểm/combo/progress.
- [ ] Có result screen sau lượt chơi.

### AI Tutor Chat

- [ ] Mascot hoặc CTA mở chat.
- [ ] Gửi message được.
- [ ] AI trả lời mock theo prompt.
- [ ] Có prompt chips.
- [ ] Layout không vỡ trên mobile.

### Stats + Achievements

- [ ] Nút “Xem chi tiết” mở `/app/stats`.
- [ ] Có streak calendar.
- [ ] Có XP/level progress.
- [ ] Có badge locked/unlocked.
- [ ] Có weekly summary mock.

---

## 6. Test cases thiết kế trước

### TC-01: Mở bài học từ Course Detail

Given: User đang ở màn chi tiết khóa học và có bài học chưa khóa.
When: User bấm bài học.
Then: App mở Lesson Player đúng lesson, không hiện alert.

### TC-02: Trả lời đúng trong Lesson Player

Given: User đang ở câu hỏi chọn đáp án.
When: User chọn đáp án đúng.
Then: Feedback hiện trạng thái đúng, progress tăng, nút tiếp tục xuất hiện.

### TC-03: Trả lời sai trong Lesson Player

Given: User đang ở câu hỏi chọn đáp án.
When: User chọn đáp án sai.
Then: Feedback hiện đáp án đúng và giải thích ngắn, progress vẫn có thể tiếp tục.

### TC-04: Hoàn thành bài học

Given: User đã làm tới câu cuối.
When: User bấm tiếp tục sau câu cuối.
Then: App hiện màn Lesson Complete với XP, streak và CTA học tiếp.

### TC-05: Mở Exam Runner

Given: User đang ở Exam Center.
When: User bấm “Làm bài ngay”.
Then: App mở Exam Runner với timer, kỹ năng và answer sheet.

### TC-06: Nộp bài thi

Given: User đang ở Exam Runner.
When: User bấm “Nộp bài” và xác nhận.
Then: App mở Exam Result với điểm tổng và điểm từng kỹ năng.

### TC-07: Ôn flashcard bình thường

Given: User có thẻ tới hạn.
When: User mở Flashcard Session, lật thẻ và chọn “Nhớ”.
Then: Thẻ tiếp theo xuất hiện, progress tăng.

### TC-08: Kết thúc flashcard session

Given: User đã đánh giá hết thẻ trong phiên.
When: Phiên kết thúc.
Then: App hiện summary số thẻ nhớ tốt, số thẻ cần ôn lại và XP.

### TC-09: Chơi game từ LearningHub

Given: User đang ở LearningHub.
When: User bấm “Gino Runner”.
Then: App mở màn game detail có điểm, câu hỏi và vùng chơi.

### TC-10: Chat AI mock

Given: User đang ở AI Tutor Chat.
When: User gửi “Giải thích weil cho em”.
Then: App thêm bubble user và bubble AI mock trả lời về câu phụ với `weil`.

### TC-11: Mở Stats detail

Given: User đang ở Dashboard hoặc RightSidebar.
When: User bấm “Xem chi tiết”.
Then: App mở `/app/stats` với streak, XP, achievements.

### TC-12: Mobile layout

Given: User dùng màn hình nhỏ.
When: User mở Lesson Player, Exam Runner, Flashcard Session.
Then: Header sticky, CTA dưới cùng và nội dung không tràn ngang.

---

## 7. Mảnh ghép giao diện nên tái dùng

Mảnh ghép giao diện nghĩa là một phần nhỏ của UI dùng lại nhiều nơi, ví dụ card, nút, header.

| Mảnh ghép | Dùng ở đâu | Vai trò |
|---|---|---|
| PageHero | Các trang list/detail | Tiêu đề, mô tả, stats |
| StatCard | Dashboard, Stats, Profile | Hiển thị chỉ số |
| SessionShell | Lesson, Flashcard, Game | Khung phiên học |
| ProgressHeader | Lesson, Exam, Game | Back, title, progress, timer |
| ChoiceCard | Lesson, Exam, Game | Đáp án chọn |
| FeedbackSheet | Lesson, Game | Báo đúng/sai và giải thích |
| ResultSummary | Lesson, Exam, Game, Review | Tổng kết cuối phiên |
| EmptyState | Search/list rỗng | Trạng thái chưa có dữ liệu |
| MockAudioButton | Lesson, Vocab, Speaking | Nút nghe giả lập |
| MascotPrompt | AI/chat/onboarding | Gợi ý từ mascot |

---

## 8. Thứ tự build đề xuất

### Phase 1A: Nối route và shell

1. Tạo routes mới trong `src/App.tsx`.
2. Tạo file page rỗng nhưng đúng layout.
3. Sửa CTA đang dead-end để mở route thật.

### Phase 1B: Lesson + Flashcard

1. Lesson Player.
2. Flashcard SRS Session.
3. Lesson Complete / Review Complete.

### Phase 1C: Exam

1. Exam Runner.
2. Exam Result.
3. Link từ Exam Center.

### Phase 1D: Hub + AI + Stats

1. Game Detail Shell.
2. AI Tutor Chat.
3. Stats + Achievements.

### Phase 2

1. Onboarding.
2. Friends/Messages.
3. Grammar/Vocab detail.
4. Journal.
5. Settings/Help/Terms/Privacy.

---

## 9. Course Learning Workspace

Route: `/app/courses/:id/learn`

Mục tiêu: biến màn học khóa học thành “bàn học chuyên nghiệp” của riêng khóa đó. Mọi phần trong màn này phải lấy từ dữ liệu của khóa đang mở, không dùng hub chung nếu không liên quan khóa.

Nói đơn giản: khi anh mở một khóa, app phải giống như mở một lớp học riêng. Trong lớp đó có từ vựng, câu hỏi ôn tập, tài liệu, game, đề thi và podcast của chính khóa đó.

### 9.1. Cách lưu thông tin của workspace

```
┌─────────────────────────────────────────────────────────────┐
│ COURSE                                                      │
│ Tên khóa, level, tiến độ, chương hiện tại.                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ COURSE VOCABULARY                                           │
│ Từ vựng trọng tâm của khóa: nghĩa, ví dụ, phát âm, trạng thái.│
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ COURSE REVIEW QUESTIONS                                     │
│ Câu hỏi trắc nghiệm tạo từ từ vựng/ngữ pháp của khóa.       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COURSE DOCUMENTS                                            │
│ PDF, bài đăng, ghi chú, transcript, worksheet.              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COURSE GAMES                                                │
│ Game được tạo từ dữ liệu khóa: ghép từ, chọn nghĩa, xếp câu.│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COURSE EXAMS                                                │
│ Đề thi thử thuộc khóa đó: mock test, mini test, lịch sử điểm.│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ COURSE PODCASTS                                             │
│ Audio/podcast của khóa, mở bằng nút tai nghe nổi.           │
└─────────────────────────────────────────────────────────────┘
```

Mock shape đề xuất:

| Nhóm | Field chính | Ví dụ |
|---|---|---|
| Course | `id`, `title`, `level`, `progress`, `currentModule` | `course-a1`, `Gino A1`, `A1`, `42` |
| Vocabulary | `id`, `word`, `article`, `meaning`, `example`, `status` | `brot`, `das Brot`, `bánh mì`, `learning` |
| Review question | `id`, `type`, `prompt`, `options`, `answer`, `explanation` | trắc nghiệm chọn nghĩa |
| Document | `id`, `title`, `kind`, `size`, `publishedAt`, `readTime` | `PDF`, `2026-05-06` |
| Game | `id`, `title`, `source`, `rounds`, `bestScore` | tạo từ bộ từ vựng chương 1 |
| Exam | `id`, `title`, `skills`, `duration`, `status` | JFT-Basic A1 Mini Test |
| Podcast | `id`, `title`, `duration`, `episode`, `isNew` | Episode 01, `05:30` |

### 9.2. Bố cục màn hình

Desktop:

```
┌─────────────────────────────────────────────────────────────┐
│ Course header                                                │
│ Back | Gino A1 | progress | streak | CTA tiếp tục từ vựng   │
└─────────────────────────────────────────────────────────────┘

┌───────────────┬─────────────────────────────────┬───────────┐
│ Left nav      │ Main workspace                  │ Right rail │
│               │                                 │            │
│ Từ vựng       │ Tab content đang chọn           │ Hôm nay    │
│ Ôn tập        │                                 │ Mục tiêu   │
│ Tài liệu      │                                 │ AI gợi ý   │
│ Game          │                                 │ Tiến độ    │
│ Thi thử       │                                 │            │
└───────────────┴─────────────────────────────────┴───────────┘

                         Floating podcast button
```

Mobile:

```
┌─────────────────────────────────────────────────────────────┐
│ Sticky course header                                        │
├─────────────────────────────────────────────────────────────┤
│ Horizontal tabs: Từ vựng | Ôn tập | Tài liệu | Game | Thi  │
├─────────────────────────────────────────────────────────────┤
│ Nội dung tab                                                │
└─────────────────────────────────────────────────────────────┘

                    Nút tai nghe nổi góc dưới
```

Nguyên tắc layout:

- Tab mặc định là `Từ vựng`, vì đây là trọng tâm học chính của khóa.
- Desktop có left nav để cảm giác giống workspace chuyên nghiệp.
- Mobile dùng tab ngang để không chiếm chiều ngang.
- Right rail chỉ là gợi ý phụ: mục tiêu hôm nay, tiến độ, từ đang yếu, đề xuất tiếp theo.
- Podcast luôn nổi trên mọi tab, nhưng phải chừa khoảng cách để không che bottom nav.

### 9.3. Tab Từ vựng

Mục đích: user vào khóa là thấy ngay mình cần học từ nào.

Nội dung chính:

- Hero nhỏ: số từ trong khóa, số từ đã nhớ, số từ cần ôn.
- Bộ lọc: `Tất cả`, `Đang học`, `Cần ôn`, `Đã nhớ`.
- Danh sách vocabulary card:
  - Từ tiếng Nhật (romaji).
  - Nghĩa tiếng Việt.
  - Ví dụ ngắn.
  - Nút nghe phát âm mock.
  - Trạng thái học.
  - CTA `Học từ này` hoặc `Ôn lại`.
- Mini panel “Từ cần ưu tiên hôm nay”.

Interaction mock:

- Bấm vocabulary card mở preview ngay trong workspace.
- Bấm nghe đổi trạng thái icon trong 1-2 giây.
- Bấm `Đã nhớ` cập nhật local state mock.

### 9.4. Tab Ôn tập

Mục đích: ôn tập bằng câu hỏi trắc nghiệm, không phải flashcard chung.

Nội dung chính:

- Card bắt đầu: `10 câu từ chương hiện tại`.
- Câu hỏi MCQ:
  - Prompt.
  - 4 đáp án.
  - Feedback đúng/sai.
  - Giải thích ngắn.
- Summary cuối phiên:
  - Số câu đúng.
  - Từ sai nhiều.
  - CTA quay lại học từ vựng.

Quy tắc:

- Ôn tập trong workspace này chỉ là trắc nghiệm.
- Câu hỏi phải ghi rõ nguồn: từ vựng/ngữ pháp của khóa hiện tại.
- Sai thì giải thích nhẹ, không làm user thấy bị phạt.

### 9.5. Tab Tài liệu

Mục đích: gom tài liệu khóa học thành thư viện nhỏ.

Nội dung chính:

- Nhóm `PDF / Worksheet`:
  - Tên tài liệu.
  - Dung lượng mock.
  - Ngày đăng `YYYY-MM-DD`.
  - CTA `Xem tài liệu`.
- Nhóm `Bài đăng / Ghi chú`:
  - Tiêu đề.
  - Thời gian đọc.
  - Tag chương học.
  - CTA `Đọc bài`.
- Preview panel:
  - PDF mock hiển thị thumbnail dạng giấy.
  - Post mock hiển thị đoạn mở đầu.

Interaction mock:

- Bấm PDF mở panel preview trong màn.
- Bấm bài đăng đổi panel sang nội dung article.
- Chưa cần download thật.

### 9.6. Tab Game

Mục đích: game được tạo từ dữ liệu khóa, không phải game chung chung.

Game đề xuất cho phase đầu:

| Game | Nguồn dữ liệu | Cách chơi |
|---|---|---|
| Vocabulary Sprint | Từ vựng khóa | Chọn nghĩa đúng trong thời gian ngắn |
| Article Match | Danh từ có giống từ | Ghép `der/die/das` với từ đúng |
| Sentence Builder | Ví dụ trong khóa | Xếp từ thành câu đúng |
| Listening Pick | Audio mock của từ | Nghe và chọn từ đúng |

Card game cần hiển thị:

- “Tạo từ dữ liệu khóa này”.
- Số vòng chơi.
- Best score mock.
- CTA `Chơi ngay`.

### 9.7. Tab Thi thử

Mục đích: chỉ hiện đề thi thuộc khóa đang mở.

Nội dung chính:

- Danh sách mock exams của khóa.
- Mỗi exam card:
  - Tên đề.
  - Kỹ năng: Lesen, Hören, Schreiben, Sprechen.
  - Thời lượng.
  - Trạng thái: chưa làm, đang làm, đã xong.
  - Điểm gần nhất nếu có.
  - CTA `Làm đề` hoặc `Xem kết quả`.

Quy tắc:

- Không trộn đề của khóa khác.
- Nếu khóa chưa có đề, hiện empty state thân thiện và gợi ý học từ vựng trước.

### 9.8. Podcast nổi

Mục đích: podcast luôn sẵn sàng như một “tai nghe học kèm”, không bị chôn trong tab.

Bố cục:

- Button nổi góc phải dưới: icon tai nghe + chấm trạng thái.
- Popover khi bấm:
  - Episode đang chọn.
  - Nút play/pause mock.
  - Progress bar mock.
  - Danh sách episode của khóa.
  - CTA `Nghe tiếp bài này`.

Quy tắc:

- Button luôn hiển thị ở mọi tab của workspace.
- Popover đóng/mở bằng local state.
- Mobile phải đặt cao hơn bottom nav.
- Chưa nối audio thật trong phase UI.

### 9.9. Luồng hoạt động chính

Luồng 1: Học từ vựng trong khóa

1. User mở `/app/courses/:id/learn`.
2. App mở tab `Từ vựng`.
3. User chọn một từ cần học.
4. Workspace hiện nghĩa, ví dụ, trạng thái và nút nghe mock.
5. User đánh dấu đã nhớ hoặc chuyển sang ôn tập.

Luồng 2: Ôn tập trắc nghiệm

1. User chuyển sang tab `Ôn tập`.
2. User bấm bắt đầu phiên 10 câu.
3. User chọn đáp án MCQ.
4. App hiện đúng/sai và giải thích.
5. Kết thúc phiên, app gợi ý quay lại các từ sai.

Luồng 3: Xem tài liệu

1. User mở tab `Tài liệu`.
2. User chọn PDF hoặc bài đăng.
3. Workspace mở preview trong màn.
4. User quay lại danh sách hoặc mở tài liệu khác.

Luồng 4: Chơi game từ khóa

1. User mở tab `Game`.
2. User chọn game có nhãn “tạo từ dữ liệu khóa này”.
3. App mở game shell hoặc panel chơi mock.
4. Kết thúc hiển thị điểm và CTA ôn lại từ liên quan.

Luồng 5: Thi thử trong khóa

1. User mở tab `Thi thử`.
2. User chọn đề thuộc khóa.
3. App mở exam runner hiện có hoặc route exam tương ứng.
4. Sau khi làm, user xem result và quay lại workspace.

Luồng 6: Nghe podcast nổi

1. User đang ở bất kỳ tab nào.
2. User bấm nút tai nghe nổi.
3. Popover mở danh sách episode của khóa.
4. User play/pause mock hoặc đổi episode.
5. Popover đóng nhưng button vẫn còn.

### 9.10. Checklist kiểm tra hoàn thành

- [ ] `/app/courses/:id/learn` không còn là Course Detail kéo dài, mà là workspace riêng.
- [ ] Tab mặc định là Từ vựng.
- [ ] Từ vựng lấy từ mockdata của khóa hiện tại.
- [ ] Ôn tập là câu hỏi trắc nghiệm, có đúng/sai và giải thích.
- [ ] Tài liệu tách PDF và bài đăng.
- [ ] Game hiển thị rõ nguồn “tạo từ dữ liệu khóa này”.
- [ ] Thi thử chỉ hiện đề thuộc khóa hiện tại.
- [ ] Nút podcast nổi luôn hiển thị trên mọi tab.
- [ ] Podcast popover đổi được episode và trạng thái play/pause mock.
- [ ] Mobile không bị che bottom nav.
- [ ] Mọi CTA chính có hành động hoặc route thật.

### 9.11. Test cases thiết kế trước

#### TC-CW-01: Mở workspace từ Course Detail

Given: User đang ở Course Detail.
When: User bấm `Bắt đầu học` hoặc mở `/app/courses/:id/learn`.
Then: App mở Course Learning Workspace với tab `Từ vựng` mặc định.

#### TC-CW-02: Học từ vựng

Given: User đang ở tab `Từ vựng`.
When: User bấm một vocabulary card.
Then: Workspace hiện nghĩa, ví dụ, trạng thái và CTA học/ôn từ đó.

#### TC-CW-03: Làm câu hỏi trắc nghiệm

Given: User đang ở tab `Ôn tập`.
When: User chọn một đáp án MCQ.
Then: App hiện đúng/sai, giải thích và nút sang câu tiếp theo.

#### TC-CW-04: Xem PDF

Given: User đang ở tab `Tài liệu`.
When: User bấm tài liệu loại PDF.
Then: Preview panel hiển thị dạng PDF mock, tiêu đề, ngày đăng và CTA xem.

#### TC-CW-05: Đọc bài đăng

Given: User đang ở tab `Tài liệu`.
When: User bấm tài liệu loại bài đăng.
Then: Preview panel hiển thị nội dung article mock và thời gian đọc.

#### TC-CW-06: Chơi game từ dữ liệu khóa

Given: User đang ở tab `Game`.
When: User bấm `Chơi ngay` trên một game.
Then: Game hiển thị nguồn dữ liệu của khóa và trạng thái chơi mock.

#### TC-CW-07: Làm đề thi của khóa

Given: User đang ở tab `Thi thử`.
When: User bấm một đề thi.
Then: App mở đề thuộc khóa hiện tại hoặc route exam tương ứng.

#### TC-CW-08: Mở podcast nổi

Given: User đang ở bất kỳ tab nào trong workspace.
When: User bấm nút tai nghe nổi.
Then: Popover mở, hiển thị episode của khóa và nút play/pause mock.

#### TC-CW-09: Podcast không che UI mobile

Given: User dùng màn hình nhỏ.
When: User mở workspace và bật podcast popover.
Then: Popover không che bottom nav và vẫn có thể đóng được.

### 9.12. Pattern mobile header chung cho các trang app

Vấn đề hiện tại: nhiều trang đang lấy hero desktop rồi co xuống mobile. Trên điện thoại, phần đầu bị cao, nhiều chữ, nhiều trang trí, CTA chen nhau nên cảm giác nặng và kém chuyên nghiệp.

Nguyên tắc mới: mobile không phải là desktop thu nhỏ. Mobile cần một phần đầu riêng, gọn như app thật.

#### Công thức mobile header chuẩn

```
┌─────────────────────────────────────────┐
│ Sticky header                           │
│ Back/Menu | Tiêu đề ngắn       Action   │
├─────────────────────────────────────────┤
│ Progress / Summary card                 │
│ 1 câu mục tiêu + progress bar + 2 chỉ số│
├─────────────────────────────────────────┤
│ Tabs ngang / filter chips               │
├─────────────────────────────────────────┤
│ Nội dung chính                          │
└─────────────────────────────────────────┘
```

Quy tắc áp dụng:

- Header mobile cao khoảng 56-72px, sticky trên cùng, nền kem/blur nhẹ.
- Tiêu đề chỉ 1 dòng, ví dụ `Gino A1`, `Ôn tập`, `Làm đề A1`; mô tả dài không đặt trong header.
- Chỉ giữ 1 action chính ở góc phải: podcast, search, timer hoặc settings tùy màn.
- Hero desktop, ảnh trang trí, mascot lớn, gradient lớn phải ẩn hoặc chuyển xuống dưới trên mobile.
- Thẻ tổng quan mobile chỉ nên có 1 card gọn: mục tiêu hôm nay, progress bar, 2-3 chỉ số nhỏ.
- Tabs ngang nằm ngay dưới summary card; nếu nhiều tab thì scroll ngang, không xuống 2 dòng.
- Nội dung chính bắt đầu sớm trong màn hình đầu tiên; user không phải kéo qua một hero dài mới thấy bài học.
- Nút nổi phải tránh bottom nav và tránh đè nhau: podcast, AI tutor, CTA cố định phải có thứ tự z-index/vị trí rõ.

#### Course Learning Workspace trên mobile

Mobile của `/app/courses/:id/learn` nên đổi từ hero lớn thành cấu trúc này:

```
┌─────────────────────────────────────────┐
│ ←  Gino A1                         🎧   │
│    Chương 1 · 42%                       │
├─────────────────────────────────────────┤
│ Từ vựng hôm nay                         │
│ ███████░░░  42%                         │
│ 2 cần ôn · 48 từ · 15 phút              │
│ [Tiếp tục học từ]                       │
├─────────────────────────────────────────┤
│ Từ vựng | Ôn tập | Tài liệu | Game | Thi│
├─────────────────────────────────────────┤
│ Danh sách từ / câu hỏi / tài liệu...    │
└─────────────────────────────────────────┘

                      🎧 Podcast nổi
```

Điều chỉnh cụ thể cho phần đầu Course Learning:

- Ẩn desktop hero lớn trên mobile: không dùng heading `Bàn học của khóa hôm nay` cỡ lớn ở màn nhỏ.
- Header mobile hiển thị: nút quay lại, tên khóa rút gọn, chương hiện tại rút gọn, icon podcast.
- Card tiến độ mobile hiển thị: trọng tâm `Từ vựng hôm nay`, progress, số từ cần ôn, tổng từ, mục tiêu phút.
- CTA mobile chỉ ưu tiên `Tiếp tục học từ`; CTA `Ôn trắc nghiệm` đưa xuống tab hoặc card phụ.
- Right rail desktop không hiện ở mobile; các gợi ý hôm nay đưa vào summary card hoặc cuối tab.
- Tab ngang sticky nhẹ sau summary card để user đổi mode nhanh.
- Podcast nổi đặt cao hơn bottom nav và không bị AI tutor che.

#### Pattern áp dụng cho các trang khác

| Màn | Header mobile nên giữ | Phần nên bỏ khỏi đầu mobile |
|---|---|---|
| Dashboard | Lời chào ngắn, streak, CTA học tiếp | Hero marketing lớn, quá nhiều card thống kê đầu trang |
| Course Detail | Back, tên khóa, progress, CTA bắt đầu học | Mô tả dài và banner lớn |
| Course Learning | Back, tên khóa, chương, podcast | Desktop hero `Bàn học...` và right rail |
| Lesson Player | Back, lesson title, progress câu, hearts/XP | Bất kỳ card giới thiệu dài trước câu hỏi |
| Exam Runner | Back, tên đề, timer, nộp bài | Sidebar kỹ năng desktop |
| Review Center | Tiêu đề, số thẻ/câu tới hạn, CTA ôn ngay | Dashboard thống kê dài trước nội dung ôn |

#### Checklist mobile header hoàn thành

- [ ] Ở màn 375px, phần đầu không chiếm quá nửa màn hình trước khi thấy nội dung chính.
- [ ] Không có chữ bị tràn hoặc title xuống quá 2 dòng.
- [ ] Không có horizontal scroll toàn trang; chỉ tabs/chips được scroll ngang.
- [ ] CTA chính bấm được bằng ngón tay, vùng chạm tối thiểu khoảng 44px.
- [ ] Bottom nav, AI tutor, podcast và CTA nổi không đè nhau.
- [ ] Khi scroll, header/tabs vẫn giúp user biết đang ở màn nào.
- [ ] Desktop vẫn giữ hero đẹp, không bị đơn giản hóa theo mobile.

#### Test cases mobile header

##### TC-MH-01: Mobile Course Learning nhìn gọn

Given: User mở `/app/courses/course-1/learn` ở viewport 375px.
When: Trang load xong.
Then: User thấy header gọn, card tiến độ và tab `Từ vựng` trong màn đầu tiên, không bị hero desktop đẩy nội dung xuống quá sâu.

##### TC-MH-02: Tabs ngang không vỡ layout

Given: User ở mobile Course Learning.
When: User kéo thanh tabs ngang.
Then: Tabs cuộn ngang mượt, không làm toàn trang bị horizontal scroll.

##### TC-MH-03: Nút nổi không đè nhau

Given: User ở mobile Course Learning.
When: User mở podcast nổi và nhìn bottom nav/AI tutor.
Then: Podcast bấm được, popover đóng được, không che bottom nav.

##### TC-MH-04: Desktop không bị mất hero

Given: User mở Course Learning ở desktop.
When: Trang load xong.
Then: Desktop vẫn có hero/workspace đầy đủ, right rail và bố cục chuyên nghiệp.

### 9.13. Mobile Learning App Blueprint cho Course Workspace

Mục tiêu mới: màn học trên điện thoại phải giống một app học tập thật. User mở vào là biết ngay hôm nay học gì, bấm một tay được, không bị ngợp bởi hero lớn hoặc nhiều card trang trí.

#### Nguyên lý 4 tầng trên mobile

```
┌─────────────────────────────────────────┐
│ 1. Định hướng: Anh đang ở khóa nào?     │
├─────────────────────────────────────────┤
│ 2. Nhiệm vụ hôm nay: Học gì trước?      │
├─────────────────────────────────────────┤
│ 3. Chọn mode: Từ vựng / Ôn / Tài liệu… │
├─────────────────────────────────────────┤
│ 4. Hành động học: 1 card, 1 việc chính  │
└─────────────────────────────────────────┘
```

Giải thích đời thường: mobile giống bàn học nhỏ. Trên bàn chỉ nên để quyển đang học, bút và đồng hồ. Những thứ phụ như tài liệu, game, đề thi vẫn có nhưng nằm trong tab riêng, không chen vào phần đầu.

#### Layout chuẩn trên điện thoại

```
┌─────────────────────────────────────────┐
│ ← Gino A1                         🎧   │  sticky, 56-64px
│ Chương 1 · 42% · 15 phút hôm nay        │
├─────────────────────────────────────────┤
│  NHIỆM VỤ HÔM NAY                       │
│  Học chắc 6 từ cần ôn                   │
│  ██████░░░░ 42%                         │
│  [Học từ tiếp]                          │
├─────────────────────────────────────────┤
│ Từ vựng | Ôn tập | Tài liệu | Game | Thi│  sticky sau khi scroll
├─────────────────────────────────────────┤
│                                         │
│  Card học chính                         │
│  Một màn chỉ ưu tiên một hành động      │
│                                         │
└─────────────────────────────────────────┘

                         🎧 Podcast mini nổi
```

#### Quy tắc hiệu quả học trên mobile

- Mỗi tab chỉ có 1 hành động chính nổi bật. Ví dụ tab `Từ vựng` là `Nghe / Nhớ từ`, tab `Ôn tập` là `Chọn đáp án`, tab `Thi thử` là `Làm đề`.
- Nội dung ưu tiên dạng card dọc, không chia nhiều cột trên mobile.
- Mỗi card cao vừa phải để user thấy được ít nhất 1-2 mục tiếp theo, tránh cảm giác màn bị khóa bởi một thẻ quá lớn.
- Dữ liệu phụ đưa vào dòng nhỏ hoặc accordion/collapse, không đặt hết lên mặt card.
- Sau mỗi hành động học nên có phản hồi ngay: đúng/sai, đã nghe, đã nhớ, hoặc điểm mini.
- Nút podcast luôn nổi nhưng là mini control, không cạnh tranh với CTA học chính.
- Bottom nav vẫn là điều hướng app; tabs trong workspace là điều hướng trong khóa học.

#### Thiết kế từng tab trên mobile

##### Tab 1: Từ vựng

Mục tiêu: user học từ mới/cần ôn nhanh nhất.

```
┌─────────────────────────────────────────┐
│ Từ cần ôn hôm nay: 6                    │
│ [Cần ôn] [Đang học] [Từ mới] [Đã nhớ]  │
├─────────────────────────────────────────┤
│ der Beruf                         🔊   │
│ nghề nghiệp                             │
│ Ich lerne einen Beruf.                  │
│ [Khó nhớ] [Đã nhớ]                      │
├─────────────────────────────────────────┤
│ das Brot                          🔊   │
│ bánh mì                                 │
└─────────────────────────────────────────┘
```

Quy tắc:

- Card từ vựng là trung tâm của tab này.
- Nút nghe phải nằm bên phải, dễ bấm bằng ngón cái.
- Filter chip cuộn ngang, không xuống dòng.
- Preview từ đang học trên desktop có thể là side card; mobile nên chuyển thành card inline hoặc bottom sheet nhẹ.

##### Tab 2: Ôn tập trắc nghiệm

Mục tiêu: luyện phản xạ bằng câu hỏi ngắn.

```
┌─────────────────────────────────────────┐
│ Câu 1/10 · Từ vựng chương 1             │
│ “das Brot” nghĩa là gì?                 │
├─────────────────────────────────────────┤
│ ○ bánh mì                               │
│ ○ gia đình                              │
│ ○ kỳ thi                                │
│ ○ chào buổi ngày                        │
├─────────────────────────────────────────┤
│ Feedback đúng/sai + giải thích ngắn     │
│ [Câu tiếp theo]                         │
└─────────────────────────────────────────┘
```

Quy tắc:

- Option là hàng dọc 44px+, không dùng grid 2 cột trên mobile nếu câu dài.
- Khi chọn đáp án phải hiện chữ rõ: `Bạn chọn đúng`, `Bạn đã chọn`, `Đáp án đúng` — không chỉ đổi màu.
- Feedback chỉ 1-2 câu, tránh giải thích dài như bài giảng.
- Phím mũi tên và screen reader phải hiểu đây là một nhóm đáp án.

##### Tab 3: Tài liệu

Mục tiêu: xem PDF/bài đăng của khóa mà không làm rối màn học.

```
┌─────────────────────────────────────────┐
│ Tài liệu khóa này                       │
├─────────────────────────────────────────┤
│ 📄 Workbook Chương 1        PDF · 12p   │
│ Từ vựng + bài tập chào hỏi              │
│ [Mở xem]                                │
├─────────────────────────────────────────┤
│ 📝 Cách dùng Guten Tag       Bài đăng   │
│ [Đọc nhanh]                             │
└─────────────────────────────────────────┘
```

Quy tắc:

- Mobile không cần preview PDF lớn ở đầu; chỉ cần danh sách tài liệu rõ và nút mở.
- Metadata quan trọng: loại tài liệu, thời lượng đọc, kích thước/số trang.
- Nếu mở PDF thật sau này, dùng full-screen reader hoặc bottom sheet lớn, không nhét PDF vào card nhỏ.

##### Tab 4: Game

Mục tiêu: game là cách luyện vui từ dữ liệu khóa, không biến thành hub game chung.

```
┌─────────────────────────────────────────┐
│ Game từ khóa Gino A1                    │
├─────────────────────────────────────────┤
│ Vocabulary Sprint                       │
│ 5 vòng · từ chương 1                    │
│ Best 82%                    [Chơi]      │
├─────────────────────────────────────────┤
│ Article Match                           │
│ der/die/das              [Chơi]         │
└─────────────────────────────────────────┘
```

Quy tắc:

- Card game cần nói rõ game lấy dữ liệu từ đâu: `từ chương 1`, `mạo từ A1`, `câu nghe`.
- CTA `Chơi` rõ, không cần hero gradient lớn trên mobile.
- Điểm/best score là phụ, nằm bên dưới hoặc bên phải.

##### Tab 5: Thi thử

Mục tiêu: đề thi thuộc khóa hiện tại, dễ bắt đầu và biết trạng thái.

```
┌─────────────────────────────────────────┐
│ Đề thi của khóa                         │
├─────────────────────────────────────────┤
│ A1 Mini Test · 15 phút                  │
│ Nghe · Đọc · Từ vựng                    │
│ Sẵn sàng                    [Làm đề]    │
├─────────────────────────────────────────┤
│ Full Mock A1 · 60 phút                  │
│ Đã làm: 74%                 [Xem lại]   │
└─────────────────────────────────────────┘
```

Quy tắc:

- Luôn hiển thị thời lượng và kỹ năng kiểm tra.
- Nếu đã làm, ưu tiên `Xem kết quả` hoặc `Làm lại`.
- Mobile không nên dùng layout hai cột cho score + CTA nếu làm nút bị nhỏ.

##### Podcast nổi

Mục tiêu: user có thể nghe trong khi đang ở bất kỳ tab nào.

```
             🎧 Podcast
┌─────────────────────────────────────────┐
│ Episode 02: Gia đình và nơi ở       X   │
│ ▶  Tóm tắt nội dung                     │
│ █████░░░  33%                           │
│ Episode 01                              │
│ Episode 02                         Mới  │
└─────────────────────────────────────────┘
```

Quy tắc:

- Nút nổi đặt cao hơn bottom nav và lệch khỏi AI tutor.
- Khi mở, popover không che nút đóng và không bị khuất bởi bottom nav.
- Podcast là hỗ trợ học, không phải modal bắt buộc; user vẫn phải quay lại học chính dễ dàng.

#### Thứ tự ưu tiên trên mobile

| Mức ưu tiên | Thành phần | Lý do |
|---|---|---|
| 1 | Header + nhiệm vụ hôm nay | User biết ngay đang học gì |
| 2 | Tab `Từ vựng` | Đây là mục tiêu học chính của khóa |
| 3 | Ôn tập MCQ | Luyện phản xạ sau khi học từ |
| 4 | Podcast mini | Hỗ trợ nghe, luôn sẵn nhưng không lấn át |
| 5 | Tài liệu/Game/Thi thử | Quan trọng nhưng không đặt trước nhiệm vụ hôm nay |

#### Checklist mobile learning hoàn thành

- [ ] Mở trang ở 375px thấy ngay header, nhiệm vụ hôm nay, tabs và phần đầu của nội dung học.
- [ ] User có thể học từ vựng chỉ bằng một tay: nghe từ, chọn filter, đánh dấu nhớ.
- [ ] Tab Ôn tập hiển thị câu hỏi/đáp án dạng dọc, không chữ nhỏ khó bấm.
- [ ] Tài liệu, game, thi thử đều nói rõ dữ liệu thuộc khóa hiện tại.
- [ ] Podcast nổi không che bottom nav, AI tutor, hoặc nút học chính.
- [ ] Khi scroll xuống sâu, user vẫn đổi tab được mà không phải kéo lên đầu trang quá lâu.
- [ ] Mỗi feedback học tập có chữ rõ, không chỉ dựa vào màu.

#### Test cases mobile learning

##### TC-CLM-01: Vào màn học thấy nhiệm vụ ngay

Given: User mở `/app/courses/course-1/learn` trên viewport 375px.
When: Trang load xong.
Then: User thấy tên khóa, chương, tiến độ, nhiệm vụ từ vựng hôm nay và CTA học từ trong màn đầu tiên.

##### TC-CLM-02: Học từ bằng một tay

Given: User ở tab `Từ vựng` trên mobile.
When: User bấm nghe phát âm và đổi filter `Cần ôn`.
Then: Nút nghe phản hồi rõ, filter không làm vỡ layout, danh sách từ vẫn dễ đọc.

##### TC-CLM-03: Ôn tập MCQ rõ đúng/sai

Given: User ở tab `Ôn tập` trên mobile.
When: User chọn một đáp án.
Then: App hiện `Bạn chọn đúng` hoặc `Bạn đã chọn` + `Đáp án đúng`, kèm giải thích ngắn và nút câu tiếp theo.

##### TC-CLM-04: Podcast hoạt động như mini player

Given: User đang ở bất kỳ tab nào.
When: User bấm nút podcast nổi.
Then: Popover mở ở vị trí không che bottom nav, có nút đóng, play/pause và danh sách episode của khóa.

##### TC-CLM-05: Desktop không bị mobile hóa

Given: User mở workspace ở desktop.
When: Trang load xong.
Then: Desktop vẫn có hero, side nav/right rail và bố cục rộng chuyên nghiệp.

### 9.14. Thứ tự build đề xuất

1. Tạo mobile header compact cho Course Learning Workspace trước.
2. Tách desktop hero và mobile summary card bằng responsive classes.
3. Làm tab ngang mobile sticky/scrollable.
4. Dời CTA phụ khỏi phần đầu mobile.
5. Kiểm tra podcast nổi, AI tutor và bottom nav không đè nhau.
6. Browser QA viewport 375px, 768px, desktop 1280px.
7. Sau khi pattern ổn, áp dụng tiếp cho Dashboard/Course Detail/Lesson Player/Exam Runner.

---

## 10. Quyết định thiết kế

- Dùng mockdata trước để chốt UX nhanh.
- Chưa xây backend, auth thật, Gemini thật, audio thật trong phase UI.
- Mọi nút chính phải có đích route thật.
- Ưu tiên mobile vì app có bottom nav và phong cách học ngắn mỗi ngày.
- Thiết kế phải giữ cảm giác thân thiện, không làm user sợ khi sai.
- Các màn học nên kết thúc bằng phần thưởng nhỏ: XP, streak, badge hoặc gợi ý tiếp theo.
- Course Learning Workspace phải lấy mọi mode học từ khóa hiện tại, không biến thành hub chung.
- Podcast của khóa là nút tai nghe nổi luôn hiển thị, không chỉ là modal mở từ header.
- Mobile phải có header/summary riêng; không co nguyên desktop hero xuống màn nhỏ.

---

## 11. Admin Management Dashboard Design

### 11.1. Mục tiêu

Thiết kế trang quản trị nội bộ cho TOKUTEI GINO để admin nhìn được toàn cảnh học viên, khóa học, từ vựng, bài kiểm tra và chất lượng nội dung.

Reference:

- Spec: `docs/specs/admin-dashboard.md`
- Plan: `plans/2026-05-10-admin-dashboard/awf-plan.md`

Quyết định chính:

- Route nên là `/admin`, tách khỏi `MainLayout` của learner app.
- Lý do: các route `/app/*` hiện luôn có learner `Sidebar`, `BottomNav`, và `MobileAITutorPopover`; admin cần shell riêng, nhiều dữ liệu hơn và không cần bottom nav học tập.
- Phase đầu dùng mockdata trong `src/data/admin/*`, chưa backend, chưa auth thật.
- Admin ưu tiên desktop/tablet trước, mobile là fallback dạng card list để không vỡ layout.

### 11.2. Product shape

Admin hoạt động như một trung tâm điều hành học viện.

```
┌─────────────────────────────────────────────────────────────────────┐
│ Admin Topbar: Search | Date range | Export mock | Admin profile     │
├───────────────┬───────────────────────────────────────┬─────────────┤
│ Admin Sidebar │ Main workspace                        │ Detail rail  │
│ Overview      │ KPI, charts, tables, filters          │ Selected row │
│ Courses       │                                       │ Alerts       │
│ Students      │                                       │ Actions      │
│ Vocabulary    │                                       │             │
│ Assessments   │                                       │             │
│ Content       │                                       │             │
│ Reports       │                                       │             │
└───────────────┴───────────────────────────────────────┴─────────────┘
```

Nếu màn nhỏ:

```
┌─────────────────────────────────────┐
│ Admin topbar + section switcher     │
├─────────────────────────────────────┤
│ KPI compact cards                   │
├─────────────────────────────────────┤
│ Filter chips + search               │
├─────────────────────────────────────┤
│ Entity cards thay cho table rộng    │
├─────────────────────────────────────┤
│ Detail drawer mở dạng bottom sheet  │
└─────────────────────────────────────┘
```

### 11.3. Data Model

Dữ liệu phase này là mockdata typed, không phải database thật. Tuy vậy nên thiết kế như dữ liệu thật để sau này nối backend dễ.

| Entity | Mục đích | Trường chính |
|---|---|---|
| `AdminCourse` | Quản lý khóa học | `id`, `title`, `level`, `status`, `lessonCount`, `enrolledCount`, `completionRate`, `averageScore`, `revenueMock`, `updatedAt` |
| `AdminStudent` | Quản lý học viên | `id`, `name`, `email`, `level`, `activeCourseId`, `progress`, `streakDays`, `averageScore`, `vocabularyKnown`, `lastActiveAt`, `riskStatus` |
| `AdminVocabularyItem` | Quản lý từ vựng | `id`, `term`, `article`, `translation`, `level`, `topic`, `example`, `hasAudio`, `errorRate`, `difficulty`, `reviewStatus`, `linkedCourseIds` |
| `AdminAssessment` | Quản lý quiz/test | `id`, `title`, `courseId`, `type`, `questionCount`, `averageScore`, `completionRate`, `status`, `weakestSkill` |
| `AdminDocument` | Quản lý tài liệu | `id`, `title`, `courseId`, `type`, `level`, `viewCount`, `downloadCount`, `status`, `updatedAt` |
| `AdminAudioContent` | Quản lý podcast/audio | `id`, `title`, `courseId`, `durationMinutes`, `plays`, `status`, `missingTranscript` |
| `AdminAlert` | Cảnh báo vận hành | `id`, `severity`, `category`, `title`, `description`, `relatedEntityType`, `relatedEntityId`, `recommendedAction`, `createdAt` |
| `AdminActivity` | Nhật ký hoạt động | `id`, `actorName`, `action`, `entityType`, `entityTitle`, `createdAt` |

Date format mock thống nhất: ISO string `YYYY-MM-DD` hoặc `YYYY-MM-DDTHH:mm:ssZ`.

### 11.4. Relationships

```
Course 1 ── n Student enrollment
Course 1 ── n Assessment
Course 1 ── n Document
Course 1 ── n AudioContent
Course n ── n VocabularyItem
Student n ── 1 active Course
Alert n ── 1 related entity
Activity n ── 1 related entity
```

Quy tắc nghiệp vụ mock:

- `riskStatus = at-risk` nếu học viên lâu không hoạt động, điểm thấp hoặc progress đứng yên.
- `course.status = draft` thì không nên tính vào top published courses.
- `vocabulary.reviewStatus = needs-review` nếu thiếu audio, thiếu ví dụ hoặc `errorRate` cao.
- `assessment.averageScore < 70` tạo cảnh báo chất lượng học.
- `document.status = pending-review` xuất hiện trong Content Operations queue.

### 11.5. Mockdata file structure

Đề xuất nhiều file nhỏ để dễ sửa:

| File | Nội dung |
|---|---|
| `src/data/admin/types.ts` | Type/interface chung cho admin mockdata |
| `src/data/admin/adminCourses.ts` | Courses + course metrics |
| `src/data/admin/adminStudents.ts` | Students + risk states |
| `src/data/admin/adminVocabulary.ts` | Vocabulary items + quality flags |
| `src/data/admin/adminAssessments.ts` | Quiz/test mocks |
| `src/data/admin/adminContent.ts` | Documents, audio, podcast, games nếu cần |
| `src/data/admin/adminOperations.ts` | Alerts + activity feed |
| `src/data/admin/index.ts` | Re-export sạch cho page import |

Derived metrics nên tính từ mock arrays trong page/helper thay vì copy tay quá nhiều, ví dụ:

- total students
- active today
- average completion
- average score
- at-risk count
- pending content count

### 11.6. Route and module design

| Route | Component đề xuất | Mục đích |
|---|---|---|
| `/admin` | `AdminDashboard` | Shell + state cho section đang chọn |

Không cần nhiều route con trong phase đầu. Section có thể là state client-side để build nhanh:

- Overview
- Courses
- Students
- Vocabulary
- Assessments
- Content
- Reports

Nếu sau này admin lớn hơn, có thể tách thành `/admin/courses`, `/admin/students`, nhưng phase mock-first nên giữ một page để nhanh demo.

### 11.7. Component breakdown

| Component | Vai trò | Ghi chú |
|---|---|---|
| `AdminDashboard` | Page chính | Giữ active section, selected entity, filters |
| `AdminShell` | Layout admin | Sidebar, topbar, main grid, detail drawer |
| `AdminSidebar` | Chọn module | Desktop sidebar; mobile thành horizontal section switcher |
| `AdminTopbar` | Search/date/action | Search global mock, date range chip |
| `AdminKpiCard` | Hiển thị KPI | trend, delta, status color |
| `AdminMiniChart` | Bar/trend đơn giản | Không thêm chart lib nếu chưa cần |
| `AdminFilterBar` | Filter/search theo module | level, status, risk, quality issue |
| `AdminDataTable` | Table desktop | columns config, row click |
| `AdminEntityCardList` | Mobile fallback | card thay table khi màn nhỏ |
| `AdminStatusBadge` | Badge trạng thái | status/risk/severity thống nhất |
| `AdminProgressBar` | Progress metric | completion, score, error rate |
| `AdminDetailDrawer` | Xem chi tiết | right rail desktop, bottom sheet mobile |
| `AdminAlertList` | Cảnh báo | severity + recommended action |
| `AdminActivityFeed` | Recent activity | nhật ký mock |

Không cần tách quá sớm nếu code nhỏ, nhưng nên tránh một file quá lớn. Nếu `AdminDashboard.tsx` vượt khoảng 700-800 dòng, tách components.

### 11.8. Screen design

#### 11.8.1. Overview

Mục đích: admin mở vào là biết app đang khỏe hay có vấn đề.

Layout:

```
┌──────────────────────────────────────────────────────┐
│ Title: Admin command center                           │
│ Subtitle: Today performance + content operations      │
├──────────────────────────────────────────────────────┤
│ Students │ Active today │ Completion │ Avg score      │
│ Vocab    │ At risk      │ Pending    │ Revenue mock   │
├─────────────────────────────┬────────────────────────┤
│ Learning activity trend     │ Level distribution     │
├─────────────────────────────┼────────────────────────┤
│ Students at risk            │ Content quality issues │
├─────────────────────────────┴────────────────────────┤
│ Recent activity feed                                  │
└──────────────────────────────────────────────────────┘
```

States:

- Loading: skeleton KPI cards + skeleton table rows.
- Empty: friendly card `Chưa có dữ liệu admin demo`.
- Error: inline card `Không tải được dữ liệu mock`, có CTA reload mock.
- Success: all data visible, alerts sorted by severity.

#### 11.8.2. Courses

Table columns:

- Course
- Level
- Status
- Lessons
- Students
- Completion
- Avg score
- Revenue mock
- Updated

Detail drawer:

- Course summary
- enrollment trend mock
- weak lessons
- linked assessments
- linked documents
- recommended action

Primary mock actions:

- Review course
- Publish/Archive mock
- Open learner preview

#### 11.8.3. Students

Table columns:

- Student
- Level
- Active course
- Progress
- Streak
- Avg score
- Vocabulary known
- Last active
- Risk

Detail drawer:

- Learning summary
- risk reasons
- recent activity
- struggling vocabulary/topics
- suggested admin action

Primary mock actions:

- Message student mock
- Assign review set mock
- Mark as contacted mock

#### 11.8.4. Vocabulary

Table columns:

- Term + article
- Translation
- Level
- Topic
- Audio
- Example
- Error rate
- Difficulty
- Review status

Detail drawer:

- example sentence
- linked courses
- common wrong answers mock
- quality checklist
- recommended action

Primary mock actions:

- Add audio mock
- Edit example mock
- Mark reviewed mock

#### 11.8.5. Assessments

Table columns:

- Title
- Type
- Course
- Questions
- Completion
- Avg score
- Weakest skill
- Status

Detail drawer:

- score distribution mock
- most missed question mock
- linked lesson/course
- recommendation

#### 11.8.6. Content Operations

Combined content view for phase đầu:

- Documents
- Audio/podcast
- Games/luyện tập
- Pending review queue

Cards should highlight:

- missing transcript
- pending review
- low engagement
- stale update date
- content not linked to course

### 11.9. Interaction flows

#### Flow A: Open admin overview

```
User opens /admin
  -> AdminShell renders
  -> mockdata loads synchronously
  -> KPI metrics derive from mock arrays
  -> Overview shows alerts + activity feed
```

Edge cases:

- If mock arrays are empty, show empty state.
- If derived metrics divide by zero, show `0%` or `—`, not `NaN`.

#### Flow B: Filter and inspect students

```
User selects Students
  -> User filters Risk = At risk
  -> Table/card list narrows results
  -> User clicks a row
  -> Detail drawer opens
  -> Drawer shows risk reasons + recommended actions
```

Rules:

- Filter updates must be immutable.
- Search should match name, email, course title, level.
- Clearing filters restores full list.

#### Flow C: Content quality review

```
User opens Vocabulary or Content
  -> User filters quality issue
  -> Items with missing audio/example or pending review appear
  -> User opens detail drawer
  -> User clicks mock action
  -> UI shows local toast/status copy only
```

Rules:

- Phase đầu should not pretend data was saved to server.
- Action copy should say mock/demo if persistence is not real.

### 11.10. Visual rules

- Keep background warm cream, but admin panels should be cleaner and denser than learner screens.
- Use deep navy for headings, refined orange for primary active states, plum/blue for analytical accents.
- Tables use soft borders and row hover; no heavy enterprise gray wall.
- KPI cards should show one large number, one label, one delta, one icon.
- Use progress bars/capsules instead of adding a charting dependency.
- Severity colors:
  - Critical: muted red
  - Warning: amber
  - Good: green
  - Info: navy/plum

### 11.11. Responsive behavior

| Breakpoint | Behavior |
|---|---|
| Desktop 1280px+ | Sidebar + main content + right detail rail |
| Tablet 768-1279px | Sidebar can compress, detail drawer overlays |
| Mobile <768px | Section switcher horizontal, tables become cards, detail is bottom sheet |

Mobile admin is not the primary workflow, but must not break:

- no full-page horizontal scroll
- table columns hidden/reformatted as cards
- filters scroll horizontally
- detail drawer closes easily
- tap targets around 44px

### 11.12. Acceptance Criteria

#### Admin route and shell

- [ ] `/admin` renders without learner bottom nav or mobile AI tutor.
- [ ] Admin shell has topbar, sidebar/section switcher, main workspace, and detail drawer area.
- [ ] User can switch between Overview, Courses, Students, Vocabulary, Assessments, Content, and Reports.
- [ ] Empty/error/loading UI states exist at shell or module level.

#### Overview

- [ ] KPI cards show totals derived from admin mockdata.
- [ ] Overview shows at-risk students and content quality issues.
- [ ] Learning trend and level distribution are visually clear without external chart dependency.
- [ ] Alerts are sorted by severity or urgency.

#### Courses

- [ ] Course list shows level, status, lesson count, students, completion, average score, and updated date.
- [ ] User can filter by level/status and search by course title.
- [ ] Clicking a course opens a detail drawer with linked metrics and recommended action.

#### Students

- [ ] Student list shows level, active course, progress, streak, average score, last active, and risk status.
- [ ] User can filter by risk/status/level and search by name/email/course.
- [ ] Clicking a student opens a detail drawer with risk reasons and suggested action.

#### Vocabulary

- [ ] Vocabulary list shows term, article, translation, level, topic, audio/example flags, error rate, and review status.
- [ ] User can filter missing audio, missing example, high error rate, and needs review.
- [ ] Detail drawer shows linked courses, examples, common mistakes, and quality checklist.

#### Content operations

- [ ] Assessments, documents, audio/podcast, and review queue are visible in one compact module.
- [ ] Pending review and low-score content are clearly marked.
- [ ] Mock action buttons do not claim real persistence.

#### Responsive

- [ ] Desktop layout fits at 1280px without horizontal scroll.
- [ ] Tablet layout keeps filters and detail drawer usable.
- [ ] Mobile layout converts tables to cards and keeps tap targets usable.

### 11.13. Test Outline

#### Manual browser QA

- TC-ADM-01: Open `/admin` on desktop and verify admin shell renders without learner nav.
- TC-ADM-02: Switch every admin section and confirm content changes without route crash.
- TC-ADM-03: Search courses by title and clear search.
- TC-ADM-04: Filter students by `At risk`, open first student detail drawer, close drawer.
- TC-ADM-05: Filter vocabulary by `Missing audio` and `High error rate`.
- TC-ADM-06: Open course detail drawer and verify metrics are not `NaN` or blank.
- TC-ADM-07: Click mock action and verify UI copy does not imply backend persistence.
- TC-ADM-08: Resize to 768px and verify detail drawer overlays correctly.
- TC-ADM-09: Resize to 375px and verify tables become cards with no full-page horizontal scroll.
- TC-ADM-10: Run `npm run lint` and `npm run build` after implementation.

#### Future automated test candidates

- Derive KPI metrics from mock arrays.
- Filter courses/students/vocabulary by search and status.
- Render empty state when arrays are empty.
- Prevent `NaN` in percentage helpers.

### 11.14. Implementation notes for `/awf-code`

Recommended build order:

1. Add `/admin` route in `src/App.tsx` outside the `/app` `MainLayout` route.
2. Create admin mockdata under `src/data/admin/*`.
3. Create `src/pages/AdminDashboard.tsx`.
4. Build AdminShell + Overview first.
5. Add Courses, Students, Vocabulary modules.
6. Add Assessments/Content module compactly.
7. Add detail drawer and mobile card fallback.
8. Verify with lint, build, and browser QA.

Avoid in phase đầu:

- backend-like service abstraction
- real auth flow
- chart library dependency
- large persistent store
- admin CRUD forms that appear to save real data

### 11.15. Open questions before coding

1. Anh có muốn route admin public demo là `/admin`, hay vẫn muốn `/app/admin` dù sẽ dính learner shell nếu không sửa layout?
2. Admin phase đầu có cần form tạo/sửa mock đầy đủ không, hay chỉ cần table/detail/action để demo?
3. Có muốn thêm link vào learner dashboard để mở admin không, hay chỉ truy cập trực tiếp bằng URL?

---

## 12. Supabase Real Data Foundation Design

### 12.1. Mục tiêu design

Thiết kế nền dữ liệu Supabase thật cho TOKUTEI GINO theo hướng local-first, seed-first và auth-gated cho `/admin`.

Reference:

- Spec: `docs/specs/supabase-real-data.md`
- Plan: `plans/2026-05-14-supabase-real-data/awf-plan.md`
- Admin design hiện có: `docs/DESIGN.md#11-admin-management-dashboard-design`

Quyết định đã chốt:

- Bắt đầu bằng Supabase local, chưa nối thẳng dev cloud project.
- `/admin` phải có Supabase Auth để test, không còn là public demo route.
- Learner routes cũng cần Supabase Auth trong phase 1; không chỉ riêng admin.
- Phase 1 chỉ cần role `admin`, chưa thêm `content_manager` để giảm scope.
- Dữ liệu phase 1 dùng sample/curated seed từ mockdata hiện tại, không import dữ liệu thật của học viên.
- Không dùng Supabase Storage cho audio phase 1; chỉ lưu metadata/audio trạng thái/sample URL nếu cần.
- Sample local admin credentials sẽ được tạo bởi seed và ghi rõ trong setup/seed output local-only, không coi là production secret.
- Supabase là source of truth cho flow mới; mockdata cũ là nguồn tham chiếu seed và fallback dev có kiểm soát.

### 12.2. High-level architecture

```text
React/Vite app
  ├─ Public learner routes
  ├─ /admin/login
  └─ /admin/* protected by Supabase Auth
        │
        ▼
Frontend repositories/services
  ├─ authRepository
  ├─ adminDashboardRepository
  ├─ courseContentRepository
  ├─ courseLearningRepository
  └─ packageRepository
        │
        ▼
Supabase local
  ├─ Auth users
  ├─ Postgres tables + RLS policies
  ├─ SQL migrations
  └─ seed data from curated sample dataset
```

Nguyên tắc quan trọng:

- Component không gọi Supabase trực tiếp nếu logic dữ liệu có thể nằm trong repository/service.
- Public anon key có thể nằm ở frontend env, nhưng chỉ an toàn khi RLS bật đúng.
- Admin route protection ở frontend chỉ là UX gate; quyền đọc/ghi admin phải nằm ở RLS/database policy.
- Các bảng user/progress/activity phải bật RLS ngay từ đầu, kể cả local.

### 12.3. Environment and local setup design

| Area | Design |
|---|---|
| Runtime đầu tiên | Supabase local stack |
| Env frontend | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Env server/CLI nếu cần | dùng local Supabase CLI output, không commit secret thật |
| Existing `.env.example` | thêm Supabase keys dạng placeholder |
| Migration location | `supabase/migrations/*.sql` |
| Seed location | `supabase/seed.sql` hoặc `supabase/seeds/*.sql` nếu tách nhỏ |
| Type generation | `supabase gen types --local` xuất ra file type generated |
| Reset dev DB | `supabase db reset` để chạy lại migrations + seed |

Không đưa `service_role` key vào frontend. Nếu phase sau cần admin privileged operations, dùng server-side boundary hoặc Edge Function, không gọi trực tiếp từ browser.

### 12.4. Auth and admin route design

#### Routes

| Route | Mục đích | Auth requirement |
|---|---|---|
| `/admin/login` | Admin login bằng Supabase Auth local | Public |
| `/admin` | Admin dashboard overview | Authenticated + admin role |
| `/admin/*` | Các section admin phase sau nếu tách route | Authenticated + admin role |

#### Auth flow

```text
User opens /admin
  -> ProtectedAdminRoute checks Supabase session
  -> No session: redirect /admin/login
  -> Has session: query admin role/profile
  -> Role allowed: render AdminDashboardPage
  -> Role missing: show access denied + sign out CTA
```

#### Tables cho auth/admin

| Table | Mục đích | Trường chính |
|---|---|---|
| `profiles` | app profile nối với `auth.users` | `id`, `display_name`, `email`, `created_at`, `updated_at` |
| `admin_roles` | quyền admin/tester | `user_id`, `role`, `is_active`, `created_at` |

Business rules:

- `profiles.id` reference `auth.users.id`.
- `admin_roles.user_id` reference `profiles.id` hoặc `auth.users.id`.
- Phase 1 chỉ cần role `admin`; chưa thêm `content_manager` cho đến khi có nhu cầu phân quyền nội dung thật.
- Seed local tạo admin test user bằng Supabase seed/auth workflow và ghi credentials local-only trong setup/seed output để dev test được ngay.

### 12.5. Data model

#### Core academic content

| Entity/Table | Mục đích | Trường chính |
|---|---|---|
| `courses` | khóa học | `id`, `slug`, `title`, `level`, `status`, `description`, `owner_name`, `published_at`, `created_at`, `updated_at` |
| `course_modules` | nhóm bài trong khóa | `id`, `course_id`, `title`, `position`, `status`, `estimated_minutes`, `created_at`, `updated_at` |
| `lessons` | bài học | `id`, `course_id`, `module_id`, `title`, `type`, `position`, `status`, `quality_score`, `created_at`, `updated_at` |
| `lesson_assets` | metadata tài liệu/audio/image/transcript | `id`, `lesson_id`, `type`, `title`, `status`, `external_url`, `missing_reason`, `created_at`, `updated_at` |
| `lesson_exercises` | bài tập trong lesson | `id`, `lesson_id`, `type`, `prompt`, `status`, `error_rate`, `position`, `created_at`, `updated_at` |
| `vocabulary_items` | từ vựng | `id`, `term`, `article`, `translation`, `level`, `topic`, `example_de`, `example_vi`, `has_audio`, `audio_url`, `difficulty`, `status`, `created_at`, `updated_at` |
| `lesson_vocabulary` | nối lesson-vocab có thứ tự | `lesson_id`, `vocabulary_id`, `position`, `is_required` |

Audio phase 1:

- `lesson_assets.type = 'audio'` hoặc `vocabulary_items.audio_url` chỉ lưu metadata/sample external URL.
- Không tạo Supabase Storage bucket cho audio.
- Nếu không có audio thật, dùng `has_audio = false`, `audio_url = null`, `missing_reason` rõ ràng.

#### Practice, exams, and documents

| Entity/Table | Mục đích | Trường chính |
|---|---|---|
| `review_questions` | MCQ/review theo lesson/vocab | `id`, `lesson_id`, `vocabulary_id`, `type`, `prompt`, `explanation`, `status`, `created_at` |
| `review_options` | options của câu hỏi | `id`, `question_id`, `label`, `is_correct`, `position` |
| `assessments` | quiz/mock exam/listening/vocab test | `id`, `course_id`, `title`, `type`, `status`, `question_count`, `duration_minutes`, `created_at`, `updated_at` |
| `assessment_questions` | câu hỏi trong assessment | `id`, `assessment_id`, `prompt`, `skill`, `position`, `answer_key`, `explanation` |
| `documents` | PDF/post/checklist metadata | `id`, `course_id`, `title`, `type`, `status`, `summary`, `external_url`, `view_count`, `download_count`, `updated_at` |
| `podcast_episodes` | podcast/audio metadata theo khóa | `id`, `course_id`, `title`, `episode`, `duration_minutes`, `summary`, `status`, `external_url`, `missing_transcript`, `created_at` |

#### Learner progress sample data

| Entity/Table | Mục đích | Trường chính |
|---|---|---|
| `learner_profiles` | học viên sample/synthetic | `id`, `display_name`, `email`, `level`, `created_at` |
| `enrollments` | học viên tham gia khóa | `id`, `learner_id`, `course_id`, `status`, `progress_percent`, `started_at`, `completed_at`, `last_active_at` |
| `lesson_progress` | tiến độ lesson mới nhất | `id`, `learner_id`, `lesson_id`, `status`, `progress_percent`, `updated_at` |
| `vocabulary_progress` | trạng thái từ vựng theo học viên | `id`, `learner_id`, `vocabulary_id`, `status`, `strength`, `last_reviewed_at` |
| `review_attempts` | lịch sử làm câu hỏi | `id`, `learner_id`, `question_id`, `is_correct`, `answered_at` |
| `assessment_attempts` | lịch sử làm quiz/mock exam | `id`, `learner_id`, `assessment_id`, `score`, `status`, `started_at`, `completed_at` |
| `learning_activity_events` | activity feed sample | `id`, `learner_id`, `course_id`, `event_type`, `metadata`, `created_at` |

Business rules:

- Dữ liệu học viên là synthetic/sample, không dùng PII thật.
- `learner_profiles.email` nếu cần nên dùng domain giả như `example.test`.
- Latest progress và attempts tách nhau: progress để UI đọc nhanh, attempts để giữ lịch sử.
- Unique constraints nên có cho latest state: `(learner_id, lesson_id)`, `(learner_id, vocabulary_id)`, `(learner_id, course_id)`.

#### Monetization and admin operations

| Entity/Table | Mục đích | Trường chính |
|---|---|---|
| `packages` | gói học | `id`, `slug`, `name`, `status`, `price_vnd`, `duration_days`, `ai_monthly_quota`, `target_audience`, `highlight`, `created_at`, `updated_at` |
| `package_courses` | course bundle | `package_id`, `course_id`, `position` |
| `admin_alerts` | cảnh báo vận hành | `id`, `severity`, `category`, `title`, `description`, `related_entity_type`, `related_entity_id`, `recommended_action`, `created_at` |
| `admin_activity_logs` | log admin/sample operations | `id`, `actor_user_id`, `actor_name`, `action`, `entity_type`, `entity_id`, `entity_title`, `created_at` |
| `ai_prompts` | metadata prompt | `id`, `name`, `purpose`, `provider`, `model_label`, `status`, `version`, `prompt_body`, `created_at`, `updated_at` |
| `api_key_metadata` | metadata key, không raw secret | `id`, `provider`, `label`, `environment`, `status`, `masked_key`, `last_used_at`, `monthly_quota_used`, `monthly_quota_limit`, `owner_name`, `created_at` |

Rule bảo mật:

- `api_key_metadata.masked_key` chỉ lưu masked text hoặc `not configured`.
- Không lưu raw API key ở database sample.
- `admin_activity_logs` không expose cho anon users.

### 12.6. Relationships

```text
auth.users 1 ── 1 profiles
profiles 1 ── 0..n admin_roles

courses 1 ── n course_modules
course_modules 1 ── n lessons
lessons 1 ── n lesson_assets
lessons 1 ── n lesson_exercises
lessons n ── n vocabulary_items via lesson_vocabulary
lessons 1 ── n review_questions
review_questions 1 ── n review_options
courses 1 ── n assessments
assessments 1 ── n assessment_questions
courses 1 ── n documents
courses 1 ── n podcast_episodes

learner_profiles n ── n courses via enrollments
learner_profiles 1 ── n lesson_progress
learner_profiles 1 ── n vocabulary_progress
learner_profiles 1 ── n review_attempts
learner_profiles 1 ── n assessment_attempts
learner_profiles 1 ── n learning_activity_events

packages n ── n courses via package_courses
admin_alerts n ── 1 related entity by typed reference
admin_activity_logs n ── 1 related entity by typed reference
```

Constraints nên ưu tiên:

- `courses.slug` unique.
- `(course_id, position)` unique cho modules.
- `(module_id, position)` unique cho lessons.
- `(lesson_id, position)` unique cho exercises/assets nếu cần thứ tự.
- `review_options` phải có đúng một correct option theo validation seed/test, hoặc constraint nâng cao ở phase sau.
- `status`, `level`, `role`, `type` dùng check constraints hoặc Postgres enum nếu muốn chặt.

### 12.7. RLS policy direction

Policy principle:

| Table group | Anon | Auth learner | Admin role |
|---|---|---|---|
| Published course catalog | no access in app phase 1 | read published only | read all/write |
| Draft/admin content | no access | no access | read/write |
| Learner progress | no access | own rows only | read for admin dashboard |
| Admin alerts/logs | no access | no access | read/write as needed |
| API key metadata | no access | no access | read metadata only |

Admin check helper nên nằm trong DB, ví dụ function `is_admin()` kiểm tra `admin_roles` active cho `auth.uid()`. Policies dùng helper này để tránh copy logic.

Important:

- Bật RLS cho mọi bảng public ngay từ migration đầu.
- Vì learner routes cũng auth-gated trong phase 1, anon không cần đọc course content từ app.
- `/admin` vẫn phải yêu cầu authenticated + admin role, kể cả khi data đang là sample.
- Index các cột dùng trong RLS/filter: `user_id`, `learner_id`, `course_id`, `status`, `role`, `level`, `created_at`.

### 12.8. Seed strategy

Seed v1 dùng curated sample data từ mock hiện tại, không random khó kiểm soát.

Suggested seed order:

1. Auth/admin test user and profile.
2. Admin role for that user.
3. Courses.
4. Course modules.
5. Lessons.
6. Lesson assets/exercises.
7. Vocabulary + lesson vocabulary joins.
8. Review questions/options.
9. Assessments/questions.
10. Documents and podcast/audio metadata.
11. Learner synthetic profiles.
12. Enrollments and progress.
13. Packages and package courses.
14. Admin alerts/activity logs.
15. AI prompt/API key metadata.

Seed quality checks:

- No orphan `course_id`, `lesson_id`, `learner_id`.
- No raw API keys.
- No real email/phone/customer data.
- Published courses have at least one module and one lesson.
- Course learning route has vocabulary, review questions, documents, exams, and podcast metadata for at least one course.
- `/admin` dashboard can show KPI counts without `NaN`.

### 12.9. Frontend modules

| Module/File area | Mục đích |
|---|---|
| `src/lib/supabase/client.ts` | create browser Supabase client from Vite env |
| `src/features/auth/*` | admin login/session hooks/components |
| `src/features/admin/auth/ProtectedAdminRoute.tsx` | guard `/admin` bằng session + role |
| `src/features/admin/services/adminRepository.ts` | đọc admin overview/courses/students/vocab/packages |
| `src/features/courses/services/courseRepository.ts` | đọc course list/detail/learning workspace |
| `src/features/packages/services/packageRepository.ts` | đọc packages nếu cần tách |
| `src/types/supabase.ts` | generated database types |
| `src/shared/lib/result.ts` hoặc pattern tương đương | chuẩn hóa success/error nếu cần |

Không đưa query phức tạp vào `AdminDashboardPage.tsx`. Page chỉ nên gọi hook/service rồi render loading/error/success.

### 12.10. Screen/module states

#### `/admin/login`

| State | UI |
|---|---|
| Idle | email/password form |
| Submitting | disabled button + loading label |
| Invalid credentials | friendly error, không lộ chi tiết auth internals |
| Success | redirect `/admin` |
| Already signed in admin | redirect `/admin` |
| Signed in non-admin | access denied + sign out |

#### `/admin`

| State | UI |
|---|---|
| Checking session | full-page lightweight loading |
| No session | redirect `/admin/login` |
| No admin role | access denied card |
| Loading data | admin skeletons |
| Data error | retry card with safe message |
| Empty seed | setup hint: seed local database |
| Success | dashboard uses Supabase data |

#### Course learning route

- If no session: redirect to learner login/auth entry once implemented.
- If Supabase data exists for course: render course-bound workspace.
- If course not found: show not found/empty state.
- If query fails: show user-friendly error and retry.
- No audio Storage assumptions; podcast/audio metadata can be displayed without playback if `external_url` is missing.

### 12.11. Main flows

#### Flow A: Local setup and seed

```text
Developer starts Supabase local
  -> migrations create schema + RLS
  -> seed inserts sample admin user, content, learners, progress
  -> generated types refresh
  -> Vite app reads local env keys
```

#### Flow B: Admin login test

```text
User opens /admin
  -> redirect /admin/login
  -> submit sample admin credentials
  -> Supabase Auth creates session
  -> app checks admin_roles
  -> dashboard loads Supabase-backed sample data
```

#### Flow C: Admin reads data

```text
Admin opens dashboard
  -> repository fetches dashboard data/domain rows
  -> mapper converts DB rows to current UI model
  -> UI renders KPI/tables/detail drawer
```

#### Flow D: Learner reads course workspace

```text
User opens /app/courses/:id/learn
  -> course repository fetches course + content relationships
  -> workspace model contains vocabulary, MCQ, documents, games/exams, podcast metadata
  -> UI renders course-centered learning modes
```

### 12.12. Acceptance Criteria

#### Supabase local foundation

- [ ] Repo has Supabase local config/migrations/seed path.
- [ ] `.env.example` includes `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` placeholders.
- [ ] Local database can reset and reseed repeatably.
- [ ] Generated TypeScript database types exist or generation command is documented.

#### Auth-protected admin

- [ ] `/admin` redirects unauthenticated users to `/admin/login`.
- [ ] `/admin/login` can authenticate a local sample admin user.
- [ ] Authenticated non-admin users cannot view admin dashboard.
- [ ] Admin role check is enforced by data access/RLS, not only by frontend route logic.
- [ ] Sign out returns user to `/admin/login`.

#### Data model and seed

- [ ] Seed includes courses, modules, lessons, assets, exercises, vocabulary, review questions, exams, documents, podcast metadata, packages, learners, progress, alerts, and activity logs.
- [ ] Seed data is synthetic/sample only.
- [ ] No raw API keys, real student emails, phone numbers, or private data are committed.
- [ ] Audio is metadata-only; no Supabase Storage bucket is required for phase 1.
- [ ] Foreign-key relationships are valid after reset.

#### Frontend integration

- [ ] Admin dashboard reads at least overview/course/student/vocabulary data from Supabase local.
- [ ] Course learning workspace can read one course's vocabulary, review questions, documents, exams, and podcast metadata from Supabase local.
- [ ] Loading, empty, error, and success states exist for Supabase-backed reads.
- [ ] Components do not contain raw Supabase query logic when repository/service abstraction is appropriate.

### 12.13. Test outline

#### Unit/data tests

- TC-SUPA-01: Map course DB rows into admin course UI model.
- TC-SUPA-02: Map course learning DB rows into workspace model with non-empty vocabulary/review/docs/exams/podcast arrays.
- TC-SUPA-03: Derive admin KPI counts from Supabase-backed data without `NaN`.
- TC-SUPA-04: Reject/flag seed metadata that contains raw API keys.

#### Integration/local DB tests

- TC-SUPA-05: Run local migration/reset seed successfully.
- TC-SUPA-06: Verify sample admin user has active admin role.
- TC-SUPA-07: Verify published course can be read by learner/public policy as designed.
- TC-SUPA-08: Verify draft course is hidden from anon/learner but visible to admin.
- TC-SUPA-09: Verify learner progress rows are only readable by owner or admin.
- TC-SUPA-10: Verify admin alerts/logs are not readable by anon.

#### Browser QA

- TC-SUPA-11: Open `/admin` logged out and confirm redirect to `/admin/login`.
- TC-SUPA-12: Login with sample admin account and see Supabase-backed dashboard.
- TC-SUPA-13: Login with non-admin sample account and see access denied.
- TC-SUPA-14: Sign out from admin and confirm session is cleared.
- TC-SUPA-15: Open course learning page and verify content is course-bound from Supabase data.
- TC-SUPA-16: Stop Supabase/local API and verify UI shows safe error state, not blank page.

#### Build checks

- TC-SUPA-17: `npm run lint` passes.
- TC-SUPA-18: `npm run build` passes.

### 12.14. Implementation order for `/awf-code`

1. Add Supabase dependency and local env placeholders.
2. Initialize Supabase local config/migrations.
3. Create schema with RLS enabled and admin role helper.
4. Add curated seed dataset from current mockdata.
5. Generate database types.
6. Add Supabase client and auth/session utilities.
7. Add `/admin/login` and protected `/admin` route guard.
8. Build repository/service layer for admin read flows.
9. Replace admin dashboard reads with Supabase-backed data while keeping UI model stable.
10. Add course learning read path for one course workspace.
11. Run local reset/seed, lint/build, and browser QA.
12. Use security review before claiming completion because auth/RLS/user data boundaries changed.

### 12.15. Final decisions before coding

- Learner routes cần auth trong phase 1, không chỉ riêng `/admin`.
- Phase 1 chỉ có role `admin`; chưa thêm `content_manager`.
- Sample local admin credentials do seed tạo và được ghi trong setup/seed output local-only để dev test nhanh; không dùng cho production.

---

*Tạo bởi AWF Design Phase - UI/mockdata v0; cập nhật Supabase real data design 2026-05-14*


---

## ADDENDUM 2026-05-17 — New Engagement Games MVP

Bản design chi tiết cho 2 game mới (Memory Match + Word Builder) tách thành file riêng để giữ document này gọn:

- 📐 Design: [`docs/design/new-games-mvp.md`](./design/new-games-mvp.md)
- 📝 Plan: [`plans/2026-05-17-new-games-engagement/awf-plan.md`](../plans/2026-05-17-new-games-engagement/awf-plan.md)
- 📋 Spec: [`docs/specs/new-games-engagement.md`](./specs/new-games-engagement.md)

Tóm tắt phạm vi:
- **MVP**: Memory Match (lật bài ghép cặp) + Word Builder (xếp chữ tiếng Nhật romaji)
- **Future**: Listening Lab + Story Quest (mở plan riêng sau)
- Reuse `GameShell` + `gameStore` + `courseGameStore`, **không thêm dependency mới**
- 4 phases: Foundation → Memory Match → Word Builder → Polish
