---
name: Obsidian & Alabaster Luxe
colors:
  surface: '#111319'
  surface-dim: '#111319'
  surface-bright: '#37393f'
  surface-container-lowest: '#0c0e13'
  surface-container-low: '#191c21'
  surface-container: '#1d2025'
  surface-container-high: '#282a30'
  surface-container-highest: '#33353b'
  on-surface: '#e2e2ea'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#e2e2ea'
  inverse-on-surface: '#2e3036'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#93ccff'
  on-secondary: '#003351'
  secondary-container: '#3198dc'
  on-secondary-container: '#002c47'
  tertiary: '#4ee6aa'
  on-tertiary: '#003825'
  tertiary-container: '#22c990'
  on-tertiary-container: '#004e35'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#cce5ff'
  secondary-fixed-dim: '#93ccff'
  on-secondary-fixed: '#001d31'
  on-secondary-fixed-variant: '#004b73'
  tertiary-fixed: '#68fcbf'
  tertiary-fixed-dim: '#45dfa4'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#111319'
  on-background: '#e2e2ea'
  surface-variant: '#33353b'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.035em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.01em
  metric-xl:
    fontFamily: JetBrains Mono
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.04em
  metric-xl-mobile:
    fontFamily: JetBrains Mono
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.03em
  metric-md:
    fontFamily: JetBrains Mono
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.02em
  metric-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 3rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

> **Organisation of this file.** **Part A** (below, unchanged) is the design system: colours, type, shape, components. **Part B** (at the end) is the design build plan: how and in what order to apply it. Conflicts and gaps in Part A are listed and resolved in Part B, section B1. Token values for both themes are in `DESIGN-TOKENS.md`.

## Brand & Style

This design system establishes a high-tier wealth-management visual identity that balances precision engineering with understated luxury. Blending high-precision modern minimalism, calibrated glassmorphic depth, and tactile refinement, the interface delivers effortless gravitas for institutional and private ultra-high-net-worth investors.

The visual tone is discreet, architectural, and razor-sharp. Rather than relying on ornate decorations, luxury is projected through pristine whitespace, surgical alignment, micro-specular rim lighting, and luminous chromatic indicators. The system evokes absolute institutional safety, crystalline data clarity, and bespoke discretion.

## Colors

The design system operates a dual-chassis color architecture: an Obsidian Dark Mode engineered for trading floors, night-ops execution, and immersive portfolio monitoring, paired with an Alabaster Light Mode tuned for daylight executive reporting and administrative tasks.

### Obsidian Palette (Dark Mode - Default)
- **Base Canvas:** `#07090e` deep void backdrop; `#0c1017` structural container.
- **Surfaces & Cards:** `#131924` elevated tier-1 card base; `#1a2232` interactive layer hover state.
- **Specular Borders:** `rgba(255, 255, 255, 0.08)` hairline divider; `rgba(56, 189, 248, 0.24)` active border stroke.
- **Chromatic Highlights:** `#38bdf8` luminous cyan (primary focus/glows); `#818cf8` royal iris (secondary accents).
- **Semantics:** `#34d399` emerald (alpha/yield positive); `#fbbf24` amber (margin caution/pending); `#f87171` coral rose (liquidation/drawdown).

### Alabaster Palette (Light Mode)
- **Base Canvas:** `#f8fafc` chalk ground; `#f1f5f9` structural underlay.
- **Surfaces & Cards:** `#ffffff` pure porcelain elevated panels with platinum reflections.
- **Borders & Dividers:** `#e2e8f0` muted platinum boundary; `rgba(2, 132, 199, 0.2)` focused rim.
- **Chromatic Accents:** `#0284c7` sapphire deep ink; `#0ea5e9` cerulean highlight.
- **Typography & Tones:** `#0f172a` primary obsidian ink; `#334155` slate subtitle; `#64748b` muted telemetry metadata.
- **Semantics:** `#10b981` emerald gain; `#f59e0b` amber notice; `#f43f5e` crimson deficit.

## Typography

The typographic pairing reflects dual operational imperatives: human executive polish and mathematical precision.

- **Plus Jakarta Sans** governs editorial structures, brand marks, section headlines, and conversational interfaces. Its geometric balance provides a welcoming yet corporate presence. Letter-spacing is tightened intentionally at larger scales to retain density and authoritative impact.
- **JetBrains Mono** governs every financial artifact: balances, currency codes, yield percentages, order execution IDs, timestamp streams, and ledger tables. It provides uniform monospace tabular stacking (`font-variant-numeric: tabular-nums;`), eliminating jitter during real-time valuation updates.
- **Uppercase Micro-Labels:** `label-caps` must always be styled with `text-transform: uppercase;` and paired with tracking values around `0.08em` for metadata headers and terminal tags.

## Layout & Spacing

The architecture operates on an 8pt spatial baseline with a responsive 12-column fluid grid.

- **Desktop (1280px+):** 12 columns, `gutter: 1.5rem` (24px), outer margins set to `margin: 3rem` (48px) with a centered maximum content container of 1440px. Heavy metrics dashboards deploy nested card-grid splits (e.g., 8-col portfolio trajectory graph alongside 4-col real-time transaction ledger).
- **Tablet (768px - 1279px):** 8 columns, `gutter: 1rem` (16px), `margin: 2rem` (32px). Secondary telemetry modules collapse beneath primary assets.
- **Mobile (< 768px):** 4 columns, `gutter-mobile: 0.75rem` (12px), `margin-mobile: 1rem` (16px). All horizontal data tables convert to vertically stacked ledger strips.

Component internal rhythm adheres strictly to the `space-*` scale:
- `space-xs` (4px): Metric badge padding, inline icon offsets.
- `space-sm` (8px): Gaps between segmented filters, badge internal horizontal padding.
- `space-md` (16px): Input field internal padding, row spacing in asset lists.
- `space-lg` (24px): Standard card internal padding, button-to-control distance.
- `space-xl` (40px): Section-to-section block breaks.

## Elevation & Depth

Visual depth is achieved through layered specular glassmorphism, multi-tiered surface luminous opacity, and diffuse chromatic shadows rather than harsh drop shadows.

### Glassmorphism & Translucency
- **Floating Pod Navigation:** Background `rgba(19, 25, 36, 0.72)` (Dark) or `rgba(255, 255, 255, 0.8)` (Light) with `backdrop-filter: blur(16px) saturate(180%)`.
- **Active Card Tier:** Obsidian surfaces combine a translucent body with a top-down linear specular gradient: `linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)`.

### Surface & Border Hierarchy
- **Level 0 (Canvas):** Pure `#07090e` (Dark) / `#f8fafc` (Light). No borders.
- **Level 1 (Panels & Cards):** `#131924` with 1px border `rgba(255, 255, 255, 0.07)`. In Light Mode, `#ffffff` with 1px border `#e2e8f0` and ambient shadow `0 4px 20px -2px rgba(15, 23, 42, 0.05)`.
- **Level 2 (Modals & Overlays):** `#1a2232` with 1px border `rgba(255, 255, 255, 0.12)`. Ambient glow `0 24px 48px -12px rgba(0, 0, 0, 0.65)`. Light mode features `0 20px 40px -8px rgba(15, 23, 42, 0.12)`.
- **Accent Illumination:** Active states and critical focus rings invoke a cyan ambient glow: `0 0 20px rgba(56, 189, 248, 0.25)`.

## Shapes

The geometric framework balances softened organic contours with razor-sharp structural integrity. 

- **Cards & Data Modules:** Use `rounded-lg` (16px / 1rem) for an architectural, balanced frame that houses data density without looking boxy or overly playful.
- **Inputs & Dropdowns:** Standardize on `rounded-md` (8px / 0.5rem) to maintain geometric contrast against large structural containers.
- **Floating Capsule Pods & Quick Action Triggers:** Utilize true pill shapes (`border-radius: 9999px`) for the floating navigation pod, micro-status chips, and primary call-to-action buttons.

## Components

### Buttons
- **Primary Sovereign Action:** Pill-shaped (`border-radius: 9999px`). In Dark Mode, a solid luminous cyan `#38bdf8` background with `#07090e` bold text, transitioning on hover to a subtle `box-shadow: 0 0 24px rgba(56, 189, 248, 0.4)`. In Light Mode, deep sapphire `#0284c7` with `#ffffff` text. Padding: `12px 28px`.
- **Secondary Ghost:** Translucent fill (`rgba(255, 255, 255, 0.04)` dark / `rgba(15, 23, 42, 0.04)` light), 1px specular border, pill-shaped. Hover triggers border color transitions to `var(--primary)`.

### Floating Capsule Pod Navigation
- Floating bottom-center (mobile) or top-center (desktop) island.
- Enclosed in a pill-shaped container (`border-radius: 9999px`) featuring `backdrop-filter: blur(20px)` and a fine 1px border `rgba(255, 255, 255, 0.1)`.
- Internal nav links display micro JetBrains Mono numbers, with active items marked by an internal glowing pill indicator.

### Cards & Asset Tiles
- Outer corner radius: `1rem` (16px).
- Incorporates a subtle 1px internal inset highlight: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`.
- Asset rows within cards feature hover transitions with subtle background shift to `rgba(255, 255, 255, 0.03)` and a translation of `+2px` on the x-axis.

### Metric Displays & Telemetry Chips
- Numbers set exclusively in `JetBrains Mono`.
- Delta badges (e.g., `+14.28%`) styled in pill chips with low-alpha tint backgrounds: positive gain `rgba(52, 211, 153, 0.12)` with `#34d399` text; loss `rgba(248, 113, 113, 0.12)` with `#f87171` text.

### Form Inputs & Selectors
- Background: `rgba(0, 0, 0, 0.25)` in dark mode, `#f8fafc` in light mode.
- 1px border stroke; on focus, transition stroke to `#38bdf8` accompanied by a soft glow `box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15)`.
- Monospace input formatting for numerical amounts with right-aligned currency tags.

### Checkboxes & Segmented Controls
- Checkboxes: 18x18px squares with `rounded-sm` (4px), using emerald or cyan fill with a white checkmark.
- Segmented switches (e.g., time horizons: `1D`, `1W`, `1M`, `1Y`, `ALL`): Pill container with a sliding background highlight indicator behind the active item.

---

# Part B: Design Build Plan (how to build this design)

Part A above is the design system. Part B says **how and in what order to apply it**. It is a separate track from the project build plan (`ARCHITECTURE-BUILD-PLAN.md`): the project plan makes a **working app with a plain look**; this plan turns that working app into the finished design. Progress is tracked in `BUILD-TODO.md` (Track B).

## B0. Rules for this plan

1. **Start only when the project plan has reached milestone M1** (a working, plain build that the person has approved). Do not begin earlier.
2. **Only visual code changes.** Allowed: `src/ui/**`, `src/ui/theme.ts`, assets, fonts, style blocks and layout inside screens and feature components, `app.config.js` splash and icon fields. **Not allowed:** `src/domain/**`, `src/data/**`, `src/stores/**`, notification scheduling, the native module. If a design step needs a logic change, stop, add a step to the project plan, and ask.
3. **Tokens only.** Every colour, size, radius, shadow and font comes from `theme.ts`, which is built from Part A and `DESIGN-TOKENS.md`. No hex value or style number inside a screen.
4. **Both themes, every step.** Dark (Obsidian) and Light (Alabaster) must both look right before a step is done.
5. **Components first, screens second.** Build and check a component in the gallery (D1.5) before using it on a screen.
6. **Exact values.** Use the numbers in Part A. If Part A is silent, use `DESIGN-TOKENS.md`; if that is silent too, **ask**. Do not invent.
7. **Every step is verified** with the gallery or screen in both themes, on a real phone, with a screenshot saved as evidence.
8. **Accessibility is part of done:** 44 px targets, 4.5:1 text contrast, labels, status never by colour alone, reduce motion respected.
9. **Copy does not change** during design. Text comes from `COPY.md`.

## B1. Conflicts and gaps in Part A, and how they are resolved

| # | Issue | Resolution (confirm or change) |
|---|---|---|
| 1 | The YAML colours (`surface #111319`, `primary #8ed5ff`) disagree with the prose palette (`#07090e`, `#131924`, `#38bdf8`) | **Prose wins.** The YAML colours are not used, except as noted in 2 |
| 2 | Dark mode has **no text colours** in the prose | Use the YAML values: `on-surface #e2e2ea` (primary text), `on-surface-variant #bdc8d1` (secondary), `outline #87929a` (muted). **Needs confirmation** |
| 3 | Light-mode button label is white on `#0284c7`, contrast **4.1:1** (below 4.5:1) | Proposal: keep `#0284c7` for fills and large text; use `#0369a1` (5.93:1) for button fill or text on white. **Needs confirmation** |
| 4 | Light-mode semantic text on white fails contrast: emerald 2.54, amber 2.15, rose 3.67 | Proposal: use `#10b981`, `#f59e0b`, `#f43f5e` for fills, icons and tints only. For text use `#047857`, `#b45309`, `#be123c` (5.48, 5.02, 6.29). **Needs confirmation** |
| 5 | No caution (amber) tint, no light-mode scrim, no disabled or error-text styles, no placeholder colour | Proposals are listed in `DESIGN-TOKENS.md` and marked PROPOSED. **Need confirmation** |
| 6 | The file targets web and desktop (hover, backdrop-filter, 1280 px layouts) | Mobile only. Hover becomes the pressed state. Blur is optional with a solid fallback. Ignore desktop and tablet layouts |
| 7 | "Internal nav links display micro JetBrains Mono numbers" is unclear | Default: tab labels in `label-caps`. **Ask if unclear** |
| 8 | Radii: spacing says cards 16 and inputs 8, but dialogs and sheets are not listed | Dialogs use 16 like cards (Level 2 surface). **Needs confirmation** |
| 9 | An earlier draft named the themes "Obsidian, Polar, System" while this file says Obsidian and Alabaster | **Obsidian (dark), Alabaster (light), Auto**. "Polar" is not used |

## B2. Approach

1. **Freeze function.** Take screenshots of every screen and dialog of the working build as a baseline. Create a branch for design work.
2. **Tokens, then type, then surfaces, then controls, then shell, then screens, then dialogs.** Each layer builds on the one before.
3. **One component at a time.** Add it to the gallery in both themes, compare to Part A, fix, then move on.
4. **One screen at a time** after the components are done. Replace plain primitives with designed ones; do not touch logic.
5. **Light mode is checked at every step**, then again as a full pass in D7.
6. **Real phone checks** at three screen widths or densities, not only one phone.
7. **Contrast and touch targets** are measured, not guessed.
8. **Stop for approval** after every step and show screenshots.

## B3. Steps

### Phase D1: Foundations

#### D1.1: Baseline and branch
- **Build:** screenshots of every screen and dialog (both themes if both exist); a design branch.
- **Done when:** the screenshots are saved in `docs/design-baseline/` and the tests still pass.

#### D1.2: Tokens
- **Build:** both palettes in `theme.ts` exactly as in Part A and `DESIGN-TOKENS.md`: surfaces, borders, primary, accents, semantics, text, tints, glow, focus ring, input fill, scrim, nav fill; spacing scale (4, 8, 16, 24, 40), margins (16 mobile), radii (cards 16, inputs 8, pills full).
- **Spec:** Part A "Colors", "Layout & Spacing", "Shapes".
- **Done when:** a unit test confirms both palettes define every token name; no hex value appears outside `theme.ts`.

#### D1.3: Fonts and type styles
- **Build:** load Plus Jakarta Sans (400, 500, 600, 700, 800) and JetBrains Mono (500, 600). Type styles from Part A (mobile sizes). `Text`, `Metric` (JetBrains Mono, tabular numerals, used for **every** amount, percentage and date-like figure) and `LabelCaps` (11, uppercase, 0.08em).
- **Spec:** Part A "Typography".
- **Done when:** the gallery shows every style; a search finds no money value rendered in a proportional font.

#### D1.4: Theme provider visuals
- **Build:** status bar style, navigation bar colour and splash background follow the theme; Auto follows the phone.
- **Done when:** switching themes updates the whole app with no flash.

#### D1.5: Component gallery
- **Build:** a dev-only screen listing tokens, type styles and components in both themes, with a theme switch.
- **Done when:** the gallery opens from Settings in a debug build and is removed from release builds.

### Phase D2: Surfaces and controls

#### D2.1: Surfaces, cards, elevation
- **Build:** Level 0 canvas; Level 1 card (1px border `rgba(255,255,255,0.07)`, top sheen gradient, inset highlight); Level 2 (dialogs: `#1a2232`, border `0.12`, soft large shadow); light-mode shadows from Part A; row pressed state (fill `rgba(255,255,255,0.03)` and a 2 px shift).
- **Done when:** a card and a dialog surface match Part A in both themes.

#### D2.2: Buttons
- **Build:** primary pill (Dark `#38bdf8` with `#07090e` bold text; Light per B1 item 3; padding 12 x 28; pressed glow `0 0 24px rgba(56,189,248,0.4)`), secondary ghost pill (translucent fill, 1px border), disabled and loading states.
- **Done when:** all states visible in the gallery; 44 px minimum height.

#### D2.3: Inputs
- **Build:** radius 8, fill `rgba(0,0,0,0.25)` (Light `#f8fafc`), 1px border; focus border `#38bdf8` plus 3 px ring `rgba(56,189,248,0.15)`; amount fields in JetBrains Mono with a right-aligned rupee tag; error state.
- **Done when:** default, focused, error and disabled match Part A.

#### D2.4: Chips, tags, badges
- **Build:** status tags (Done, Failed, Pending) as low-alpha tint pills with a text label; delta badges (`rgba(52,211,153,0.12)` with `#34d399`; `rgba(248,113,113,0.12)` with `#f87171`); category chips (selected and unselected).
- **Done when:** 44 px touch area on chips; labels always present.

#### D2.5: Segmented control, checkbox, switch
- **Build:** pill segmented control with a sliding indicator; 18 x 18 checkbox (radius 4, cyan or emerald fill, white check); switch in the same family.
- **Optional (ask first):** limit slider; needs a new dependency.
- **Done when:** the indicator animates and respects reduce motion.

#### D2.6: Icons and monograms
- **Build:** one icon set (lucide) at consistent size and stroke; UPI app monograms (text, not brand logos).
- **Done when:** every icon has an accessible name where it is a button.

#### D2.7: Brand assets
- **Build:** squircle brand mark with cyan glow (SVG), Android adaptive icon, splash artwork.
- **Done when:** icon and splash look right on the phone launcher and at startup.

### Phase D3: Shell

#### D3.1: Screen shell
- **Build:** 16 px side margin, 12 px gutter, section breaks 40, safe areas, bottom room for the pod, scroll fades at top and bottom (gradient overlays).
- **Done when:** nothing hides behind the status bar or pod on three phone sizes.

#### D3.2: Floating pod navigation
- **Build:** bottom-centre capsule about 20 px above the bottom; Dark `rgba(19,25,36,0.72)`, Light `rgba(255,255,255,0.8)`; 1px border `rgba(255,255,255,0.1)`; optional blur (16 to 20) with a solid fallback; glowing cyan active pill and a small dot; pressed scale 0.95.
- **Done when:** active state is clear in both themes; labels follow B1 item 7.

#### D3.3: Top app bar
- **Build:** brand mark, bell with a count badge, avatar. Visual only; behaviour comes from the project plan.
- **Done when:** badge and avatar match Part A components.

#### D3.4: Dialog host visuals
- **Build:** scrim `rgba(6,9,14,0.78)` (Light per `DESIGN-TOKENS.md`), Level 2 surface, scale 0.95 to 1 with fade, 36 px close button.
- **Done when:** the dialog is centred on small and large phones with the keyboard open; no animation with reduce motion.

#### D3.5: Toast
- **Build:** Level 2 style toast above the pod, optional text action.
- **Done when:** readable in both themes and announced to screen readers.

### Phase D4: Screens (one at a time)

For each screen: apply the designed components, check structure and copy against `DESIGN.md` and `COPY.md`, verify in both themes and on a phone.

#### D4.1: Splash
- **Build:** canvas background, glowing brand mark, "Track Pay" in display type, progress bar with a smooth width animation.
#### D4.2: Onboarding
- **Build:** step label in `label-caps`, avatar placeholder with a dashed ring, input wells, greeting preview card, primary button.
#### D4.3: Home
- **Build:** outflow card with the amount in `Metric`, gauge, buffer badge and pace line; pending banner (gentle pulse, off with reduce motion); quick-action tiles; recent payments with category avatars and status tags.
#### D4.4: Analytics
- **Build:** pace card with delta badge; trajectory line chart (actual spend line against a straight ceiling); category bars; weekday columns; top payees; monthly trend; calendar. Chart axes and values in mono.
#### D4.5: History
- **Build:** search field, filter chips, expandable month groups, rows.
#### D4.6: Settings
- **Build:** profile card, theme segmented control, limit controls (input, quick-step buttons, optional slider), UPI app tiles, data rows.
#### D4.7: Needs confirming page
- **Build:** rows with action buttons and the name field in designed components.
#### D4.8: Scanner
- **Build:** camera overlay, frame corners, torch and close buttons, hint text.

### Phase D5: Dialogs

For each dialog check the contents against `DESIGN.md` and `COPY.md`, and both themes.

#### D5.1: Payment dialogs
- Pay to a friend (three states), Confirm payment (two states), Couldn't open the UPI app, No UPI app found.
#### D5.2: Result dialogs
- Did it go through? (two states), Payment failed with Try again (two versions). The failed icon tile uses the negative tint.
#### D5.3: Manage dialogs
- Edit payment (two states), Delete this payment? (red alert badge), Add a payment.
#### D5.4: Data dialogs
- Import backup, Couldn't import, Export your data, PDF statement.
#### D5.5: Pickers and permissions
- Quiet hours, Show payments, Choose a month, Allow notifications, Allow camera, Camera is off.

### Phase D6: Notifications and motion

#### D6.1: Notification visuals
- **Build:** small icon (white glyph), accent colour, large icon; text is fixed by the project plan. The OS controls card colour and shape.
- **Done when:** checked on a real phone in light and dark system themes.

#### D6.2: Motion
- **Build:** pressed feedback, dialog enter, segmented indicator, banner pulse, progress animation. All disabled with reduce motion.
- **Done when:** nothing animates longer than 300 ms; reduce motion removes all of it.

### Phase D7: Light-mode pass and QA

#### D7.1: Light mode on every screen and dialog
- **Done when:** a screenshot of each screen and dialog in Light is saved and reviewed.

#### D7.2: Contrast fixes
- **Build:** apply the approved decisions from B1 items 2 to 5.
- **Done when:** every text and icon pair measures at least 4.5:1 (3:1 for large text and icons) in both themes; the measurements are written in `DESIGN-TOKENS.md`.

#### D7.3: Accessibility audit
- **Done when:** touch targets, labels, 130% font scale, reduce motion and a screen reader pass on every screen.

#### D7.4: Screenshot review
- **Done when:** three phone sizes by two themes reviewed side by side against Part A.

#### D7.5: Design sign-off
- **Done when:** the person approves; `DESIGN.md`, `DESIGN-TOKENS.md` and `README.md` match what was built; this is milestone M2.
