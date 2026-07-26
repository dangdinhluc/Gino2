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
- Mood: calm, capable, warm, modern
- Density: balanced
- Theme mode: light

## Color Tokens
| Token | Value | Usage |
|------|-------|-------|
| primary | #C96A1B | CTA, active progress, selected actions |
| secondary | #6F4AA8 | secondary emphasis, AI and smart suggestion accents |
| background | #F7F1E8 | app background |
| surface | #FFF9F2 | cards, panels |
| text-primary | #172033 | main text |
| text-secondary | #5F6B7C | muted text |
| success | #2F8F6B | positive states |
| warning | #D68A1F | warning states |
| danger | #C65B57 | destructive states |

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
- Border style: warm neutral 1px borders with soft contrast
- Shadow/elevation approach: subtle layered shadows, no heavy blur stacks

## Motion
- Transition timing: 160ms micro, 220ms panel, 300ms modal entry max
- Hover behavior: small lift, border tint, soft background shift
- Focus behavior: high-contrast visible ring using warm primary accent
- Reduced motion rule: remove movement, preserve visibility via opacity/color only

## Components
- Buttons: primary filled, secondary outlined, tertiary ghost; all need 44px+ touch targets
- Inputs: white or near-white surface, strong placeholder contrast, icon-safe padding
- Cards: use three hierarchy levels only to avoid visual noise
- Navigation: active items must be obvious through icon capsule, fill tint, and text weight
- Tables/Charts: prefer bars, capsules, and metric stacks over busy charts
- Empty states: supportive tone, one action max, no oversized mascot takeover
- Error states: inline panel alerts with clear next action

## Accessibility Rules
- Contrast target: WCAG AA minimum for text and controls
- Keyboard navigation: all tabs, dialogs, filters, and answer options fully reachable
- Focus visibility: never hide focus rings; use distinct offset on warm surfaces
- Motion safety: honor reduced motion preferences for tab transitions and dialogs
- Touch target size: 44x44 minimum

## Anti-Patterns to Avoid
- childish illustrations dominating productivity screens
- too many accent colors in one panel
- generic glassmorphism that hurts readability on content-heavy pages

## Admin Operational Extension
- Applies to: `/admin` and future internal/admin screens.
- Style: clean operational dashboard, inspired by Linear/Notion rhythm and Apple-like restraint.
- Admin background may tighten from `#F7F1E8` to `#F5EFE6` for clearer table contrast.
- Admin surface may use `#FFFCF7` with table header bands at `#F0E8DC`.
- Admin accent: `#315C73` for neutral analytics, table focus, and non-primary charts.
- Density: information-dense but readable; compact rows are allowed if touch/focus targets stay clear.
- Tables: stronger row separators than learner screens, hover tint, left accent on selected row.
- Charts: use bars, capsules, sparklines, and metric stacks before adding chart dependencies.
- Admin must avoid mascot/hero marketing patterns unless explicitly used in an empty state.

## Build Handoff
- Code must use these tokens first.
- Page overrides may refine, not replace core identity.
- If a page file exists in `design-system/pages/`, its local rules win only for that page.
