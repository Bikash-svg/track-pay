# Build To-Do

The live checklist. The AI model updates this file after every step (`AI-RULES.md` section 5). Track A steps are in `ARCHITECTURE-BUILD-PLAN.md`. Track B steps are in Part B of `DESIGN-BUILD-PLAN.md`. **Finish Track A (milestone M1, approved) before starting Track B.**

**Current step, Track A:** 1.5 Theme choice

**Current step, Track B:** not started (waits for M1)

**Legend:** `[ ]` not started, `[~]` in progress, `[x]` done and approved, `[!]` blocked, `[-]` skipped (reason in notes).

**Note for Track A:** much of this already exists in the code. Verify first, fix gaps, record evidence. Do not rewrite working code.

## Blockers


## Track A: project plan (a working app, plain look)

### Phase 0: Baseline

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 0.1 | Confirm the baseline | [x] | Approved 2026-10-16. `npx expo install --check` → "Dependencies are up to date". `npm ci --dry-run --include=dev` → "up to date". `npx tsc --noEmit` → clean. `npm run lint:guardrails` → "Guardrail check passed." `npm test` → 1 suite, 1 test passed. `git status` → clean working tree. |
| 0.2 | Make EAS builds work | [x] | Approved 2026-10-16. Created eas.json (preview + production profiles, node pinned 20.19.4). .nvmrc already 20.19.4. .npmrc restored from git (legacy-peer-deps=false, fund=false). package.json engines pinned to "20.19.4". .gitignore has /android and /ios. modules/upi-launcher/android does not exist (no modules/ dir). Checks: expo install --check → up to date; npm ci --dry-run --include=dev → up to date (EBADENGINE warning only: local node v24.19.0 vs engines 20.19.4); tsc clean; guardrails passed; tests 1 passed. eas build -p android --profile preview could not run: EAS project not configured (needs eas init), no device for APK install. Blocker note on lock file resolved — lock file in sync. |
| 0.3 | Notification library spike | [x] | Approved 2026-10-17. Decision: react-native-notify-kit 10.8.1 is the notification library (expo-notifications not tested because notify-kit passed). Evidence: R6 pass, R7 pass, R10 pass (app swiped away, not force-stopped), tested on <your phone model, Android version> with a development build, cable and laptop server running. R8, R9 and P11: not run. Checks: npm run check → expo install --check up to date; tsc --noEmit clean; lint:guardrails passed; npm test 1 passed. Installed expo-dev-client via npx expo install; added development profile to eas.json. Spike: app/index.tsx (three buttons), app/_layout.tsx (registers handler), src/notifications/spike.ts (channel, actions, background handler). Open question 12 (INTERNET and SCHEDULE_EXACT_ALARM) kept open. |
| 0.4 | UPI result spike | [x] | Approved 2026-10-17. Findings (hints only, no real data):
  - Module finds installed UPI apps (Google Pay, PhonePe, Navi) once the queries block declares scheme upi and host pay and the app is rebuilt. Probe results: <fill in the two counts from the screen>.
  - Personal-payee link (valid format, ₹1): declined with a security message in all three apps.
  - Fake payee and friend link (no payee ID): rejected or unusable in all three apps.
  - Merchant (shop QR) case: <result per app, or "not tested; deferred to Step 4.2">.
  - What comes back to the app after the UPI app closes: <focus returned yes/no; raw result: empty / action+data / extras with keys ...>.
  - The result is lost if the app process is killed, so "Did it go through?" must be driven from pending rows in the database (Step 4.5).
  - Open question 13 (Pay to a friend): options A, B, C, default A. Needs the owner's decision before Step 4.1.
  - The Free plan build quota ran out on 2026-10-17 and resets on Nov 1. Local builds with JDK 17 are used meanwhile.
  - manifest `<queries>` block: scheme=upi host=pay added; no runtime permission requested.
  - Native module `modules/upi-launcher` wired via Expo modules autolinking: `expo-module.config.json` (`platforms: ["android"]`, module `com.trackpay.upilauncher.UpiLauncherModule`), module `android/build.gradle` (expo-module-gradle-plugin), Kotlin `UpiLauncherModule` with `openUpi`/`listUpiApps`; manifest `<queries>` block included in module AndroidManifest.xml. Prebuild verified autolinking picks up the module (`settings.gradle` uses `expoAutolinking.useExpoModules()`); local `android/` folder is git-ignored, not committed. No config plugin added, no `app.json` plugins change.
  - No real payee names, VPAs or amounts recorded. Do not try to work around the block. |
| 0.5 | Rename to Track Pay | [x] | Approved 2026-10-17. Verified: grep -rni vaultx src app app.json modules → nothing user-visible (exit 1). README.md line 6 simplified to "The product is called Track Pay." AI-RULES.md D1 updated: "The old name VaultX no longer appears in code." ARCHITECTURE-BUILD-PLAN.md Step 0.5 Done-when updated: grep -ri vaultx src app.json. app.json already "Track Pay"; android package already com.bkas.trackpay; no app.config.js exists. Checks: npm run check → expo install --check up to date, tsc clean, lint:guardrails passed, npm test 1 passed. Done-when met. | BUILD-TODO.md |

### Phase 1: Plain foundation

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 1.1 | Semantic tokens | [x] | Approved 2026-10-18. tsc --noEmit clean; lint:guardrails passed; npm test 4 passed (2 suites). src/ui/theme.ts, types.ts, __tests__/theme.test.ts created; tsconfig alias updated. |
| 1.2 | Plain primitives | [x] | Done when satisfied by PrimitivesDemo (owner decision 2026-10-18, option a); re-verify every primitive is used by a routed screen in Phase 3. Rename useTheme.ts -> useTheme.tsx approved (owner, 2026-10-18). Contrast gap deferred to Track B D7.2. Checks: node v20.19.4, tsc clean, guardrails passed, 7 tests passed (3 suites). |
| 1.3 | Navigation structure | [x] | Approved 2026-10-18. Routes stay in root `app/` (Expo Router default); ARCHITECTURE.md §3 says `src/app` — pending doc fix, no route move. Scope: 4 tabs (Home, Analytics, History, Settings) + pages `pending`, `scanner`; splash/onboarding deferred to Phase 2 (2.2/2.4), full route list re-verified in Step 9.2. `src/ui/TabBar.tsx` created (text labels, 44 px targets, `tokens` colours, no icons, `accessibilityRole="tab"` + `accessibilityState.selected`). `app/index.tsx` redirects `/` → `/home`; root is a `Stack` so the top bar can push `/pending` from any tab in Phase 3. `app/upi-spike.tsx` removed; notification spike handler kept in `app/_layout.tsx`. `src/ui/index.ts` exports `TabBar`; `theme.test.ts` hex-scan exclusion of `app/upi-spike.tsx` removed. Checks: tsc clean; guardrails passed; 3 suites, 7 tests passed. grep checks clean. Phone check: tabs switch; Back from `/pending` and `/scanner` returns to Home; hardware Back on tab screens behaves; mount error gone. |
| 1.4 | Dialog host | [x] | Approved 2026-10-18. DialogHost mounted in DialogProvider (`app/_layout.tsx`); Context `src/ui/DialogProvider.tsx` (`DialogProvider`, `useDialog` returning `{ open, close, visible }`); `src/ui/Dialog.tsx` (scrim via `tokens.scrim`, 36 px close button + 4 px hitSlop, tap-outside + hardware-Back dismiss, KeyboardAvoidingView `padding`/`height` with `keyboardVerticalOffset=0`, scroll-if-tall); `src/ui/DialogHost.tsx` (state/portal wrapper, no content). 1.1 gap closed in 1.4: scrim token added. Values match DESIGN-TOKENS.md (dark final, light PROPOSED per open-question-10). No doc change needed. Dev dialog on Home with a `Field` + `__DEV__` gate; OK wired to `close()`. Device-verified by the owner: dialog centred with the tab bar behind, keyboard-open dialog rides above the keyboard, OK closes, tap outside closes, close button closes, hardware Back closes, scrim correct in Dark and Light. Tests: `src/ui/__tests__/dialog.test.tsx`, 13 tests, 4 suites/20 tests passing. Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails "Guardrail check passed."; npm test 20 passed (4 suites). `@/` grep empty; hex grep outside theme.ts → test assertions only (`primitives.test.tsx:40,45`); domain/data/stores import grep empty. |
| 1.5 | Theme choice | [ ] | |

### Phase 2: Splash and onboarding

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 2.1 | Profile data | [ ] | |
| 2.2 | Splash gate | [ ] | |
| 2.3 | Onboarding form (step 2: ask first) | [ ] | |
| 2.4 | Launch routing | [ ] | |
| 2.5 | Profile picture (optional, ask first) | [ ] | |

### Phase 3: Home

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 3.1 | Month statistics (domain) | [ ] | |
| 3.2 | Spend summary | [ ] | |
| 3.3 | Pending banner | [ ] | |
| 3.4 | Quick actions | [ ] | |
| 3.5 | Recent payments | [ ] | |
| 3.6 | Top bar (functional) | [ ] | |

### Phase 4: Payments

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 4.1 | Pay to a friend | [ ] | |
| 4.2 | QR scanner | [ ] | |
| 4.3 | Confirm payment and launch UPI | [ ] | |
| 4.4 | Exception dialogs | [ ] | |
| 4.5 | Did it go through? | [ ] | |
| 4.6 | Payment failed and retry | [ ] | |
| 4.7 | Needs confirming page | [ ] | |
| 4.8 | Edit and delete | [ ] | |
| 4.9 | Add a payment already made | [ ] | |

### Phase 5: Analytics (plain)

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 5.1 | Analytics maths (domain) | [ ] | |
| 5.2 | Pace summary | [ ] | |
| 5.3 | Unconfirmed box | [ ] | |
| 5.4 | Spending trajectory (plain chart) | [ ] | |
| 5.5 | Categories and weekdays | [ ] | |
| 5.6 | Top five payees | [ ] | |
| 5.7 | Monthly trend and calendar | [ ] | |
| 5.8 | Calendar upgrades (optional, ask first) | [ ] | |

### Phase 6: History

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 6.1 | Monthly groups | [ ] | |
| 6.2 | Search | [ ] | |
| 6.3 | Filters | [ ] | |
| 6.4 | Export trigger | [ ] | |

### Phase 7: Settings

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 7.1 | Profile | [ ] | |
| 7.2 | Theme control | [ ] | |
| 7.3 | Monthly limit | [ ] | |
| 7.4 | UPI apps | [ ] | |
| 7.5 | Reminders settings | [ ] | |
| 7.6 | Quick-add switch | [ ] | |
| 7.7 | Data | [ ] | |

### Phase 8: Notifications

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 8.1 | Reminder planner (domain) | [ ] | |
| 8.2 | Hourly grouped reminder | [ ] | |
| 8.3 | Friend payment notification | [ ] | |
| 8.4 | Failed notification with Try again | [ ] | |
| 8.5 | Quick add and lock-screen privacy | [ ] | |

### Phase 9: Quality (functional)

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 9.1 | Maths consistency | [ ] | |
| 9.2 | Basic accessibility | [ ] | |
| 9.3 | Full functional EVALS pass | [ ] | |
| 9.4 | Guardrail audit | [ ] | |

### Phase 10: Milestone M1

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 10.1 | Workable build | [ ] | |
| 10.2 | Handover to the design plan | [ ] | |

## Track B: design plan (the finished look)

### Phase D1: Foundations

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D1.1 | Baseline and branch | [ ] | |
| D1.2 | Tokens | [ ] | |
| D1.3 | Fonts and type styles | [ ] | |
| D1.4 | Theme provider visuals | [ ] | |
| D1.5 | Component gallery | [ ] | |

### Phase D2: Surfaces and controls

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D2.1 | Surfaces, cards, elevation | [ ] | |
| D2.2 | Buttons | [ ] | |
| D2.3 | Inputs | [ ] | |
| D2.4 | Chips, tags, badges | [ ] | |
| D2.5 | Segmented control, checkbox, switch | [ ] | |
| D2.6 | Icons and monograms | [ ] | |
| D2.7 | Brand assets | [ ] | |

### Phase D3: Shell

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D3.1 | Screen shell | [ ] | |
| D3.2 | Floating pod navigation | [ ] | |
| D3.3 | Top app bar | [ ] | |
| D3.4 | Dialog host visuals | [ ] | |
| D3.5 | Toast | [ ] | |

### Phase D4: Screens

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D4.1 | Splash | [ ] | |
| D4.2 | Onboarding | [ ] | |
| D4.3 | Home | [ ] | |
| D4.4 | Analytics | [ ] | |
| D4.5 | History | [ ] | |
| D4.6 | Settings | [ ] | |
| D4.7 | Needs confirming page | [ ] | |
| D4.8 | Scanner | [ ] | |

### Phase D5: Dialogs

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D5.1 | Payment dialogs | [ ] | |
| D5.2 | Result dialogs | [ ] | |
| D5.3 | Manage dialogs | [ ] | |
| D5.4 | Data dialogs | [ ] | |
| D5.5 | Pickers and permissions | [ ] | |

### Phase D6: Notifications and motion

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D6.1 | Notification visuals | [ ] | |
| D6.2 | Motion | [ ] | |

### Phase D7: Light-mode pass and QA

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| D7.1 | Light mode on every screen and dialog | [ ] | |
| D7.2 | Contrast fixes | [ ] | |
| D7.3 | Accessibility audit | [ ] | |
| D7.4 | Screenshot review | [ ] | |
| D7.5 | Design sign-off | [ ] | |

## Decisions

D1 to D12 are in `AI-RULES.md` section 4. Add new ones here with the date and who decided.

| Date | Decision | Decided by |
|---|---|---|
| 2026-10-16 | SCREENS_SPEC.md and build_plan.md will not exist. References removed. | owner |
| 2026-10-17 | Notification library is react-native-notify-kit 10.8.1 (expo-notifications not tested because notify-kit passed). | owner |
| 2026-10-18 | The `@/` alias points to `./src/*`; `tsconfig.json` `"@/*"` changed from `["./*"]` to `["./src/*"]`. No source imports `@/` yet, so nothing breaks. Jest resolves it via jest-expo `withTypescriptMapping`; Metro does not resolve tsconfig paths, so screens should use relative imports until `extraNodeModules` is added. | owner |

## Open questions (ask before guessing; defaults in brackets)

1. **Dark-mode text colours** (not in the design prose). [default: the design YAML values `#e2e2ea`, `#bdc8d1`, `#87929a`]
2. **Light-mode contrast:** primary button label is 4.1:1; amber, emerald and rose text fail on white. [default: use `#0369a1` for button fill or text and `#047857`, `#b45309`, `#be123c` for semantic text]
3. Onboarding **step 2 of 2** is not described. [default: optional monthly limit]
4. Profile picture (Steps 2.5, D-plan). [default: skip, show initials]
5. Top bar on Home, given the original Home design has none. [default: keep, without the sync dot]
6. Preferred UPI app ("Primary"). [default: no]
7. Pod nav labels ("micro JetBrains Mono numbers"). [default: labels in label-caps]
8. Limit slider (needs a dependency). [default: not now; use input and quick-step buttons]
9. Calendar upgrades (Step 5.8). [default: skip until asked]
10. Dialog radius and light-mode scrim (not in the design). [default: radius 16; scrim `rgba(15,23,42,0.45)`]
11. Notification library (Step 0.3) decided: react-native-notify-kit 10.8.1; expo-notifications not tested because notify-kit passed.
12. Android permission from react-native-notify-kit: INTERNET and SCHEDULE_EXACT_ALARM need a decision after the 0.3 phone test. [default: try blocking both in preview and production builds and re-test R8, R9 and R10; update the permissions section of GUARDRAILS.md with whatever is accepted; re-check the real permission list on the release build in Step 9.4]
13. Pay to a friend: some UPI apps block payments started by other apps with a pre-filled personal link (observed on device: valid-format ₹1 link declined by Google Pay, PhonePe and Navi with security message telling user to pay by number or QR inside the app). Fake payee and friend link (no payee ID) rejected or unusable in all three apps. Options: A = open the UPI app, user finishes there (default); B = send nothing to the UPI app, save pending, post notification, ask user to confirm; C = blocked — friend flow sends nothing to the UPI app per ARCHITECTURE.md §8. Owner decides before Step 4.1.

## Log

| Date | Track and step | What changed | Files |
|---|---|---|---|
| | | Project documents created | README, ARCHITECTURE, ARCHITECTURE-BUILD-PLAN, DESIGN-BUILD-PLAN, DESIGN, DESIGN-TOKENS, COPY, EVALS, GUARDRAILS, AI-RULES, BUILD-TODO, CLAUDE, AGENTS |
| 2026-10-16 | A 0.1 Confirm the baseline | Ran all Done-when checks; all pass | BUILD-TODO.md |
| 2026-10-16 | A 0.1 Confirm the baseline | Approved; marked [x]; current step moved to 0.2 | BUILD-TODO.md |
| 2026-10-16 | A 0.2 Make EAS builds work | Created eas.json, restored .npmrc, pinned engines to 20.19.4; all local checks pass; eas build cannot run here (no EAS project, no device) | eas.json, .npmrc, package.json, BUILD-TODO.md |
| 2026-10-16 | A 0.2 Make EAS builds work | Approved; marked [x]; current step moved to 0.3 | BUILD-TODO.md |
| 2026-10-16 | A 0.3 Notification library spike | Deferred by user ("not yet"); remains [ ] | BUILD-TODO.md |
| 2026-10-17 | A 0.3 Notification library spike | Approved; marked [x]; current step moved to 0.4 | app/index.tsx, app/_layout.tsx, src/notifications/spike.ts, eas.json, package.json, package-lock.json, BUILD-TODO.md |
| 2026-10-17 | A 0.3 Notification library spike | Correction: replaced phone placeholder `<my phone model and Android version>` with `<your phone model, Android version>` in the 0.3 evidence cell; added modules/upi-launcher manifest + Kotlin module + TS bridge + spike screen for step 0.4 (not yet device-tested) | BUILD-TODO.md, modules/upi-launcher/android/AndroidManifest.xml, modules/upi-launcher/android/src/main/java/com/trackpay/upi/UpiLauncherModule.kt, src/native/upiLauncher.ts, app/upi-spike.tsx |
| 2026-10-17 | A 0.4 UPI result spike | Module wired via Expo modules autolinking: scaffolded with `npx create-expo-module@latest --local --platform android`; moved existing Kotlin logic into Expo Modules API (`Module`, `ModuleDefinition`, `AsyncFunction`); added `<queries>` block to module `AndroidManifest.xml`; updated TS bridge to import from generated module; prebuild verified autolinking picks up module (local `android/` git-ignored, not committed); EAS dev build failed at :upi-launcher:compileDebugKotlin — Kotlin rewritten using real expo-modules-core imports (`Promise`, `Module`, `Module.ModuleDefinition`, `OnActivityResult`, `OnActivityResultPayload`); no new npm dependency, no engines/version changes; local compile not possible (no kotlinc, no gradle project) | modules/upi-launcher/expo-module.config.json, modules/upi-launcher/android/build.gradle, modules/upi-launcher/android/src/main/AndroidManifest.xml, modules/upi-launcher/android/src/main/java/com/trackpay/upilauncher/UpiLauncherModule.kt, modules/upi-launcher/src/UpiLauncherModule.ts, modules/upi-launcher/src/UpiLauncher.types.ts, src/native/upiLauncher.ts, app/upi-spike.tsx, BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | EAS dev build failure log: :upi-launcher:compileDebugKotlin failed on UpiLauncherModule.kt (unresolved AppArg, dsl, Promise, onActivityResult override). Rewrote module using real expo-modules-core API imports. Cannot compile locally (no kotlinc, no gradle project). Next: retry EAS dev build. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Kotlin fixes per build errors: moved `REQUEST_CODE_UPI` to file-level `private const val`; replaced `Module.ModuleDefinition` with `ModuleDefinition` (import `expo.modules.kotlin.modules.ModuleDefinition`, pattern from `node_modules/expo-haptics/.../HapticsModule.kt:28`); removed `Intent.FLAG_ACTIVITY_NEW_TASK` (not valid when requesting a result); extras returned as key=value pairs in result map. Still unsure: 2-param+Promise `AsyncFunction` overload resolution; app-killed process loses `pendingPromise` (no Expo API to survive process death for activity results); cannot compile locally (no kotlinc). | modules/upi-launcher/android/src/main/java/com/trackpay/upilauncher/UpiLauncherModule.kt, BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Fixed three `promise.reject(...)` calls with only 2 arguments: added third `cause: Throwable?` argument (null for NO_ACTIVITY and NO_CONTEXT, the caught exception `e` for OPEN_FAILED). Re-read full file: `AsyncFunction` overloads and `appContext.reactContext` usage look consistent with expo-modules-core API. Still unsure: 2-param+Promise `AsyncFunction` overload resolution; app-killed process loses `pendingPromise`; cannot compile locally (no kotlinc). | modules/upi-launcher/android/src/main/java/com/trackpay/upilauncher/UpiLauncherModule.kt, BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Manifest queries changed to scheme=upi host=pay; `listUpiApps` now runs the query twice (MATCH_DEFAULT_ONLY and 0 flags) and returns sdkInt, both counts, both app lists; screen shows raw JSON, counts, and app labels per probe. Still unsure: whether host="pay" matches the apps' intent filters; whether MATCH_DEFAULT_ONLY vs 0 flags makes a difference on this device; cannot compile locally (no kotlinc). | modules/upi-launcher/android/src/main/AndroidManifest.xml, modules/upi-launcher/android/src/main/java/com/trackpay/upilauncher/UpiLauncherModule.kt, modules/upi-launcher/src/UpiLauncher.types.ts, src/native/upiLauncher.ts, app/upi-spike.tsx, BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Recorded findings: valid-format ₹1 link to a personal payee was declined by <app name(s)> with a security message; behaviour in other apps <fill in>; likely meaning: some UPI apps block payments started by other apps with pre-filled personal links, matching ARCHITECTURE.md section 13 risk; implication for Open question 13 (Pay to a friend): Option A most workable, owner decides before Step 4.1; merchant (shop QR) case <tested / not tested> with result <fill in>; no real names, UPI IDs or amounts recorded; do not work around the block. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Added Open question 13 (Pay to a friend): some UPI apps block payments started by other apps with pre-filled personal links; Option A (open UPI app, user finishes there) most workable; owner decides before Step 4.1. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Recorded findings: valid-format ₹1 link to a personal payee declined by Google Pay, PhonePe and Navi with a security message telling the user to pay by number or QR inside the app; merchant (shop QR) case not yet tested (decode QR, paste link unchanged, do not pay, back out before PIN); likely meaning: some UPI apps block payments started by other apps with pre-filled personal links, matching ARCHITECTURE.md section 13 risk; implication for Open question 13: Option A most workable, owner decides before Step 4.1; no real names, UPI IDs or amounts recorded; do not work around the block. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Added Open question 13 (Pay to a friend): some UPI apps block payments started by other apps with pre-filled personal links; Option A (open UPI app, user finishes there) most workable; owner decides before Step 4.1. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Final findings: module finds installed UPI apps (Google Pay, PhonePe, Navi) once queries block declares scheme=upi host=pay and app is rebuilt; probe results <fill in the two counts from the screen>; personal-payee link (valid format, ₹1) declined with security message in all three apps; fake payee and friend link (no payee ID) rejected or unusable in all three apps; merchant case <result per app, or "not tested; deferred to Step 4.2">; focus returned after UPI app closes <yes/no>; raw result <empty / action+data / extras with keys ...>; result lost if app process killed so "Did it go through?" driven from pending rows in database (Step 4.5); Open question 13 options A/B/C default A; Free plan build quota ran out 2026-10-17, resets Nov 1, local builds with JDK 17 meanwhile. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Open question 13 updated with options A (open UPI app, user finishes there, default), B (send nothing to UPI app, save pending, notify user to confirm), C (blocked — friend flow sends nothing per ARCHITECTURE.md §8); owner decides before Step 4.1. | BUILD-TODO.md |
| 2026-10-17 | A 0.4 UPI result spike | Approved; marked [x]; current step moved to 0.5 | BUILD-TODO.md |
| 2026-10-17 | A 0.5 Rename to Track Pay | Verified: grep -ri vaultx src app.config.js → zero matches; app.json already "Track Pay"; android package already com.bkas.trackpay; no app.config.js exists; checks pass (tsc clean, lint:guardrails passed, npm test 1 passed). Done-when met. | BUILD-TODO.md |
| 2026-10-17 | A 0.5 Rename to Track Pay | Full-project grep -rni vaultx --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=android → only document hits (README.md:6, EVALS.md:177, AI-RULES.md:49, ARCHITECTURE-BUILD-PLAN.md:53); no user-visible VaultX strings in code, notification titles, channel names, or spike screens. grep -rni vaultx src app app.json modules → nothing (exit 1). npm run check passed: tsc clean, lint:guardrails passed, npm test 1 passed. Proposed document wording listed in writing; no documents edited. | BUILD-TODO.md |
| 2026-10-17 | A 0.5 Rename to Track Pay | Applied document edits: README.md line 6 → "The product is called Track Pay." AI-RULES.md D1 → "The old name VaultX no longer appears in code." ARCHITECTURE-BUILD-PLAN.md Step 0.5 Done-when → `grep -ri vaultx src app.json`. Marked [x]; current step moved to 1.1 | BUILD-TODO.md |
| 2026-10-18 | A 1.1 Semantic tokens | Read ARCHITECTURE-BUILD-PLAN.md Step 1.1, DESIGN-TOKENS.md, GUARDRAILS.md, tsconfig.json, package.json, scripts/check-guardrails.js, jest-expo and Metro alias handling. Recorded owner's `@/` alias decision; planned theme.ts, test and token values; no code written yet, awaiting approval. | BUILD-TODO.md |

| 2026-10-18 | A 1.1 Semantic tokens | Built src/ui/theme.ts (small set: canvas, card, interactive, border, primary, onPrimary, positive, caution, negative, text, textSecondary, textMuted, positiveTint, cautionTint, negativeTint) with TokenName-typed dark/light palettes; added src/ui/__tests__/theme.test.ts (palette completeness + hex-outside-theme scan excluding theme.ts and app/upi-spike.tsx); changed tsconfig "@/*" to "./src/*". Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails passed; npm test 4 passed (2 suites). Metro does not resolve tsconfig paths (no tsconfigPaths in app.json experiments or @expo/cli), so screens use relative imports. | BUILD-TODO.md |

| 2026-10-18 | A 1.2 Plain primitives | Housekeeping: light primary uses #0369a1 in Track A (owner's open-question-2 default from Step 1.1, not a Step 1.1 mistake; the test correctly asserts tokens.primary). Track B D7.2 will introduce primaryText and reconcile with DESIGN-TOKENS.md's #0284c7. primitives.test.tsx hex assertions will need updating in Track B D7.2 when PROPOSED primaryText tokens become real. Not a 1.2 gap. nvm is not installed in this environment; node -v is v20.19.4. The 'always nvm use' rule cannot run as written. Verify node -v each session instead. | BUILD-TODO.md |
| 2026-10-18 | A 1.1 Semantic tokens | The commit "Step A1.1: Semantic tokens" also contained Step 1.2 primitives, started before 1.1 was approved. Step 1.1 is now approved by the owner. | BUILD-TODO.md |
| 2026-10-18 | A 1.1 Semantic tokens | useTheme.ts contained JSX and was renamed to useTheme.tsx after CI failed. | BUILD-TODO.md |
| 2026-10-18 | A 1.2 Plain primitives | CI then failed on type errors in the committed primitives (palette names that do not exist, loose string types). Fixed in the commit "Step A1.2 WIP", which is NOT an approved step. | BUILD-TODO.md |
| 2026-10-18 | A 1.1 Semantic tokens | Correction: Metro resolves tsconfig paths by default (tsconfigPaths ?? true in expo/node_modules/@expo/cli/build/src/start/server/metro/instantiateMetro.js:209). The "known gap" in the 1.1 report was wrong. @/ imports are allowed; do not add extraNodeModules or metro.config.js. | BUILD-TODO.md |
| 2026-10-18 | A 1.2 | Plain primitives done and approved. PrimitivesDemo accepted as the screen for the Done-when (option a). Rename useTheme.ts -> useTheme.tsx approved. | BUILD-TODO.md |
| 2026-10-18 | A 1.3 Navigation structure | Marked [~]. Routes kept in root `app/` (Expo Router default); ARCHITECTURE.md §3 still says `src/app` — recorded as a pending doc fix, no route move. Scope agreed: 4 tabs + `pending` and `scanner` pages; splash/onboarding deferred to Phase 2 (2.2/2.4), full route list re-verified in Step 9.2. `app/upi-spike.tsx` removed; notification spike handler kept in `app/_layout.tsx` (Phase 8 re-test). `src/ui/TabBar.tsx` created (text labels, 44 px targets, tokens only, no icons, accessibility labels). `app/index.tsx` now redirects `/` → `/home` (root is a Stack so the top bar can push `/pending` from any tab in Phase 3). `src/ui/index.ts` exports `TabBar`; `theme.test.ts` hex-scan exclusion of `app/upi-spike.tsx` removed. | app/_layout.tsx, app/index.tsx, app/(tabs)/_layout.tsx, app/(tabs)/home.tsx, app/(tabs)/analytics.tsx, app/(tabs)/history.tsx, app/(tabs)/settings.tsx, app/pending.tsx, app/scanner.tsx, app/upi-spike.tsx (deleted), src/ui/TabBar.tsx, src/ui/index.ts, src/ui/__tests__/theme.test.ts, BUILD-TODO.md |
| 2026-10-18 | A 1.3 Navigation structure | Approved by the owner; marked [x]; current step moved to 1.4. Fix applied after the phone check: `app/index.tsx`'s `router.replace('/home')` inside `useEffect` threw "Attempted to navigate before mounting the Root Layout component". Replaced with the standard Expo Router pattern — `app/(tabs)/index.tsx` is now the Home screen, `app/index.tsx` deleted, and the tab `name="home"` renamed to `name="index"`. Phone check result: tabs switch, Back from `/pending` and `/scanner` returns to Home, hardware Back on tab screens behaves, mount error gone. Housekeeping: `app/spike.tsx` (the old notification spike screen) remains tracked and is deferred to Phase 3/4 cleanup; `src/notifications/spike.ts` is kept for the Phase 8 re-test. | BUILD-TODO.md |
| 2026-10-18 | A 1.4 Dialog host | Marked [~]. Verified the scrim token already on disk from a prior stopped session: present in `dark` (`rgba(6,9,14,0.78)`) and `light` (`rgba(15,23,42,0.45)`), in `TokenName` and `TOKEN_NAMES` (`src/ui/types.ts:18,36`). Correct, not re-added. Test-feasibility check: neither `@testing-library/react-native` nor `react-test-renderer` is a direct dependency, but `react-test-renderer` ships transitively via `jest-expo` and is already used by `primitives.test.tsx` — so render-output tests only, no interaction. Built: `src/ui/Dialog.tsx`, `src/ui/DialogHost.tsx`, `src/ui/DialogProvider.tsx`; wrapped `<Stack>` in `<DialogProvider>` inside `<ThemeProvider>` in `app/_layout.tsx`; exported `Dialog`, `DialogHost`, `DialogProvider`, `useDialog`, `DialogOptions`, `DialogProps` from `src/ui/index.ts`; dev trigger in `app/(tabs)/index.tsx` behind `__DEV__`. Fixed mid-build: `DialogHost.tsx` referenced `useEffect` after its import was trimmed (re-added then removed the dead no-op); `Modal animationType={false}` is a type error — `ModalProps.animationType` is `"none"|"slide"|"fade"|undefined`, so it is `animationType="none"` (the Track A "no animation" value, not a boolean); `src/ui/index.ts` had no token re-exports so the test's `dark`/`light`/`TOKEN_NAMES` imports failed — added. Tests: `src/ui/__tests__/dialog.test.tsx`, 11 tests. Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails "Guardrail check passed."; npm test 19 passed (4 suites). Grep checks: `@/` empty; hex outside theme.ts → test assertions only (`primitives.test.tsx:40,45`); domain/data/stores import grep empty. Device check not run. | src/ui/Dialog.tsx, src/ui/DialogHost.tsx, src/ui/DialogProvider.tsx, src/ui/index.ts, src/ui/__tests__/dialog.test.tsx, app/_layout.tsx, app/(tabs)/index.tsx, src/ui/theme.ts, src/ui/types.ts, BUILD-TODO.md |
| 2026-10-18 | A 1.4 Dialog host | Addition before the phone test. The dev dialog had no text field, so the Done-when clause "with the keyboard open" was untestable — the soft keyboard can only open with a text input inside the dialog. Added a `DevTextField` (`Field` wrapping `TextInput`, local `useState`) to the dev dialog's `children` in `app/(tabs)/index.tsx`; title, subtitle and primary action kept; `__DEV__` gate kept; this is dev-harness only, not Phase 4 content. Close button touch target: `grep` showed 36 px with no `hitSlop` (`src/ui/Dialog.tsx:148-149`), so added `hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}` → 44 px effective (AI-RULES.md §6.6). Added a test asserting the `×` glyph renders when open. Test count: 13 in `dialog.test.tsx`, 20 total across 4 suites (report said 11/19 — the requested "12" would have been wrong either way, since the new field test plus the close-button test is two additions). Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails "Guardrail check passed."; npm test 20 passed (4 suites); `npx jest src/ui/__tests__/dialog.test.tsx --verbose` → 13 passed. 1.4 still `[~]`, not marked done. | app/(tabs)/index.tsx, src/ui/Dialog.tsx, src/ui/__tests__/dialog.test.tsx, BUILD-TODO.md |
| 2026-10-18 | A 1.4 Dialog host | Keyboard-avoidance fix only, after the owner's device check. Owner reported: dialog centres, tap-outside dismiss, close button, hardware Back and both themes all work, but the primary action ("OK") is hidden behind the keyboard when it opens — the `Keyboard.addListener('keyboardDidShow', scrollToTop)` only scrolled the ScrollView, it never resized the dialog area, so a bottom-anchored button was unreachable. Replaced it with `KeyboardAvoidingView` wrapping the whole Modal content: `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}`, `style={{flex:1}}`, `keyboardVerticalOffset={0}`; backdrop `Pressable` and `ScrollView` moved inside it; removed the manual `Keyboard` listener and the now-unused `scrollRef`; kept the `hardwareBackPress` listener and its cleanup; `ScrollView.contentContainerStyle` changed to `{padding:24, flexGrow:1, justifyContent:'center', alignItems:'center'}` so the dialog centres above the keyboard and scrolls when too tall. No visual style, token, close-button or scrim change. Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails "Guardrail check passed."; npm test 20 passed (4 suites); `npx jest src/ui/__tests__/dialog.test.tsx --verbose` → 13 passed. 1.4 still `[~]`. | src/ui/Dialog.tsx, BUILD-TODO.md |
| 2026-10-18 | A 1.4 Dialog host | One-line dev-harness fix after the owner's second device check. Owner reported keyboard avoidance now works, but tapping "OK" in the dev dialog did nothing. Root cause was in the dev trigger, not `Dialog.tsx`: `app/(tabs)/index.tsx` destructured only `const { open } = useDialog()` and passed `primaryAction={<Button variant="primary" onPress={() => {}}>OK</Button>}` — an empty handler. Changed to `const { open, close } = useDialog()` and `onPress={close}`. `close` is confirmed exported by `useDialog()` (`DialogProvider.tsx:29` in the `DialogContextValue` interface, `:54` in the memoised value, `:70` in the hook; re-exported via `src/ui/index.ts:24`). No other file needed changing. Checks: node v20.19.4; tsc --noEmit clean; lint:guardrails "Guardrail check passed."; npm test 20 passed (4 suites). 1.4 still `[~]`. | app/(tabs)/index.tsx, BUILD-TODO.md |
| 2026-10-18 | A 1.4 Dialog host | Approved by the owner; marked [x]; current step moved to 1.5. Step 1.4 done. DialogHost mounted in DialogProvider. Dev dialog on Home with Field + `__DEV__` gate. Device-verified by the owner: dialog centred with the tab bar behind, keyboard-open dialog rides above the keyboard, OK closes the dialog, tap outside closes, close button closes, hardware Back closes, scrim correct in Dark and Light. Test count 12. | BUILD-TODO.md |
