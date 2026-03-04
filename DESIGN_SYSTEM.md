# Design System — The Log

Adapted from analysis of Cal AI, MyFitnessPal, and Strava. Principles extracted, not copied.

---

## Color Tokens

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0D0D0D` | Page background (deepest layer) |
| `--surface` | `#1A1A1A` | Cards, elevated containers |
| `--surface-hover` | `#222222` | Surface on hover/active states |
| `--border` | `#2A2A2A` | Card borders, dividers |
| `--text` | `#F0F0F0` | Primary text, high contrast |
| `--text-muted` | `#888888` | Labels, metadata, secondary info |
| `--text-dim` | `#555555` | Disabled, placeholder, very low emphasis |
| `--accent` | `#D97706` | Progress indicators, active tab, primary actions |
| `--accent-light` | `#F59E0B` | Accent hover, highlighted state |
| `--accent-dim` | `#92400E` | Accent at low opacity, subtle warmth |
| `--record` | `#FF3B30` | Record button only — never used elsewhere |
| `--success` | `#22C55E` | Completed states (green-500) |
| `--error` | `#FF3B30` | Error text, destructive actions |

### Color Rules
- **Accent (amber) is for data and navigation only** — progress dots, active tab indicator, stat highlights. Never used for destructive actions.
- **Record red is sacred** — only the voice recording button uses `--record`. Do not reuse red anywhere else in the UI.
- **One accent per screen** — if accent appears in progress dots, it doesn't also appear in a CTA on the same screen. CTAs stay white.
- **Success green is subtle** — small text or icons only, never large fills.

---

## Typography Scale

Font: Inter (400 regular, 600 semibold). No other weights.

| Level | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Page title | `text-xl` (20px) | 600 | `--text` | Greeting, page headings |
| Data value | `text-2xl` (24px) | 600 | `--text` | Streak number, key stats — **larger than titles** |
| Card title | `text-xs` (12px) | 600 | `--text-muted` | Section headers, uppercase + tracking-wider |
| Body | `text-sm` (14px) | 400 | `--text` | Card content, descriptions |
| Label | `text-xs` (12px) | 400 | `--text-muted` | Metadata, dates, helper text |
| Micro | `text-[11px]` | 600 | `--text-muted` | Tab bar labels, badge text |

### Typography Rules
- **Data values are the hero** — the biggest text on any card is the number, not the heading.
- **Labels above, values below** — always. Small muted label on top, large bold value underneath.
- **Section headers are whispered** — uppercase, letter-spaced, muted. They organize without competing.
- **No bold body text** — semibold is reserved for titles, values, and CTAs.

---

## Spacing System

Base unit: 4px. Common stops: 4, 8, 12, 16, 20, 24, 32.

| Token | Value | Usage |
|---|---|---|
| `px-5` | 20px | Page horizontal padding (all pages) |
| `py-6` | 24px | Page vertical header padding |
| `p-4` | 16px | Card internal padding |
| `gap-3` | 12px | Between cards in a list |
| `gap-2` | 8px | Between items inside a card |
| `gap-6` | 24px | Between sections |
| `mb-1` | 4px | Label-to-value spacing |
| `rounded-xl` | 12px | Card corner radius |
| `rounded-2xl` | 16px | Large card / modal radius |
| `rounded-full` | 9999px | Circular elements (dots, avatars) |

### Spacing Rules
- **Page padding is 20px** (px-5) — consistent on every page. Never 16, never 24.
- **Cards never touch** — always `gap-3` (12px) between stacked cards.
- **Sections breathe** — `gap-6` (24px) between distinct sections.
- **Bottom nav clearance** — all pages need `pb-20` (80px) to avoid content under the tab bar.

---

## Component Patterns

### Card
```
bg-[--surface] border border-[--border] rounded-xl p-4
```
- Always has border. No shadows (shadows don't read on dark backgrounds).
- One purpose per card. If it has two distinct data points, use two cards.

### Stat Pair (label + value)
```
<div>
  <p className="text-xs text-[--text-muted]">Label</p>
  <p className="text-2xl font-semibold text-[--text]">Value</p>
</div>
```
- The universal atomic pattern. Used in streak, stats, progress.
- Always label on top, value below. Never side-by-side.
- Value font size is always larger than everything else in its container.

### Stat Grid (2-column)
```
<div className="grid grid-cols-2 gap-3">
  <StatPair /> <StatPair />
</div>
```
- For displaying 2+ stat pairs horizontally.
- Max 2 columns at 390px width. Never 3.

### Week Dots
```
7 circles in a row — one per day (Mon–Sun).
Filled (accent) = logged that day.
Hollow (border only) = not logged.
Today = slightly larger or ring highlight.
```
- Always shows full current week (Monday–Sunday).
- Appears on home dashboard as a quick streak visualization.

### Bottom Tab Bar
```
Fixed bottom. 4 tabs: Home, Morning, Evening, Weekly.
Active tab: accent color icon + label.
Inactive: muted color.
Height: 56px + safe-area-inset-bottom.
Background: --surface with top border.
```
- Icon above label (vertical stack), not side-by-side.
- Only one active at a time.
- Tab labels use micro type (11px semibold).

### Primary CTA Button
```
w-full h-14 bg-white text-[--bg] font-semibold rounded-xl
active:scale-[0.98] transition-all
```
- White on dark. Full width. 56px height.
- Only ONE per screen. If you need a second action, use a ghost button.

### Ghost Button (secondary)
```
w-full h-12 border border-[--border] text-[--text] font-semibold rounded-xl
hover:bg-[--surface] active:scale-[0.98] transition-all
```

### Section Header
```
<h3 className="text-xs font-semibold text-[--text-muted] uppercase tracking-wider">
  Section Title
</h3>
```

---

## Layout Principles

1. **Single column, always** — no sidebars, no split views. Mobile-first at 390px.
2. **Hierarchy flows down** — greeting → glanceable status → primary CTA → secondary content.
3. **One action per zone** — each card has at most one tap target.
4. **Bottom nav is always visible** — except during onboarding and active voice recording flows.
5. **Content ends above the nav** — `pb-20` on all scrollable pages.

---

## Interaction Style

- **Press feedback**: `active:scale-[0.98]` on all buttons and tappable cards.
- **Page transitions**: `fadeSlideIn` (0.3s ease-out, 8px translateY).
- **No horizontal swipe gestures** — voice-first app, keep interaction simple.
- **Loading**: small white spinner (6×6, border-2, animate-spin). Centered.
- **State changes**: color transitions (`transition-colors`, 150ms). No layout shifts.

---

## Do / Don't

| Do | Don't |
|---|---|
| Use accent for progress and active nav | Use accent for buttons or CTAs |
| Make data values the biggest text | Make headings the biggest text |
| Use one CTA per screen | Stack multiple CTAs |
| Keep cards single-purpose | Cram multiple data types into one card |
| Show week dots for streak context | Show only a number for streak |
| Use consistent 20px page padding | Vary padding per page |
| Let white space breathe between sections | Fill every pixel with content |

---

*The Log · Design System · March 2026*
