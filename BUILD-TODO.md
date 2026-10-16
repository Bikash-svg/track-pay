# Build To-Do

The live checklist. The AI model updates this file after every step (`AI-RULES.md` section 5). Track A steps are in `ARCHITECTURE-BUILD-PLAN.md`. Track B steps are in Part B of `DESIGN-BUILD-PLAN.md`. **Finish Track A (milestone M1, approved) before starting Track B.**

**Current step, Track A:** 0.1 Confirm the baseline

**Current step, Track B:** not started (waits for M1)

**Legend:** `[ ]` not started, `[~]` in progress, `[x]` done and approved, `[!]` blocked, `[-]` skipped (reason in notes).

**Note for Track A:** much of this already exists in the code. Verify first, fix gaps, record evidence. Do not rewrite working code.

## Blockers

- Step 0.2: the last EAS build failed at `npm ci` (lock file out of sync). Fix: `npx expo install --fix`, regenerate the lock with npm 10, pin Node 20.19.4, commit, rebuild.

## Track A: project plan (a working app, plain look)

### Phase 0: Baseline

| ID | Step | Status | Evidence / notes |
|---|---|---|---|
| 0.1 | Confirm the baseline | [ ] | |
| 0.2 | Make EAS builds work | [ ] | |
| 0.3 | Notification library spike | [ ] | |
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
| | | |

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
11. Notification library (Step 0.3) is decided by the spike. [default: react-native-notify-kit, fallback expo-notifications]

## Log

| Date | Track and step | What changed | Files |
|---|---|---|---|
| | | Project documents created | README, ARCHITECTURE, ARCHITECTURE-BUILD-PLAN, DESIGN-BUILD-PLAN, DESIGN, DESIGN-TOKENS, COPY, EVALS, GUARDRAILS, AI-RULES, BUILD-TODO, CLAUDE, AGENTS |
