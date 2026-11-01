# Design System and Design Build Plan

> **Organisation of this file.** **Part A** is the design system: style, roles, type, shape, elevation and components. **Part B** (at the end) is the design build plan: how and in what order to apply it. All colour, type and size **values** live in `DESIGN-TOKENS.md` (the single source). Part A names tokens, not hex values. Screens, copy and behaviour are in `DESIGN.md` and `COPY.md`.
>
> **Rewritten 2026-10-27** from the Stitch design files (Track Pay Offline Design System, Obsidian and Alabaster). The old wealth-management wording, the YAML colour block and the desktop layouts were removed. Contrast failures in the Stitch values were fixed in `DESIGN-TOKENS.md`.

# Part A: Design system

## Brand and style

Track Pay is a private, offline expense tracker. The user pays in any UPI app, shares the success screenshot, and Track Pay records it on the phone. The look is calm, focused, utilitarian and dependable: clear budget pace at a glance, no decoration for its own sake, no claims it cannot back up (no security badges, no "encrypted", no "live sync").

- **Obsidian (dark, default):** a near-black canvas with layered slate cards and a sky-cyan accent.
- **Alabaster (light):** a chalk canvas with white cards and a deep sky-blue accent.
- **Auto** follows the phone.
- **One-to-one parity:** every screen and dialog has the same layout, hierarchy, text and spacing in both themes. Only token values change.
- Depth comes from surface tone, a hairline border, a soft shadow, and (on the tab bar only) optional blur with a solid fallback.

## Colour roles

Names only; values are in `DESIGN-TOKENS.md`. Never hard-code a value in a screen.

- `canvas`: screen background. `container`: input wells, unselected chips, progress tracks. `card`: cards and rows. `dialog`: dialogs and the tab bar.
- `border`, `borderSoft`, `borderActive`: dividers, card outlines, selected outline.
- `primary`, `primaryFill`, `onPrimary`, `primaryText`: the accent for icons, the gauge, button fills and links.
- `positive`, `caution`, `negative` with `...Text` and `...Tint`: fills and icons, readable text, and badge backgrounds.
- `text`, `textSecondary`, `textMuted`: the three text levels.
- Caution is used for the "Not verified" marker and limit warnings. Negative is used for going over the limit, refused screenshots and destructive actions.
- Plain semantic colours are for fills, icons, bars and tints only. Text uses the `...Text` tokens.

## Typography

- **Plus Jakarta Sans** for headings, labels, instructions, dialogs and buttons.
- **JetBrains Mono** with tabular numerals for **every** amount, currency symbol, percentage, date digit and counter, in both themes.
- Styles: `displayHero`, `titleLarge`, `titleMedium`, `bodyLarge`, `bodyMedium`, `bodySmall`, `caption`, `numericMedium`, `metricSm`, `labelCaps` (uppercase, wide tracking, for small metadata headers such as DAILY PACE). Sizes in `DESIGN-TOKENS.md`.
- Text follows the system font-size setting; layouts must hold at 130%.

## Layout

- Phone only, portrait, baseline 390 by 844. Single column.
- Page margin 16, section gap 20 to 24, content gap 12 to 16.
- Top safe area and bottom safe area come from the insets (Track A 2.2a). Content scrolls under a soft fade at the top and above the tab bar.
- Every tappable control is at least 44 by 44.
- No desktop or tablet layouts.

## Elevation

- **Level 0, canvas:** flat.
- **Level 1, card:** `card` fill, 1px `borderSoft`, `shadowCard`.
- **Level 2, dialog:** `dialog` fill, 1px `borderSoft`, `shadowDialog`, over the `scrim` (blur is optional, with a plain scrim as the fallback).
- **Tab bar:** a floating pill about 20 above the bottom, `navFill`, 1px `borderSoft`, `shadowDock`, optional blur 20 with a solid `dialog` fallback.
- **Active glow:** `shadowGlow` on the active tab pill and the focused primary control. Keep it subtle.

## Shapes

Input 8, chip and badge 8, card and row 16, dialog 24, pills (buttons, tab bar, avatars, step buttons) full, checkbox 4.

## Components

- **Primary button:** 50 high, pill, `primaryFill` with `onPrimary` bold label (bodyLarge). Pressed: glow and a 0.98 scale.
- **Secondary button:** 50 high, pill, `container` fill, 1px `border`, `text` label.
- **Destructive:** 48 high, pill. Outline style (`negativeTint` fill, `negativeText`, 1px `negative`) for Undo and Delete payment; solid style (`negativeFill`, `onNegative`) only for the final Delete in the confirmation.
- **Step pills** (+₹2,000, +₹5,000, −₹1,000): 36 high, pill, `container`, mono label, 44 hit area.
- **Input:** 48 high, radius 8, `container` fill, 1px `border`, 12 side padding. Focus: `borderActive` plus a 3px `focusRing`. Error: `negative` border and `negativeText` message below. Placeholder uses `textMuted`.
- **Amount well:** large inset `container` card, `displayHero` mono digits, a ₹ symbol on the left.
- **Month card:** `card`, radial gauge (8px stroke, `container` track, `primary` arc), spent amount in `displayHero`, Limit, Left and Allowance a day in `numericMedium`, footnote in `caption`.
- **Glance block:** three columns with `labelCaps` heading, `numericMedium` value and a `caption` unit.
- **Payment row:** `card`, 16 radius; a monogram squircle (first letter, `container`), payee in `bodyMedium`, category and time in `bodySmall` `textSecondary`, amount in `numericMedium`; the "Not verified" marker under the name when it applies.
- **"Not verified" marker:** compact pill (padding 2 by 8, radius 8), `cautionTint` fill, `cautionText`, 1px `caution`, a small `!` icon, text "Not verified", 12 semibold. Status is never colour alone.
- **Chips:** 36 high, radius 8, padding 8 by 14 (44 hit area). Selected: `primaryFill` with `onPrimary`. Unselected: `container` with `textSecondary`. The Not verified filter chip uses the caution tint when it is not selected.
- **Segmented control, checkbox, switch:** pill track with a sliding active indicator (`primaryFill`); checkbox 18 with radius 4 and a white tick; switch in the same family.
- **Tab bar:** four items (Home, Analytics, History, Settings), icon with a `caption` label, the active item has a `primary`-tinted pill, bold `primaryText` label and a small dot; inactive items use `textSecondary`.
- **Dialog:** centred, width up to 358, radius 24, padding 20, title in `titleLarge`, a 32 round close button (not on permission dialogs), optional subtitle.
- **Notification cards (preview only):** the OS draws real notifications. In the design files they use `card`, radius 16, a meta row (app icon, "Track Pay", time), a title, a body and 36 high pill buttons with 44 touch targets.
- **Charts:** radial gauge; spending line with a dashed ceiling line, a soft area fill and a marked day; category bars; seven weekday bars; six-month bars with a limit line; a calendar grid with most-spent and least-spent day marks. Chart axes and values in mono. A text summary for screen readers.
- **Toast:** Level 2 style above the tab bar, optional text action.

## Motion

- Press feedback: scale 0.98, ease-out, under 150 ms.
- Dialog: scrim fades in 200 ms; the dialog scales from 0.95 and fades in under 250 ms.
- Nothing runs longer than 300 ms.
- With reduce motion on, all transitions, scales and pulses are off.

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

## B1. Conflicts and gaps, and how they are resolved

Resolved 2026-10-27 after reviewing the three Stitch files (Obsidian `design.md`, `tokens_table.md`, `screens.md`) and the Polar Luxe light file. **Items marked CONFIRM need the owner's yes.**

| # | Issue | Resolution |
|---|---|---|
| 1 | The old YAML colours (`#111319`, `#8ed5ff`) disagreed with the prose palette | Removed. `DESIGN-TOKENS.md` is the only source of values |
| 2 | Dark text colours were undefined | Dark `text #f8fafc`, `textSecondary #94a3b8` from the Stitch file. `textMuted` changed from `#64748b` (3.70:1, fails) to `#7f8da3` (5.23:1). CONFIRM |
| 3 | Light button label white on `#0284c7` is 4.10:1 | `primaryFill` and `primaryText` use `#0369a1` (5.93:1). `primary #0284c7` stays for the gauge, icons and borders. CONFIRM |
| 4 | Light semantic text fails (positive 3.77 with `#059669`, negative on tint 4.41) | Separate `...Text` tokens: `#047857`, `#b45309`, `#b91c1c`. CONFIRM |
| 5 | Stitch contrast numbers were wrong (4.62, 4.71, 3.98) | Re-measured; the true values are in `DESIGN-TOKENS.md`. Light `textMuted` changed to `#52627a` (5.66 on `container`). CONFIRM |
| 6 | Part A targeted web and desktop | Mobile only; hover becomes pressed; blur optional with a solid fallback |
| 7 | Tab labels | Tab labels use `caption` (not mono numbers) |
| 8 | Dialog radius | 24 (the Stitch value), cards 16, inputs 8 |
| 9 | Theme names | Obsidian (dark), Alabaster (light), Auto. The names "Polar" and "Polar Luxe" are not used |
| 10 | The Polar Luxe file set amounts in Plus Jakarta Sans, inputs at 12, a near-black selected chip, a 24 hero card | Not used. Amounts are JetBrains Mono, inputs 8, selected chip `primaryFill`, cards 16, in both themes |
| 11 | The Stitch screens included a "Local" pill, a "Welcome back" line, Wi-Fi and battery icons, "Safe Zone", "Budgeted ₹483/d", a Filter button, an "I understand" checkbox, "Set up later", shield icons, a camera on the avatar, "Zero-knowledge" or "Secure Enclave" text | Not built. The guardrails ban unbacked security claims; the others are not in the locked screens. Ask before adding any |
| 12 | The Stitch spec used the old payment flow elements (bell, Pending Collect, Triage Inbox, Smart Routing SLA, voice search, Linked Payment Rails, Persistent Ledger Ping, Done/Failed/Pending control) | Removed everywhere; see `GUARDRAILS.md` section 11 |

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
- **Build:** both palettes in `theme.ts` exactly as in `DESIGN-TOKENS.md`: every colour token (including the `...Text`, `...Tint` and `primaryFill` tokens), shadows, spacing scale (4, 8, 12, 16, 20, 24, 32), margin 16, radii (input 8, chip 8, card 16, dialog 24, pill full, checkbox 4).
- **Spec:** `DESIGN-TOKENS.md`; Part A "Colour roles", "Layout", "Shapes".
- **Done when:** a unit test confirms both palettes define every token name; no hex value appears outside `theme.ts`.

#### D1.3: Fonts and type styles
- **Build:** load Plus Jakarta Sans (400, 500, 600, 700) and JetBrains Mono (500, 600, 700). Type styles from `DESIGN-TOKENS.md`. `Text`, `Metric` (JetBrains Mono, tabular numerals, used for **every** amount, percentage and date-like figure, in both themes) and `LabelCaps` (11, uppercase, 0.08em).
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
- **Build:** Level 0 `canvas`; Level 1 `card` with 1px `borderSoft` and `shadowCard`; Level 2 `dialog` with `borderSoft` and `shadowDialog`; row pressed state (`rowPressed` and scale 0.98). The card top sheen is optional.
- **Done when:** a card and a dialog surface match Part A and `DESIGN-TOKENS.md` in both themes.

#### D2.2: Buttons
- **Build:** primary pill (`primaryFill`, `onPrimary` bold label, 50 high, pressed `shadowGlow` and scale 0.98), secondary pill (`container`, 1px `border`), destructive outline and solid variants, step pills, disabled (`disabledOpacity`) and loading states.
- **Done when:** all states visible in the gallery; 44 px minimum height.

#### D2.3: Inputs
- **Build:** 48 high, radius 8, `container` fill, 1px `border`; focus `borderActive` plus a 3 px `focusRing`; amount well and amount fields in JetBrains Mono with a ₹ symbol; error state with `negativeText` message; placeholder `textMuted`.
- **Done when:** default, focused, error and disabled match Part A.

#### D2.4: Chips, tags, badges
- **Build:** the "Not verified" marker (`cautionTint`, `cautionText`, 1px `caution`, `!` icon and text; there are no Done, Failed or Pending tags); positive and negative badges (`positiveTint` with `positiveText`; `negativeTint` with `negativeText`); filter and category chips (selected `primaryFill`, unselected `container`).
- **Done when:** 44 px touch area on chips; labels always present.

#### D2.5: Segmented control, checkbox, switch
- **Build:** pill segmented control with a sliding `primaryFill` indicator; 18 x 18 checkbox (radius 4, `primaryFill`, white check); switch in the same family.
- **Done when:** the indicator animates and respects reduce motion.

#### D2.6: Icons and monograms
- **Build:** one icon set (lucide) at consistent size and stroke; payee monograms (first letter of the payee name, uppercase, in a squircle).
- **Done when:** every icon has an accessible name where it is a button.

#### D2.7: Brand assets
- **Build:** squircle brand mark with cyan glow (SVG), Android adaptive icon, splash artwork.
- **Done when:** icon and splash look right on the phone launcher and at startup.

### Phase D3: Shell

#### D3.1: Screen shell
- **Build:** 16 px side margin, 12 px gutter, section breaks 40, safe areas, bottom room for the pod, scroll fades at top and bottom (gradient overlays).
- **Done when:** nothing hides behind the status bar or pod on three phone sizes.

**Plan note (2026-10-19, owner-approved):** Inset application is Track A 2.2a — `Screen` and `TabBar` read insets via `useSafeArea insets` from `react-native-safe-area-context` (already installed via expo-router). D3.1 consumes the resulting spacing and does not re-apply insets.

#### D3.2: Floating pod navigation
- **Build:** bottom-centre pill about 20 px above the bottom, 64 high; `navFill`, 1px `borderSoft`, `shadowDock`; optional blur 20 with a solid `dialog` fallback; active item has a `primary`-tinted pill, bold `primaryText` label, a small dot and `shadowGlow`; inactive items `textSecondary`; pressed scale 0.95.
- **Done when:** active state is clear in both themes; tab labels use `caption` (B1 item 7).

#### D3.3: Top app bar
- **Build:** brand mark and avatar. No bell and no badge. Visual only; behaviour comes from the project plan.
- **Done when:** the avatar matches Part A components.

#### D3.4: Dialog host visuals
- **Build:** `scrim`, Level 2 `dialog` surface (radius 24, padding 20, up to 358 wide), scale 0.95 to 1 with fade, 32 px close button.
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
- **Build:** the **locked Home structure** (`DESIGN.md` §1 Home): greeting header with month pill; month card with the amount in `Metric`, gauge, Left and Allowance a day, and the footnote; quick access (Add from screenshot primary, Add manually secondary, hint); "This month at a glance"; recent payments with category avatars and the Not verified marker; tab bar. Colours come from `DESIGN-TOKENS.md` only; the approved mockup's green accent and canvas are illustrative and are not used. No pending banner.
#### D4.4: Analytics
- **Build:** pace card with delta badge; trajectory line chart (actual spend line against a straight ceiling); category bars; weekday columns; top payees; monthly trend; calendar. Chart axes and values in mono.
#### D4.5: History
- **Build:** search field, filter chips (All, Not verified), expandable month groups, rows with the Not verified marker.
#### D4.6: Settings
- **Build:** profile card, theme segmented control, limit controls (input, quick-step buttons, optional slider), reminder rows (daily times, quiet hours, backup reminder, limit alerts always on), data rows.
#### D4.7: Receipt result and batch result screens
- **Build:** the Payment added page (amount, payee, date, category, Looks right, Edit, Undo) and its variants (Already added, Could not read, Not a successful payment), and the Batch result page with its counts. Designed components only; text from `COPY.md`.
#### D4.8: Add and edit payment form
- **Build:** the payment form (amount well, to whom, what for, category chips, date stepper) in designed components, used for Add manually and Edit.

### Phase D5: Dialogs

For each dialog check the contents against `DESIGN.md` and `COPY.md`, and both themes.

#### D5.1: Payment form and edit dialogs
- Add manually, Edit payment (with the Not verified marker).
#### D5.2: Delete, verify and undo
- Delete this payment? (red alert badge), the Marked as verified and Payment deleted toasts with Undo.
#### D5.3: Reminder dialogs
- Reminder times, Quiet hours.
#### D5.4: Data dialogs
- Import backup, Couldn't import, Export your data, Export choices, PDF statement.
#### D5.5: Pickers and permissions
- Choose a month, Allow notifications. (No camera dialogs: the camera is not used.)

### Phase D6: Notifications and motion

#### D6.1: Notification visuals
- **Build:** small icon (white glyph), accent colour, large icon for the four notification kinds (receipt, daily reminder, limit alert, backup reminder); text and buttons are fixed by the project plan. The OS controls card colour and shape.
- **Done when:** checked on a real phone in light and dark system themes.

#### D6.2: Motion
- **Build:** pressed feedback, dialog enter, segmented indicator, progress animation. All disabled with reduce motion.
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