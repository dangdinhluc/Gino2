# TOKUTEI GINO — Đánh giá & Hướng đi

Ngày: 2026-07-27
Người đánh giá: Codex (agent)
Dựa trên: audit toàn bộ codebase + trao đổi với chủ dự án

---

## Vision sản phẩm

Nền tảng học tiếng Đức/Nhật Tokutei Ginou cho học viên:
- Học viên đăng ký gói → vào khóa học đã mua
- Trong khóa: học từ vựng + luyện câu hỏi thi + xem tài liệu
- Ghi chú cá nhân trên tài liệu
- Cộng đồng học viên: kết bạn, nhắn tin, chia sẻ tiến độ

---

## Hiện trạng — Đã có gì

| Module | Trạng thái | Ghi chú |
|--------|-----------|---------|
| Auth (login/signup/logout) | ✅ Hoàn chỉnh | Supabase, admin/learner role, RLS |
| Course Learning workspace | ✅ Hoàn chỉnh | Tab từ vựng, ôn tập, tài liệu, game, thi thử |
| Game engine | ✅ Hoàn chỉnh | FlappyVocab, Memory Match, Word Builder, VocabSprint, SituationGame |
| Admin dashboard | ✅ Cơ bản | Quản lý packages, courses, học viên, từ vựng |
| Supabase schema | ✅ Hoàn chỉnh | Migration đầy đủ, RLS, seed data |
| UI/UX shell | ✅ Hoàn chỉnh | Toàn bộ route có màn hình (dù nhiều chỗ là mock) |
| TypeScript | ✅ Sạch | `tsc --noEmit` pass, 0 lỗi |
| Tests | ✅ 10 file | Game generators, store, auth, repositories |

---

## Những thứ còn THIẾU (theo thứ tự ưu tiên)

### 🔴 P0 — Cốt lõi, làm ngay

#### 1. Enrollment flow (Gói học → Khóa của tôi)

- **Hiện tại:** `CourseListPage` show tất cả khóa, không phân biệt gói. Packages mock data đã có nhưng không có màn hình cho học viên xem/mua gói.
- **Cần làm:**
  - Màn "Gói học" cho học viên xem danh sách packages
  - Flow đăng ký gói (free hoặc paid)
  - Màn "Khóa học của tôi" — chỉ hiện khóa trong gói đã đăng ký
  - Bảng `enrollments` trong Supabase đã có, chỉ thiếu UI

#### 2. Document viewer (xem tài liệu trực tiếp trong app)

- **Hiện tại:** `DocumentsPanel` chỉ list tài liệu, không có viewer.
- **Cần làm:**
  - Component render nội dung PDF và Post trong app
  - Navigation trong tài liệu (mục lục, page)

#### 3. Ghi chú cá nhân trên tài liệu

- **Hiện tại:** Hoàn toàn chưa có.
- **Cần làm:**
  - Highlight/selection text trong document
  - Ghi chú cá nhân gắn vào document
  - Lưu riêng theo user (cần thêm bảng `document_notes` hoặc tương tự)

---

### 🟡 P1 — Quan trọng, làm sau P0

#### 4. Progress dashboard cá nhân

- **Hiện tại:** Thống kê học tập được hiển thị trong Hồ sơ/Cài đặt; không duy trì màn riêng.
- **Hướng mở rộng:** nếu cần thêm chỉ số, bổ sung trực tiếp trong Hồ sơ/Cài đặt thay vì tạo route thống kê mới.

#### 5. AI Tutor thật (không mock)

- **Hiện tại:** `useMockTutorChat` chỉ match keyword, không gọi Gemini.
- **Cần làm:**
  - Gọi Gemini API với streaming
  - Context từ khóa học hiện tại (biết học viên đang học gì)
  - AI Writing Lab: chấm bài viết thật
  - AI Speaking Lab: đánh giá phát âm
  - **Lưu ý:** API key hiện expose qua Vite `define` → cần chuyển ra backend hoặc ít nhất dùng environment variable đúng cách

---

### 🟢 P2 — Tăng retention, làm sau P1

#### 6. Cộng đồng học viên

- **Hiện tại:** `FriendsPage`, `MessagesPage`, `JournalPage` đều là shell trỏ về `PhaseTwoPages`.
- **Cần làm:**
  - Kết bạn / follow học viên khác
  - Bảng tin / feed học tập
  - Group thảo luận theo khóa học
  - Chia sẻ tiến độ, streak, thành tích

#### 7. Notification / nhắc học

- **Hiện tại:** Không có.
- **Cần làm:**
  - Push notification hoặc email reminder học hàng ngày
  - Nhắc ôn tập từ vựng đến hạn (due)
  - Thông báo khóa học mới, gói mới

#### 8. Các cải thiện kỹ thuật

- Dọn file rác trong repo (`_nm.tar`, `_nm.tar.gz`, `_gino_snapshot.tar.gz`, `_zustand_pkg.tar.gz`)
- Thêm `.gitignore` cho `.DS_Store`
- Viết `README.md` có hướng dẫn setup
- Tách `app-routes.tsx` thành lazy load routes
- Thêm `ErrorBoundary` component
- Thêm loading skeleton pattern cho các trang gọi Supabase

---

## Kiến trúc & Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 19 + Vite 6 + TypeScript |
| Routing | React Router v7 |
| State | Zustand (persist localStorage) |
| UI | Tailwind CSS v4 + `motion` (animation) |
| Icons | Lucide React |
| Backend/DB | Supabase (local dev: `supabase start`) |
| AI | Google Gemini (`@google/genai`) |

---

## Luồng người dùng chính (mong muốn)

```
Học viên đăng nhập
  → Xem gói học → Đăng ký gói
  → "Khóa học của tôi" (chỉ khóa trong gói)
  → Vào khóa học → Learning workspace
    → Học từ vựng (flashcard, SRS)
    → Luyện câu hỏi ôn thi
    → Xem tài liệu + ghi chú cá nhân
    → Chơi game từ vựng
    → Thi thử
  → Dashboard cá nhân (tiến độ, streak)
  → Cộng đồng (kết bạn, chia sẻ)
```

---

## Thiết kế UI Mobile — Tăng hứng thú & Đơn giản hóa

Ngày thêm: 2026-07-27
Ngữ cảnh: Học viên chủ yếu dùng mobile để học. App cần tối ưu cho màn hình nhỏ, thao tác nhanh, tạo động lực duy trì học mỗi ngày.

### Hiện trạng UI mobile

| Thành phần | Trạng thái | Vấn đề |
|-----------|-----------|--------|
| BottomNav 5 tab | ✅ Tốt | Tab "Từ của tôi" trỏ sang `/app/grammar` — không đúng tên gọi |
| Dashboard mobile | ✅ Có | Quá nhiều thứ: 7 tools + 4 tasks + search card. Học viên mở app không biết bắt đầu từ đâu |
| AI Tutor popover | ✅ Có | Floating button góc phải, bấm vào mở chat overlay — tốt |
| Progress/streak | ⚠️ Sơ khai | Chỉ hiện số, không có animation reward, không gây hứng thú |
| Phiên học | ⚠️ | Chưa có khái niệm "micro-session" 3-5 phút |
| Bottom sheet | ❌ Chưa có | Tài liệu, ghi chú, tìm kiếm nên là bottom sheet thay vì full page |

---

### 10 nguyên tắc thiết kế mobile cho app học tập

#### 1. 🎯 One-thing-per-open — Mở app là thấy ngay việc cần làm

- **Dashboard thành "Nhiệm vụ hôm nay"**: Chỉ hiển thị 1-3 task cốt lõi. Không grid tools.
- Format: "📝 Học 5 từ mới" → "✅ Xong! +20 XP" → "🔥 Streak: 3 ngày"
- Học viên mở app, làm task, đóng app. Toàn bộ flow dưới 3 phút.
- Nút CTA chính to, nằm nửa dưới màn hình, trong tầm ngón cái.

```
┌─────────────────────────┐
│  🔥 Streak 3 ngày       │
│                         │
│  Nhiệm vụ hôm nay       │
│  ┌───────────────────┐  │
│  │ 📝 Học 5 từ mới   │  │
│  │ ████████░░ 80%    │  │
│  └───────────────────┘  │
│  ┌───────────────────┐  │
│  │ 🎧 Nghe hội thoại │  │
│  │ Chưa làm          │  │
│  └───────────────────┘  │
│                         │
│  ┌─────────────────────┐│
│  │   🚀 BẮT ĐẦU HỌC    ││  ← CTA chính, to, nổi bật
│  └─────────────────────┘│
│                         │
│  [Home] [Khóa] [Ôn] [Thi]│
└─────────────────────────┘
```

#### 2. ⏱️ Micro-session 3-5 phút

- Mỗi phiên học có timer đếm ngược hiển thị rõ: "Còn 2:45"
- Text khuyến khích: "Chỉ 3 phút thôi, làm nhanh rồi nghỉ!"
- Sau mỗi micro-session: animation reward (confetti, XP bay lên, streak tăng)
- Giảm rào cản tâm lý: không ai ngại bỏ ra 3 phút

#### 3. 🎮 Gamification tối giản

- **XP + Level**: Mỗi hành động (học từ, trả lời đúng, streak) cho XP. Level hiển thị cạnh avatar.
- **Streak animation**: Mỗi ngày học liên tiếp có animation lửa to dần. Mốc 7-30-100 ngày có badge đặc biệt.
- **Combo trong game**: Đã có combo system, thêm animation "Combo x5! 🔥" nổi bật hơn.
- **Daily reward**: Mở app mỗi ngày được nhận XP bonus nhỏ (giống Duolingo chest).
- **Không phạt**: Không reset streak về 0 khi lỡ 1 ngày — thay vào đó là "streak freeze" hoặc giảm nhẹ.

#### 4. 📊 Progress bar trực quan, to, luôn thấy

- Thanh progress to nằm ở đầu mỗi khóa học: "Bạn đã hoàn thành 65% A1 Foundation"
- Mục tiêu ngày: vòng tròn tiến độ (ring) ở dashboard, fill dần khi hoàn thành task
- Dùng màu sắc trực quan: đỏ (<30%) → cam (30-70%) → xanh lá (>70%) → vàng kim (100%)

#### 5. 📱 Bottom sheet cho mọi thứ phụ

- **Tài liệu**: Bottom sheet mở 80% màn hình, kéo xuống để đóng. Có ghi chú overlay.
- **AI Chat**: Đã là popover → giữ nguyên, nhưng thêm khả năng kéo thành bottom sheet.
- **Tìm kiếm**: Bottom sheet với input focus ngay khi mở.
- **Ghi chú**: Bottom sheet nhỏ từ dưới lên khi bôi đen text trong tài liệu.
- Nguyên tắc: **không rời khỏi màn hình chính nếu không bắt buộc**.

#### 6. ✋ One-thumb design

- Mọi CTA chính (Bắt đầu học, Tiếp tục, Trả lời) ở 1/3 dưới màn hình.
- Câu hỏi trắc nghiệm: 4 đáp án xếp dọc, nút to (min 48px), có thể bấm bằng ngón cái.
- Navigation: bottom tab bar là chính. Tránh hamburger menu.
- Swipe gestures: vuốt trái/phải để chuyển từ/câu hỏi.

#### 7. 🎉 Micro-reward liên tục

- **Đúng 1 câu**: Rung nhẹ (haptic) + animation check xanh + âm thanh "tinh".
- **Đúng 5 câu liên tiếp**: animation combo lửa + text "Đang vào form! 🔥".
- **Sai**: Rung nhẹ kiểu khác + animation nhẹ nhàng, không đỏ chói. Text khuyến khích: "Sai tí thôi, lần sau đúng nhé!"
- **Hoàn thành phiên**: Confetti + XP counter bay lên + streak flame.
- **Hoàn thành khóa**: Animation lớn hơn + certificate card có thể share.

#### 8. 📅 Streak calendar mini

- Heatmap nhỏ (giống GitHub contribution graph) hiển thị 30 ngày gần nhất
- Màu: xám (chưa học) → nhạt (ít) → đậm (nhiều). Tạo áp lực tích cực giữ màu xanh.
- Có thể swipe để xem tháng trước.

#### 9. 🔮 Anticipation — Cho học viên thấy ngày mai được gì

- "Ngày mai: Mở khóa bài 'Phỏng vấn HR' 🔒→🔓"
- "Còn 10 XP nữa lên Level 5!"
- "Bạn sắp đạt streak 7 ngày — thêm 1 ngày nữa để nhận badge 🏅"
- Home screen widget (nếu sau này làm mobile app native) hiển thị streak ngay ngoài màn hình.

#### 10. 🗣️ Tương tác bằng giọng nói (tương lai)

- Khi học viên học trên mobile, thay vì gõ chữ vào AI chat, có thể bấm nút mic nói trực tiếp
- "Luyện phát âm" → app nghe và chấm điểm phát âm
- Đặc biệt quan trọng với tiếng Nhật/Đức — ngôn ngữ cần phát âm chính xác

---

### So sánh trước/sau (Dashboard mobile)

**Trước (hiện tại):**
```
┌──────────────────────────┐
│ Vào nhịp Tokutei, anh    │
│ Mỗi ngày một phiên...    │
├──────────────────────────┤
│ Stats: 0 | 3' | 0d       │
│ [Vào phiên ưu tiên]      │
│ [Khóa học]               │
├──────────────────────────┤
│ Grid 7 tools icons       │
│ (quá nhiều, rối)         │
├──────────────────────────┤
│ 4 daily tasks            │
├──────────────────────────┤
│ [Tìm kiếm...]            │
└──────────────────────────┘
```

**Sau (đề xuất):**
```
┌──────────────────────────┐
│ 🔥 3 ngày    Lv.5 ⭐     │
│                          │
│ Anh ơi, còn 2 từ nữa     │
│ là xong mục tiêu hôm nay! │
│                          │
│    ┌────────────────┐    │
│    │   ████████░░    │    │
│    │   80% hôm nay   │    │
│    └────────────────┘    │
│                          │
│ ┌──────────────────────┐ │
│ │ 📝 Học 5 từ mới      │ │
│ │ ▓▓▓▓▓▓▓▓░░ 4/5      │ │
│ └──────────────────────┘ │
│ ┌──────────────────────┐ │
│ │ 🎧 Nghe hội thoại    │ │
│ │ ○○●●● Chưa làm      │ │
│ └──────────────────────┘ │
│                          │
│ ┌──────────────────────┐ │
│ │   🚀 TIẾP TỤC HỌC    │ │
│ └──────────────────────┘ │
│                          │
│ 📅 ░░▒▒▓▓▓▓░... (30d)    │
│                          │
│ [Home] [Khóa] [Ôn] [Thi] │
└──────────────────────────┘
```

---

### Thứ tự triển khai UI mobile (trong các phase)

| Phase | Hạng mục | Chi tiết |
|-------|---------|---------|
| **P0** | Dashboard → "Nhiệm vụ hôm nay" | Gộp tools+tasks thành 1-3 task chính, CTA to ở dưới |
| **P0** | Progress ring + streak animation | Vòng tròn tiến độ ngày, animation lửa streak |
| **P1** | Micro-session timer | Timer đếm ngược 3-5 phút trong phiên học |
| **P1** | Combo + XP animation | Animation khi đúng liên tiếp, XP bay lên |
| **P1** | Bottom sheet cho tài liệu + tìm kiếm | Thay full-page bằng bottom sheet |
| **P1** | Reward animation (confetti) | Khi hoàn thành phiên học |
| **P2** | Streak calendar heatmap | Lịch 30 ngày dạng ô vuông màu |
| **P2** | Anticipation cards | "Ngày mai mở khóa...", "Còn X XP lên level" |
| **P2** | Haptic feedback | Rung khi đúng/sai (cần native app hoặc PWA) |
| **P2** | Swipe gestures | Vuốt trái/phải chuyển câu hỏi/từ vựng |

---

### Lưu ý kỹ thuật

- Giữ nguyên motion library (`motion`) đã có để làm animation
- Tận dụng Tailwind responsive classes (`md:`, `lg:`) — mobile first, desktop là bonus
- Bottom sheet có thể dùng thư viện hoặc custom với `motion` + `AnimatePresence`
- Haptic feedback cần PWA manifest + `navigator.vibrate()` — đơn giản, không cần native app
- Streak data: đã có `learning_activity_events` trong Supabase schema, có thể query streak từ đó
