# Architecture

How Track Pay is built. Read `GUARDRAILS.md` first: it limits everything below. Track Pay records payments the user shares as screenshots or types in. It never starts a payment.

## 1. Goals

1. The local database is the single source of truth. Screens, notifications and reminders all read from it.
2. Everything works offline and stays on the phone. No account, server, analytics or ads. The INTERNET permission is stripped.
3. Money is never wrong: integer paise, estimates labelled as estimates, and every value read from a screenshot can be verified and edited.
4. Notification buttons work while the app is closed.
5. Screenshots are read on the phone and never stored.
6. One design system (`DESIGN-BUILD-PLAN.md`) drives every colour, size and shape through tokens, in Dark and Light, applied after the app works.

## 2. Stack

| Area | Choice |
|---|---|
| App | React Native, Expo SDK 54, TypeScript (strict), Android only, development build |
| Routing | Expo Router (file based) |
| State | Zustand stores that read the repositories, plus the small React contexts already built |
| Storage | `expo-sqlite` for payments (from Step 4-C.1; AsyncStorage until then). AsyncStorage key-value for settings, profile and the pending-receipt index. Pending-receipt image files under `documentDirectory/pending/` |
| Notifications | `react-native-notify-kit` 10.8.1 (chosen in Step 0.3) with action buttons that work with the app closed |
| Screenshot reading (OCR) | PaddleOCR via `ppu-paddle-ocr` + `onnxruntime-react-native` + `@shopify/react-native-skia`, bundled ONNX models, no network |
| Share target | `expo-share-intent` with local config plugin `plugins/withShareIntentAttributes.js` (see §10; `app/+native-intent.ts` was deleted in 4-B.1) |
| Gallery picking | `expo-document-picker` (images, multi-select). No permission needed. Uses the same pending-queue intake as shares (4-D.2) |
| Graphics | react-native-svg for charts; expo-linear-gradient and optional expo-blur arrive in the design plan |
| Icons | None in the project plan; lucide-react-native in the design plan |
| Fonts | System font in the project plan; Plus Jakarta Sans and JetBrains Mono in the design plan |
| PDF and files | expo-print, expo-sharing, expo-document-picker, expo-file-system |
| Tests | Jest for domain logic, manual device checks from `EVALS.md` |

Removed on 2026-10-25: `expo-camera` and the Kotlin module `modules/upi-launcher`. Not used: Tailwind, NativeWind, any web view, any network library.

## 3. Layers and folders

```
UI (app, src/features, src/ui)
  -> Stores (src/stores)
    -> Domain (src/domain)   pure TypeScript, no React, no platform imports
      -> Data (src/data)     repositories over SQLite and the key-value store
Platform: src/notifications, src/native, plugins
```

- `app/`: routes (Expo Router reads the root `app/` folder). Tabs (Home, Analytics, History, Settings), the share-receipt intake page, the pending-verify grid and card pages, popups, splash and onboarding.
- `src/ui`: design system: tokens (`theme.ts`), `ThemeProvider`, `Text`, components, dialog host, screen shell, tab bar, top bar.
- `src/features/<name>`: feature-specific components (home, analytics, history, settings, payments, onboarding, **pending** — pod, grid, card, scan engine).
- `src/domain`: payment lifecycle, money, dates, **receipt parsing (`src/domain/receipt`)**, analytics maths, notification planner, backup, statement, notification text. Unit tested.
- `src/data`: the only code that touches storage. Numbered migrations.
- `src/notifications`, `src/native`: everything platform specific (notification library, OCR wrapper), kept small and free of business rules.
- `scripts/check-guardrails.js`: fails the build on forbidden code (network, SMS, payment initiation, silent changes).

Rule: UI never touches storage; domain never imports React or platform code.

## 4. Separating function from design

The app is built in two plans (`README.md`). To make that possible:

1. **UI contract.** Screens use only primitives from `src/ui` and colours from `useTheme()` by semantic name. No hex values, font names or style numbers in screens. Money is always rendered through one `Money` component.
2. **Logic stays out of styling.** Logic lives in `src/domain`, hooks and stores. Screens read data and call actions.
3. **Tokens.** `src/ui/theme.ts` holds the semantic tokens for two themes. In the project plan the values are plain; the design plan fills in the Obsidian (dark) and Alabaster (light) values from `DESIGN-TOKENS.md`.
4. **Design plan scope.** It changes only `src/ui/**`, `theme.ts`, assets, fonts, and layout or style code in screens, never `src/domain`, `src/data`, `src/stores` or notification scheduling.
5. **Visual rules.** Shapes, type, elevation, motion and components are defined in `DESIGN-BUILD-PLAN.md` Part A. Blur is optional with a solid fallback. Motion is off when reduce-motion is on.

## 5. Data model

**payments** (SQLite from Step 4-C.1): `id`, `amountPaise` (integer), `payeeName`, `payeeVpa` (nullable), `label` (note, nullable), `category` (Food, Shopping, Bills, Transport, Other), `status` (`success` for every new payment; `pending` and `failed` exist only in old test rows), `source` (`receipt` for a screenshot, `manual` for a typed payment), `reviewed` (boolean), `paidAt` (the date and time of the payment, from the receipt or chosen by the user, never in the future), `createdAt` (when it was recorded), `upiRef` (nullable, used to detect duplicates). If the current store already has a date field, keep its name and ask before adding a second one. `confirmedAt` and the sources `qr`, `friend` and `quick_add` are no longer used. `reviewed` is deprecated (2026-11-18): kept on old rows only. Every new payment is created at verify time with `reviewed = true`. The "Not verified" marker, the History "Not verified" filter and `PayRow.notVerified` retire.

**pending receipts** (JSON index in AsyncStorage at `trackpay.pendingItems.v1`; image files under `documentDirectory/pending/`): `id`, `imagePath` (file:// URI), `originalName` (nullable), `capturedAt`, `status` (`unscanned` | `scanning` | `scanned` | `verified` | `error`), `scanResult` (nullable: `{ amountPaise, payeeName, paidAt, rawLines, duplicateOfPaymentId? }`), `error` (nullable), `paymentId` (nullable — set on verify). A `scanning` row at boot is demoted to `unscanned` by `sweepInterrupted` — a mid-scan kill is recoverable, not fatal.

**settings and profile** (key-value): theme (`dark`, `light`, `auto`); limit on/off and `limitPaise`; quiet hours (start and end minute, default 23:00 to 07:00); `remindersEnabled` (default on); `reminderTimes` (1 to 6 times as minutes since midnight, default 10:00, 14:00, 18:00, 21:00); `backupReminderEnabled` (default on); `lastBackupReminderMonth`; `limitAlertsFired` (the month and which of 80 and 100 already fired); lock-screen details on/off (default off); last export time; and the profile: `firstName`, `surname`, `avatarUri` (nullable), `onboarded` (boolean). `preferredUpiPackage` and the persistent quick-add switch are no longer used.

Adding keys is additive and needs no migration. Renaming a key, changing a value's shape, and moving payments from AsyncStorage to SQLite need a numbered migration and a test.

## 6. Payment lifecycle

```
shared or picked screenshot -> copied to app storage -> pending row (unscanned)
                             (no OCR at share time; app exits)
manual add                  -> saved (reviewed = true)
pending (unscanned) -> Start scanning (batch or single) -> OCR + parse
                    -> scanned with result (or error)
pending (scanned)   -> verify  -> payment created (reviewed = true)
                               -> pending row verified, image deleted
pending (scanned)   -> discard -> pending row removed, image deleted
pending (unscanned) -> discard -> pending row removed, image deleted
saved payment       -> Edit    -> updated
saved payment       -> Delete  -> removed
```

- Only the user's actions create, change or remove a payment. OCR output never changes an existing payment.
- A payment exists in the store only after the user has verified it from the pending card. History has no unreviewed state.
- A pending screenshot that cannot be read shows an error on its card; the user can retry, discard it, or enter it manually.
- A pending screenshot that matches an existing payment (same `upiRef`, or same amount, payee and time) is flagged as a likely duplicate on its card; the user decides.
- Totals count every payment in the store. Old `failed` test rows are never counted.
- There is no retry of a payment. Track Pay does not start payments.

## 7. Money and analytics definitions

All amounts are integer paise. These definitions are the single source for every screen; tests live in `src/domain/__tests__`.

| Term | Definition | Example (11 Oct, limit ₹15,000, spent ₹3,630) |
|---|---|---|
| Spent | Sum of all payments for the month (old failed rows excluded) | ₹3,630 |
| Daily average so far | Spent ÷ days elapsed (today counts) | ₹330 a day |
| Projected month end (estimate) | Daily average × days in the month | ₹10,230 |
| Headroom | Limit − projected month end | ₹4,770 |
| Left | Limit − spent | ₹11,370 |
| Percent used | floor(spent ÷ limit × 100) | 24% |
| Allowance per day | floor(left ÷ days remaining) | ₹568 a day for 20 days |
| Versus last month | Spent this month so far vs spent in the same days last month | percent and amount |
| Limit alert thresholds | Percent used reaches 80, then 100 | once each per month |

Totals are only as complete as what the user records; each analytics screen says "Based on payments recorded in Track Pay".

## 8. Flows

**Share a screenshot:** the user pays in any UPI app and shares the success screenshot to Track Pay. The share-receipt page copies the image into app storage, appends a pending row (`status: 'unscanned'`), and exits within ~1 second. No OCR runs at share time. The share appears later on the Pending Pod on Home.

**Pick from the gallery:** Add from screenshot opens the file picker (images, several at once). Each image is copied to app storage and becomes a pending row (`unscanned`). No OCR runs at pick time. Same Pending Pod destination as a share.

**Add manually:** Add manually opens the payment form. Saving creates a payment with `reviewed` true.

**Verify pending:** the Pending Pod on Home shows a horizontal thumbnail strip plus a **Verify Pending** button. Verify Pending opens a grid of every pending item with a **Start scanning** button. Start scanning runs `recognizeImageWithMeta → extractFromLines` per item, writing results back to the pending row. The scan can be interrupted by backgrounding or by the OS killing the app — per-item status persists, and `sweepInterrupted` on next launch demotes any stale `scanning` row to `unscanned`, showing a "N items unfinished — tap to resume" prompt. Notifications fire on scan begin and scan complete.

**Pending card:** tapping any pending item opens a card — screenshot on the top half, details on the bottom. Scanned items show editable fields (amount, payee, date, category) and a Verify button; Verify writes the payment and marks the row verified. Unscanned items show a Scan button. Scanning from a card runs independently of whether the user stays on the card; on completion the card updates in place.

**Verify, edit, undo:** Verify from the pending card creates the payment (see above). Edit opens the payment form with the values filled in. Undo removes a payment that was just saved. Delete asks for confirmation and names the payment.

**Daily log reminders:** the planner computes the next reminder times from `reminderTimes`. A time inside quiet hours is skipped, not moved. A reminder is skipped if a payment was logged, or No payments was tapped, since the previous reminder. **No payments** dismisses the notification and cancels the rest of that day's reminders. **Snooze 1 hour** posts it once more, unless that falls in quiet hours. The planner replaces the scheduled set when the app opens and after any change to the settings or the payments.

**Limit alerts:** after a payment is saved, if a limit is set and percent used has reached 80 (or 100) and that threshold has not fired this month, one notification is posted and recorded in `limitAlertsFired`. A new month starts clean. Editing or deleting a payment never un-fires a threshold.

**Backup reminder:** on the 1st of each month at 10:00, if the reminder is on and no export has happened since the 1st, a notification says to export the previous month's spend data. **Export now** opens the export choices (backup file or monthly PDF). **Remind me tomorrow** posts it once more the next day at 10:00.

**Onboarding:** splash waits for the database and settings to load, then routes: first launch goes to onboarding, otherwise Home. Skip sets `onboarded` and leaves the name empty.

**Plan note (2026-10-18, owner-approved):** "Database" resolves to the Phase 3 payments store; today the splash gate keys off `loadAppData()` (`src/data/loading.ts`), which loads settings/theme and profile only. **Ownership boundary (permanent):** 2.2 owns the splash gate and "routes on" (to `/home` in 2.2's scope); 2.4 owns the `onboarded` branch and the "first launch goes to onboarding" behavior. The 1.5 theme-flash gap closes in 2.2 via `expo-splash-screen.preventAutoHideAsync()` at module scope and `hideAsync()` after the load resolves.

## 9. Notifications

| Notification | Channel (importance) | Buttons |
|---|---|---|
| Payment received | Receipt confirmations (high) | Looks right, Edit, Undo |
| Couldn't read this screenshot | Receipt confirmations | Enter manually |
| Already added | Receipt confirmations | none (tap opens the payment) |
| N payments received (batch) | Receipt confirmations | Review |
| Daily log reminder | Daily log reminders (default) | Add screenshots, No payments, Snooze 1 hour |
| Limit alert | Limit alerts (high) | none (tap opens Analytics) |
| Backup reminder | Backup reminders (default) | Export now, Remind me tomorrow |

Lock-screen details are hidden by default; the lock screen shows generic text. Buttons that run without opening the app (Looks right, Undo, No payments, Snooze, Remind me tomorrow) must be verified on a real phone with the app swiped away, and again after the INTERNET permission is stripped. Reminders are inexact: `SCHEDULE_EXACT_ALARM` is not requested, so a reminder can arrive a few minutes late. All notification code lives in `src/notifications` so the library can be swapped.

## 10. Platform code

There is no custom native module. The share target comes from `expo-share-intent` plus the local config plugin `plugins/withShareIntentAttributes.js` (the old `app/+native-intent.ts` was deleted in 4-B.1 — its redirect dropped the `dataUrl`). OCR comes from `ppu-paddle-ocr` + `onnxruntime-react-native` + `@shopify/react-native-skia`, wrapped in `src/ocr` so the rest of the app never imports them. A small Expo config plugin strips the INTERNET permission after prebuild. No Android source is tracked in git.

## 11. Permissions

Notifications only, asked when needed and after an explanation dialog. The share sheet and the file picker need no permission. No camera, no storage or media access, no INTERNET. The optional profile photo was skipped (Step 2.5).

## 12. Dependency and build policy

- Expo packages are added with `npx expo install`, never plain `npm install`.
- After any dependency change: `npx expo install --check`, `npm ci --dry-run --include=dev`, then commit `package.json` and `package-lock.json` together.
- Pin Node in `eas.json` (`"node": "20.19.4"`) so EAS and local installs use the same npm family.
- Releases are built with EAS (`preview` profile makes an installable APK). Local builds with JDK 17 are used when the EAS quota is used up.
- Dependencies change only when a step lists it: `expo-camera` is removed in 4-B.0, `expo-sqlite` is added in 4-C.1.

## 13. Known risks

| Risk | Mitigation |
|---|---|
| OCR misreads an amount or payee | The pending card shows the values and requires Verify before the payment counts. Refuse when unsure; manual entry is always available |
| UPI apps change their success screens | Parser tests per app on synthetic layouts; manual add as the fallback |
| The same screenshot is shared twice | Duplicate check on `upiRef`, or on amount, payee and time |
| A failed or pending screenshot is shared | Detect the status text and refuse |
| OS kills the app mid-scan (Vivo / OriginOS) | Per-item status persisted; `sweepInterrupted` on next launch demotes stale `scanning` rows to `unscanned`; user sees a "N items unfinished — tap to resume" prompt |
| Stripping INTERNET or the exact-alarm permission breaks notify-kit | Re-test R6, R7, R10 after the plugin lands; reminders are inexact by design |
| Android lets users block a notification channel | Say so in Settings; never promise limit alerts cannot be silenced |
| Phone brands kill background work | Scheduled notifications, a battery-settings shortcut, device tests |
| Light theme colours fail contrast (primary label 4.1:1; amber, emerald, rose text on white) | `DESIGN-TOKENS.md` proposes darker text tokens; resolved in design step D7.2 |
| Data loss if the phone is lost | Export and import, and the monthly backup reminder |
| Totals are incomplete if the user forgets to log | Four daily log reminders; the footer says "Based on payments recorded in Track Pay" |
| A growing JSON blob in AsyncStorage gets slow | Step 4-C.1 moves payments to SQLite before analytics is built |