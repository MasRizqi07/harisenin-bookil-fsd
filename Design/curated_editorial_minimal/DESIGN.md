---
name: Curated Editorial Minimal
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28.8px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 25.6px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22.4px
    letterSpacing: 0em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 3rem
  margin-mobile: 1.25rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the convergence of high-end independent publishing and precision software design—an aesthetic tension defined as "Modern Editorial Tech meets Clean Neo-SaaS". It addresses discerning readers, knowledge workers, and creative professionals who view their digital library as both an intellectual sanctuary and a curated personal artifact.

The design philosophy rejects transactional noise in favor of serene focus, tactile micro-interactions, deliberate typographic rhythm, and generous negative space. Interfaces evoke the calm authority of an art-directed journal while retaining the fluid utility, instantaneous feedback, and keyboard-first accessibility expected of modern developer tools.

## Colors

The palette is engineered around an architectural foundation of layered neutrals, anchored by a decisive indigo core and deliberate semantic accents:

- **Base Canvas & Surfaces**: Primary canvas sits on Slate-50 (`#F8FAFC`), establishing immediate contrast against elevated component cards cast in crisp White (`#FFFFFF`). Frosted overlays utilize white with 80% opacity (`rgba(255, 255, 255, 0.8)`).
- **Primary & Indigo Scales**: The brand signature is Deep Indigo (`#4F46E5`), paired with Indigo-500 (`#6366F1`) for interactive states and focus rings. Indigo-50 (`#EEF2FF`) supplies tint backgrounds for active filters and callouts, while Indigo-900 (`#312E81`) delivers intense, high-contrast states.
- **Neutrals & Text Hierarchy**: Slate-900 (`#0F172A`) commands display titles and key metrics. Slate-800 (`#1E293B`) provides legible, long-form reading comfort. Slate-600 (`#475569`) handles metadata, subtitles, and captions. Slate-400 (`#94A3B8`) defines placeholder values and disabled iconography. Slate-200 (`#E2E8F0`) forms hairline framing borders.
- **Semantic Accents**: Emerald-500 (`#10B981`) indicates instant digital fulfillment, ready-to-read states, and verified items. Amber-500 (`#F59E0B`) highlights editorial picks, ratings, and volume milestones. Rose-500 (`#F43F5E`) governs destructive actions and inventory limits.

## Typography

The type system balances technical precision with editorial warmth. A unified geometric humanist sans-serif scale establishes a modern, structured voice across display, narrative, and operational contexts.

- **Headlines & Display**: Rendered with deliberate negative letter-spacing (`-0.02em` to `-0.03em`) to mimic the crisp, ink-pressed density of contemporary print catalog covers.
- **Body & Longform**: Bound to a consistent `1.6` line-height ratio, producing an open reading cadence suitable for e-book samples, synopses, and literary critiques.
- **Labels & Micro-copy**: Employs neutral to slightly expanded tracking (`+0.02em` to `+0.04em`) on uppercase badges and metadata to maintain instant optical recognition at reduced sizes.

## Layout & Spacing

Layouts follow a strict 8-point spatial discipline across a 12-column responsive fluid grid, bounded by an optimal max-width of 1440px for editorial browsing balance.

- **Desktop (>= 1024px)**: 12-column layout with 24px (`1.5rem`) gutters and a minimum 48px (`3rem`) page boundary. Asymmetrical bento grid patterns host featured drops, book-of-the-month breakdowns, and author dialogues.
- **Tablet (768px - 1023px)**: 8-column layout with 20px gutters and 32px canvas margins. Bento blocks collapse into dual-column cards; book catalogs shift to a 3-column arrangement.
- **Mobile (< 768px)**: 4-column layout with 16px (`1rem`) gutters and 20px (`1.25rem`) side gutters. Bento heroes reflow vertically into continuous linear feeds, and category filter bars convert to edge-to-edge horizontally scrollable ribbons.

## Elevation & Depth

Spatial separation relies on translucent atmospheric layers combined with soft, directional light rather than heavy structural drop shadows:

- **Glassmorphic Planes**: Primary floating containers (navigation bars, modal sheets, hover previews, sticky player controls) employ `backdrop-blur-md` coupled with an 80% white ground (`rgba(255, 255, 255, 0.8)`) and a 1px border rendered in Slate-200 at 60% opacity (`rgba(226, 232, 240, 0.6)`).
- **Surface Elevation 0 (Base)**: Slate-50 background, flat, borderless.
- **Surface Elevation 1 (Cards & Bento Cells)**: Pure White background framed by a subtle 1px border (`#E2E8F0`), supported by an ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Surface Elevation 2 (Hover & Active States)**: Activated book cards and dropdown popovers lift with: `0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Surface Elevation 3 (Overlays & Drawers)**: Reader preference menus and checkout panels utilize: `0 20px 30px -10px rgba(15, 23, 42, 0.12), 0 10px 15px -5px rgba(15, 23, 42, 0.05)`.

## Shapes

The design system uses a balanced, contemporary rounded geometry to contrast the rigid 3:4 aspect ratio of classic printed matter:

- **Standard Cards & Bento Modules**: Default to `rounded-xl` (16px) or `rounded-2xl` (24px for macro containers), establishing soft editorial frames that contain vibrant jacket artwork.
- **Interactive Controls**: Inputs, standard buttons, and popovers utilize `rounded-md` (8px) to `rounded-lg` (12px) to ensure optical stability.
- **Tags, Indicators & Micro-actions**: Filter pills, category selectors, reading duration badges, and rating chips utilize continuous full-radius pill styling (`rounded-full`).

## Components

### Buttons
- **Primary**: Solid Deep Indigo (`#4F46E5`) with white text. 10px vertical and 20px horizontal padding, `rounded-lg`. Subtle hover shift to `#4338CA` with an ambient glow (`box-shadow: 0 4px 14px 0 rgba(79, 70, 229, 0.3)`).
- **Secondary / Ghost**: White background with 1px Slate-200 border, Slate-800 text. Hover triggers Slate-50 fill and Slate-300 border transition.
- **Glass Action**: Translucent white (`bg-white/80`), `backdrop-blur-md`, Slate-900 typography, hairline light borders.

### Pill Filters & Tags
- Height: 36px. Border radius: full pill (`9999px`).
- Inactive state: White fill, Slate-200 outline, Slate-600 label, `space-sm` icon pairing.
- Active state: Indigo-50 fill, 1px Deep Indigo border, Deep Indigo text, font-weight 600.
- Floating Glass Badges: Placed directly over cover images using `bg-slate-900/60`, `backdrop-blur-md`, white text, and `label-sm` sizing.

### 3:4 Book Cover Cards
- Strict aspect ratio of 3:4.
- High-resolution cover art wrapped in `rounded-lg` geometry with an inset 1px border (`rgba(0, 0, 0, 0.06)`) to preserve contrast against white pages.
- Hover interaction: `-translate-y-1` vertical lift, transition duration of 200ms ease-out, triggering Elevation 2 ambient shadow.
- Metadata block beneath cover features `headline-sm` title, Slate-600 author attribution, and inline rating chip with Amber-500 star marker.

### Search Inputs
- Clean Neo-SaaS aesthetic: 44px height, White fill, 1px Slate-200 border, `rounded-lg`.
- Prefix: Slate-400 magnifying glass icon. Suffix: Keycap command hint (`⌘K`) in Slate-400, rendered inside a Slate-100 mini-container (`rounded`, `text-xs`).
- Focus state: Border transitions to Indigo-500 with a 3px ring of Indigo-50 (`box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15)`).

### Selection Controls (Checkboxes & Radios)
- Checkboxes: 18x18px, `rounded` (4px), Slate-300 border. Selected state triggers Indigo-600 fill with a crisp white checkmark icon.
- Radio buttons: 18x18px concentric circle, Slate-300 border. Selected state shows Indigo-600 ring containing an interior white offset circle.

### Bento Grid Hero Blocks
- Asymmetric layout featuring variable 1x1, 1x2, and 2x2 modular blocks.
- Surfaces use White or faint Indigo-50 fills, enclosed in `rounded-2xl` radii with hairline Slate-200 borders.
- Incorporates high-contrast typography, live reading progress indicators, and instant sample-read action triggers.