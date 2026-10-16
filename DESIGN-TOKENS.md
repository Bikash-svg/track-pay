# Design Tokens

Every colour and size the app may use, for both themes, with the conflicts in `DESIGN-BUILD-PLAN.md` resolved. `src/ui/theme.ts` must match this file. **PROPOSED** means the design file does not define it; confirm before relying on it.

Names are semantic. Screens use names, never values.

## Colours

| Token | Dark (Obsidian) | Light (Alabaster) | Used for |
|---|---|---|---|
| `canvas` | `#07090e` | `#f8fafc` | Level 0 background |
| `container` | `#0c1017` | `#f1f5f9` | Structural underlay |
| `card` | `#131924` | `#ffffff` | Level 1 cards |
| `interactive` | `#1a2232` | `#f1f5f9` PROPOSED | Rows, Level 2 dialogs in dark, pressed layer |
| `dialog` | `#1a2232` | `#ffffff` PROPOSED | Level 2 dialogs |
| `border` | `rgba(255,255,255,0.08)` | `#e2e8f0` | Hairlines |
| `borderCard` | `rgba(255,255,255,0.07)` | `#e2e8f0` | Card outline |
| `borderDialog` | `rgba(255,255,255,0.12)` | `#e2e8f0` | Dialog outline |
| `borderActive` | `rgba(56,189,248,0.24)` | `rgba(2,132,199,0.2)` | Selected or focused outline |
| `primary` | `#38bdf8` | `#0284c7` | Main action, focus, glow |
| `onPrimary` | `#07090e` | `#ffffff` | Text on primary |
| `accent` | `#818cf8` | `#0ea5e9` | Secondary accent |
| `positive` | `#34d399` | `#10b981` | Done, gains |
| `caution` | `#fbbf24` | `#f59e0b` | Pending, warnings |
| `negative` | `#f87171` | `#f43f5e` | Failed, over limit |
| `text` | `#e2e2ea` PROPOSED (design YAML `on-surface`) | `#0f172a` | Primary text |
| `textSecondary` | `#bdc8d1` PROPOSED (YAML `on-surface-variant`) | `#334155` | Secondary text |
| `textMuted` | `#87929a` PROPOSED (YAML `outline`) | `#64748b` | Metadata, placeholders |
| `positiveText` | `#34d399` | `#047857` PROPOSED | Text in the positive colour |
| `cautionText` | `#fbbf24` | `#b45309` PROPOSED | Text in the caution colour |
| `negativeText` | `#f87171` | `#be123c` PROPOSED | Text in the negative colour |
| `primaryText` | `#38bdf8` | `#0369a1` PROPOSED | Links and text in the primary colour on white |
| `positiveTint` | `rgba(52,211,153,0.12)` | `rgba(16,185,129,0.12)` PROPOSED | Done tag, gain badge |
| `cautionTint` | `rgba(251,191,36,0.12)` PROPOSED | `rgba(245,158,11,0.12)` PROPOSED | Pending tag |
| `negativeTint` | `rgba(248,113,113,0.12)` | `rgba(244,63,94,0.12)` PROPOSED | Failed tag, loss badge |
| `inputFill` | `rgba(0,0,0,0.25)` | `#f8fafc` | Input background |
| `ghostFill` | `rgba(255,255,255,0.04)` | `rgba(15,23,42,0.04)` | Secondary button |
| `rowPressed` | `rgba(255,255,255,0.03)` | `rgba(15,23,42,0.03)` PROPOSED | Pressed row |
| `navFill` | `rgba(19,25,36,0.72)` | `rgba(255,255,255,0.8)` | Floating pod |
| `navBorder` | `rgba(255,255,255,0.1)` | `#e2e8f0` PROPOSED | Pod outline |
| `scrim` | `rgba(6,9,14,0.78)` | `rgba(15,23,42,0.45)` PROPOSED | Behind dialogs |
| `sheenTop` / `sheenBottom` | `rgba(255,255,255,0.06)` / `rgba(255,255,255,0.01)` | none | Card top gradient |
| `insetHighlight` | `rgba(255,255,255,0.08)` | none | Card top inner line |
| `glow` | `rgba(56,189,248,0.25)` | `rgba(2,132,199,0.25)` PROPOSED | Active glow |
| `focusRing` | `rgba(56,189,248,0.15)` | `rgba(2,132,199,0.15)` PROPOSED | 3 px input ring |
| `disabledOpacity` | 0.4 PROPOSED | 0.4 PROPOSED | Disabled controls |

**Shadows (light mode):** cards `0 4px 20px -2px rgba(15,23,42,0.05)`; dialogs `0 20px 40px -8px rgba(15,23,42,0.12)`. **Dark dialogs:** `0 24px 48px -12px rgba(0,0,0,0.65)`.

## Type (mobile)

| Style | Font | Size / line | Weight | Letter spacing |
|---|---|---|---|---|
| displayHero | Plus Jakarta Sans | 36 / 44 | 700 | -0.025em |
| headlineLg | Plus Jakarta Sans | 26 / 34 | 600 | -0.02em |
| headlineMd | Plus Jakarta Sans | 22 / 28 | 600 | -0.015em |
| headlineSm | Plus Jakarta Sans | 18 / 24 | 600 | -0.01em |
| bodyLg | Plus Jakarta Sans | 16 / 26 | 400 | -0.005em |
| bodyMd | Plus Jakarta Sans | 14 / 22 | 400 | 0 |
| bodySm | Plus Jakarta Sans | 12 / 18 | 400 | 0.01em |
| metricXl | JetBrains Mono | 28 / 36 | 600 | -0.03em |
| metricMd | JetBrains Mono | 20 / 28 | 500 | -0.02em |
| metricSm | JetBrains Mono | 13 / 18 | 500 | -0.01em |
| labelCaps | JetBrains Mono | 11 / 16 | 600 | 0.08em, uppercase |

Every amount, percentage and figure uses a mono style with tabular numerals.

## Spacing and shape

Spacing: 4, 8, 16, 24, 40. Page margin 16. Gutter 12. Radii: cards 16, inputs 8, dialogs 16 (PROPOSED), pills and chips full, checkbox 4. Touch target minimum 44.

## Measured contrast

| Pair | Ratio | Result |
|---|---|---|
| Dark: `text` on canvas | 15.46 | pass |
| Dark: `text` on card | 13.67 | pass |
| Dark: `text` on interactive | 12.36 | pass |
| Dark: `textSecondary` on card | 10.36 | pass |
| Dark: `textMuted` on card | 5.54 | pass |
| Dark: primary on card | 8.22 | pass |
| Dark: `onPrimary` on primary | 9.30 | pass |
| Dark: positive, caution, negative on card | 9.16, 10.55, 6.37 | pass |
| Light: `text` on canvas | 17.06 | pass |
| Light: `textSecondary` on card | 10.35 | pass |
| Light: `textMuted` on card | 4.76 | pass |
| Light: `textMuted` on canvas | 4.55 | pass (barely) |
| Light: `onPrimary` on primary (white on `#0284c7`) | **4.10** | **fails** normal text |
| Light: `primaryText` `#0369a1` on card | 5.93 | pass |
| Light: positive, caution, negative on white | **2.54, 2.15, 3.67** | **fail** as text |
| Light: `positiveText`, `cautionText`, `negativeText` on white | 5.48, 5.02, 6.29 | pass |

The light failures are why the PROPOSED text tokens exist. Do not use the plain semantic colours for text on white.
