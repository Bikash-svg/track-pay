# Build To-Do

The live checklist. The AI model updates this file after every step (`AI-RULES.md` section 5). Track A steps are in `ARCHITECTURE-BUILD-PLAN.md`. Track B steps are in Part B of `DESIGN-BUILD-PLAN.md`. **Finish Track A (milestone M1, approved) before starting Track B.**

**Current step, Track A:** 0.4 UPI result spike

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
| 0.3 | Notification library spike | [~] | Decision: react-native-notify-kit 10.8.1 is the notification library (expo-notifications not tested because notify-kit passed). Evidence: R6 pass, R7 pass, R10 pass (app swiped away, not force-stopped), tested on <my phone model and Android version> with a development build, cable and laptop server running. R8, R9 and P11: not run. Checks: npm run check → expo install --check up to date; tsc --noEmit clean; lint:guardrails passed; npm test 1 passed. Installed expo-dev-client via npx expo install; added development profile to eas.json. Spike: app/index.tsx (three buttons), app/_layout.tsx (registers handler), src/notifications/spike.ts (channel, actions, background handler). git status: uncommitted. |
| 0.4 | UPI result spike | [ ] | |
| 0.5 | Rename to Track Pay | [ ] | |

### Phase 1: Plain foundation

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 1.1 | Semantic tokens | [ ] | |
| 1.2 | Plain primitives | [ ] | |
| 1.3 | Navigation structure | [ ] | |
| 1.4 | Dialog host | [ ] | |
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

## Log

| Date | Track and step | What changed | Files |
|---|---|---|---|
| | | Project documents created | README, ARCHITECTURE, ARCHITECTURE-BUILD-PLAN, DESIGN-BUILD-PLAN, DESIGN, DESIGN-TOKENS, COPY, EVALS, GUARDRAILS, AI-RULES, BUILD-TODO, CLAUDE, AGENTS |
| 2026-10-16 | A 0.1 Confirm the baseline | Ran all Done-when checks; all pass | BUILD-TODO.md |
| 2026-10-16 | A 0.1 Confirm the baseline | Approved; marked [x]; current step moved to 0.2 | BUILD-TODO.md |
| 2026-10-16 | A 0.2 Make EAS builds work | Created eas.json, restored .npmrc, pinned engines to 20.19.4; all local checks pass; eas build cannot run here (no EAS project, no device) | eas.json, .npmrc, package.json, BUILD-TODO.md |
| 2026-10-16 | A 0.2 Make EAS builds work | Approved; marked [x]; current step moved to 0.3 | BUILD-TODO.md |
| 2026-10-16 | A 0.3 Notification library spike | Deferred by user ("not yet"); remains [ ] | BUILD-TODO.md |
| 2026-10-17 | A 0.3 Notification library spike | react-native-notify-kit 10.8.1 chosen; expo-dev-client installed; development eas.json profile added; spike screen + background handler written; R6/R7/R10 passed on real phone (app swiped away), R8/R9/P11 not run | app/index.tsx, app/_layout.tsx, src/notifications/spike.ts, eas.json, package.json, package-lock.json, BUILD-TODO.md |
