# Design System Page Override

## Page
- Name: Admin Management Dashboard
- Route/Screen: `/admin`
- Purpose: quản lý vận hành app học tiếng Đức bằng dashboard dày dữ liệu, rõ trạng thái và dễ drill down
- Primary CTA: module-dependent mock action such as Review, Preview, Export, Message student

## Layout Override
- Hero/header: no marketing hero; use compact command bar with title, global search, date range mock, export mock, admin avatar
- Main sections: Overview, Courses, Students, Vocabulary, Assessments, Content, Reports
- Sidebar/nav: persistent 232px desktop sidebar; tablet icon rail; mobile horizontal section switcher
- Content density: high but controlled; tables and KPI cards can be compact if hierarchy stays clear

## Component Overrides
- Cards: KPI cards use tight metric tile layout, 14-18px radius, one big number, one trend/delta, one icon
- Tables/Lists: desktop uses dense tables with sticky-ish header styling, warm borders, hover tint, selected left accent; mobile uses entity cards
- Forms: filters use compact chips/select-like buttons; search is 40-44px high with clear focus ring
- Charts: use bars, capsules, sparklines, segmented distribution blocks; avoid heavy chart library in phase đầu
- Dialogs/Drawers: desktop right detail rail when space allows, tablet slide-over, mobile bottom sheet

## State Notes
- Loading: skeleton KPI cards and 5-8 skeleton table rows; no spinner-only empty space
- Empty: operational empty state with one action such as Reset filters or Review another section
- Error: inline alert panel scoped to module; message should explain mock data failed to render and offer retry
- Success: small confirmation toast/pill for mock actions; copy must not imply server persistence

## Content and Hierarchy
- Main message: admin can see health of learning operations at a glance
- Secondary content: recent activity, content quality alerts, selected entity recommendations
- Priority actions: inspect at-risk students, review low-score course/test, fix vocabulary quality issues

## Visual Mockup - Desktop

```text
┌────────────────────────────────────────────────────────────────────────────┐
│ TOKUTEI GINO Admin     Search students/courses...   May 2026   Export     │
├──────────────┬───────────────────────────────────────────────┬─────────────┤
│ Overview  ●  │ Admin command center                          │ Detail rail │
│ Courses      │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │ Selected    │
│ Students     │ │1,248   │ │342     │ │76%     │ │41 risk │ │ entity      │
│ Vocabulary   │ │Students│ │Active  │ │Complete│ │Students│ │ summary     │
│ Assessments  │ └────────┘ └────────┘ └────────┘ └────────┘ │             │
│ Content      │ ┌──────────────────────┐ ┌────────────────┐ │ Alerts      │
│ Reports      │ │ Learning trend bars  │ │ Level split    │ │ Actions     │
│              │ └──────────────────────┘ └────────────────┘ │             │
│              │ ┌───────────────────────────────────────────┐ │             │
│              │ │ Data table / operations queue             │ │             │
│              │ └───────────────────────────────────────────┘ │             │
└──────────────┴───────────────────────────────────────────────┴─────────────┘
```

## Visual Mockup - Mobile

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

## Responsive Notes
- Mobile behavior: tables become cards; filters become horizontally scrollable chips; detail rail becomes bottom sheet
- Tablet behavior: sidebar compresses to icon rail and drawer overlays; cards use two-column KPI grid
- Desktop behavior: 3-zone shell with persistent sidebar, content, optional right rail; no full-page horizontal scroll at 1280px

## Accessibility Notes
- Focus order: topbar search/actions → sidebar/section switcher → filters → table/list rows → detail drawer actions
- Screen reader notes: KPI cards need labels with metric meaning; progress bars need aria text like `Course completion 76 percent`
- Motion cautions: no bouncy transitions; respect reduced motion for drawer and row hover effects

## Deviation from Master
- What changes here: admin uses higher density, crisper table borders, less mascot/gradient, and neutral admin accent `#315C73`
- Why this page needs it: internal admin work depends on scanability, precise status, table readability, and fast comparison more than learner warmth

## UI Delivery Checklist
- [ ] visual hierarchy rõ giữa topbar, KPI, filters, table, detail rail
- [ ] spacing nhất quán ở KPI row, tables, detail drawer
- [ ] typography scale đủ đọc cho table 13px+ và labels 11px+ uppercase
- [ ] màu CTA nổi nhưng không chói trên nền kem
- [ ] hover/focus states rõ cho row, nav item, filter, drawer action
- [ ] loading, empty, error, success states có trong module hoặc shell
- [ ] contrast đủ an toàn cho badges, table metadata, alert severity
- [ ] keyboard navigation dùng được qua search, nav, filters, rows, drawer close
- [ ] mobile/tablet/desktop không vỡ layout với content dài
- [ ] token dùng nhất quán với `design-system/MASTER.md`
