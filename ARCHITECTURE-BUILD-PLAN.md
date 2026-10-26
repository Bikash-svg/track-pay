# Architecture Build Plan (project plan: a working app)

This plan builds a **working version of the app with a plain look**. Every feature works, is tested and is accessible, but nothing is styled beyond what is needed to use it. The finished look is a separate plan: Part B of `DESIGN-BUILD-PLAN.md`. Do not do design work here.

**Milestone M1** is the end of this plan: a plain build that can be installed and used. After M1 is approved, the design plan starts.

> **Scope lock (2026-10-25).** The AI does only the current step in `BUILD-TODO.md` and edits no `.md` file except `BUILD-TODO.md` (`AI-RULES.md` §0). Track Pay records payments the user shares as screenshots, picks from the gallery or types; it never starts a payment. Steps marked RETIRED or SUPERSEDED below are not built. Phase 0 steps 0.2 and 0.4 are history: the `modules/upi-launcher` path in 0.2 is deleted in 4-B.0, and 0.4 only records why the pay flow was dropped.

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

#### Step 3.3: Pending banner (SUPERSEDED 2026-10-25: removed in 4-B.0, nothing is pending)
- **Build:** "N payments need confirming" with Review. Singular and plural correct.
- **Done when:** appears only when something is pending.

#### Step 3.4: Quick actions (SUPERSEDED 2026-10-25: rebuilt in 4-B.4 as Add from screenshot and Add manually)
- **Build:** Scan QR, Pay to a friend, Pay, Add a payment already made.
- **Done when:** each opens the right flow.

#### Step 3.5: Recent payments (updated in 4-B.4: up to 5 rows, Not verified marker)
- **Build:** up to four newest payments as rows with name, amount, category, status label and date; See all opens History; empty state.
- **Done when:** tapping a row opens Edit.

#### Step 3.6: Top bar (bell removed in 4-B.0)
- **Build:** app name, a bell showing the pending count (opens the pending page), a profile button (opens Settings profile). No sync indicator.
- **Done when:** the count matches the database and hides at zero.

---

## Phase 4-A: Payment launcher (RETIRED 2026-10-25)

> **Retired.** Track Pay no longer starts, launches or scans for a payment (`GUARDRAILS.md` §1.4 and §11, `AI-RULES.md` D13). Steps 4.1 to 4.9 are not built and their specs are removed. Steps 4.1 to 4.3 were built before the pivot; their code is deleted by Step 4-B.0 below. Their history stays in `BUILD-TODO.md`. The GPay and PhonePe decline of pre-filled `upi://pay` links (device-tested 2026-10-21) is the reason.

## Phase 4-B: Screenshot tracker (active)

> **Model (2026-10-25).** The user pays in any UPI app, then shares the success screenshot to Track Pay, picks screenshots from the gallery, or adds the payment by hand. Google ML Kit reads the screenshot on the phone. Track Pay saves the payment as "Not verified", shows it with Looks right, Edit and Undo, and sends a receipt notification. Nothing is started, launched or scanned for in the background.
>
> **Path B (2026-10-22).** ML Kit runs with the bundled model. A small Expo config plugin strips `INTERNET`. Re-verify notify-kit R6, R7 and R10 once it is stripped (`BUILD-TODO.md` OQ 12a).

#### Step 4-B.0: Retire the pay flow (cleanup)

Runs first. Deletes the old payment-launcher code and nothing else.

- **Before deleting, list.** Run `git ls-files` and `grep -rIl` for the names below. Put the list of files you will delete in the report and in `BUILD-TODO.md`. Delete only files that match this list. If a file might belong but is not clearly named here, do not delete it; list it under "Found but not touched" and ask.
- **Delete list (exact):**
    1. The QR scanner route (`app/scanner.tsx`).
    2. Pay to a friend: the route (`app/pay-to-friend.tsx`) and `src/ui/PayToFriendDialog.tsx`.
    3. Confirm payment: `src/ui/ConfirmPaymentDialog.tsx`.
    4. The placeholder route `app/add-payment.tsx` (replaced by the payment form in 4-B.3).
    5. The Android module `modules/upi-launcher` and its JavaScript wrapper, and every import of it.
    6. The UPI link parser (QR text to payment details) and its tests (EVALS U1 to U9 are retired, see `EVALS.md`).
    7. The pending page (route and screen) and the `Needs confirming` copy keys it used.
    8. The `expo-camera` dependency and its plugin entry in `app.json`, with the camera permission. Use `npx expo install --check` and `npm ci --dry-run --include=dev` after.
    9. In `app/(tabs)/index.tsx`: the Scan QR tile, the Pay to a friend tile, the Pay button, the Add a payment already made button, and the Pending banner. Leave the SpendCard, Recent payments and the dev section as they are. Home is rebuilt in 4-B.4.
    10. In the top bar: the bell. Keep the profile button and the app name.
- **Keep list:** see the Keep list in `BUILD-TODO.md` ("Cleanup comes first"). Do not touch it.
- **Also:** where a deleted file leaves an unused export, delete that export only if it was used by the deleted code alone. No renames, no refactors.
- **Done when:** `npx tsc --noEmit`, `npm run lint:guardrails` and `npm test` pass; `grep -rIniE "upi://|expo-camera|upi-launcher|PayToFriend|ConfirmPayment|scanner" app src modules package.json app.json` finds nothing except comments in `BUILD-TODO.md`; the app starts and Home, Analytics, History and Settings open; the deleted-file list is in the report. Device check: the app opens on a phone with no crash.

#### Step 4-B.1: ML Kit share and OCR spike (throwaway)

- **Build:** A throwaway route `app/share-receipt.tsx` that receives a shared image through `useShareIntentContext` (from `expo-share-intent`), calls `MlkitOcr.recognizeText()` on the image, and shows the raw text on screen. `app/+native-intent.ts` redirects share intents to `/share-receipt` (resolves the Expo Router and expo-share-intent linking conflict on Android). No parsing, no saving, no Home changes. Both files are replaced in 4-B.5 or deleted if the spike fails. Needs a native rebuild.
- **Done when:** sharing a GPay success screenshot to Track Pay opens `/share-receipt` and the raw text contains the amount, payee and UPI reference shown on the receipt; the same for PhonePe, Paytm and Navi. After `npx expo prebuild --clean`, `grep -i INTERNET android/app/src/main/AndroidManifest.xml` finds nothing; in airplane mode sharing still gives text. If the text is missing or unreadable, stop and re-evaluate the OCR stack before 4-B.2.
- **Status:** in progress; evidence is in `BUILD-TODO.md`. Resumes right after 4-B.0.

#### Step 4-B.2: Receipt parser (domain)

- **Build:** a pure `src/domain/receipt/parseReceipt.ts`: `parseReceipt(ocrText: string): ParsedReceipt | ReceiptRefusal`.
    - `ParsedReceipt = { amountPaise: number; payeeName: string; paidAt: Date | null; upiRef: string | null; app: 'gpay' | 'phonepe' | 'paytm' | 'navi' | 'unknown' }`.
    - `ReceiptRefusal = { reason: 'failed' | 'pending' | 'no_amount' | 'unreadable' }`.
    - Detects the app from the text. Fixes the known OCR slips (letter O for zero, the rupee sign read as 7 or ₹ glued to the number, a space after the decimal point). Never guesses: more than one possible amount, or none, refuses with `no_amount`. A receipt saying Failed, Declined, Pending or Processing refuses with the matching reason.
    - No native imports, no logging, no storage, no `Date.now()`; the reference date is a parameter.
- **Tests first,** with synthetic samples for GPay, PhonePe, Paytm and Navi that copy a layout, never a real payment (`GUARDRAILS.md` §13.8). Include: noisy text, empty text, an unrelated screenshot, a failed receipt, a pending receipt, two amounts on one screen.
- **Done when:** every sample parses to the expected fields or the expected refusal; no test uses real data.

#### Step 4-B.3: Payment form (manual add and edit fields)

- **Build:** one reusable form in `src/ui` used for Add manually and Edit. Fields: amount (`AmountField`), to whom (`Field`; empty saves as "Unknown"), what for (optional note), category (Food, Shopping, Bills, Transport, Other), date and time (never in the future). **No status field:** every new payment is Done. Adds `addPayment` and `updatePayment` to the payments store with `source: 'manual'` or `'receipt'` and `reviewed`. Validation: amount above zero, at most 2 decimals, at most ₹99,99,999.99, name at most 40 characters. Text from `COPY.md`.
- **Done when:** a manual payment saves with `reviewed = true` and shows in Recent payments; edit changes it; validation messages match `COPY.md`; unit tests for the store functions pass.

#### Step 4-B.4: Home restructure (locked structure, plain look)

- **Build:** Home in this order, using tokens only:
    1. Greeting header with the month pill.
    2. Month card: spent, limit, Left, Allowance a day, and the footnote "Based on payments recorded in Track Pay". Limit parts hidden when no limit is set.
    3. Quick access: **Add from screenshot** (primary) and **Add manually**, with the hint "Pay in any UPI app, then share the success screenshot here." Add from screenshot opens the gallery picker in 4-B.7; until then it shows "Coming soon" text only if the step is run before 4-B.7 (a plain disabled button).
    4. "This month at a glance" slot (daily pace, month-end estimate, versus last month, Analytics link): left out until Step 5.9.
    5. Recent payments: up to 5 newest, with payee, amount, category, time and a "Not verified" marker where `reviewed` is false; "History" link; empty state.
    6. Tab bar: Home, Analytics, History, Settings.
    The top bar has no bell. No pending banner. Keep the dev section.
- **Done when:** Home matches the locked structure in `DESIGN.md` §1; numbers match Step 3.1; saving a payment updates Home at once; checked on a phone in both themes at 130% font scale.

#### Step 4-B.5: Share-receipt pipeline

- **Build:** replaces the throwaway route. Share image, read with ML Kit, `parseReceipt`, then:
    - success: save a payment (`source: 'receipt'`, `reviewed: false`), delete the image copy, show the result page with amount, payee, date and category, and Looks right, Edit and Undo;
    - duplicate (same `upiRef`, or same amount, payee and time): save nothing, show "Already added" with the existing payment;
    - refusal (failed, pending, no amount, unreadable): save nothing, show the message with Enter manually.
  The route never stores the image and never logs the text or the fields. Posting the receipt notification is Step 8.2; this step shows the result page only. A dev button "Paste OCR text" may stay behind `__DEV__`.
- **Done when:** EVALS D10 and D11 pass for GPay, PhonePe, Paytm and Navi on a real phone; a failed screenshot saves nothing; a duplicate saves nothing; airplane mode works; `adb logcat` shows no payment data.

#### Step 4-B.6: Edit, delete, verify, undo

- **Build:** Looks right sets `reviewed = true`. Edit opens the form (4-B.3) and saves with `reviewed = true`. Undo removes a payment saved in the last session of the result page. Delete asks first, names the payment, and offers an undo message. Reachable from Recent payments and History rows.
- **Done when:** EVALS S3 and S5 pass; the "Not verified" marker disappears after Looks right or Edit.

#### Step 4-B.7: Gallery picker and batch import

- **Build:** Add from screenshot opens `expo-document-picker` (images, multiple selection; already approved, no permission). Each image goes through the 4-B.5 pipeline. One summary page lists saved, already added and could-not-read counts, with Review for the saved ones. No scanning of the gallery in the background.
- **Done when:** picking five mixed images (three good, one duplicate, one failed) saves three and reports the rest; EVALS D12 passes.

## Phase 4-C: Storage

#### Step 4-C.1: SQLite payments store and migration

- **Build:** install `expo-sqlite` with `npx expo install expo-sqlite`. Add `src/data/db.ts` and a repository for payments with the fields in `ARCHITECTURE.md` §5. Numbered migration 1 moves `trackpay:payments` from AsyncStorage into SQLite inside one transaction, then marks it moved; it never deletes the old key until the new rows are counted equal. Existing test rows with status Failed or Pending stay and are excluded from totals (open question 22). The store API used by screens does not change. Tests first, including an interrupted migration.
- **Done when:** the number of payments before and after is equal; totals are equal; the app restarts with the data intact; backup prompt text is shown if anything could be lost (`GUARDRAILS.md` §5.5).

---

## Phase 5: Analytics (plain)

Totals count every payment. Each screen says "Based on payments recorded in Track Pay".

#### Step 5.1: Analytics maths (domain)
- **Build:** same-day comparison with last month, cumulative spend per day, straight-line ceiling, category totals, weekday totals, top five payees, days without a payment (shown as plain information only, open question 17). Tests first.
- **Done when:** tests cover month boundaries, 28 to 31 day months, an empty month, ties and old failed rows excluded.

#### Step 5.2: Pace summary
- **Build:** daily average, projected finish ("estimate"), headroom, versus last month (percent and amount, up or down word).
- **Done when:** the example gives ₹330 a day, ₹10,230, ₹4,770.

#### Step 5.3: Unconfirmed box (RETIRED 2026-10-25)
- Nothing is pending or unconfirmed any more. Do not build.

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
- **Build:** tap a day to see its payments, today marker, month arrows, summary line.

#### Step 5.9: Home analytics glance
- **Build:** the "This month at a glance" block on Home: daily pace, month-end estimate (labelled estimate), versus last month, and an Analytics link. Uses 5.1 and 5.2 only; no new maths.
- **Done when:** the three numbers equal the Analytics screen for the same month.

---

## Phase 6: History

#### Step 6.1: Monthly groups
- **Build:** expandable month groups with the month's spend; rows as on Home, including the "Not verified" marker.
- **Done when:** the current month starts open.

#### Step 6.2: Search
- **Build:** text search over payee, note and category. No voice input.
- **Done when:** results update as you type; an empty result shows a message (EVALS H1, H2).

#### Step 6.3: Filters
- **Build:** filter All or Not verified, and a date range. No Done, Failed or Pending filter.
- **Done when:** filters combine with search; month totals still include every payment (EVALS H3, H4).

#### Step 6.4: Export trigger
- **Build:** "Export data" opens the export choices (backup file or monthly PDF statement).
- **Done when:** EVALS D5 passes.

---

## Phase 7: Settings

#### Step 7.1: Profile
- **Build:** name display, edit profile.
- **Done when:** edits save and show in the greeting and the profile button.

#### Step 7.2: Theme control
- **Build:** Dark, Light, Auto control using step 1.5.
- **Done when:** applies at once and persists (EVALS T1 to T3).

#### Step 7.3: Monthly limit
- **Build:** switch, amount field, quick-step buttons (+₹2,000, +₹5,000, −₹1,000). Off hides every limit element everywhere (EVALS A7).
- **Done when:** values clamp above zero and to at most ₹99,99,999; Home and Analytics update at once.

#### Step 7.4: UPI apps (RETIRED 2026-10-25)
- The app no longer lists or opens UPI apps. Do not build.

#### Step 7.5: Reminders settings
- **Build:** daily log reminders switch and 1 to 6 times (default 10:00, 14:00, 18:00, 21:00), quiet hours (default 23:00 to 07:00), lock-screen details switch (default off), backup reminder switch, a row showing that limit alerts are always on, and a battery settings shortcut. Writes settings only; scheduling is Phase 8.
- **Done when:** R3 and R4 pass; changes persist.

#### Step 7.6: Quick-add switch (RETIRED by default)
- Do not build (open question 18).

#### Step 7.7: Data
- **Build:** Export (warning first), Import (merge or replace with counts; invalid-file message), PDF statement (month). Records the time of the last export. The 30-day backup nudge is replaced by Step 8.5.
- **Done when:** D1 to D6 pass.

---

## Phase 8: Notifications

Library chosen in Step 0.3 (`react-native-notify-kit`). All code lives in `src/notifications`. Spec: `ARCHITECTURE.md` §8 and §9, `COPY.md`, `EVALS.md` R1 to R14. Four channels: Receipt confirmations, Daily log reminders, Limit alerts, Backup reminders.

#### Step 8.1: Notification planner (domain)
- **Build:** pure planner in `src/domain`: next daily reminder times with quiet hours across midnight and the skip rules (a payment logged or No payments tapped since the previous reminder), limit thresholds (80 and 100, once per month each, only when a limit is set), backup due on the 1st at 10:00 unless exported that month. Tests first (R1 to R5, R12 to R14).

#### Step 8.2: Receipt received notification
- **Build:** posted by the 4-B.5 and 4-B.7 pipelines right after a payment is saved. Buttons Looks right, Edit, Undo. Variants: could not read (Enter manually), already added, batch (one grouped notification, Review). Generic lock-screen text unless details are on. Re-verify R6, R7 and R10 with INTERNET stripped, with the app swiped away.
- **Done when:** R6, R7, R10 pass on a real phone; Undo removes exactly the payment shown.

#### Step 8.3: Daily log reminders
- **Build:** schedules the planner's times (inexact, no `SCHEDULE_EXACT_ALARM`). Buttons Add screenshots (opens the picker), No payments (dismisses and cancels the rest of that day), Snooze 1 hour. Rescheduled when the app opens and when settings or payments change.
- **Done when:** R2, R8, R9 pass on a real phone; reminders skip as specified.

#### Step 8.4: Limit alerts
- **Build:** after each saved payment, post the 80% or 100% alert once per month. Tap opens Analytics. Always on inside the app.
- **Done when:** R13 passes; editing or deleting never re-fires or un-fires a threshold.

#### Step 8.5: Backup reminder
- **Build:** 1st of each month, 10:00. Buttons Export now (opens the export choices) and Remind me tomorrow. Skipped if an export already happened that month or the switch is off.
- **Done when:** R14 passes.

#### Step 8.6: Channels and lock-screen privacy
- **Build:** create the four channels; lock-screen text hides details unless the switch is on; Settings says that Android lets the user block a channel.
- **Done when:** `GUARDRAILS.md` §2.5 and §4 hold.

---

## Phase 9: Quality (functional)

#### Step 9.1: Maths consistency
- **Check:** the same month gives the same numbers on Home, Analytics, History, the statement and notifications. The example reconciles: ₹330 a day x 31 days = ₹10,230, headroom ₹4,770.

#### Step 9.2: Basic accessibility
- **Check:** every control has a label and a 44 px target; status is never colour only; 130% font scale does not break any screen; reduce motion respected. Visual contrast tuning belongs to the design plan (D7.2).

#### Step 9.3: Full functional EVALS pass
- **Check:** every unit case and every R, D, A, H, T, O, S case in `EVALS.md` on at least two phones.

#### Step 9.4: Guardrail audit
- **Check:** `npm run lint:guardrails`; no network calls and no INTERNET permission; no SMS or notification reading; no payment initiation code; no stored screenshots; no payment saved except from a user's share, pick or typing; logs free of payment data and OCR text.

---

## Phase 10: Milestone M1

#### Step 10.1: Workable build
- **Build:** `eas build -p android --profile preview`; install over any older build.
- **Done when:** data survives the update; permission prompts are correct; first run and relaunch work; the person confirms it is usable.

#### Step 10.2: Handover to the design plan
- **Build:** update `README.md` and `ARCHITECTURE.md` to match; list in `BUILD-TODO.md` anything visual that was left plain.
- **Done when:** the person approves M1. **The design plan (Part B of `DESIGN-BUILD-PLAN.md`) can now start.**# Architecture Build Plan (project plan: a working app)

This plan builds a **working version of the app with a plain look**. Every feature works, is tested and is accessible, but nothing is styled beyond what is needed to use it. The finished look is a separate plan: Part B of `DESIGN-BUILD-PLAN.md`. Do not do design work here.

**Milestone M1** is the end of this plan: a plain build that can be installed and used. After M1 is approved, the design plan starts.

> **Scope lock (2026-10-25).** The AI does only the current step in `BUILD-TODO.md` and edits no `.md` file except `BUILD-TODO.md` (`AI-RULES.md` §0). Track Pay records payments the user shares as screenshots, picks from the gallery or types; it never starts a payment. Steps marked RETIRED or SUPERSEDED below are not built. Phase 0 steps 0.2 and 0.4 are history: the `modules/upi-launcher` path in 0.2 is deleted in 4-B.0, and 0.4 only records why the pay flow was dropped.

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

#### Step 3.3: Pending banner (SUPERSEDED 2026-10-25: removed in 4-B.0, nothing is pending)
- **Build:** "N payments need confirming" with Review. Singular and plural correct.
- **Done when:** appears only when something is pending.

#### Step 3.4: Quick actions (SUPERSEDED 2026-10-25: rebuilt in 4-B.4 as Add from screenshot and Add manually)
- **Build:** Scan QR, Pay to a friend, Pay, Add a payment already made.
- **Done when:** each opens the right flow.

#### Step 3.5: Recent payments (updated in 4-B.4: up to 5 rows, Not verified marker)
- **Build:** up to four newest payments as rows with name, amount, category, status label and date; See all opens History; empty state.
- **Done when:** tapping a row opens Edit.

#### Step 3.6: Top bar (bell removed in 4-B.0)
- **Build:** app name, a bell showing the pending count (opens the pending page), a profile button (opens Settings profile). No sync indicator.
- **Done when:** the count matches the database and hides at zero.

---

## Phase 4-A: Payment launcher (RETIRED 2026-10-25)

> **Retired.** Track Pay no longer starts, launches or scans for a payment (`GUARDRAILS.md` §1.4 and §11, `AI-RULES.md` D13). Steps 4.1 to 4.9 are not built and their specs are removed. Steps 4.1 to 4.3 were built before the pivot; their code is deleted by Step 4-B.0 below. Their history stays in `BUILD-TODO.md`. The GPay and PhonePe decline of pre-filled `upi://pay` links (device-tested 2026-10-21) is the reason.

## Phase 4-B: Screenshot tracker (active)

> **Model (2026-10-25).** The user pays in any UPI app, then shares the success screenshot to Track Pay, picks screenshots from the gallery, or adds the payment by hand. Google ML Kit reads the screenshot on the phone. Track Pay saves the payment as "Not verified", shows it with Looks right, Edit and Undo, and sends a receipt notification. Nothing is started, launched or scanned for in the background.
>
> **Path B (2026-10-22).** ML Kit runs with the bundled model. A small Expo config plugin strips `INTERNET`. Re-verify notify-kit R6, R7 and R10 once it is stripped (`BUILD-TODO.md` OQ 12a).

#### Step 4-B.0: Retire the pay flow (cleanup)

Runs first. Deletes the old payment-launcher code and nothing else.

- **Before deleting, list.** Run `git ls-files` and `grep -rIl` for the names below. Put the list of files you will delete in the report and in `BUILD-TODO.md`. Delete only files that match this list. If a file might belong but is not clearly named here, do not delete it; list it under "Found but not touched" and ask.
- **Delete list (exact):**
    1. The QR scanner route (`app/scanner.tsx`).
    2. Pay to a friend: the route (`app/pay-to-friend.tsx`) and `src/ui/PayToFriendDialog.tsx`.
    3. Confirm payment: `src/ui/ConfirmPaymentDialog.tsx`.
    4. The placeholder route `app/add-payment.tsx` (replaced by the payment form in 4-B.3).
    5. The Android module `modules/upi-launcher` and its JavaScript wrapper, and every import of it.
    6. The UPI link parser (QR text to payment details) and its tests (EVALS U1 to U9 are retired, see `EVALS.md`).
    7. The pending page (route and screen) and the `Needs confirming` copy keys it used.
    8. The `expo-camera` dependency and its plugin entry in `app.json`, with the camera permission. Use `npx expo install --check` and `npm ci --dry-run --include=dev` after.
    9. In `app/(tabs)/index.tsx`: the Scan QR tile, the Pay to a friend tile, the Pay button, the Add a payment already made button, and the Pending banner. Leave the SpendCard, Recent payments and the dev section as they are. Home is rebuilt in 4-B.4.
    10. In the top bar: the bell. Keep the profile button and the app name.
- **Keep list:** see the Keep list in `BUILD-TODO.md` ("Cleanup comes first"). Do not touch it.
- **Also:** where a deleted file leaves an unused export, delete that export only if it was used by the deleted code alone. No renames, no refactors.
- **Done when:** `npx tsc --noEmit`, `npm run lint:guardrails` and `npm test` pass; `grep -rIniE "upi://|expo-camera|upi-launcher|PayToFriend|ConfirmPayment|scanner" app src modules package.json app.json` finds nothing except comments in `BUILD-TODO.md`; the app starts and Home, Analytics, History and Settings open; the deleted-file list is in the report. Device check: the app opens on a phone with no crash.

#### Step 4-B.1: ML Kit share and OCR spike (throwaway)

- **Build:** A throwaway route `app/share-receipt.tsx` that receives a shared image through `useShareIntentContext` (from `expo-share-intent`), calls `MlkitOcr.recognizeText()` on the image, and shows the raw text on screen. `app/+native-intent.ts` redirects share intents to `/share-receipt` (resolves the Expo Router and expo-share-intent linking conflict on Android). No parsing, no saving, no Home changes. Both files are replaced in 4-B.5 or deleted if the spike fails. Needs a native rebuild.
- **Done when:** sharing a GPay success screenshot to Track Pay opens `/share-receipt` and the raw text contains the amount, payee and UPI reference shown on the receipt; the same for PhonePe, Paytm and Navi. After `npx expo prebuild --clean`, `grep -i INTERNET android/app/src/main/AndroidManifest.xml` finds nothing; in airplane mode sharing still gives text. If the text is missing or unreadable, stop and re-evaluate the OCR stack before 4-B.2.
- **Status:** in progress; evidence is in `BUILD-TODO.md`. Resumes right after 4-B.0.

#### Step 4-B.2: Receipt parser (domain)

- **Build:** a pure `src/domain/receipt/parseReceipt.ts`: `parseReceipt(ocrText: string): ParsedReceipt | ReceiptRefusal`.
    - `ParsedReceipt = { amountPaise: number; payeeName: string; paidAt: Date | null; upiRef: string | null; app: 'gpay' | 'phonepe' | 'paytm' | 'navi' | 'unknown' }`.
    - `ReceiptRefusal = { reason: 'failed' | 'pending' | 'no_amount' | 'unreadable' }`.
    - Detects the app from the text. Fixes the known OCR slips (letter O for zero, the rupee sign read as 7 or ₹ glued to the number, a space after the decimal point). Never guesses: more than one possible amount, or none, refuses with `no_amount`. A receipt saying Failed, Declined, Pending or Processing refuses with the matching reason.
    - No native imports, no logging, no storage, no `Date.now()`; the reference date is a parameter.
- **Tests first,** with synthetic samples for GPay, PhonePe, Paytm and Navi that copy a layout, never a real payment (`GUARDRAILS.md` §13.8). Include: noisy text, empty text, an unrelated screenshot, a failed receipt, a pending receipt, two amounts on one screen.
- **Done when:** every sample parses to the expected fields or the expected refusal; no test uses real data.

#### Step 4-B.3: Payment form (manual add and edit fields)

- **Build:** one reusable form in `src/ui` used for Add manually and Edit. Fields: amount (`AmountField`), to whom (`Field`; empty saves as "Unknown"), what for (optional note), category (Food, Shopping, Bills, Transport, Other), date and time (never in the future). **No status field:** every new payment is Done. Adds `addPayment` and `updatePayment` to the payments store with `source: 'manual'` or `'receipt'` and `reviewed`. Validation: amount above zero, at most 2 decimals, at most ₹99,99,999.99, name at most 40 characters. Text from `COPY.md`.
- **Done when:** a manual payment saves with `reviewed = true` and shows in Recent payments; edit changes it; validation messages match `COPY.md`; unit tests for the store functions pass.

#### Step 4-B.4: Home restructure (locked structure, plain look)

- **Build:** Home in this order, using tokens only:
    1. Greeting header with the month pill.
    2. Month card: spent, limit, Left, Allowance a day, and the footnote "Based on payments recorded in Track Pay". Limit parts hidden when no limit is set.
    3. Quick access: **Add from screenshot** (primary) and **Add manually**, with the hint "Pay in any UPI app, then share the success screenshot here." Add from screenshot opens the gallery picker in 4-B.7; until then it shows "Coming soon" text only if the step is run before 4-B.7 (a plain disabled button).
    4. "This month at a glance" slot (daily pace, month-end estimate, versus last month, Analytics link): left out until Step 5.9.
    5. Recent payments: up to 5 newest, with payee, amount, category, time and a "Not verified" marker where `reviewed` is false; "History" link; empty state.
    6. Tab bar: Home, Analytics, History, Settings.
    The top bar has no bell. No pending banner. Keep the dev section.
- **Done when:** Home matches the locked structure in `DESIGN.md` §1; numbers match Step 3.1; saving a payment updates Home at once; checked on a phone in both themes at 130% font scale.

#### Step 4-B.5: Share-receipt pipeline

- **Build:** replaces the throwaway route. Share image, read with ML Kit, `parseReceipt`, then:
    - success: save a payment (`source: 'receipt'`, `reviewed: false`), delete the image copy, show the result page with amount, payee, date and category, and Looks right, Edit and Undo;
    - duplicate (same `upiRef`, or same amount, payee and time): save nothing, show "Already added" with the existing payment;
    - refusal (failed, pending, no amount, unreadable): save nothing, show the message with Enter manually.
  The route never stores the image and never logs the text or the fields. Posting the receipt notification is Step 8.2; this step shows the result page only. A dev button "Paste OCR text" may stay behind `__DEV__`.
- **Done when:** EVALS D10 and D11 pass for GPay, PhonePe, Paytm and Navi on a real phone; a failed screenshot saves nothing; a duplicate saves nothing; airplane mode works; `adb logcat` shows no payment data.

#### Step 4-B.6: Edit, delete, verify, undo

- **Build:** Looks right sets `reviewed = true`. Edit opens the form (4-B.3) and saves with `reviewed = true`. Undo removes a payment saved in the last session of the result page. Delete asks first, names the payment, and offers an undo message. Reachable from Recent payments and History rows.
- **Done when:** EVALS S3 and S5 pass; the "Not verified" marker disappears after Looks right or Edit.

#### Step 4-B.7: Gallery picker and batch import

- **Build:** Add from screenshot opens `expo-document-picker` (images, multiple selection; already approved, no permission). Each image goes through the 4-B.5 pipeline. One summary page lists saved, already added and could-not-read counts, with Review for the saved ones. No scanning of the gallery in the background.
- **Done when:** picking five mixed images (three good, one duplicate, one failed) saves three and reports the rest; EVALS D12 passes.

## Phase 4-C: Storage

#### Step 4-C.1: SQLite payments store and migration

- **Build:** install `expo-sqlite` with `npx expo install expo-sqlite`. Add `src/data/db.ts` and a repository for payments with the fields in `ARCHITECTURE.md` §5. Numbered migration 1 moves `trackpay:payments` from AsyncStorage into SQLite inside one transaction, then marks it moved; it never deletes the old key until the new rows are counted equal. Existing test rows with status Failed or Pending stay and are excluded from totals (open question 22). The store API used by screens does not change. Tests first, including an interrupted migration.
- **Done when:** the number of payments before and after is equal; totals are equal; the app restarts with the data intact; backup prompt text is shown if anything could be lost (`GUARDRAILS.md` §5.5).

---

## Phase 5: Analytics (plain)

Totals count every payment. Each screen says "Based on payments recorded in Track Pay".

#### Step 5.1: Analytics maths (domain)
- **Build:** same-day comparison with last month, cumulative spend per day, straight-line ceiling, category totals, weekday totals, top five payees, days without a payment (shown as plain information only, open question 17). Tests first.
- **Done when:** tests cover month boundaries, 28 to 31 day months, an empty month, ties and old failed rows excluded.

#### Step 5.2: Pace summary
- **Build:** daily average, projected finish ("estimate"), headroom, versus last month (percent and amount, up or down word).
- **Done when:** the example gives ₹330 a day, ₹10,230, ₹4,770.

#### Step 5.3: Unconfirmed box (RETIRED 2026-10-25)
- Nothing is pending or unconfirmed any more. Do not build.

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
- **Build:** tap a day to see its payments, today marker, month arrows, summary line.

#### Step 5.9: Home analytics glance
- **Build:** the "This month at a glance" block on Home: daily pace, month-end estimate (labelled estimate), versus last month, and an Analytics link. Uses 5.1 and 5.2 only; no new maths.
- **Done when:** the three numbers equal the Analytics screen for the same month.

---

## Phase 6: History

#### Step 6.1: Monthly groups
- **Build:** expandable month groups with the month's spend; rows as on Home, including the "Not verified" marker.
- **Done when:** the current month starts open.

#### Step 6.2: Search
- **Build:** text search over payee, note and category. No voice input.
- **Done when:** results update as you type; an empty result shows a message (EVALS H1, H2).

#### Step 6.3: Filters
- **Build:** filter All or Not verified, and a date range. No Done, Failed or Pending filter.
- **Done when:** filters combine with search; month totals still include every payment (EVALS H3, H4).

#### Step 6.4: Export trigger
- **Build:** "Export data" opens the export choices (backup file or monthly PDF statement).
- **Done when:** EVALS D5 passes.

---

## Phase 7: Settings

#### Step 7.1: Profile
- **Build:** name display, edit profile.
- **Done when:** edits save and show in the greeting and the profile button.

#### Step 7.2: Theme control
- **Build:** Dark, Light, Auto control using step 1.5.
- **Done when:** applies at once and persists (EVALS T1 to T3).

#### Step 7.3: Monthly limit
- **Build:** switch, amount field, quick-step buttons (+₹2,000, +₹5,000, −₹1,000). Off hides every limit element everywhere (EVALS A7).
- **Done when:** values clamp above zero and to at most ₹99,99,999; Home and Analytics update at once.

#### Step 7.4: UPI apps (RETIRED 2026-10-25)
- The app no longer lists or opens UPI apps. Do not build.

#### Step 7.5: Reminders settings
- **Build:** daily log reminders switch and 1 to 6 times (default 10:00, 14:00, 18:00, 21:00), quiet hours (default 23:00 to 07:00), lock-screen details switch (default off), backup reminder switch, a row showing that limit alerts are always on, and a battery settings shortcut. Writes settings only; scheduling is Phase 8.
- **Done when:** R3 and R4 pass; changes persist.

#### Step 7.6: Quick-add switch (RETIRED by default)
- Do not build (open question 18).

#### Step 7.7: Data
- **Build:** Export (warning first), Import (merge or replace with counts; invalid-file message), PDF statement (month). Records the time of the last export. The 30-day backup nudge is replaced by Step 8.5.
- **Done when:** D1 to D6 pass.

---

## Phase 8: Notifications

Library chosen in Step 0.3 (`react-native-notify-kit`). All code lives in `src/notifications`. Spec: `ARCHITECTURE.md` §8 and §9, `COPY.md`, `EVALS.md` R1 to R14. Four channels: Receipt confirmations, Daily log reminders, Limit alerts, Backup reminders.

#### Step 8.1: Notification planner (domain)
- **Build:** pure planner in `src/domain`: next daily reminder times with quiet hours across midnight and the skip rules (a payment logged or No payments tapped since the previous reminder), limit thresholds (80 and 100, once per month each, only when a limit is set), backup due on the 1st at 10:00 unless exported that month. Tests first (R1 to R5, R12 to R14).

#### Step 8.2: Receipt received notification
- **Build:** posted by the 4-B.5 and 4-B.7 pipelines right after a payment is saved. Buttons Looks right, Edit, Undo. Variants: could not read (Enter manually), already added, batch (one grouped notification, Review). Generic lock-screen text unless details are on. Re-verify R6, R7 and R10 with INTERNET stripped, with the app swiped away.
- **Done when:** R6, R7, R10 pass on a real phone; Undo removes exactly the payment shown.

#### Step 8.3: Daily log reminders
- **Build:** schedules the planner's times (inexact, no `SCHEDULE_EXACT_ALARM`). Buttons Add screenshots (opens the picker), No payments (dismisses and cancels the rest of that day), Snooze 1 hour. Rescheduled when the app opens and when settings or payments change.
- **Done when:** R2, R8, R9 pass on a real phone; reminders skip as specified.

#### Step 8.4: Limit alerts
- **Build:** after each saved payment, post the 80% or 100% alert once per month. Tap opens Analytics. Always on inside the app.
- **Done when:** R13 passes; editing or deleting never re-fires or un-fires a threshold.

#### Step 8.5: Backup reminder
- **Build:** 1st of each month, 10:00. Buttons Export now (opens the export choices) and Remind me tomorrow. Skipped if an export already happened that month or the switch is off.
- **Done when:** R14 passes.

#### Step 8.6: Channels and lock-screen privacy
- **Build:** create the four channels; lock-screen text hides details unless the switch is on; Settings says that Android lets the user block a channel.
- **Done when:** `GUARDRAILS.md` §2.5 and §4 hold.

---

## Phase 9: Quality (functional)

#### Step 9.1: Maths consistency
- **Check:** the same month gives the same numbers on Home, Analytics, History, the statement and notifications. The example reconciles: ₹330 a day x 31 days = ₹10,230, headroom ₹4,770.

#### Step 9.2: Basic accessibility
- **Check:** every control has a label and a 44 px target; status is never colour only; 130% font scale does not break any screen; reduce motion respected. Visual contrast tuning belongs to the design plan (D7.2).

#### Step 9.3: Full functional EVALS pass
- **Check:** every unit case and every R, D, A, H, T, O, S case in `EVALS.md` on at least two phones.

#### Step 9.4: Guardrail audit
- **Check:** `npm run lint:guardrails`; no network calls and no INTERNET permission; no SMS or notification reading; no payment initiation code; no stored screenshots; no payment saved except from a user's share, pick or typing; logs free of payment data and OCR text.

---

## Phase 10: Milestone M1

#### Step 10.1: Workable build
- **Build:** `eas build -p android --profile preview`; install over any older build.
- **Done when:** data survives the update; permission prompts are correct; first run and relaunch work; the person confirms it is usable.

#### Step 10.2: Handover to the design plan
- **Build:** update `README.md` and `ARCHITECTURE.md` to match; list in `BUILD-TODO.md` anything visual that was left plain.
- **Done when:** the person approves M1. **The design plan (Part B of `DESIGN-BUILD-PLAN.md`) can now start.**