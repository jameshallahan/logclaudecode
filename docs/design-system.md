# Design System — The Log

The Log is a **voice-first, data-forward personal logging app**.

The interface should feel **calm, focused, and intentional**.  
Inspired by the clarity of Strava and MyFitnessPal, but quieter and more minimal.

The hero of the interface is **the data itself**.

Numbers matter more than labels.  
Information hierarchy should always reflect this.

The UI is **dark, restrained, and highly readable**.

---

# Color Tokens

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0D0D0D` | Page background |
| `--surface` | `#1A1A1A` | Cards and elevated surfaces |
| `--surface-hover` | `#222222` | Surface hover state |
| `--border` | `#2A2A2A` | Dividers and card borders |
| `--text` | `#F0F0F0` | Primary text |
| `--text-muted` | `#888888` | Secondary labels |
| `--text-dim` | `#555555` | Disabled text |
| `--accent` | `#D97706` | Progress indicators and active navigation |
| `--accent-light` | `#F59E0B` | Accent hover |
| `--accent-dim` | `#92400E` | Subtle accent |
| `--record` | `#FF3B30` | Voice recording button only |
| `--success` | `#22C55E` | Success state |
| `--error` | `#FF3B30` | Error state |

---

# Color Rules

Accent (amber) is used for:

- progress indicators
- active tab states
- stat highlights

Accent should **not be used for primary CTAs**.

Record red is **sacred**.

Only the voice recording button uses `--record`.

Red must not appear elsewhere in the UI.

One accent per screen.

If accent is used in progress dots or nav, avoid using it in additional elements on that screen.

---

# Typography

Typography should emphasize **data clarity**.

Suggested font pairing:

Primary UI font:

Inter


Numeric / stat emphasis:

Inter SemiBold


Typography hierarchy:

| Level | Size | Weight | Usage |
|------|------|------|------|
| Page title | 20px | 600 | Greeting or page heading |
| Data value | 24px | 600 | Primary stats |
| Card title | 12px | 600 | Section headers |
| Body | 14px | 400 | Descriptions |
| Label | 12px | 400 | Metadata |
| Micro | 11px | 600 | Tab labels |

---

# Typography Rules

Data values are the **visual hero**.

Numbers should always be the largest element in a card.

Label above value:


Label
Value


Never side-by-side.

Section headers are subtle:

- uppercase
- letter spaced
- muted color

Avoid bold body text.

---

# Spacing System

Base spacing unit: **4px**

Common values:

| Token | Value |
|------|------|
| `px-5` | 20px page padding |
| `py-6` | 24px page header |
| `p-4` | 16px card padding |
| `gap-3` | 12px between cards |
| `gap-2` | 8px internal card spacing |
| `gap-6` | 24px section spacing |

Corner radius:

| Token | Value |
|------|------|
| `rounded-xl` | 12px |
| `rounded-2xl` | 16px |
| `rounded-full` | circular |

---

# Layout Principles

Mobile-first design.

Single column.

Target width:


390px


Hierarchy:

Greeting  
↓  
Status overview  
↓  
Primary action  
↓  
Secondary data

Bottom navigation always visible except during onboarding or recording.

All pages must include:


pb-20


to prevent content behind the tab bar.

---

# Component Patterns

## Card


bg-[--surface]
border border-[--border]
rounded-xl
p-4


Cards have borders, not shadows.

Each card has **one purpose only**.

---

## Stat Pair

Universal atomic pattern.


Label
Value


Example:


Streak
12 days


Structure:


label
value


---

## Stat Grid

Two column grid.


grid grid-cols-2 gap-3


Maximum columns on mobile:


2


Never three.

---

## Week Dots

Seven dots representing Monday → Sunday.

States:

- filled = logged
- hollow = not logged
- today = slightly larger or ring highlight

Purpose:

quick visual streak context.

---

## Bottom Tab Bar

Four tabs:

- Home
- Morning
- Evening
- Weekly

Structure:

icon above label.

Active tab:

accent color.

Inactive tab:

muted color.

Height:


56px + safe-area


---

# Buttons

Primary CTA:


w-full
h-14
bg-white
text-[--bg]
font-semibold
rounded-xl
active:scale-[0.98]
transition-all


Ghost button:


border border-[--border]
text-[--text]
h-12
rounded-xl


Only one primary CTA per screen.

---

# Interaction Style

Press feedback:


active:scale-[0.98]


Page transitions:


fadeSlideIn
0.3s
8px translateY


Loading spinner:


small white spinner
6px
border-2
animate-spin


State transitions:


transition-colors
150ms


---

# Accessibility

Minimum tap target:


44px


Maintain strong contrast for all text.

Interactive elements must have focus states.

---

# Do / Don't

| Do | Don't |
|----|----|
| Use accent for progress | Use accent for destructive actions |
| Highlight data values | Oversize headings |
| Use one CTA per screen | Stack multiple CTAs |
| Keep cards single purpose | Overload cards |
| Maintain 20px page padding | Vary padding randomly |

---

The Log  
Design System  
March 2026