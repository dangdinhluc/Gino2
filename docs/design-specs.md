# Design Specs

## Project Context
- Project: TOKUTEI GINO
- Screen/Page: Course Learning Workspace
- Product category: education web app
- Primary goal: biến màn học khóa học thành workspace học tập chuyên nghiệp, tập trung, dễ quay lại mỗi ngày
- Primary audience: người lớn học tiếng Nhật theo lộ trình Tokutei Ginou (kỹ năng đặc định), cần cảm giác tin cậy và có tổ chức

## Visual Direction
- Pattern: professional learning workspace with app shell + productivity rail
- Style family: trust-first premium education
- Mood: focused, warm, polished, calm
- Palette family: warm cream / deep navy / refined orange / subtle plum
- Typography pairing: Manrope + Inter
- Shape language: rounded large cards, mềm nhưng gọn, không playful quá mức
- Density: balanced, ưu tiên phân cấp rõ hơn số lượng hiệu ứng
- Theme mode: light

## Color Palette
| Token | Value | Usage |
|------|-------|-------|
| primary | #C96A1B | CTA chính, progress active, selected states |
| secondary | #6F4AA8 | accent phụ, AI suggestion, secondary chips |
| background | #F7F1E8 | nền app chính |
| surface | #FFF9F2 | card, panel, sticky nav |
| text-primary | #172033 | heading, main content |
| text-secondary | #5F6B7C | mô tả, metadata |
| success | #2F8F6B | completed, remembered |
| warning | #D68A1F | due review, caution |
| danger | #C65B57 | incorrect answer, destructive states |

## Typography Scale
- Heading font: Manrope
- Body font: Inter
- Display usage: hero title, progress headline, tab section headers
- H1: 48/56, 800
- H2: 32/40, 800
- H3: 24/32, 750
- Body: 15/24, 500
- Caption: 12/16, 700

## Spacing and Layout
- Container width: 1440px max on desktop
- Grid: desktop `240px / minmax(0, 1fr) / 320px`, tablet 2-column, mobile single-column with sticky bottom tabs
- Section spacing: 24px mobile, 32px desktop
- Card spacing: 20px mobile, 24px desktop
- Mobile behavior: sticky compact header, bottom segmented nav, key stats pinned in compact strip
- Tablet behavior: hero compresses into two rows, content panels stack with preserved hierarchy
- Desktop behavior: left workspace nav persistent, center panel dominant, right rail stays visible with daily guidance

## Radius and Elevation
- Radius system: 18 / 24 / 30 / 36
- Border style: 1px warm neutral borders with subtle opacity shifts by hierarchy
- Shadow/elevation: soft layered shadows, low blur, warm tint, no heavy floating glass

## Motion
- Transition speed: 160ms fast interactions, 220ms panel changes
- Hover behavior: nhẹ nâng card + viền accent rõ hơn
- Focus behavior: ring tương phản cao, tone orange-navy rõ trên nền kem
- Reduced motion fallback: bỏ translate/scale, giữ opacity và color transitions thôi

## States
- Loading: skeleton cards với shimmer rất nhẹ trên list, panel, right rail
- Empty: card thân thiện với CTA quay lại tab phù hợp, có icon + copy ngắn
- Error: inline message trong panel, không phá layout, có retry CTA rõ
- Success: badge xanh ấm + toast gọn cho actions như nghe audio, hoàn thành từ

## Component Notes
- Buttons: CTA chính dùng orange deep fill; secondary dùng white surface + orange border; tertiary dạng ghost text
- Inputs: background trắng sạch, border mềm, icon leading, focus state rõ hơn hiện tại
- Cards: chia 3 cấp rõ: hero card, workspace panel, item card; mỗi cấp có shadow/radius riêng
- Navigation: left nav cần cảm giác tool rail chuyên nghiệp, active state dùng surface nổi + icon capsule
- Tables/Charts: nếu có progress metrics, dùng bars và capsules thay vì chart rối
- Modals/Drawers: modal từ vựng chuyển sang sheet sạch, nhiều khoảng trắng, actions nổi bật

## Screen-Specific Notes
- Hero/Header: đổi từ cảm giác “landing section” sang “daily learning command center” với headline ngắn, trust badges, progress capsule
- Main content: tab đang chọn phải có một panel chủ đạo lớn, trong đó list và preview phân cấp rõ, tránh nhiều card ngang vai nhau
- Secondary content: right rail là lớp productivity support, không tranh spotlight với khu học chính
- Primary CTA: `Tiếp tục học từ` hoặc action theo tab phải luôn dễ thấy ngay fold đầu

## Anti-Patterns to Avoid
- hiệu ứng quá vui hoặc mascot-heavy làm giảm cảm giác chuyên nghiệp cho người lớn
- quá nhiều nền màu cam khiến hierarchy bị bẹt và mỏi mắt
- blur nặng, shadow đậm, card chồng dày gây cảm giác app demo thay vì product thật

## Build Handoff Notes
- Code must follow design-system/MASTER.md first.
- Page overrides may refine local behavior only.
- Keep tokens and interaction states consistent in implementation.
- Ưu tiên làm lại hierarchy của hero, left nav, main panel, right rail trước khi thêm hiệu ứng mới.
- ReviewPanel và VocabularyPanel nên dùng chung panel shell để giảm drift visual.

---

> ⚠️ OUTDATED (2026-07-11): Phần spec 6 game dưới đây (Der/Die/Das Rush, Wortschmiede, Satzpuzzle, Kasus Kampf, Diktat Sprint, Aussprache Echo) dựa hoàn toàn trên ngữ pháp tiếng Đức (giống từ der/die/das, cách Akkusativ/Dativ) — các khái niệm này KHÔNG tồn tại trong tiếng Nhật nên không áp dụng được cho Tokutei Ginou. 6 game này chưa từng được code (đã xác nhận qua audit `types.ts`). Nếu muốn mở rộng Game Zone thêm game mới, cần thiết kế lại mechanic từ đầu cho phù hợp tiếng Nhật (xem `plans/2026-07-11-tokutei-full-migration/awf-plan.md`), không dùng lại spec cũ này. Phần Hub layout, color palette, motion, shell pattern chung vẫn có thể tái dùng.

# Game Zone Visual Specs

## Project Context
- Project: TOKUTEI GINO
- Screen/Page: Learning Hub + 6 Game Screens
- Routes: `/app/hub` (hub), `/app/hub/:gameId` (in-game)
- Product category: gamified language learning
- Primary goal: biến game từ mock quiz thành 6 trò chơi học tập thật, mỗi game một cơ chế riêng, gắn với vốn từ và tình huống Tokutei Ginou
- Primary audience: người lớn học tiếng Nhật công việc Tokutei, cần game vừa vui vừa hiệu quả, không childish

## Visual Direction — Hybrid Mode
- Hub page: calm, curated, warm — nằm trong MainLayout
- In-game screens: immersive, focused — full viewport, thoát MainLayout
- Pattern: calm portal → immersive focus mode
- Style: premium adult gaming meets education
- Mood: Hub = warm invitation; In-game = focused flow state
- Shape language: Hub rounded large (24-30px); In-game rounded medium (14-18px) for tighter controls

## Hub Color Palette
| Token | Value | Usage |
|------|-------|-------|
| hub-bg | #F7F1E8 | Hub background (inherits app bg) |
| hub-surface | #FFF9F2 | Game cards |
| hub-border | #E4D8C9 | Card borders |
| hub-text | #172033 | Titles |
| hub-meta | #5F6B7C | Subtitles, level badges |
| daily-accent | #C96A1B | Daily Challenge highlight |

## In-Game Color Palette
| Token | Value | Usage |
|------|-------|-------|
| game-bg | #0F1419 | Dark base background |
| game-surface | #1A2332 | Card/panel surfaces in-game |
| game-border | #2A3544 | Subtle borders |
| game-text | #F9FAFB | Primary text (white) |
| game-text-muted | #9CA3AF | Secondary text |
| game-correct | #10B981 | Correct feedback |
| game-wrong | #EF4444 | Wrong feedback |
| game-combo | #F59E0B | Combo/streak highlight |

## Game-Specific Accent Colors
| Game | Accent | CSS var |
|------|--------|---------|
| Der/Die/Das Rush | #3B82F6 | --game-accent-rush |
| Wortschmiede | #8B5CF6 | --game-accent-forge |
| Satzpuzzle | #06B6D4 | --game-accent-puzzle |
| Kasus Kampf | #EF4444 | --game-accent-kampf |
| Diktat Sprint | #10B981 | --game-accent-diktat |
| Aussprache Echo | #F59E0B | --game-accent-echo |

## Typography — In-Game
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Game prompt | Manrope | 28-36px | 800 |
| Options/buttons | Inter | 16-18px | 700 |
| Score/meta | Inter | 12px | 700 |
| Feedback text | Inter | 15px | 600 |
| Rule explainer | Inter | 13px | 500 |

## Hub Layout
- Desktop: Daily Challenge hero card (full width) + 3×2 game card grid
- Tablet: Daily Challenge + 2×3 grid
- Mobile: Daily Challenge + 2-column grid, scrollable
- Card anatomy: accent dot → title → subtitle → level badge → progress indicator
- Bottom stats strip: streak + weekly XP

## In-Game Shared Shell
- Top bar: back button + game name + score + combo counter
- Progress bar: 4px height, accent color fill, spring animation
- Gameplay area: center, max-width 640px on desktop
- Feedback bar: bottom slide-up toast, auto-dismiss 1.5s
- No sidebar, no app navigation — pure focus

## Game Mechanics Summary
| # | Game | Mechanic | Input | Skill |
|---|------|----------|-------|-------|
| 1 | Der/Die/Das Rush | Article classification | Tap 1 of 3 | Vocab gender |
| 2 | Wortschmiede | Compound word building | Drag/tap to combine | Compound vocab |
| 3 | Satzpuzzle | Word order reorder | Drag-and-drop | Grammar structure |
| 4 | Kasus Kampf | Case selection | Tap article per blank | Akk/Dat cases |
| 5 | Diktat Sprint | Dictation typing | Keyboard input | Listening + spelling |
| 6 | Aussprache Echo | Pronunciation | Hold-to-speak | Speaking |

## Motion — In-Game
| Event | Animation | Duration |
|-------|-----------|----------|
| Correct answer | scale(1.05) + accent glow | 200ms |
| Wrong answer | translateX shake ±4px + red flash | 150ms |
| Combo milestone | particle burst from score | 300ms |
| Progress advance | spring fill | 250ms |
| Round transition | crossfade | 180ms |
| Hub → Game | fade from black | 200ms |
| Game → Result | card scale from 0.95 | 300ms |

## States
- Loading: dark skeleton with accent shimmer
- Empty (no rounds): "Chưa có dữ liệu cho game này" + back to hub CTA
- Error (audio fail): inline retry with fallback text
- Game Over (Kasus Kampf): hearts depleted → summary card
- Complete: result card with score, combo, XP, replay/hub buttons

## Anti-Patterns to Avoid
- Không dùng nền sáng cream cho in-game — phải tối để tạo focus
- Không dùng mascot/illustration lớn trong gameplay area
- Không dùng quá nhiều particle/confetti — chỉ dùng khi perfect score
- Không để game controls quá nhỏ trên mobile — 48px minimum touch target
- Không mix nhiều accent color trong 1 game screen — mỗi game chỉ dùng 1 accent
- Không để feedback toast che gameplay area — luôn ở bottom bar riêng

## Build Handoff Notes
- Game screens MUST NOT use MainLayout — render as standalone full-viewport routes
- Use CSS custom properties for game accent so 1 component serves all 6 games
- Shared GameShell component: top bar + progress + feedback + gameplay slot
- Each game is a separate gameplay component rendered inside GameShell
- Drag-and-drop: use `@dnd-kit/core` for Satzpuzzle and Wortschmiede
- Audio: Web Speech Synthesis API for Diktat Sprint TTS; Web Speech Recognition for Echo
- SRS integration: wrong answers feed into ReviewCenter's SRS queue
- Data: game rounds should come from Supabase vocabulary/review_questions tables
- Route structure: keep `/app/hub/:gameId` but render outside MainLayout wrapper

---

# Admin Dashboard Visual Specs

## Project Context
- Project: TOKUTEI GINO
- Screen/Page: Admin Management Dashboard
- Route: `/admin`
- Product category: internal education operations dashboard
- Primary goal: giúp admin quản lý khóa học, học viên, từ vựng, bài kiểm tra và chất lượng nội dung bằng giao diện dày dữ liệu nhưng dễ đọc
- Primary audience: admin/operator và teacher/content manager

## Visual Direction
- Pattern: data-first operational dashboard
- Style family: clean operational, gợi nhịp Linear + Notion + một chút Apple nhưng giữ brand ấm của TOKUTEI GINO
- Mood: focused, precise, calm, trustworthy
- Palette family: warm cream / ink navy / refined orange / muted plum / operational blue-gray
- Typography pairing: Manrope + Inter
- Shape language: rounded medium-large, crisp table rows, subtle dividers
- Density: information-dense but readable
- Theme mode: light

## Color Palette
| Token | Value | Usage |
|------|-------|-------|
| primary | #C96A1B | active section, primary CTA, key progress |
| secondary | #6F4AA8 | analytical accent, smart insight chips |
| admin-accent | #315C73 | table focus, neutral operational charts |
| background | #F5EFE6 | admin app background |
| surface | #FFFCF7 | main cards and panels |
| surface-muted | #F0E8DC | table header, inactive nav, filter bands |
| text-primary | #172033 | headings, table primary text |
| text-secondary | #5F6B7C | descriptions, metadata |
| border | #E4D8C9 | dividers and table borders |
| success | #2F8F6B | healthy metrics, completed, active |
| warning | #D68A1F | pending review, stale content |
| danger | #C65B57 | at-risk, low score, critical alert |

## Typography Scale
- Heading font: Manrope
- Body font: Inter
- Display usage: admin page title and KPI numbers only
- H1: 34/42, 800
- H2: 24/32, 800
- H3: 18/26, 750
- Body: 14/22, 500
- Table: 13/20, 600 for important cells, 500 for metadata
- Caption: 11/16, 700 uppercase for labels and table headers

## Spacing and Layout
- Container width: full viewport admin shell, content max useful width 1600px
- Grid: desktop `232px / minmax(0, 1fr) / 340px`; tablet `72px / 1fr`; mobile single-column
- Section spacing: 24px desktop, 18px tablet, 14px mobile
- Card spacing: 16px desktop, 14px mobile
- Mobile behavior: topbar + horizontal section switcher, tables become stacked entity cards, drawer becomes bottom sheet
- Tablet behavior: sidebar compresses to icons, detail drawer overlays from right
- Desktop behavior: persistent sidebar, sticky topbar, optional right rail for selected entity and alerts

## Radius and Elevation
- Radius system: 14 / 18 / 22 / 28
- Border style: 1px warm neutral border with stronger table row separators than learner screens
- Shadow/elevation: very subtle Apple-like lift; tables rely more on borders and spacing than heavy shadows

## Motion
- Transition speed: 120ms hover/focus, 180ms section switch, 220ms drawer open
- Hover behavior: row tint + left accent line, no playful bounce
- Focus behavior: high-contrast orange/navy ring with visible offset
- Reduced motion fallback: remove slide/lift, keep opacity and border-color changes

## States
- Loading: skeleton KPI cards, skeleton table rows, muted shimmer only
- Empty: operational empty card with one recovery action such as `Reset filters`
- Error: inline panel with clear message and retry action, no full-page takeover
- Success: small toast/status pill for mock actions, copy must not imply backend persistence

## Component Notes
- Buttons: primary orange for one main action; secondary surface buttons for Review/Export/Preview; destructive actions muted red outline only
- Inputs: compact search with icon, 40-44px height, strong border/focus state
- Cards: KPI cards are compact metric tiles; insight cards can be larger but must not compete with tables
- Navigation: sidebar item uses icon + label, active state with warm surface, orange left bar, and stronger text
- Tables/Charts: prefer table + bar/capsule microcharts; no chart library needed in phase đầu
- Modals/Drawers: desktop right rail/drawer, tablet overlay drawer, mobile bottom sheet

## Screen-Specific Notes
- Header: `Admin command center` with search, date range mock, export mock, admin avatar; no mascot/learner CTA
- Main content: overview first, then section switcher/table modules; visible filters above every data table
- Secondary content: right rail shows selected row summary, alerts, recommended actions
- Primary CTA: module-dependent; for phase đầu actions are mock and should be labeled honestly

## ASCII Mockup - Desktop

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ TOKUTEI GINO Admin     Search students/courses...   May 2026   Export     │
├──────────────┬───────────────────────────────────────────────┬─────────────┤
│ Overview  ●  │ Admin command center                          │ Detail rail │
│ Courses      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │ Selected    │
│ Students     │ │1,248   │ │342     │ │76%     │ │41 risk │ │ course /    │
│ Vocabulary   │ │Students│ │Active  │ │Complete│ │Students│ │ student     │
│ Assessments  │ └────────┘ └────────┘ └────────┘ └────────┘ │             │
│ Content      │ ┌──────────────────────┐ ┌────────────────┐ │ Alerts      │
│ Reports      │ │ Learning trend bars  │ │ Level split    │ │ Actions     │
│              │ └──────────────────────┘ └────────────────┘ │             │
│              │ ┌───────────────────────────────────────────┐ │             │
│              │ │ At-risk students table                    │ │             │
│              │ └───────────────────────────────────────────┘ │             │
└──────────────┴───────────────────────────────────────────────┴─────────────┘
```

## ASCII Mockup - Mobile

```text
┌─────────────────────────────────────┐
│ Admin        Search        Export   │
├─────────────────────────────────────┤
│ Overview | Courses | Students | ... │
├─────────────────────────────────────┤
│ Students 1,248   Active 342         │
│ Complete 76%     At risk 41         │
├─────────────────────────────────────┤
│ Filter: Level A1  Risk All          │
├─────────────────────────────────────┤
│ Anna Müller                         │
│ A1 Foundation · 42% · At risk       │
│ Last active 7d ago · Avg 61         │
├─────────────────────────────────────┤
│ Tap card -> bottom sheet detail     │
└─────────────────────────────────────┘
```

## Anti-Patterns to Avoid
- Không dùng mascot, hero marketing hoặc gradient lớn trong admin.
- Không dùng rainbow chart; mỗi metric chỉ cần một màu có ý nghĩa.
- Không ép bảng desktop xuống mobile; mobile phải chuyển thành card.
- Không dùng blur/glassmorphism làm giảm readability của số liệu.
- Không làm action mock giống như đã lưu thật lên server.

## Build Handoff Notes
- Code must follow `design-system/MASTER.md` first.
- Admin page must follow `design-system/pages/admin-dashboard.md` overrides.
- Keep admin route outside learner `MainLayout` unless anh explicitly changes direction.
- Prioritize Overview, Students, Courses, Vocabulary before Reports polish.
- Browser QA required at 1440px, 1024px, 768px, and 375px.
