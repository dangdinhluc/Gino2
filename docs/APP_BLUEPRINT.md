# TOKUTEI GINO — Tổng quan & Chức năng chi tiết

Ngày: 2026-07-27

---

## I. App là gì?

**TOKUTEI GINO** là nền tảng học tiếng trên mobile (web app/PWA) dành cho người Việt ôn thi chứng chỉ **Tokutei Ginou** (Kỹ năng đặc định) để sang Nhật làm việc.

**Mô hình kinh doanh:** Học viên mua gói (package) → được mở khóa khóa học trong gói → học từ vựng, luyện câu hỏi thi, xem tài liệu, chơi game ôn tập.

**Người dùng chính:** Học viên, dùng mobile là chủ yếu.

---

## II. Vai trò người dùng

| Vai trò | Mô tả |
|---------|-------|
| **Learner** (Học viên) | Người học chính. Đăng ký gói → vào khóa học → học từ vựng, luyện thi, xem tài liệu, chơi game. |
| **Admin** (Quản trị viên) | Quản lý nội dung: khóa học, gói, từ vựng, câu hỏi, học viên, theo dõi hoạt động. Có dashboard quản trị riêng. |

---

## III. Công nghệ

| Lớp | Công nghệ |
|-----|-----------|
| Frontend | React 19 + TypeScript + Vite 6 |
| UI | Tailwind CSS v4, `motion` (animation), Lucide Icons |
| Routing | React Router v7 |
| State | Zustand (localStorage persist) |
| Backend/DB | Supabase (PostgreSQL + Auth + RLS) |
| AI | Google Gemini (`@google/genai`) |
| Dev | Local Supabase (`supabase start`), `tsx` test runner |

---

## IV. Danh sách chức năng — đã có

### 1. Auth & Phân quyền ✅

| Chức năng | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Đăng nhập bằng email/password | ✅ Done | Supabase Auth |
| Quick login (chọn vai trò) | ✅ Done | Giao diện chọn Learner/Admin |
| Admin role check qua DB | ✅ Done | Bảng `admin_roles`, RLS policy |
| Learner role mặc định | ✅ Done | Trigger tự tạo profile khi signup |
| Protected route (learner + admin) | ✅ Done | Component `ProtectedRoute` |
| Session refresh tự động | ✅ Done | AuthProvider lắng nghe auth state change |
| Sign out | ✅ Done | Clear session, reset state |
| Seed tài khoản mẫu local | ✅ Done | `admin@example.test` / `learner@example.test` |

### 2. Trang công khai ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Landing page | ✅ Done | Trang chào, giới thiệu app |
| Onboarding | ✅ Done | 3 bước giới thiệu cho người mới |
| Terms of Service | ✅ Done | Trang điều khoản sử dụng |
| Privacy Policy | ✅ Done | Trang chính sách bảo mật |

### 3. Dashboard học viên ⚠️

| Chức năng | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Hero card + streak/stats | ✅ Done | Dùng mock data |
| Grid công cụ nhanh (7 tools) | ⚠️ Có nhưng rối | Quá nhiều icon, cần đơn giản hóa |
| Daily tasks (4 tasks) | ⚠️ Có | Mock data, chưa liên kết Supabase |
| Tìm kiếm nội dung | ✅ Done | Search landing page |
| Stats & Achievements | ⚠️ Shell | Trang có nhưng mock data tĩnh |

### 4. Khóa học (Courses) ✅

| Chức năng | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Danh sách khóa học | ✅ Done | Filter theo level, search, responsive |
| Chi tiết khóa học | ✅ Done | Module, bài học, progress, từ vựng |
| **Learning Workspace** | ✅ Done | **Module mạnh nhất của app** |
| ↳ Tab Từ vựng | ✅ Done | Flashcard với status (new/learning/due/remembered), filter, search |
| ↳ Tab Ôn tập | ✅ Done | 2 chế độ: Vocabulary review + Quiz (4 đáp án) |
| ↳ Tab Tài liệu | ⚠️ List | Chỉ hiển thị danh sách, chưa có viewer |
| ↳ Tab Games | ✅ Done | Link sang các game với context khóa học |
| ↳ Tab Thi thử | ✅ Done | Link sang exam |
| Podcast player | ✅ Done | Mock episodes, player UI |
| SRS (Spaced Repetition) | ✅ Done | Từ vựng có status flow: new→learning→due→remembered |
| Lưu tiến độ từ vựng | ✅ Done | Gọi Supabase `vocabulary_progress` |
| Lưu kết quả ôn tập | ✅ Done | Gọi Supabase `review_attempts` |

### 5. Game ôn tập ✅

| Game | Trạng thái | Kiểu chơi |
|------|-----------|-----------|
| **FlappyVocab** | ✅ Hoàn chỉnh | Flappy Bird + trả lời nghĩa từ khi chạm ống. Canvas loop, physics, SRS integration |
| **Memory Match** | ✅ Hoàn chỉnh | Lật bài ghép cặp Nhật↔Việt |
| **Word Builder** | ✅ Hoàn chỉnh | Xếp chữ cái thành từ romaji, có hint system |
| **VocabSprint** | ✅ Hoàn chỉnh | Chọn nghĩa đúng trong thời gian giới hạn |
| **SituationGame** | ✅ Hoàn chỉnh | Điền từ vào chỗ trống theo tình huống thực tế |
| GameShell (shared) | ✅ Done | Khung game chung: header, điểm, thanh tiến trình |
| GameStore (shared) | ✅ Done | Zustand store: score, combo, feedback, SRS |
| CourseGameStore | ✅ Done | Context khóa học để game dùng từ vựng thật của khóa |
| Game generators | ✅ Done | 5 generators từ vựng khóa học → rounds cho từng game |
| Game màn hình riêng | ✅ Done | `/app/game/:gameId` — full screen, không nav bar |

### 6. Thư viện Ngữ pháp & Từ vựng ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Grammar Library | ✅ Done | Danh sách chủ đề ngữ pháp |
| Grammar Topic Detail | ✅ Done | Chi tiết 1 chủ đề, có ví dụ |
| Vocabulary Detail | ✅ Done | Chi tiết 1 từ: nghĩa, phát âm, ví dụ |

### 7. Luyện thi (Exams) ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Exam Center | ✅ Done | Danh sách đề thi, filter theo kỹ năng |
| Exam Runner | ✅ Done | Làm bài: câu hỏi trắc nghiệm + timer |
| Exam Result | ✅ Done | Kết quả: điểm từng phần, review đáp án |

### 8. AI Tutor ⚠️ (mock)

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| AI Chat (Tutor Chat) | ⚠️ Mock | Keyword matching, chưa gọi Gemini thật |
| AI Writing Lab | ⚠️ Mock | Giao diện viết bài, chưa AI chấm |
| AI Speaking Lab | ⚠️ Mock | Giao diện luyện nói, chưa AI đánh giá |
| Writing History | ⚠️ Mock | Lịch sử bài viết |
| Speaking History | ⚠️ Mock | Lịch sử luyện nói |
| Mobile AI Popover | ⚠️ Mock | Floating button chat trên mobile |

### 9. Ôn tập (Review) ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Review Center | ✅ Done | Tổng hợp các chế độ ôn: thẻ nhớ, hồ sơ, mock test, listening |
| Flashcard Session | ✅ Done | Phiên ôn thẻ từ vựng |

### 10. Learning Hub ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Game Hub | ✅ Done | Trang tập trung tất cả game, có game card + leaderboard |

### 11. Admin Dashboard ✅

| Chức năng | Trạng thái | Ghi chú |
|-----------|-----------|---------|
| Tổng quan (KPIs) | ✅ Done | Học viên, khóa học, từ vựng, doanh thu |
| Quản lý Packages (gói) | ✅ Done | CRUD gói, gán khóa học vào gói |
| Quản lý Courses | ✅ Done | Danh sách + chi tiết khóa học |
| Quản lý Course Content | ✅ Done | Modules, lessons, exercises |
| Quản lý Học viên | ✅ Done | Danh sách, tiến độ, hoạt động |
| Quản lý Từ vựng | ✅ Done | Thêm/sửa/xóa từ vựng |
| Quản lý Đề thi (Assessments) | ✅ Done | Tạo đề, thêm câu hỏi |
| Quản lý Tài liệu | ✅ Done | Upload/link tài liệu |
| Quản lý Audio/Podcast | ✅ Done | Metadata podcast |
| AI Prompts management | ✅ Done | Quản lý prompt template cho AI |
| API Keys management | ✅ Done | Quản lý key dịch vụ ngoài |
| Activity logs | ✅ Done | Nhật ký hoạt động admin |
| Alerts | ✅ Done | Cảnh báo hệ thống |
| Supabase integration panel | ✅ Done | Theo dõi trạng thái kết nối Supabase |
| Mobile responsive | ✅ Done | Có mobile entity list riêng |

### 12. Social & Community ❌ (shell)

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Friends | ❌ Shell | Trỏ về `PhaseTwoPages`, UI tĩnh mock data |
| Messages | ❌ Shell | Trỏ về `PhaseTwoPages`, UI tĩnh mock data |
| Journal (Nhật ký học) | ❌ Shell | Trỏ về `PhaseTwoPages`, UI tĩnh mock data |

### 13. Profile & Settings ✅

| Màn hình | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Profile | ✅ Done | Thông tin cá nhân, streak, XP |
| Settings | ✅ Done | Cài đặt app (thông báo, AI, mục tiêu), toggle UI |

### 14. Navigation ✅

| Thành phần | Trạng thái | Ghi chú |
|------------|-----------|---------|
| Sidebar (desktop) | ✅ Done | Collapsible, có rail hints |
| Bottom Nav (mobile) | ✅ Done | 5 tab: Home, Khóa học, Ôn tập, Luyện thi, Từ của tôi |
| Main Layout | ✅ Done | Ẩn sidebar/bottom nav trong course learning |

### 15. Hạ tầng & Dữ liệu ✅

| Thành phần | Trạng thái | Ghi chú |
|------------|-----------|---------|
| Supabase schema | ✅ Done | 18 bảng: profiles, admin_roles, courses, modules, lessons, vocabulary, review_questions, assessments, documents, podcasts, enrollments, learner_profiles, progress... |
| RLS policies | ✅ Done | Phân quyền đọc/ghi theo role |
| Migrations | ✅ Done | 3 file SQL migration |
| Seed data | ✅ Done | Tài khoản mẫu + khóa học mẫu + từ vựng mẫu |
| Repositories pattern | ✅ Done | Tách biệt Supabase calls khỏi UI |
| TypeScript types | ✅ Done | `tsc --noEmit` pass sạch |
| Tests | ✅ Done | 10 file test (game, auth, admin, supabase) |

---

## V. Danh sách chức năng — CÒN THIẾU

### 🔴 P0 — Cốt lõi, cần làm ngay

#### P0.1 Enrollment Flow (Đăng ký gói → Khóa học của tôi)

- **Màn "Gói học"** cho học viên: xem danh sách packages (Free, A1 Accelerator, JFT Prep...)
- **So sánh gói**: tính năng, giá, khóa học trong gói, quota AI
- **Đăng ký gói**: flow chọn gói → xác nhận (với gói free thì instant, gói paid thì cần tích hợp thanh toán sau)
- **Màn "Khóa học của tôi"**: chỉ hiển thị khóa học thuộc gói đã đăng ký
- **Backend**: bảng `enrollments` đã có schema, cần repository + UI

#### P0.2 Document Viewer (Xem tài liệu ngay trong app)

- **Render PDF**: component xem PDF trực tiếp trong app (dùng thư viện như `react-pdf` hoặc iframe)
- **Render bài viết (Post)**: hiển thị nội dung dạng bài đọc với markdown/HTML
- **Navigation trong tài liệu**: mục lục, chuyển trang, zoom
- **Chế độ toàn màn hình**: ẩn UI phụ khi đọc tài liệu dài

#### P0.3 Ghi chú cá nhân trên tài liệu

- **Highlight text**: bôi đen văn bản → chọn màu highlight
- **Ghi chú (note)**: gắn ghi chú vào vị trí cụ thể trong tài liệu
- **Danh sách ghi chú của tôi**: xem tất cả ghi chú đã tạo, lọc theo tài liệu
- **Backend**: cần thêm bảng `document_annotations` hoặc `user_notes`
- **UI**: bottom sheet khi highlight text trên mobile

### 🟡 P1 — Quan trọng, làm sau P0

#### P1.1 Dashboard cá nhân (có dữ liệu thật)

- **Streak tracker**: số ngày học liên tiếp, animation lửa
- **Mục tiêu ngày**: vòng tròn tiến độ (ring), fill dần theo XP
- **Heatmap học tập**: lịch 30 ngày dạng ô vuông màu (như GitHub)
- **Từ đã học**: tổng số, phân loại (new/learning/remembered)
- **Điểm yếu**: từ/câu hỏi hay sai, gợi ý ôn lại
- **Badge/Thành tích**: streak mốc 7-30-100 ngày, hoàn thành khóa đầu tiên...

#### P1.2 Micro-session & Gamification

- **Phiên học 3-5 phút**: timer đếm ngược, text khuyến khích
- **XP + Level system**: mỗi hành động (học từ, trả lời đúng, streak) → XP → Level
- **Animation reward**: confetti khi xong phiên, XP bay lên, combo lửa
- **Daily reward**: mở app mỗi ngày nhận XP bonus
- **Haptic feedback**: rung nhẹ khi đúng/sai trên mobile (PWA `navigator.vibrate`)
- **Swipe gesture**: vuốt trái/phải chuyển câu hỏi/từ vựng trong phiên học

#### P1.3 AI Tutor thật (gọi Gemini API)

- **AI Chat**: streaming response, context từ khóa học hiện tại
- **AI Writing Lab**: gửi bài viết → AI chấm điểm, sửa lỗi, gợi ý
- **AI Speaking Lab**: ghi âm → speech-to-text → AI đánh giá phát âm
- **Rate limiting**: theo quota gói (Free: 20/tháng, Pro: 180-260/tháng)
- **Bảo mật**: chuyển API key ra backend, không expose qua Vite client-side

#### P1.4 Bottom Sheet thay full-page

- **Tài liệu**: mở trong bottom sheet 80% màn hình
- **Tìm kiếm**: bottom sheet với input focus ngay
- **Ghi chú**: bottom sheet nhỏ khi bôi đen text
- **AI Chat**: có thể kéo từ popover thành bottom sheet

### 🟢 P2 — Retention & Polish, làm sau

#### P2.1 Cộng đồng học viên

- **Kết bạn / Follow**: gửi lời mời kết bạn, danh sách bạn bè
- **Bảng tin (feed)**: chia sẻ tiến độ, streak, thành tích, bài viết
- **Group thảo luận**: theo khóa học, theo chủ đề (hồ sơ, phỏng vấn...)
- **Nhắn tin**: chat 1-1 giữa học viên
- **Bảng xếp hạng**: leaderboard theo XP, streak, từ đã học

#### P2.2 Notification

- **Nhắc học hàng ngày**: "Anh ơi, hôm nay chưa học từ nào!"
- **Nhắc ôn tập**: "Có 8 từ đến hạn ôn tập hôm nay"
- **Thông báo khóa mới/gói mới**: từ admin
- **Kênh**: push notification (PWA), email, hoặc in-app notification center

#### P2.3 Cải thiện kỹ thuật

- **Viết README.md**: hướng dẫn setup, mô tả dự án
- **Dọn file rác**: xóa `_nm.tar`, `_nm.tar.gz`, `_gino_snapshot.tar.gz`, `_zustand_pkg.tar.gz`
- **`.gitignore`**: thêm `.DS_Store`, file tạm
- **Error Boundary**: component bắt lỗi, tránh crash toàn app
- **Loading skeleton**: pattern cho các trang gọi Supabase
- **Lazy load routes**: tách `app-routes.tsx` khỏi 28 imports thẳng

#### P2.4 Tính năng tương lai

- **Tương tác giọng nói**: nói thay vì gõ trong AI Chat, luyện phát âm
- **Offline mode**: học được khi không có mạng (PWA + sync sau)
- **Dark mode**
- **Đa ngôn ngữ UI** (Việt ↔ Nhật)

---

## VI. Luồng người dùng chính

```
NGƯỜI MỚI                              HỌC VIÊN QUAY LẠI
    │                                        │
    ▼                                        ▼
Landing Page                            Đăng nhập
    │                                        │
    ▼                                        ▼
Đăng ký tài khoản                  ┌── Dashboard ("Nhiệm vụ hôm nay")
    │                              │
    ▼                              │    ┌─────────────────────────┐
Onboarding (3 bước)                │    │ 🔥 Streak 3 ngày        │
    │                              │    │ 📝 Học 5 từ mới   4/5   │
    ▼                              │    │ 🎧 Nghe hội thoại       │
Chọn gói học                       │    │ [🚀 TIẾP TỤC HỌC]       │
    │                              │    └─────────────────────────┘
    ▼                              │
Khóa học của tôi ──────────────────┘
    │
    ▼
Chi tiết khóa học
    │
    ▼
Learning Workspace
    │
    ├── Tab Từ vựng ──→ Flashcard, filter, SRS
    ├── Tab Ôn tập  ──→ Vocabulary review + Quiz trắc nghiệm
    ├── Tab Tài liệu ──→ PDF/Post viewer + ghi chú cá nhân
    ├── Tab Games   ──→ FlappyVocab, Memory Match, Word Builder...
    └── Tab Thi thử ──→ Làm đề, timer, chấm điểm
```

---

## VII. Tổng kết nhanh

| Nhóm | Đã có | Còn thiếu |
|------|-------|-----------|
| Core Learning (khóa học + từ vựng + ôn tập) | ✅ 90% | Document viewer, ghi chú |
| Game (5 games) | ✅ 100% | — |
| Auth + Phân quyền | ✅ 100% | — |
| Admin Dashboard | ✅ 95% | — |
| AI Tutor | ⚠️ 20% | Gọi Gemini thật, streaming, writing/speaking eval |
| Enrollment (gói → khóa của tôi) | ❌ 10% | Toàn bộ UI flow |
| Dashboard học viên | ⚠️ 40% | Dữ liệu thật, gamification, heatmap |
| Cộng đồng | ❌ 5% | Friends, feed, messages, group |
| Notification | ❌ 0% | Push, email, in-app |
| Mobile UX | ⚠️ 50% | Bottom sheet, micro-session, one-thumb, reward animation |
