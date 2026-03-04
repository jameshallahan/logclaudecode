---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with exceptional design quality. Avoid generic AI aesthetics and build interfaces with intentional aesthetic direction, strong hierarchy, and polished interactions.
license: Complete terms in LICENSE.txt
---

# Frontend Design Skill

This skill guides the creation of **distinctive, production-grade frontend interfaces** that feel intentionally designed rather than generically AI-generated.

Interfaces should demonstrate **taste, hierarchy, and restraint**, with strong aesthetic identity and meticulous attention to detail.

If a local `design-system.md` exists in the project, follow it exactly for **tokens, spacing, and components**, while still maintaining the design quality standards in this skill.

---

# Design Thinking

Before writing code, determine the conceptual direction.

Understand:

**Purpose**
What problem does the interface solve?

**Audience**
Who uses it and what environment are they in?

**Tone**
Commit to a clear aesthetic direction. Examples:

- brutally minimal
- editorial / magazine
- quiet luxury
- maximalist graphic
- retro-futuristic
- industrial utilitarian
- playful / toy-like
- brutalist raw
- organic / natural
- art deco geometric

Commit to a direction and execute it consistently.

**Differentiation**

Every interface should have **one memorable detail** that makes it distinctive.

Examples:

- an unusual layout rhythm
- a signature animation
- unique typography hierarchy
- distinctive data visualization style
- subtle texture layer
- strong asymmetry

The goal is **designed interfaces, not generic SaaS dashboards**.

---

# Interface Architecture Principles

All interfaces should follow clear visual hierarchy.

Order of importance:

1. Primary action
2. Primary information
3. Supporting information
4. Secondary actions

Design rules:

- One dominant action per screen
- Strong spacing hierarchy
- Generous whitespace
- Clear alignment grid
- Logical grouping of content

Avoid clutter.

Hierarchy should be immediately obvious.

---

# Layout Principles

Default to **mobile-first design** unless the product explicitly targets desktop.

Order of design:

1. Mobile
2. Tablet
3. Desktop enhancement

Avoid premature desktop layouts like large sidebars unless context requires them.

Prefer:

- single column flows
- vertical hierarchy
- scannable sections
- clear content zones

---

# Typography

Typography defines the personality of an interface.

Guidelines:

- Use **distinctive, intentional font pairings**
- Pair display + body fonts when appropriate
- Numbers and data can use a different typographic treatment
- Avoid generic defaults when possible

Avoid overused combinations such as:

- Inter + default Tailwind layouts
- Roboto + generic card dashboards
- predictable “startup SaaS UI”

Typography should contribute to identity.

---

# Color Systems

Interfaces should use a **token-based color system**.

Guidelines:

- Define background, surface, border, and text layers
- Use one primary accent color
- Maintain strong contrast ratios
- Avoid using too many colors

Prefer:

- dominant neutral palette
- one strong accent
- restrained color usage

---

# Motion & Interaction Design

Interfaces should feel responsive and alive.

Use motion intentionally.

Recommended timing:

- hover transitions: 150–250ms
- page transitions: 250–400ms
- staggered content reveals on load

Use animation for:

- feedback
- hierarchy
- delight

Avoid:

- excessive animations
- distracting effects
- animation that slows interaction

Subtlety and intention are key.

---

# Component Quality Standards

All interfaces must be **production-grade**.

Components should include:

- accessible semantic HTML
- keyboard navigation support
- focus states
- hover states
- loading states
- error states

All interactive elements must have:

- minimum tap target of 44px
- visible feedback on interaction

Components should be reusable and modular.

---

# Spatial Composition

Avoid predictable layouts.

Consider:

- asymmetry
- layered surfaces
- overlapping elements
- diagonal flow
- unexpected grid compositions

Whitespace is powerful.

Use either:

- generous negative space
or
- intentional density

Never accidental clutter.

---

# Visual Details

Add subtle atmospheric details when appropriate:

- gradient meshes
- subtle noise textures
- soft shadows
- layered transparency
- geometric backgrounds
- decorative borders
- custom cursors

Visual texture should support the aesthetic direction.

---

# Anti-Generic Design Rules

Avoid common AI-generated UI patterns:

- purple gradient on white backgrounds
- default card grids
- generic SaaS dashboards
- predictable sidebars
- overused font combinations

Every interface should feel **crafted for its specific context**.

---

# Design Inspiration Benchmarks

Aim for design quality comparable to:

- Linear
- Stripe
- Apple
- Notion
- Raycast
- Vercel
- Airbnb
- Arc Browser

Study their hierarchy, restraint, and interaction polish.

---

# Design System Compliance

If a project includes a local `design-system.md`:

- Follow its tokens and components
- Maintain consistency with its layout rules
- Do not introduce conflicting patterns

If a design-system conflicts with quality standards (for example generic typography or poor hierarchy), modernize it while preserving its intent.

---

# Final Principle

Design should feel **intentional, cohesive, and memorable**.

Interfaces must feel like they were **designed by a thoughtful product designer**, not generated automatically.