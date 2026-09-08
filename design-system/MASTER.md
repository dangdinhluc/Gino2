# Design System Master

## Project
- Name: TOKUTEI GINO
- Product category: education web app
- Platform: responsive web app
- Primary audience: adult Tokutei Ginou (Japan work-skill visa) learners using structured self-study flows
- Primary goal: make study flows feel premium, trustworthy, and focused without losing warmth

## Visual Direction
- Pattern: app workspace with learning command center
- Style family: trust-first premium education
- Mood: calm, capable, friendly, modern
- Density: balanced
- Theme mode: light
- Brand direction: purple-first, visually aligned with the GINO mascot family

## Color Tokens
| Token | Value | Usage |
|------|-------|-------|
| primary | #6F45D8 | CTA, active navigation, progress, selected actions |
| primary-strong | #5631B8 | CTA hover/pressed, strong active emphasis |
| primary-soft | #EEE7FF | selected surfaces, badges, subtle emphasis |
| secondary | #8A72C7 | supporting purple emphasis, AI and smart suggestions |
| background | #F7F4FC | app background |
| surface | #FFFCFF | cards, panels |
| surface-soft | #F4EFFB | secondary panels, filters, passive states |
| border | #E5DCF2 | default borders and separators |
| text-primary | #211B35 | main text |
| text-secondary | #6F6880 | muted text |
| success | #2F8F6B | positive states only |
| warning | #D68A1F | warning states only |
| danger | #C65B57 | destructive/error states only |

## Color Usage Rules
- Purple is the dominant brand color across learner navigation, CTA, progress, focus, active tabs and selected states.
- Do not reintroduce orange as a generic brand accent. Orange is reserved for semantic warning/energy details only when meaningfully needed.
- AI may use the secondary/lighter purple family but must still feel part of the same GINO palette.
- Success, warning and danger colors keep semantic meaning and must not be recolored to purple.
- Prefer pale lavender surfaces over beige/yellow surfaces so mascot illustrations and controls feel visually connected.

## Typography
- Heading font: Manrope
- Body font: Inter
- UI font fallback: system-ui, sans-serif
- Tone: modern, trustworthy, readable
- Notes: headings dùng weight mạnh và tracking chặt; body tránh quá nhỏ trên mobile

## Spacing and Layout
- Container width: 1440px max
- Grid system: 12-column desktop foundation, app-shell split layouts for workspace pages
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40
- Section rhythm: generous top-level spacing, tighter inside dense study panels
- Mobile priority: key action và active context luôn hiện trong first viewport

## Radius and Elevation
- Radius scale: 18 / 24 / 30 / 36
- Border style: lavender-neutral 1px borders with soft contrast
- Shadow/elevation approach: subtle purple-neutral layered shadows, no heavy blur stacks

## Motion
- Transition timing: 160ms micro, 220ms panel, 300ms modal entry max
- Hover behavior: small lift, border tint, soft background shift
- Focus behavior: high-contrast visible ring using primary purple
- Reduced motion rule: remove movement, preserve visibility via opacity/color only

## Components
- Buttons: primary filled, secondary outlined, tertiary ghost; all need 44px+ touch targets
- Inputs: white or near-white surface, strong placeholder contrast, icon-safe padding
- Cards: use three hierarchy levels only to avoid visual noise
- Navigation: active items must be obvious through icon capsule, purple fill tint, and text weight
- Tables/Charts: prefer bars, capsules, and metric stacks over busy charts
- Empty states: supportive tone, one action max, no oversized mascot takeover
- Error states: inline panel alerts with clear next action

## Accessibility Rules
- Contrast target: WCAG AA minimum for text and controls
- Keyboard navigation: all tabs, dialogs, filters, and answer options fully reachable
- Focus visibility: never hide focus rings; use distinct offset on light surfaces
- Motion safety: honor reduced motion preferences for tab transitions and dialogs
- Touch target size: 44x44 minimum

## Anti-Patterns to Avoid
- childish illustrations dominating productivity screens
- too many accent colors in one panel
- orange used as a generic primary brand color
- generic glassmorphism that hurts readability on content-heavy pages

## Admin Operational Extension
- Applies to: `/admin` and future internal/admin screens.
- Style: clean operational dashboard, inspired by Linear/Notion rhythm and Apple-like restraint.
- Admin background may use `#F6F3FA` for clearer table contrast.
- Admin surface may use `#FFFCFF` with table header bands at `#EEE8F5`.
- Admin accent: `#315C73` remains allowed for neutral analytics, table focus, and non-primary charts.
- Primary actions that belong to the GINO product identity should use the purple primary family.
- Density: information-dense but readable; compact rows are allowed if touch/focus targets stay clear.
- Tables: stronger row separators than learner screens, hover tint, left accent on selected row.
- Charts: use bars, capsules, sparklines, and metric stacks before adding chart dependencies.
- Admin must avoid mascot/hero marketing patterns unless explicitly used in an empty state.

## Build Handoff
- Code must use these tokens first.
- Page overrides may refine, not replace core identity.
- If a page file exists in `design-system/pages/`, its local rules win only for that page.
