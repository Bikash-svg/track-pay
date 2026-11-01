# Design Tokens

Every colour and size the app may use, for both themes. This is the single source of values. `src/ui/theme.ts` must match this file. Screens use names, never values.

**Sources (merged 2026-10-27):** the Obsidian values come from the Stitch file "Track Pay Offline Design System" (`design.md`, dark tokens). The Alabaster values come from the same file, with the light-mode contrast failures fixed. Where the Stitch "Polar Luxe" file disagreed (a second primary `#006194`, Plus Jakarta Sans for amounts, 12 px inputs, a near-black selected chip), this file wins and the Polar Luxe value is not used.

**FIXED** means a value was changed from the Stitch file to pass 4.5:1 contrast. **CONFIRM** means the owner has not yet approved it.

## Colours

| Token | Dark (Obsidian) | Light (Alabaster) | Used for |
|---|---|---|---|
| `canvas` | `#07090e` | `#f8fafc` | Level 0 background |
| `container` | `#0f131c` | `#f1f5f9` | Input wells, unselected chips, progress tracks |
| `card` | `#131924` | `#ffffff` | Level 1 cards and rows |
| `dialog` | `#181c24` | `#ffffff` | Level 2 dialogs and the tab bar |
| `border` | `#232936` | `#e2e8f0` | Input outlines and dividers |
| `borderSoft` | `rgba(255,255,255,0.08)` | `rgba(0,0,0,0.06)` | Card and dialog outline |
| `borderActive` | `rgba(56,189,248,0.24)` | `rgba(2,132,199,0.2)` | Selected or focused outline |
| `primary` | `#38bdf8` | `#0284c7` | Gauge arc, icons, focus, active indicator (not for small text on light) |
| `primaryFill` | `#38bdf8` | `#0369a1` FIXED, CONFIRM | Button fill (4.10 with white fails, 5.93 passes) |
| `onPrimary` | `#07090e` | `#ffffff` | Text on `primaryFill` |
| `primaryText` | `#38bdf8` | `#0369a1` FIXED, CONFIRM | Links and text in the primary colour |
| `positive` | `#34d399` | `#059669` | Fills, icons, bars |
| `positiveText` | `#34d399` | `#047857` FIXED | Text in the positive colour |
| `positiveTint` | `rgba(52,211,153,0.12)` | `#ecfdf5` | Positive badge background |
| `caution` | `#fbbf24` | `#b45309` | Fills, icons, bars |
| `cautionText` | `#fbbf24` | `#b45309` | Text, including the "Not verified" marker |
| `cautionTint` | `rgba(251,191,36,0.12)` | `#fffbeb` | Caution badge background |
| `negative` | `#f87171` | `#dc2626` | Fills, icons, destructive outline |
| `negativeText` | `#f87171` | `#b91c1c` FIXED | Text in the negative colour (4.41 on its tint fails with `#dc2626`) |
| `negativeFill` | `#f87171` | `#b91c1c` FIXED | Solid Delete button |
| `onNegative` | `#07090e` | `#ffffff` | Text on `negativeFill` |
| `negativeTint` | `rgba(248,113,113,0.12)` | `#fef2f2` | Destructive badge and Undo button background |
| `text` | `#f8fafc` | `#0f172a` | Primary text |
| `textSecondary` | `#94a3b8` | `#475569` | Subtitles, timestamps, helper text |
| `textMuted` | `#7f8da3` FIXED | `#52627a` FIXED | Footnotes, captions, placeholders, inactive tabs |
| `inputFill` | `#0f131c` (same as `container`) | `#f1f5f9` (same as `container`) | Input background |
| `ghostFill` | `rgba(255,255,255,0.04)` | `rgba(15,23,42,0.04)` | Secondary button fill |
| `rowPressed` | `rgba(255,255,255,0.03)` | `rgba(15,23,42,0.03)` | Pressed row |
| `navFill` | `rgba(24,28,36,0.90)` | `rgba(255,255,255,0.90)` | Floating tab bar (solid `dialog` when blur is off) |
| `scrim` | `rgba(7,9,14,0.75)` | `rgba(15,23,42,0.40)` | Behind dialogs |
| `glow` | `rgba(56,189,248,0.25)` | `rgba(2,132,199,0.15)` | Active glow |
| `focusRing` | `rgba(56,189,248,0.15)` | `rgba(2,132,199,0.15)` | 3 px input ring |
| `disabledOpacity` | 0.4 | 0.4 | Disabled controls |

Removed from the old table: `accent` (the iris `#818cf8` is not used; the Stitch file uses `primary`), `interactive`, `borderCard`, `borderDialog`, `sheenTop`, `sheenBottom`, `insetHighlight`. The card top sheen is optional in the design plan and not a token.

## Shadows

| Token | Dark | Light |
|---|---|---|
| `shadowCard` | `0 4px 20px -2px rgba(0,0,0,0.5)` | `0 2px 12px -2px rgba(15,23,42,0.06)` |
| `shadowDialog` | `0 24px 48px -12px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.08)` | `0 24px 48px -12px rgba(15,23,42,0.16), 0 0 0 1px rgba(0,0,0,0.05)` |
| `shadowDock` | `0 16px 36px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)` | `0 16px 36px -10px rgba(15,23,42,0.12), 0 0 0 1px rgba(0,0,0,0.05)` |
| `shadowGlow` | `0 0 16px -2px rgba(56,189,248,0.25)` | `0 0 16px -2px rgba(2,132,199,0.15)` |

React Native uses `elevation` and shadow props, not CSS strings. Approximate them in `theme.ts`; the web values above are the target look.

## Type (mobile)

| Style | Font | Size / line | Weight | Letter spacing |
|---|---|---|---|---|
| displayHero | JetBrains Mono | 40 / 44 | 700 | -0.03em |
| titleLarge | Plus Jakarta Sans | 24 / 28 | 700 | -0.02em |
| titleMedium | Plus Jakarta Sans | 18 / 24 | 600 | -0.01em |
| bodyLarge | Plus Jakarta Sans | 16 / 22 | 500 | 0 |
| bodyMedium | Plus Jakarta Sans | 15 / 20 | 400 | 0 |
| bodySmall | Plus Jakarta Sans | 13 / 18 | 500 | 0 |
| caption | Plus Jakarta Sans | 11 / 14 | 500 | 0.02em |
| numericMedium | JetBrains Mono | 15 / 20 | 600 | 0 |
| metricSm | JetBrains Mono | 13 / 18 | 500 | -0.01em |
| labelCaps | JetBrains Mono | 11 / 16 | 600 | 0.08em, uppercase |

Every amount, percentage, date digit and counter uses a mono style with tabular numerals (`displayHero`, `numericMedium`, `metricSm` or `labelCaps`). In both themes. The Polar Luxe file set amounts in Plus Jakarta Sans; that is not used. Fonts: Plus Jakarta Sans 400, 500, 600, 700; JetBrains Mono 500, 600, 700.

## Spacing and shape

Spacing: 4, 8, 12, 16, 20, 24, 32. Page margin 16. Section gap 20 to 24. Bottom room for the tab bar 32 plus the safe area.
Radii: input 8, chip and badge 8, card and row 16, dialog 24, pill (buttons, tab bar, avatars, step buttons) full, checkbox 4.
Heights: primary and secondary button 50, destructive button 48, input 48, filter chip 36, step pill 36, tab bar 64 (about 20 above the bottom). Touch target minimum 44 by 44 (a 36 high control gets a larger hit area).

## Measured contrast (checked 2026-10-27)

| Pair | Ratio | Result |
|---|---|---|
| Dark: `text` on canvas, card, dialog | 19.03, 16.84, 16.31 | pass |
| Dark: `textSecondary` on card, container, dialog | 6.87, 7.25, 6.66 | pass |
| Dark: `textMuted` `#7f8da3` on canvas, card, container, dialog | 5.92, 5.23, 5.52, 5.07 | pass (the Stitch value `#64748b` was 3.70 on card and failed) |
| Dark: `primary` on card, dialog | 8.22, 7.97 | pass |
| Dark: `onPrimary` on `primaryFill` | 9.30 | pass |
| Dark: positive, caution, negative on card or dialog | 9.16, 11.13 (container), 6.17 (dialog) | pass |
| Light: `text` on canvas | 17.06 | pass |
| Light: `textSecondary` on container | 6.92 | pass |
| Light: `textMuted` `#52627a` on white, canvas, container | 6.20, 5.93, 5.66 | pass (the Stitch value `#64748b` was 4.34 on container and failed) |
| Light: white on `primaryFill` `#0369a1` | 5.93 | pass (white on `#0284c7` is 4.10 and fails) |
| Light: `primaryText` on white, container | 5.93, 5.42 | pass |
| Light: `positiveText` on white, on tint | 5.48, 5.21 | pass (`#059669` as text is 3.77 and fails) |
| Light: `cautionText` on white, on tint | 5.02, 4.84 | pass |
| Light: `negativeText` on white, on tint | 6.47, 5.91 | pass (`#dc2626` on its tint is 4.41 and fails) |
| Light: white on `negativeFill` | 6.47 | pass |

The Stitch contrast table (`tokens_table.md`) listed 4.62 for white on `#0284c7`, 4.71 for `#059669` on white, and 3.98 for `#64748b` on white. Those numbers were wrong; the values above were measured.

Rules: use the plain `positive`, `caution`, `negative` and `primary` colours only for fills, icons, bars and tints. Use the `...Text` tokens for text. Status is never shown by colour alone.

Still to measure in design step D7.2: `border` on `canvas` for input outlines (3:1 wanted), chart colours on `card`, and every notification card on real devices.