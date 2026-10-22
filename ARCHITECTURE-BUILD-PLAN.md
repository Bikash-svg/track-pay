# Architecture Build Plan (project plan: a working app)

This plan builds a **working version of the app with a plain look**. Every feature works, is tested and is accessible, but nothing is styled beyond what is needed to use it. The finished look is a separate plan: Part B of `DESIGN-BUILD-PLAN.md`. Do not do design work here.

**Milestone M1** is the end of this plan: a plain build that can be installed and used. After M1 is approved, the design plan starts.

## What "plain" means

- System font, no custom fonts, no icons except text labels, no shadows, gradients, blur, animation or brand art.
- Neutral colours from the small token set in Step 1.1 (both a light and a dark version, so the theme switch works).
- Layout is a simple vertical stack with consistent spacing. Touch targets are at least 44 px. Every control has a text label.
- Plain does **not** mean unfinished: states, validation messages, empty states and errors are all built, with the exact text from `COPY.md`.

## The UI contract (so the design plan only changes looks)

1. Screens use only primitives from `src/ui` (`Screen`, `Text`, `Button`, `Field`, `Card`, `Chip`, `StatusTag`, `Toggle`, `Dialog`, `Banner`, `PayRow`) and colours from `useTheme()` by **semantic name**. No hex values or font names in screens.
2. Money is always rendered through one `Money` text component, so the design plan can switch every figure to the mono font in one place.
3. Logic lives in `src/domain`, hooks and stores. Screens only read data and call actions.
4. Text comes from one place (`COPY.md` is the reference; code may keep strings in `src/ui/copy.ts`).

## How every step works

0. **Check what already exists.** The project already contains a lot of this. For each step, look for the feature first. If it exists, verify it against "Done when", fix only the gaps, and record the evidence. Do not rewrite working code.
1. **Read** the step, the spec files it names, and `GUARDRAILS.md`.
2. **Tests first** for any logic. Run them and see them fail.
3. **Build only this step.**
4. **Run the checks:** `npx tsc --noEmit`, `npm run lint:guardrails`, `npm test`. After a dependency change: `npx expo install --check` and `npm ci --dry-run --include=dev`.
5. **Device check** where the step lists one (real phone, not an emulator).
6. **Update `BUILD-TODO.md`** (Track A) with evidence, then stop and report. Wait for approval.

**Sources:** features and behaviour: `DESIGN.md` (structure and copy only), `COPY.md`, `ARCHITECTURE.md`, `EVALS.md`. Ignore all colours, fonts and radii in those files. Safety: `GUARDRAILS.md`.

## Phase 0: Baseline

#### Step 0.1: Confirm the baseline
- **Build:** nothing new.
- **Done when:** `npx expo install --check` reports nothing; `npm ci --dry-run --include=dev` is clean; type check, guardrail check and tests pass; `git status` is clean.

#### Step 0.2: Make EAS builds work
- **Build:** pin Node (`"node": "20.19.4"`) in `eas.json` build profiles; add `.nvmrc`, `.npmrc` and the `engines` line from the setup files; regenerate the lock file with npm 10 if `npm ci` fails on EAS; confirm `.gitignore` uses `/android` and `/ios` and `modules/upi-launcher/android` is tracked.
- **Done when:** `eas build -p android --profile preview` finishes and the APK installs and opens.

#### Step 0.3: Notification library spike
- **Build:** a throw-away screen: schedule a notification with Done and Failed buttons and a reply box; close the app fully; tap each control.
- **Done when:** EVALS R6, R7, R10 pass on a real phone, or the fallback library is chosen and passes. The choice is recorded.

#### Step 0.4: UPI result spike
- **Build:** a throw-away check of what the installed UPI apps return after `upi://pay` for a shop QR and a friend.
- **Done when:** findings are written in `BUILD-TODO.md`. Results remain hints only.

#### Step 0.5: Rename to Track Pay
- **Build:** visible name in `app.config.js`, strings, notification titles and channel names. Keep the Android package id.
- **Done when:** `grep -ri vaultx src app.json` finds nothing user-visible; tests pass.

---

## Phase 1: Plain foundation

#### Step 1.1: Semantic tokens
- **Build:** `theme.ts` with a small semantic token set (names from `DESIGN-TOKENS.md`: `canvas`, `card`, `interactive`, `border`, `primary`, `onPrimary`, `positive`, `caution`, `negative`, `text`, `textSecondary`, `textMuted`, tints) and two plain palettes, light and dark. Values are simple and high contrast. The design plan replaces the values.
- **Done when:** a test confirms both palettes define every name; no hex value appears outside `theme.ts`.

#### Step 1.2: Plain primitives
- **Build:** `Screen`, `Text`, `Money`, `Button` (primary, secondary, danger, text), `Field`, `Card`, `Chip`, `StatusTag` (text label always), `Toggle`, `Banner`, `PayRow`. Minimal styling, 44 px targets, accessibility labels.
- **Done when:** every primitive is used by at least one screen; none contains business logic.

#### Step 1.3: Navigation structure
- **Build:** four tabs (Home, Analytics, History, Settings) with a plain tab bar; stack routes for pages and popups.
- **Done when:** every route in the plan opens and Back works.

#### Step 1.4: Dialog host
- **Build:** one reusable centred dialog: scrim, close button, tap outside and Back dismiss, scrolls if tall, keyboard-safe. Used by every popup.
- **Done when:** centred on small and large phones with the keyboard open.

#### Step 1.5a: Settings key-value store
- **Build:** Install `@react-native-async-storage/async-storage` via `npx expo install`. Create `src/data/settings.ts` with a typed wrapper around it: `getTheme()` and `setTheme(theme)` at minimum, extended in Phase 2.1 for the profile fields (`firstName`, `surname`, `avatarUri`, `onboarded`). Include a storage-availability check (a function the tests can stub) so the layer is mockable. Do not add Phase 2 profile fields here.
- **Done when:** round-trip test passes: `setTheme('light')` then `getTheme()` returns `'light'`. Storage dependency installed via `npx expo install`. `npx expo install --check` reports nothing.

#### Step 1.5: Theme choice
- **Build:** Dark, Light and Auto (follows the phone), persisted, status bar follows.
- **Done when:** switching updates every screen without a restart.

---

## Phase 2: Splash and onboarding (functional)

#### Step 2.1: Profile data
- **Build:** settings fields `firstName`, `surname`, `avatarUri`, `onboarded` with a migration and tests; `greeting(now, firstName)` (morning, afternoon, evening).
- **Done when:** tests cover defaults, migration from old settings, and the greeting at 04:59, 05:00, 11:59, 12:00, 17:00, 21:00.

#### Step 2.2: Splash gate
- **Build:** a plain screen with the name and a progress indicator that ends only when the database and settings have loaded; then routes on.
- **Done when:** works with no network (EVALS D7); never shows an empty Home first.

**Plan notes (2026-10-18, owner-approved):**
- The gate keys off a single `loadAppData()` call (`src/data/loading.ts`). "Database" resolves to the Phase 3 payments store (Steps 3.x/4.x), which does not exist yet — 2.2 gates on settings/profile only. This is a wording gap in the build line, not a code gap; no schema change, so GUARDRAILS §5.1 (numbered migration per schema change) does not apply.
- **Ownership boundary (permanent):** 2.2 owns the splash gate and "routes on" — in 2.2's scope that means routing to `/home` on every launch. 2.4 owns the `onboarded` branch and the "first launch goes to onboarding" behavior. O2 and O6 are formally 2.4's tests; do not claim them in 2.2.
- The 1.5 theme-flash gap closes here: `expo-splash-screen.preventAutoHideAsync()` at module scope in `app/_layout.tsx`, `hideAsync()` after `loadAppData()` resolves (including on failure).

#### Step 2.2a: Safe area insets
- **Build:** Verify whether `expo-router` already provides `<SafeAreaProvider>` (grep `app src` for `SafeAreaProvider`). If not, wrap the root in `<SafeAreaProvider>` in `app/_layout.tsx`. Update `src/ui/Screen.tsx` to use `useSafeAreaInsets()` — top inset added to padding, bottom inset added so content clears the Android navigation bar. Update `src/ui/TabBar.tsx` to add `insets.bottom` padding. No new dependency: `react-native-safe-area-context` ships with `expo-router`.
- **Done when:** On device: the top heading of every tab screen is fully visible below the status bar; the tab bar is fully visible above the navigation bar; tapping any top or bottom control works. Verified on device.

#### Step 2.3: Onboarding form
- **Build:** Skip for now, First name and Surname fields, live greeting preview text, Continue. **Step 2 of 2 (monthly limit) deferred to 7.3; BUILD-TODO open question 3 resolved to single-step for 2.3.**
- **Done when:** preview updates as you type; Continue saves; Skip leaves the name empty and opens Home.

#### Step 2.4: Launch routing
- **Build:** first launch goes to onboarding, later launches to Home; profile editable in Settings.
- **Done when:** fresh install, relaunch and clear-data behave correctly.
- **Note (2026-10-19):** "profile editable in Settings" belongs to Step 7.1, not 2.4. 2.4's Done-when is "fresh install, relaunch and clear-data behave correctly" and does not include profile edit. The onboarded branch lives in `src/ui/SplashGate.tsx` as `<Redirect href="/onboarding" />` (declarative, not `router.replace` in an effect) and is owned by 2.4; 2.2 owns the splash gate and "routes on", 2.3 owns saving `onboarded:true` and navigating to Home.

#### Step 2.5: Profile picture (optional, ask first)
- **Build:** pick a photo for the avatar, kept only on the phone. Needs a new dependency and maybe a permission.
- **Ask first.** If not wanted, mark skipped.

---

## Phase 3: Home

#### Step 3.1: Month statistics (domain)
- **Build:** pure functions for spent, daily average, projected month end, headroom, left, percent used, allowance per day, and level (ok below 80%, warn from 80%, over above 100%), per `ARCHITECTURE.md` section 7. Tests first.
- **Done when:** the example (spent ₹3,630 on 11 Oct, limit ₹15,000) gives ₹330 a day, projected ₹10,230, headroom ₹4,770, left ₹11,370, 24%, ₹568 a day; edge cases pass: day 1, last day, no limit, zero spend, over limit.

#### Step 3.2: Spend summary
- **Build:** this month's spent, limit, left, percent, daily average, as plain text and a plain progress bar. Limit parts hidden when the limit is off.
- **Done when:** numbers match step 3.1 and update after a payment is added.

#### Step 3.3: Pending banner
- **Build:** "N payments need confirming" with Review. Singular and plural correct.
- **Done when:** appears only when something is pending.

#### Step 3.4: Quick actions
- **Build:** Scan QR, Pay to a friend, Pay, Add a payment already made.
- **Done when:** each opens the right flow.

#### Step 3.5: Recent payments
- **Build:** up to four newest payments as rows with name, amount, category, status label and date; See all opens History; empty state.
- **Done when:** tapping a row opens Edit.

#### Step 3.6: Top bar (functional)
- **Build:** app name, a bell showing the pending count (opens the pending page), a profile button (opens Settings profile). No sync indicator.
- **Done when:** the count matches the database and hides at zero.

---

## Phase 4-A: Payments (payment launcher model — SUPERSEDED)

> **Pivot note (2026-10-21).** Track Pay is repositioned from a payment launcher to a private, offline UPI tracker. GPay and PhonePe decline pre-filled `upi://pay` links from non-merchant apps — device-tested 2026-10-21 with personal (`@bank`) and merchant (`@okaxis`, `@ybl`) VPAs, both declined; consistent with Step 0.4's findings and `ARCHITECTURE.md` §13. Navi accepts. Steps 4.1–4.3 are complete and their code is retained but unreachable from Home after the pivot. Steps 4.4–4.9 are superseded by Phase 4-B — the pending-payment flows they assumed are no longer created from UI, and the Home pivot removes the entry points. See `Phase 4-B: OCR tracker model` for the active plan. Code files from the superseded steps (`scanner.tsx`, `ConfirmPaymentDialog.tsx`, `PayToFriendDialog.tsx`, exception dialogs) are retained with a header comment "Not reachable from UI post-pivot 2026-10-21. Retained for future re-enable."

Spec: `DESIGN.md` sections on dialogs, `COPY.md`, `EVALS.md` P1 to P12. Steps 4.1–4.3 complete; 4.4–4.9 superseded (see pivot note above).

#### Step 4.1: Pay to a friend
- **Build:** amount, to whom (empty saves as "Friend"), UPI app list; validation from `DESIGN.md` 13.5; a no-UPI-app state.
- **Done when:** P7 passes.

#### Step 4.2: QR scanner
- **Build:** camera view, torch, close, "Enter details instead"; camera permission explanation and camera-off message; invalid code message, keeps scanning.
- **Done when:** P10 passes; U1 to U9 pass in unit tests.

#### Step 4.3: Confirm payment and launch UPI
- **Build:** shop, UPI ID, editable amount, note; Make payment saves a pending payment and opens the chooser; a QR without an amount asks for one.
- **Done when:** P1 and P6 pass.

#### Step 4.4: Exception dialogs
- **Build:** "Couldn't open {app}" (Try again, Choose another app, Cancel) and "No UPI app found". Nothing is saved when the app does not open.
- **Done when:** P9 passes; no pending payment is left behind.

#### Step 4.5: Did it go through?
- **Build:** note field, category choice, Yes, No, Decide later, reminder note; the UPI hint box when a hint exists.
- **Done when:** P2, P3, P4 pass; a hint never changes the status by itself (S4).

#### Step 4.6: Payment failed and retry
- **Build:** "Payment failed" (Try again, Edit details, Keep as failed). Try again creates a **new** pending payment; QR reopens Confirm payment with the same details, friend reopens Pay to a friend with the same details. Same button in Edit payment when the status is Failed. Tests first.
- **Done when:** the old payment stays Failed and uncounted; repeated retries work; EVALS P12 passes.

#### Step 4.7: Needs confirming page
- **Build:** page with Back; tabs All and Unconfirmed; each pending row has Done, Failed, Edit and a name field. No collect requests, SMS detection or WhatsApp.
- **Done when:** actions update the list at once; empty state shown.

#### Step 4.8: Edit and delete
- **Build:** Edit (amount, to whom, what for, category, Done / Failed / Pending); Delete asks first and names the payment; undo message after delete.
- **Done when:** S3 and S5 pass.

#### Step 4.9: Add a payment already made
- **Build:** amount, name, category, date stepper (never past today), Done or Failed.
- **Done when:** the payment lands in the right month and totals follow the rules.

## Phase 4-B: OCR tracker model (active)

> **Pivot scope (2026-10-21).** Track Pay is a private, offline UPI tracker. The user pays in their UPI app (GPay / PhonePe / Paytm / Navi / any), then either (a) shares the success screenshot to Track Pay, which OCRs it on-device and pre-fills a receipt form, or (b) adds the payment manually. Track Pay logs, categorizes, and analyzes; it does not initiate payments. This replaces Phase 4-A's payment-launcher model, which was blocked by GPay/PhonePe pre-fill declines.

> **Guardrails decision (2026-10-22 — Path B chosen).** ML Kit's SDK sends diagnostic telemetry to Google (device model, per-install ID, timing, error metrics). Never image data, OCR text, payee names, amounts, or payment details. **Path B was chosen on 2026-10-22** (owner decision; recorded in `BUILD-TODO.md` Decisions + OQ 14): `GUARDRAILS.md` §2.2 ("no network use") stays literally true; a custom Expo config plugin strips `INTERNET` from the manifest after ML Kit is added; the bundled OCR model (`ocrUseBundled: true`) works on-device; telemetry fails silently. Path A (amend GUARDRAILS §2.2 + AI-RULES §10.4 with Settings → About disclosure) was rejected — the "no network" positioning is worth more than ~2h of saved engineering. **4-B.1 is no longer blocked** — proceed with Path B implementation. Re-verify notify-kit R6/R7/R10 after INTERNET is stripped (see `BUILD-TODO.md` OQ 12a).

#### Step 4-B.1: ML Kit share + OCR spike (throwaway)

- **Build:** A throwaway route `app/share-receipt.tsx` that receives a shared image via `useShareIntentContext` (from `expo-share-intent`), calls `MlkitOcr.recognizeText()` on the image URI, and displays the raw OCR text on screen. `app/+native-intent.ts` redirects share intents to `/share-receipt` (resolves the expo-router ↔ expo-share-intent linking conflict on Android). No parsing, no saving, no Home changes. Both files are throwaway — replaced by 4-B.5 if the spike succeeds, or deleted if it fails. Requires native rebuild.
> **State as of 2026-10-22:** neither `app/+native-intent.ts` nor `app/share-receipt.tsx` exists yet — both must be **created** in this step (`ls` returns "No such file or directory"). See `BUILD-TODO.md` 4-B.1 row and the 2026-10-22 Correction log entry.
- **Done when:** sharing a GPay success screenshot to Track Pay opens `/share-receipt` and the raw OCR text visibly contains the amount, payee, and UPI reference shown on the receipt. Same for PhonePe. Both device-tested. If raw text is missing, empty, or unrecognisable, the OCR stack is re-evaluated before 4-B.2. **Additionally for Path B:** after `npx expo prebuild --clean`, `grep -i INTERNET android/app/src/main/AndroidManifest.xml` returns nothing (INTERNET stripped); and in airplane mode, sharing a GPay screenshot still produces raw OCR text on screen (proves on-device OCR runs without network).

#### Step 4-B.2: Receipt parser (domain)

- **Build:** A pure `src/domain/receiptParse.ts` — `parseReceipt(ocrText: string, source: 'gpay' | 'phonepe' | 'paytm' | 'unknown'): ParsedReceipt | null`. `ParsedReceipt = { amountPaise: number; payeeName: string; date: Date; upiRef: string | null }`. Includes OCR-error corrections for the known failure modes documented in the WeSpend write-up and similar published findings (`O` → `0`, `₹` → `7` at start, space-after-decimal → `.`). Tests first with real captured samples for each app layout. No native imports, no logs of payee names or amounts (`GUARDRAILS.md` §1.4), no storage, no `Date.now()`.
- **Done when:** unit tests cover GPay, PhonePe, and Paytm receipt variants; correctly extract amount, payee, and date across common formats; gracefully return `null` for unparseable text (empty share, screenshot of unrelated screen, corrupted OCR).

#### Step 4-B.3: Add previous payment receipt form

- **Build:** `src/ui/AddReceiptForm.tsx` — the reusable form used by both manual entry (from Home) and OCR confirmation (from 4-B.5). Fields: amount (via `AmountField`, pre-filled if OCR provided a value), payee name (via `Field`, pre-filled if OCR provided a value), category (Chip row: Food / Shopping / Bills / Transport / Other), date (stepper, never future), status (Done / Failed). Adds a new `addReceiptPayment` function in `src/data/payments.tsx`: `source: 'receipt'`, `payeeVpa: string | null` (receipts may not expose VPA), persists via the existing AsyncStorage store. Renames the `addPaymentAlreadyMade` copy key to `addPreviousPaymentReceipt` with value `'Add previous payment receipt'`; adds `addPreviousPaymentReceiptSubtitle: 'For a payment you made in another UPI app'`. Testable in isolation via a `__DEV__` button in DevSection; Home integration is 4-B.4.
- **Done when:** manual entry saves a payment; the new payment appears in Recent Payments with `source: 'receipt'`; validation matches DESIGN.md §5 rules (amount > 0, ≤ 2 decimals, ≤ ₹99,99,999.99, payee ≤ 40 chars); device-tested in both themes; form works with pre-filled values (simulating what 4-B.5 will pass in).

#### Step 4-B.4: Home pivot cleanup

- **Build:** Restructure `app/(tabs)/index.tsx` for the tracker model. Element inventory after this step (top to bottom):
    1. **SpendCard** — kept. Reworked to read `spent` from `usePayments().payments.filter(p => p.status !== 'failed').reduce((s, p) => s + p.amountPaise, 0)` instead of the `__DEV__` preset. When `spent === 0`, empty state shows "Spend on {Month} / ₹0 / No payments yet". Limit stays `null` for now (7.3 wires it). Progress bar hidden when `limit === null` (existing SpendCard behaviour).
    2. **"Add previous payment receipt" button** — renamed from "Add a payment already made". Full-width, secondary variant. `onPress` opens `AddReceiptForm` via `useDialog().open({ title: copy.addPreviousPaymentReceipt, children: <AddReceiptForm onSave={handleSave} onCancel={close} /> })`. Save writes via `addReceiptPayment`, closes dialog, stays on Home (payment appears in Recent Payments below).
    3. **Recent Payments** — kept, simplified. Title "Recent Payments" + "See all → History" link. Up to **4** newest payments. Each row: avatar letter + payee/note + amount + date only — **no category, no status tag** (both live in History per Step 6.x). `PayRow` is called with `category={undefined}` and `status` hidden via a new `hideStatus?: boolean` prop (additive to `PayRow.tsx`). Empty state: `copy.noPayments` (existing key: "No payments yet. Scan a QR or add one.") — reword to "No payments yet. Add a previous payment to get started." via a new key `noPaymentsTrackerModel`, keep the old one for potential History reuse.
    4. **DevSection** — kept, dev-only, unchanged (spent/limit presets remain for testing SpendCard; pending count presets remain for TopBar bell testing; theme buttons + dialog trigger unchanged).
    **Removed entirely from Home's JSX:**
    - Pay button (was disabled, no purpose)
    - Quick actions row (Scan QR tile, Pay to a friend tile)
    - Pending banner (no pending state from Home in the tracker model; pendingCount still feeds the TopBar bell via `usePendingCount()` — the number now derives from real payments: `usePayments().payments.filter(p => p.status === 'pending').length` in 4-B.5's follow-up; for 4-B.4 the dev-preset `pendingCount` remains for TopBar testing)
    **Also in this step:** add the header comment `"Not reachable from UI post-pivot 2026-10-21. Retained for future re-enable."` to `app/scanner.tsx`, `src/ui/PayToFriendDialog.tsx`, `src/ui/ConfirmPaymentDialog.tsx`. Do **not** delete the files.
- **Done when:** Home shows exactly SpendCard + Add previous payment receipt button + Recent Payments (simplified) + DevSection; tapping Add opens `AddReceiptForm` via the dialog, saving a payment appears in Recent Payments immediately; SpendCard shows the sum of Done + Pending payments from the store (verified by saving a test payment); device-tested on both themes; no visual regressions to TopBar / TabBar / safe area / scrolling; `scanner.tsx`, `PayToFriendDialog.tsx`, `ConfirmPaymentDialog.tsx` still compile (unused but present); all existing tests still pass; no new tests required for the removal-only changes.

#### Step 4-B.5: Share receipt OCR route (headline)

- **Build:** Replaces the throwaway `app/share-receipt.tsx` from 4-B.1 with the real implementation — receives a shared image via `useShareIntentContext`, runs `MlkitOcr.recognizeText()`, calls `parseReceipt()`, opens `AddReceiptForm` (4-B.3) pre-filled with the parsed amount/payee/date/upiRef. User reviews and edits, taps Save, `addReceiptPayment` writes to AsyncStorage, route closes back to Home (or `router.replace('/')`). `app/+native-intent.ts` unchanged. No new dependency (ML Kit was installed in 4-B.1). The `__DEV__` injector pattern from 4.2 continues here for testing without a real receipt: a dev button "Paste OCR text" on the share-receipt screen lets you simulate what OCR would return. Guardrails decision (Path A vs B) is enforced: if Path B, no network traffic observed; if Path A, Settings → About shows the ML Kit disclosure paragraph. Also wire the real pending count: change `usePendingCount()` consumers (TopBar bell) to derive from `usePayments().payments.filter(p => p.status === 'pending').length` — this closes the deferred "count matches the database" gap from 3.6 and 4.3.
- **Done when:** sharing a GPay success screenshot → Add form pre-fills amount/payee/date → user confirms → payment appears in Recent Payments with source `'receipt'`. Same for PhonePe. Both device-tested. If Path B: `adb logcat` shows no network calls during OCR. If Path A: Settings → About shows ML Kit disclosure. TopBar bell shows the count of pending payments from the store (verified by saving a payment with status Pending). New EVALS cases **D10, D11** (text for §12 approval in this step's orientation):
    - D10: "Share a GPay success screen to Track Pay → Add previous payment receipt form opens pre-filled with amount, payee, and date"
    - D11: "Same for PhonePe; share sheet offers Track Pay for image mimeType; tapping it opens the form rather than the app home screen"

#### Step 4-B.6: Edit and delete

- **Build:** (unchanged from old 4.8) Edit (amount, to whom, what for, category, Done / Failed / Pending); Delete asks first and names the payment; undo message after delete. Works on any payment regardless of source (`'friend'`, `'qr'`, `'receipt'`). Reachable from Recent Payments row tap on Home and History row tap.
- **Done when:** S3 and S5 pass.

---

## Phase 5: Analytics (plain)

#### Step 5.1: Analytics maths (domain)
- **Build:** same-day comparison with last month, cumulative spend per day, straight-line ceiling, category totals, weekday totals, top five payees, no-spend days. Tests first.
- **Done when:** tests cover month boundaries, 28 to 31 day months, an empty month, ties, and failed payments excluded.

#### Step 5.2: Pace summary
- **Build:** daily average, projected finish ("estimate"), headroom, versus last month (percent and amount, up or down word).
- **Done when:** the example gives ₹330 a day, ₹10,230, ₹4,770.

#### Step 5.3: Unconfirmed box
- **Build:** pending total and count, failed count, link to the pending page.
- **Done when:** counts match the database.

#### Step 5.4: Spending trajectory (plain chart)
- **Build:** a simple line of cumulative spend against a straight ceiling line, today marker, a text summary for screen readers.
- **Done when:** correct on day 1, mid month, last day and over the limit.

#### Step 5.5: Categories and weekdays
- **Build:** category rows (name, bar, amount) and seven weekday bars.
- **Done when:** totals equal the monthly total; empty states handled.

#### Step 5.6: Top five payees
- **Build:** ranked list with total and count.
- **Done when:** ties and long names handled.

#### Step 5.7: Monthly trend and calendar
- **Build:** six-month bars with a limit line and a month calendar with most and least spent days.
- **Done when:** EVALS A1 to A9 pass.

#### Step 5.8: Calendar upgrades (optional, ask first)
- **Build:** tap a day to see its payments, today marker, pending dot, month arrows, summary line.

---

## Phase 6: History

#### Step 6.1: Monthly groups
- **Build:** expandable month groups with the month's spend; rows as on Home.
- **Done when:** the current month starts open.

#### Step 6.2: Search
- **Build:** text search over payee, note and category. No voice input.
- **Done when:** results update as you type; an empty result shows a message (EVALS H1, H2).

#### Step 6.3: Filters
- **Build:** status filter and date-range filter.
- **Done when:** filters combine with search; month totals still include every Done and Pending payment (EVALS H3, H4).

#### Step 6.4: Export trigger
- **Build:** "Export data" opens the PDF statement dialog.
- **Done when:** EVALS D5 passes.

---

## Phase 7: Settings

#### Step 7.1: Profile
- **Build:** name display, edit profile.
- **Done when:** edits save and show in the top bar and greeting.

#### Step 7.2: Theme control
- **Build:** Dark, Light, Auto control using step 1.5.
- **Done when:** applies at once and persists (EVALS T1 to T3).

#### Step 7.3: Monthly limit
- **Build:** switch, amount field, quick-step buttons (+₹2,000, +₹5,000, −₹1,000). Off hides every limit element everywhere (EVALS A7). A slider is optional later (design plan, ask first).
- **Done when:** values clamp above zero and to at most ₹99,99,999; Home and Analytics update at once.

#### Step 7.4: UPI apps
- **Build:** list of installed apps from the native module, refresh. Optional "preferred app" (ask first).
- **Done when:** no apps and many apps both handled.

#### Step 7.5: Reminders settings
- **Build:** quiet hours (two steppers), lock-screen details switch (default off), battery settings shortcut.
- **Done when:** R3 and R4 pass.

#### Step 7.6: Quick-add switch
- **Build:** posts or removes the ongoing notification; asks permission with the explanation dialog.
- **Done when:** works with notifications denied (message, app still works; EVALS P11).

#### Step 7.7: Data
- **Build:** Export (warning first), Import (merge or replace with counts; invalid-file message), PDF statement (month, include failed), 30-day backup nudge.
- **Done when:** D1 to D6 pass.

---

## Phase 8: Notifications

Library chosen in Step 0.3. Spec: `DESIGN.md` notifications, `COPY.md`, `EVALS.md` R1 to R11.

#### Step 8.1: Reminder planner (domain)
- **Build:** pure planner with quiet hours across midnight. Tests first (R1 to R5).

#### Step 8.2: Hourly grouped reminder
- **Build:** one notification with the count, Done, Failed and Open actions, and a reply box to name it.
- **Done when:** R2, R6, R7, R8, R9, R10 pass on a real phone.

#### Step 8.3: Friend payment notification
- **Build:** posted right after choosing a UPI app, with Done, Failed, Edit and a name box.
- **Done when:** P7 and P8 pass.

#### Step 8.4: Failed notification with Try again
- **Build:** marking Failed from a notification updates it to "Payment failed" with Try again and Edit.
- **Done when:** Try again opens the retry flow (EVALS R11).

#### Step 8.5: Quick add and lock-screen privacy
- **Build:** ongoing quick-add notification (re-posted when the app opens); lock-screen text hides details unless the switch is on.
- **Done when:** GUARDRAILS 2.5 and 4 hold.

---

## Phase 9: Quality (functional)

#### Step 9.1: Maths consistency
- **Check:** the same month gives the same numbers on Home, Analytics, History, the statement and notifications. The example reconciles: ₹330 a day x 31 days = ₹10,230, headroom ₹4,770.

#### Step 9.2: Basic accessibility
- **Check:** every control has a label and a 44 px target; status is never colour only; 130% font scale does not break any screen; reduce motion respected. Visual contrast tuning belongs to the design plan (D7.2).

#### Step 9.3: Full functional EVALS pass
- **Check:** every unit case and every P, R, D, A, H, T, O case in `EVALS.md` on at least two phones.

#### Step 9.4: Guardrail audit
- **Check:** `npm run lint:guardrails`; no network calls; no SMS or notification reading; no silent status change; logs free of payment data.

---

## Phase 10: Milestone M1

#### Step 10.1: Workable build
- **Build:** `eas build -p android --profile preview`; install over any older build.
- **Done when:** data survives the update; permission prompts are correct; first run and relaunch work; the person confirms it is usable.

#### Step 10.2: Handover to the design plan
- **Build:** update `README.md` and `ARCHITECTURE.md` to match; list in `BUILD-TODO.md` anything visual that was left plain.
- **Done when:** the person approves M1. **The design plan (Part B of `DESIGN-BUILD-PLAN.md`) can now start.**
