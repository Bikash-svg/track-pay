# Track Pay

A private, on-device expense tracker for Android. You pay in any UPI app, then share the success screenshot to Track Pay. It reads the screenshot on your phone, records the payment, lets you check it, reminds you to log payments, and shows where your money goes. It never starts a payment.

> **Status:** the plan was reset on 2026-10-25 after the move from "pay through the app" to "share the screenshot". Progress is tracked in `BUILD-TODO.md`, which starts with a scope lock and a cleanup step.
> **Name:** The product is called "Track Pay".

## Why screenshots

GPay and PhonePe decline pre-filled `upi://pay` links from other apps, so paying through Track Pay does not work. Instead you pay in your own UPI app, and Track Pay records what happened.

## What it does

- **Splash and onboarding.** A short splash while the local data loads, then an optional two-step welcome where you enter your name (skippable).
- **Add a payment.** Three ways: share a success screenshot from your UPI app, pick screenshots from your gallery (several at once), or add one by hand. Google ML Kit reads the screenshot on the phone. Failed, pending, unreadable and duplicate screenshots are refused. The image is never stored.
- **Check it.** A payment read from a screenshot is saved as "Not verified" and shown with Looks right, Edit and Undo.
- **Notifications.** A receipt notification after each screenshot (Looks right, Edit, Undo); daily log reminders (four a day by default, you choose 1 to 6); limit alerts at 80% and 100% (always on while a limit is set); a monthly reminder to export your data.
- **Home.** Month card with a limit gauge, quick access (Add from screenshot, Add manually), a glance at this month, and recent payments.
- **Analytics.** Pace and month-end estimate, comparison with last month, spending trajectory, category split, weekday pattern, top payees and a calendar.
- **History.** Payments by month with search, a Not verified filter and a PDF statement.
- **Settings.** Profile, theme (Dark "Obsidian", Light "Alabaster", Auto), monthly limit, reminders, export, import.

## What it does not do

It does **not** start or launch a payment, scan QR codes, read SMS or other apps' notifications, watch your gallery in the background, see payments made directly inside a UPI app, handle collect requests, send WhatsApp messages, use voice search, claim "live sync" or routing guarantees, store your screenshots, or use any network or account. The INTERNET permission is removed. Everything stays on the phone. The full list is in `GUARDRAILS.md` section 11.

## Tech

React Native with Expo SDK 54 (development build, not Expo Go), TypeScript, Android only. Expo Router, Zustand, expo-sqlite, local notifications (library chosen in Step 0.3), Google ML Kit text recognition (bundled model, through `rn-mlkit-ocr`), `expo-share-intent`, `expo-document-picker`, react-native-svg, expo-linear-gradient, Plus Jakarta Sans and JetBrains Mono.

## Two plans, built in order

1. **Project plan** (`ARCHITECTURE-BUILD-PLAN.md`): builds a **working app with a plain look**. Ends at milestone M1.
2. **Design plan** (Part B of `DESIGN-BUILD-PLAN.md`): turns the working app into the finished design (Obsidian dark, Alabaster light). Ends at milestone M2. It starts only after M1 is approved and never changes app logic.

## Documents (read in this order)

| File | What it is |
|---|---|
| `AI-RULES.md` | How an AI model must work on this project. Read first. |
| `BUILD-TODO.md` | The live checklist for both plans. The AI keeps it up to date. |
| `GUARDRAILS.md` | Rules that must never be broken. Wins over everything. |
| `ARCHITECTURE.md` | How the code is organised, data model, flows, formulas. |
| `ARCHITECTURE-BUILD-PLAN.md` | **Project plan**: functional steps, one feature at a time. |
| `DESIGN-BUILD-PLAN.md` | **Design system (Part A) and design plan (Part B).** |
| `DESIGN-TOKENS.md` | Every colour and size for both themes, with contrast measurements. |
| `DESIGN.md` | Screens, dialogs, notifications: structure, copy, behaviour. No visual values. |
| `COPY.md` | All text in the app. |
| `EVALS.md` | Test cases that decide whether a feature works. |
| `CLAUDE.md`, `AGENTS.md` | Short files that point AI tools to `AI-RULES.md`. |

## Getting started

```bash
npm ci                       # install exactly what the lock file says
npx expo install --check     # must report nothing to change
npm run lint:guardrails      # must pass
npm test                     # must pass
```

Config files in the project root: `.nvmrc` (Node 20.19.4), `.npmrc`, `.prettierrc`, `.github/workflows/ci.yml`. Add the `engines` line from `package.json.engines.txt`.

Run on a phone: `npx expo start --dev-client` after installing a development build (`eas build -p android --profile development`). Screenshot sharing, OCR and notifications need that build; Expo Go cannot run them.

Dependency rule: add Expo packages only with `npx expo install <name>`, never plain `npm install <name>`. After any dependency change run `npm ci --dry-run` and commit `package.json` and `package-lock.json` together. This avoids the EAS install failure the project hit earlier.

## Building with an AI model

Give the model `AI-RULES.md` first (tools that read `CLAUDE.md` or `AGENTS.md` find it automatically). It works from `BUILD-TODO.md`, obeys the scope lock at the top of that file, does one step at a time, proves each step with the checks in the plan, edits no other `.md` file, and stops for your approval between steps. It builds the working app first, then the design.

## Decisions already made

See `AI-RULES.md` section 4 and `BUILD-TODO.md` "Decisions". Open questions are at the bottom of `BUILD-TODO.md`; the AI must ask you before guessing any of them.