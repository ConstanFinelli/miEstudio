---
name: Terminal Scholar
colors:
  surface: '#131316'
  surface-dim: '#131316'
  surface-bright: '#39393c'
  surface-container-lowest: '#0e0e11'
  surface-container-low: '#1b1b1e'
  surface-container: '#1f1f22'
  surface-container-high: '#2a2a2d'
  surface-container-highest: '#353438'
  on-surface: '#e4e1e6'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e4e1e6'
  inverse-on-surface: '#303033'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#bdc2ff'
  on-secondary: '#131e8c'
  secondary-container: '#2f3aa3'
  on-secondary-container: '#a8afff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#00885d'
  on-tertiary-container: '#000703'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#e0e0ff'
  secondary-fixed-dim: '#bdc2ff'
  on-secondary-fixed: '#000767'
  on-secondary-fixed-variant: '#2f3aa3'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#131316'
  on-background: '#e4e1e6'
  surface-variant: '#353438'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Geist
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: '0'
  mono-metric-lg:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.03em
  mono-metric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.02em
  mono-label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.02em
  mono-kbd:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
  gutter-mobile: 0.75rem
  gutter-desktop: 1rem
  container-max: 1440px
---

## Brand & Style

The design system embodies a focused, high-performance academic command center. Built specifically for ambitious university students, researchers, and technical learners, it merges the crisp, streamlined utility of modern productivity tools with the structural reliability of developer-grade consoles.

The visual style is characterized as **Technical Minimalism with Micro-Border Elevation**:
- **Utilitarian & Kinetic:** Fast execution, high density, and low cognitive friction.
- **Vibecoding & Hacker Aesthetic:** Dark canvas surfaces paired with luminous status indicators, mono-spaced data columns, and clean status badges.
- **Deep Contrast & Precision:** Precision borders delineate surfaces instead of heavy drop shadows. Crisp typography communicates status instantly, transforming chaotic degree roadmaps into structured workflows.

## Colors

The system is native dark-mode first, constructed on an architectural zinc hierarchy:

### Core Hierarchy
- **Canvas Base:** `#09090b` (Deep void for workspace frames and page canvas).
- **Surface Elevation 1:** `#121215` (Sidebars, panel containers, subtle sections).
- **Surface Elevation 2:** `#18181b` (Interactive cards, module headers, table rows).
- **Surface Elevation 3 / Popover:** `#27272a` (Modals, popovers, and dropdown menus).

### Border & Dividers
- **Subtle Outline:** `#27272a` (Card outlines, header dividers, structural grids).
- **Interactive/Hover Outline:** `#3f3f46` (Focus rings, hover card states, active splits).

### Primary Accents
- **Primary Indigo:** `#6366f1` (Primary actions, focused tabs, main KPI charts).
- **Indigo Glow / Soft:** `#818cf8` (Active indicators, hover text accents, selected pill text).
- **Indigo Highlight (Alpha):** `rgba(99, 102, 241, 0.12)` (Pill backgrounds, row selections).

### Semantic & Academic Status Colors
- **Emerald (Aprobada / Promocionada / Completed):**
  - Solid: `#10b981`
  - Subtle Muted: `rgba(16, 185, 129, 0.12)`
  - Border: `rgba(16, 185, 129, 0.25)`
- **Amber (Regular / Alerta / En Riesgo):**
  - Solid: `#f59e0b`
  - Subtle Muted: `rgba(245, 158, 11, 0.12)`
  - Border: `rgba(245, 158, 11, 0.25)`
- **Blue (Cursando / En Progreso):**
  - Solid: `#3b82f6`
  - Subtle Muted: `rgba(59, 130, 246, 0.12)`
  - Border: `rgba(59, 130, 246, 0.25)`
- **Red (Libre / Examen Próximo / Urgente):**
  - Solid: `#ef4444`
  - Subtle Muted: `rgba(239, 68, 68, 0.12)`
  - Border: `rgba(239, 68, 68, 0.25)`

## Typography

Typography prioritizes information parsing speed and visual density:
- **Geist (Body & Display):** High legibility at small sizes, minimal geometry, and neutral grotesque aesthetics ideal for rapid scanning across complex course lists.
- **JetBrains Mono (Metrics & Indicators):** Strict tabular formatting for GPA/Promedios, final exam countdowns, course credit counters, and transcript tables.

## Layout & Spacing

The layout adopts a high-density, modular fluid-grid architecture modeled after IDEs and technical productivity suites.

### Layout Principles
- **Root Shell:** Fixed collapsible left sidebar (navigation & career selector: 240px desktop, collapsed to 56px icon rail), central fluid canvas with structural split-panes, and direct action headers.
- **Rhythm & Padding:** Built on a tight 4px baseline system (`0.25rem`). Typical card padding is compressed (`0.75rem` to `1rem`) to present comprehensive semester summaries without unnecessary scrolling.
- **Responsive Adaptations:**
  - **Desktop (>= 1024px):** 2-column or 3-panel split view (Nav + Multi-column Board/Table + Inspector/PDF Split).
  - **Tablet (768px - 1023px):** 2-panel view; inspector becomes a slide-over sheet.
  - **Mobile (< 768px):** Single-column stacked stream, collapsible bottom action bar, horizontal scrolling tab filters for status states (Cursando, Aprobadas, etc.).

## Elevation & Depth

Visual hierarchy does not rely on diffused drop shadows. Instead, it utilizes **Micro-Borders and Tonal Layering**:

- **Layer 0 (Canvas Base):** Background `#09090b`. No border.
- **Layer 1 (Cards & Modules):** Surface `#121215` with a continuous 1px solid border in `#27272a`.
- **Layer 2 (Hover & Active States):** Surface `#18181b` with border transition to `#3f3f46`.
- **Layer 3 (Overlays & Dialogs):** Background `#18181b` backdrop-filter blur (16px), 1px border in `#3f3f46`, and an ultra-subtle directional inner stroke (`inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`).
- **Focus States:** Single-pixel ring with `#6366f1` and an outer hairline glow `0 0 0 1px rgba(99, 102, 241, 0.35)`.

## Shapes

The design uses tight, controlled corners (`roundedness: 1`). 
- **Base elements** (buttons, badges, inputs): `4px` (`0.25rem`).
- **Cards and modular tiles:** `6px` to `8px` (`0.375rem` to `0.5rem`).
- **Pills and live status dots:** Retain a slight capsule structure (`9999px`) only for micro-tags.
- Strict avoidance of large, playful border-radii preserves the technical, engineering-grade feel.

## Components

### Buttons
- **Primary:** Background `#6366f1`, text `#ffffff`, border `1px solid #818cf8`, font `Geist Medium`. Hover: `#4f46e5`.
- **Secondary/Surface:** Background `#18181b`, text `#d4d4d8`, border `1px solid #27272a`. Hover: border `#3f3f46`, text `#ffffff`.
- **Ghost/Subtle:** Background transparent, text `#a1a1aa`. Hover: background `#18181b`, text `#f4f4f5`.

### Status Badges & Chips
- Semantically colored pills with a 1px border and a matching 6px glowing dot:
  - **Aprobada / Promocionada:** Background `rgba(16, 185, 129, 0.1)`, text `#10b981`, border `rgba(16, 185, 129, 0.25)`.
  - **Regular / En Riesgo:** Background `rgba(245, 158, 11, 0.1)`, text `#f59e0b`, border `rgba(245, 158, 11, 0.25)`.
  - **Cursando:** Background `rgba(59, 130, 246, 0.1)`, text `#3b82f6`, border `rgba(59, 130, 246, 0.25)`.
  - **Libre / Examen Próximo:** Background `rgba(239, 68, 68, 0.1)`, text `#ef4444`, border `rgba(239, 68, 68, 0.25)`.

### Subject Cards (Materia Card)
- Surface `#121215`, 1px border `#27272a`, hover border `#3f3f46`.
- Header featuring the subject code (`JetBrains Mono`, `#71717a`) and status badge.
- Inner grid for academic progress:
  - Attendance bar (micro-meter with 4px height).
  - Average grade indicator formatted with `mono-metric-md`.
  - Configured accreditation conditions and rules.

### Academic Data Tables
- Compact table rows (`36px` height) with `#18181b` zebra or hairline border-bottom `#27272a`.
- Numeric columns (Calificación, Créditos, Faltas) aligned right in `JetBrains Mono`.

### Input Fields & Search Bars
- Background `#09090b`, border `1px solid #27272a`, text `#f4f4f5`, placeholder `#52525b`.
- On focus: border `#6366f1` with zero fuzzy blur, maintaining a razor-sharp technical edge.

### Modals & Dialogs
- Centered dialogs with backdrop blur (`rgba(9, 9, 11, 0.8)`).
- Clean action headers, structured form layouts with responsive controls, and clear action buttons.