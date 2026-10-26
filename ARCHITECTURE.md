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
| Storage | `expo-sqlite` for payments (from Step 4-C.1; AsyncStorage until then). AsyncStorage key-value for settings and profile |
| Notifications | `react-native-notify-kit` 10.8.1 (chosen in Step 0.3) with action buttons that work with the app closed |
| Screenshot reading (OCR) | Google ML Kit text recognition through `rn-mlkit-ocr`, **bundled model** (`ocrUseBundled: true`) |
| Share target | `expo-share-intent` (receives images from the Android share sheet) with `app/+native-intent.ts` |
| Gallery picking | `expo-document-picker` (images, multi-select). No permission needed |
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

- `app/`: routes (Expo Router reads the root `app/` folder). Tabs (Home, Analytics, History, Settings), the share-receipt result page, the batch result page, popups, splash and onboarding.
- `src/ui`: design system: tokens (`theme.ts`), `ThemeProvider`, `Text`, components, dialog host, screen shell, tab bar, top bar.
- `src/features/<name>`: feature-specific components (home, analytics, history, settings, payments, onboarding).
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

**payments** (SQLite from Step 4-C.1): `id`, `amountPaise` (integer), `payeeName`, `payeeVpa` (nullable), `label` (note, nullable), `category` (Food, Shopping, Bills, Transport, Other), `status` (`success` for every new payment; `pending` and `failed` exist only in old test rows), `source` (`receipt` for a screenshot, `manual` for a typed payment), `reviewed` (boolean), `paidAt` (the date and time of the payment, from the receipt or chosen by the user, never in the future), `createdAt` (when it was recorded), `upiRef` (nullable, used to detect duplicates). If the current store already has a date field, keep its name and ask before adding a second one. `confirmedAt` and the sources `qr`, `friend` and `quick_add` are no longer used.

**settings and profile** (key-value): theme (`dark`, `light`, `auto`); limit on/off and `limitPaise`; quiet hours (start and end minute, default 23:00 to 07:00); `remindersEnabled` (default on); `reminderTimes` (1 to 6 times as minutes since midnight, default 10:00, 14:00, 18:00, 21:00); `backupReminderEnabled` (default on); `lastBackupReminderMonth`; `limitAlertsFired` (the month and which of 80 and 100 already fired); lock-screen details on/off (default off); last export time; and the profile: `firstName`, `surname`, `avatarUri` (nullable), `onboarded` (boolean). `preferredUpiPackage` and the persistent quick-add switch are no longer used.

Adding keys is additive and needs no migration. Renaming a key, changing a value's shape, and moving payments from AsyncStorage to SQLite need a numbered migration and a test.

## 6. Payment lifecycle

```
shared or picked screenshot -> read -> parsed -> saved (reviewed = false)
manual add                  -> saved (reviewed = true)
saved -> Looks right        -> reviewed = true
saved -> Edit               -> saved again, reviewed = true
saved -> Undo or Delete     -> removed
```

- Only the user's actions create, change or remove a payment. OCR output never changes an existing payment.
- A payment with `reviewed = false` shows a "Not verified" marker in History and on Home.
- A screenshot of a failed, pending or unreadable payment is refused and nothing is saved. A duplicate is refused and the existing payment is shown.
- Totals count every payment. Old `failed` test rows are never counted.
- There is no retry. Track Pay does not start payments.

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

**Share a screenshot:** the user pays in any UPI app and shares the success screenshot to Track Pay. `expo-share-intent` passes the image to the share-receipt page. The app reads it with ML Kit and parses it (`parseReceipt`). Outcomes:
- A successful receipt with an amount: the payment is saved (`source` receipt, `reviewed` false), the image is discarded, and the result page shows amount, payee, date and category with Looks right, Edit and Undo. The receipt notification is posted (Phase 8).
- A duplicate: nothing is saved; "Already added" shows the existing payment.
- A failed, pending or unreadable screenshot: nothing is saved; a message offers Enter manually.

**Pick from the gallery:** Add from screenshot opens the file picker (images, several at once). Each image goes through the same steps. One summary page lists what was saved and what was skipped, and one grouped notification is posted.

**Add manually:** Add manually opens the payment form. Saving creates a payment with `reviewed` true.

**Verify, edit, undo:** Looks right sets `reviewed` true. Edit opens the payment form with the values filled in; saving sets `reviewed` true. Undo removes a payment that was just saved. Delete asks for confirmation and names the payment.

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

There is no custom native module. The share target comes from `expo-share-intent` plus the `app/+native-intent.ts` redirect (which resolves the Expo Router linking conflict). OCR comes from `rn-mlkit-ocr`, wrapped in `src/native` so the rest of the app never imports it. A small Expo config plugin strips the INTERNET permission after prebuild. No Android source is tracked in git.

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
| OCR misreads an amount or payee | The result page shows the values, the payment is marked Not verified, and Looks right, Edit and Undo are always one tap away. Refuse when unsure |
| UPI apps change their success screens | Parser tests per app on synthetic layouts; manual add as the fallback |
| The same screenshot is shared twice | Duplicate check on `upiRef`, or on amount, payee and time |
| A failed or pending screenshot is shared | Detect the status text and refuse |
| ML Kit sends diagnostics to Google | The INTERNET permission is stripped, so it fails silently (Path B) |
| Stripping INTERNET or the exact-alarm permission breaks notify-kit | Re-test R6, R7, R10 after the plugin lands; reminders are inexact by design |
| Android lets users block a notification channel | Say so in Settings; never promise limit alerts cannot be silenced |
| Phone brands kill background work | Scheduled notifications, a battery-settings shortcut, device tests |
| Light theme colours fail contrast (primary label 4.1:1; amber, emerald, rose text on white) | `DESIGN-TOKENS.md` proposes darker text tokens; resolved in design step D7.2 |
| Data loss if the phone is lost | Export and import, and the monthly backup reminder |
| Totals are incomplete if the user forgets to log | Four daily log reminders; the footer says "Based on payments recorded in Track Pay" |
| A growing JSON blob in AsyncStorage gets slow | Step 4-C.1 moves payments to SQLite before analytics is built |