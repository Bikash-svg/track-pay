# AI Rules for Building Track Pay

You are an AI model building this app for one person. Follow these rules exactly. If a rule and a request conflict, say so and ask. These rules apply to every session.

## Working rules (strict, every step)

- Run the step's "Done when" commands and show the real output, including `git status`.
- Edit only the files the current step names, plus `BUILD-TODO.md`.
- Mark the current step `[~]` and add evidence and a log line. Never mark `[x]`. Only the owner does that, after approving.
- Do not commit or push. The owner commits.
- Do not add dependencies, permissions or files the step does not list. Ask first.
- Do not raise questions already answered in the Decisions table in `BUILD-TODO.md`.
- After each step, end with the section 8 report, then stop and wait for approval. Do not start the next step until the owner says so.
- Do not touch the engines in the package.json

## 1. Read before you do anything (every session)

Read in this order: `AI-RULES.md` (this file), `BUILD-TODO.md`, `GUARDRAILS.md`, then the files the current step names. Say which step you are on before you write code.

## 2. Two separate plans, done in order

| Plan | File | Produces | Rule |
|---|---|---|---|
| **A. Project plan** | `ARCHITECTURE-BUILD-PLAN.md` | A **working app with a plain look** (milestone M1) | Function only. No design work. |
| **B. Design plan** | `DESIGN-BUILD-PLAN.md`, Part B | The finished look (milestone M2) | Visual files only. No logic changes. |

1. **Finish plan A first.** Do not start plan B until the person has approved M1.
2. In plan A, never style beyond the plain look. Use the UI contract in the plan.
3. In plan B, change only `src/ui/**`, `theme.ts`, assets, fonts, and style or layout code in screens. Never change `src/domain`, `src/data`, `src/stores`, notification scheduling or the native module.
4. If a design step needs a logic change, or a project step needs a visual decision, **stop, add a step to the right plan, and ask**.

## 3. The work loop (one step at a time)

1. Open `BUILD-TODO.md`. The current step is the first step in the active track that is not done. Never skip ahead and never work on two steps at once.
2. Read the step and every spec it names.
3. **Check whether the project already has it.** Much of plan A is already built. If so, verify it against "Done when", fix only the gaps, and record the evidence. Do not rewrite working code.
4. If anything is unclear or listed under Open questions, **stop and ask** (section 9).
5. Mark the step `[~]`.
6. For logic, write the tests first and show them failing.
7. Build only what the step says. No extras, no refactors outside the step, no renames.
8. Run the checks (section 7). Fix failures before going on.
9. Run the device check the step lists. In plan B also check **both themes**. If you cannot run a device check, say so; do not mark it passed.
10. Update `BUILD-TODO.md` (section 5), then **stop and report** (section 8). Wait for approval.

## 4. Decisions already made (do not reopen)

| # | Decision |
|---|---|
| D1 | The product is called **Track Pay**. Code says VaultX until Step 0.5. |
| D2 | Visual system = `DESIGN-BUILD-PLAN.md` Part A, with the prose colours winning over the YAML colours, as resolved in Part B section B1. Token values are in `DESIGN-TOKENS.md`. |
| D3 | Screens, copy and dialog contents = `DESIGN.md` and `COPY.md`. They give structure and text only; their colours, fonts and radii are not used. |
| D4 | Dark (Obsidian) is the default. Light (Alabaster) and Auto are required. |
| D5 | Android only, React Native with Expo SDK 54. No Tailwind, no web view, no iOS work. |
| D6 | In scope beyond the core: splash, onboarding (name, optional photo), top bar without a sync dot. |
| D7 | **Never build:** SMS or notification reading, collect requests (Authorize, Decline), WhatsApp nudges, mandates, voice search, "UPI failover SLA" or routing claims, "live sync", biometric badge, accounts, servers, analytics. |
| D8 | "Try again" creates a **new** payment. The failed one stays as history. |
| D9 | UPI apps appear as text monograms, not brand logos. |
| D10 | Money is integer paise. Estimates are labelled "estimate". |
| D11 | Failed payments are not counted. Done and Pending are counted, pending marked. |
| D12 | Plan A uses a plain look through the UI contract; plan B replaces it. |

## 5. Keeping `BUILD-TODO.md` up to date

- Statuses: `[ ]` not started, `[~]` in progress, `[x]` done and approved, `[!]` blocked, `[-]` skipped (write the reason).
- A step becomes `[x]` **only** when every "Done when" line is true **and** the person approved it. Write evidence: commands run with results, test names, device and Android version, screenshot file names.
- Update **Current step** for both tracks, the **Log** and any new **Decisions**, **Blockers** or **Open questions** every time.
- Never delete history. Corrections are new log lines.
- If you find work the plans do not cover, **add a step** to the right plan and the todo list and ask before doing it.

## 6. Follow the specs exactly

1. **Tokens only.** Every colour, size, radius, font and shadow comes from `theme.ts`. No hex value or magic number in screens. Both themes must work.
2. **Copy is exact.** Use `COPY.md`. Do not reword.
3. **Numbers** go through the `Money` component (mono font once plan B has run).
4. **If the spec is silent, ask.** Do not invent a colour, value, message or behaviour. Write proposals as questions with your default.
5. **No decorative extras.**
6. **Accessibility is part of done:** 44 px targets, labels on icon buttons, status never by colour alone, reduce motion respected; contrast 4.5:1 is checked in plan B (D7.2).
7. **Estimates** use the formulas in `ARCHITECTURE.md` section 7 and are labelled "estimate".

## 7. Checks (run before every report)

```bash
npx tsc --noEmit
npm run lint:guardrails
npm test
```

After any dependency change also:

```bash
npx expo install --check        # must report nothing
npm ci --dry-run --include=dev  # must pass
```

Report the real output. Never write "tests pass" without running them.

## 8. Report format (end of every step)

```
Track and step: <A or B, id and name>
Status: done / blocked / needs your decision
What changed: <files and what>
Checks: tsc <result>, guardrails <result>, tests <n passed>
Visual check (plan B): dark <ok/issue>, light <ok/issue>, screenshots <names>
Device check: <what was run, on what phone> or "not run: <why>"
Already existed: <what was verified, not rewritten>
Known gaps: <list or none>
Next step: <id and name>, waiting for your approval
```

## 9. When to stop and ask

Ask, with two or three concrete options and your recommended default, when:
- the spec is silent, or two specs disagree and this file does not say which wins;
- a step needs a new dependency, permission, colour, setting or database change that the plan does not list;
- something would touch `GUARDRAILS.md`, `EVALS.md` (weakening), the payment state rules, or the lock file in a way the step does not describe;
- a check fails and the fix would change the spec;
- you cannot verify something on a device;
- a plan B step needs a logic change.

Do not ask about things the documents already answer. One question at a time when one will do.

## 10. Code rules

1. `src/domain` is pure TypeScript with no React or platform imports, and has tests. Tests come first.
2. Only `src/data` touches storage. Every schema or settings change has a numbered migration and a test.
3. A payment's status changes only because the user chose it. A UPI result is a hint.
4. No network calls, analytics, crash reporters or remote config. No SMS, contacts or notification-listener access.
5. Never log payee names, UPI IDs, amounts or notes.
6. Notification and native code stays in `src/notifications`, `src/native` and `modules/upi-launcher`, with no business rules.
7. Small, focused files. Match the surrounding style (`.prettierrc`). TypeScript strict stays on. No `any` to silence an error.

## 11. Dependencies and git

1. Add Expo packages only with `npx expo install <name>`. Never plain `npm install <name>` for Expo packages: it installs the newest version for a different SDK and breaks EAS installs.
2. Ask before adding any dependency.
3. After a dependency change commit `package.json` and `package-lock.json` together and run `npm ci --dry-run --include=dev`.
4. One commit per finished step: `Step <A or B><id>: <short description>`. Never commit a step that failed its checks.
5. Never commit secrets, keystores or `.env` files.
6. Node version is pinned (`.nvmrc`, `eas.json`). Do not change it without asking.

## 12. Files that need explicit approval to change

`GUARDRAILS.md`, `EVALS.md` (adding cases is fine; weakening or removing is not), `src/domain/paymentState.ts` rules, `scripts/check-guardrails.js`, `eas.json`, `app.config.js` permissions, the lock file, and the design documents (`DESIGN-BUILD-PLAN.md`, `DESIGN-TOKENS.md`, `DESIGN.md`, `COPY.md`). Propose the change and wait.

## 13. Honesty

- Say what you did not run, did not test, or are unsure about.
- Never mark a device check passed unless it was run on a real phone.
- Never claim reliability the app cannot have: it records payments the user starts or adds; it cannot see payments made elsewhere.
- If you make a mistake, say so, fix it and log it.
