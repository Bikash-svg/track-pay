# Architecture

How Track Pay is built. Read `GUARDRAILS.md` first: it limits everything below.

## 1. Goals

1. The local database is the single source of truth. Screens, notifications and reminders all read from it.
2. Everything works offline and stays on the phone. No account, server, analytics or ads.
3. Money is never wrong: integer paise, explicit payment states, estimates labelled as estimates.
4. Notification buttons work while the app is closed.
5. One design system (`DESIGN-BUILD-PLAN.md`) drives every colour, size and shape through tokens, in Dark and Light, applied after the app works.

## 2. Stack

| Area | Choice |
|---|---|
| App | React Native, Expo SDK 54, TypeScript (strict), Android only, development build |
| Routing | Expo Router (file based) |
| State | Zustand stores that read the repositories |
| Storage | expo-sqlite for payments, key-value store for settings and profile |
| Notifications | A local-notification library with action buttons and a reply box, chosen in Step 0.3 (react-native-notify-kit or expo-notifications) |
| Camera | expo-camera (QR) |
| UPI chooser | Own Kotlin module `modules/upi-launcher` |
| Graphics | react-native-svg for charts; expo-linear-gradient and optional expo-blur arrive in the design plan |
| Icons | None in the project plan; lucide-react-native in the design plan (text monograms for UPI apps) |
| Fonts | System font in the project plan; Plus Jakarta Sans and JetBrains Mono in the design plan |
| PDF and files | expo-print, expo-sharing, expo-document-picker, expo-file-system |
| Tests | Jest for domain logic, manual device checks from `EVALS.md` |

Not used: Tailwind, NativeWind, any web view, any network library.

## 3. Layers and folders

```
UI (src/app, src/features, src/ui)
  -> Stores (src/stores)
    -> Domain (src/domain)   pure TypeScript, no React, no platform imports
      -> Data (src/data)     repositories over SQLite and the key-value store
Platform: src/notifications, src/native, modules/upi-launcher, plugins
```

- `src/app`: routes. Tabs (Home, Analytics, History, Settings), popups, pages (pending, scanner), splash and onboarding.
- `src/ui`: design system: tokens (`theme.ts`), `ThemeProvider`, `Text`, components, dialog host, screen shell, tab bar, top bar.
- `src/features/<name>`: feature-specific components (home, analytics, history, settings, payments, onboarding).
- `src/domain`: payment states, money, dates, UPI parsing, analytics maths, reminders, backup, statement, notification text. Unit tested.
- `src/data`: the only code that touches storage. Numbered migrations.
- `src/notifications`, `src/native`: everything platform specific, kept small and free of business rules.
- `scripts/check-guardrails.js`: fails the build on forbidden code (network, SMS, silent status changes).

Rule: UI never touches storage; domain never imports React or platform code.

## 4. Separating function from design

The app is built in two plans (`README.md`). To make that possible:

1. **UI contract.** Screens use only primitives from `src/ui` and colours from `useTheme()` by semantic name. No hex values, font names or style numbers in screens. Money is always rendered through one `Money` component.
2. **Logic stays out of styling.** Logic lives in `src/domain`, hooks and stores. Screens read data and call actions.
3. **Tokens.** `src/ui/theme.ts` holds the semantic tokens for two themes. In the project plan the values are plain; the design plan fills in the Obsidian (dark) and Alabaster (light) values from `DESIGN-TOKENS.md`.
4. **Design plan scope.** It changes only `src/ui/**`, `theme.ts`, assets, fonts, and layout or style code in screens, never `src/domain`, `src/data`, `src/stores`, notifications or the native module.
5. **Visual rules.** Shapes, type, elevation, motion and components are defined in `DESIGN-BUILD-PLAN.md` Part A. Blur is optional with a solid fallback. Motion is off when reduce-motion is on.

## 5. Data model

**payments** (SQLite): `id`, `amountPaise` (integer), `payeeName`, `payeeVpa` (nullable), `label` (what it was for, nullable), `category` (Food, Shopping, Bills, Transport, Other), `status` (`pending`, `success`, `failed`), `source` (`qr`, `friend`, `manual`, `quick_add`), `createdAt`, `confirmedAt` (nullable), `upiRef` (nullable).

**settings and profile** (key-value): theme (`dark`, `light`, `auto`), limit on/off and `limitPaise`, quiet hours (start and end minute), lock-screen details on/off, persistent notification on/off, last export time, and the profile: `firstName`, `surname`, `avatarUri` (nullable), `onboarded` (boolean), `preferredUpiPackage` (nullable).

Every schema or settings-shape change needs a numbered migration and a migration test.

## 6. Payment state machine

```
created -> pending -> success
                   -> failed
```

- Saved as `pending` when a UPI app is chosen. Manual adds can start as Done or Failed.
- Only the user moves a payment to `success` or `failed`. A UPI result is shown as a hint, never applied.
- `failed` payments are excluded from totals. `success` and `pending` count, pending marked.
- **Retry:** "Try again" creates a **new** pending payment with the same payee and amount. The failed payment stays as history. There is no limit on attempts.

## 7. Money and analytics definitions

All amounts are integer paise. These definitions are the single source for every screen; tests live in `src/domain/__tests__`.

| Term | Definition | Example (11 Oct, limit ₹15,000, spent ₹3,630) |
|---|---|---|
| Spent | Sum of Done + Pending for the month | ₹3,630 |
| Daily average so far | Spent ÷ days elapsed (today counts) | ₹330 a day |
| Projected month end (estimate) | Daily average × days in the month | ₹10,230 |
| Headroom | Limit − projected month end | ₹4,770 |
| Left | Limit − spent | ₹11,370 |
| Percent used | floor(spent ÷ limit × 100) | 24% |
| Allowance per day | floor(left ÷ days remaining) | ₹568 a day for 20 days |
| Versus last month | Spent this month so far vs spent in the same days last month | percent and amount |


Totals are only as complete as what the user records; each analytics screen says "Based on payments recorded in Track Pay".

## 8. Flows

**QR payment:** scan, validate (`parseUpi`), Confirm payment dialog (amount editable), Make payment saves a pending payment, opens the UPI chooser, on return "Did it go through?".

**Friend payment:** enter amount and name, pick a UPI app. Nothing is sent to the UPI app. A pending payment is saved, a notification is posted, and the app opens.

**Did it go through?** Yes sets Done, No sets Failed and opens "Payment failed", Decide later leaves it pending. Closing the dialog is Decide later.

**Retry:** Payment failed dialog, Try again. QR payments reopen Confirm payment with the same shop, amount and note. Friend payments reopen Pay to a friend with the same name and amount. Also available from Edit payment (status Failed) and the failed notification action.

**Reminders:** after any change to pending payments the planner computes the next reminder times, skips quiet hours, and replaces the scheduled set. One grouped notification shows the count. Actions update the database and re-plan. Zero pending cancels everything.

**Onboarding:** splash waits for the database and settings to load, then routes: first launch goes to onboarding, otherwise Home. Skip sets `onboarded` and leaves the name empty.

## 9. Notifications

Channels: "Payment confirmations" (high), "Hourly reminders" (default), "Quick add" (low, ongoing). Lock-screen details are hidden by default. Actions handled while the app is closed must be verified on a real phone (Step 0.3) before any notification feature is built. All notification code lives in `src/notifications` so the library can be swapped.

## 10. Native module

`modules/upi-launcher` builds an `ACTION_VIEW` intent for `upi://pay`, shows the Android chooser, returns the activity result and lists installed UPI apps. No business logic. Its Android source must be tracked by git (`.gitignore` uses `/android` and `/ios`, not bare `android`).

## 11. Permissions

Camera and notifications, asked only when needed, after an explanation dialog. Optional: photos for the profile picture (only if approved in Step 2.4). Nothing else.

## 12. Dependency and build policy

- Expo packages are added with `npx expo install`, never plain `npm install`.
- After any dependency change: `npx expo install --check`, `npm ci --dry-run --include=dev`, then commit `package.json` and `package-lock.json` together.
- Pin Node in `eas.json` (`"node": "20.19.4"`) so EAS and local installs use the same npm family.
- Releases are built with EAS (`preview` profile makes an installable APK).

## 13. Known risks

| Risk | Mitigation |
|---|---|
| UPI apps may not return reliable results | Always ask the user; the result is a hint |
| Some UPI apps limit payments started by other apps | Friend flow sends nothing to the UPI app |
| Android lets users dismiss ongoing notifications | Re-post on app open; never promise permanence |
| Phone brands kill background work | Scheduled notifications, battery-settings shortcut, device tests |
| Library for notifications may be unmaintained | Isolated in `src/notifications`; Step 0.3 spike; fallback library |
| Light theme colours fail contrast (primary label 4.1:1; amber, emerald, rose text on white) | `DESIGN-TOKENS.md` proposes darker text tokens; resolved in design step D7.2 |
| Data loss if the phone is lost | Export and import, backup nudge after 30 days |
