# Track Pay

A private, on-device expense tracker for Android. You pay with your own UPI app, and Track Pay records the payment, asks you to confirm how it went, reminds you about anything unconfirmed, and shows where your money goes.

> **Status:** documents are in place; the build follows the two plans in order. Progress is tracked in `BUILD-TODO.md`.
> **Name:** The product is called "Track Pay". The code and some old documents still say "VaultX". Step 0.5 renames it.

## What it does

- **Splash and onboarding.** A short splash while the local data loads, then an optional two-step welcome where you enter your name (skippable). Greetings use your name.
- **Pay and record.** Scan a UPI QR (shop name and amount pre-filled) or use "Pay to a friend", pick one of the UPI apps installed on your phone, pay there, come back, and say how it went.
- **Confirm, and retry.** After paying you answer "Did it go through?". If it failed, you can **try again** with the same details. Anything you don't answer stays pending.
- **Reminders.** One grouped reminder an hour while payments are pending, paused overnight. Buttons on the notification let you mark Done or Failed and name the payment.
- **Home.** Monthly outflow with a limit gauge, daily pace, a pending banner, quick actions and recent payments.
- **Analytics.** Pace and month-end estimate, comparison with last month, spending trajectory, category split, weekday pattern, top payees and a calendar.
- **History.** Payments by month with search and filters, plus a PDF statement.
- **Settings.** Profile, theme (Dark "Obsidian", Light "Alabaster", Auto), monthly limit, UPI apps, reminders, quick-add notification, export, import.

## What it does not do

It does **not** read SMS or other apps' notifications, see payments made directly inside a UPI app, handle collect requests, send WhatsApp messages, use voice search, claim "live sync" or routing guarantees, move money, or use any network or account. Everything stays on the phone. The full list is in `GUARDRAILS.md` and `AI-RULES.md`.

## Tech

React Native with Expo SDK 54 (development build, not Expo Go), TypeScript, Android only. Expo Router, Zustand, expo-sqlite, local notifications (library chosen in Step 0.3), expo-camera, a small Kotlin module for the UPI chooser, react-native-svg, expo-linear-gradient, Plus Jakarta Sans and JetBrains Mono.

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

Run on a phone: `npx expo start --dev-client` after installing a development build (`eas build -p android --profile development`). Payments, notifications and the UPI chooser need that build; Expo Go cannot run them.

Dependency rule: add Expo packages only with `npx expo install <name>`, never plain `npm install <name>`. After any dependency change run `npm ci --dry-run` and commit `package.json` and `package-lock.json` together. This avoids the EAS install failure the project hit earlier.

## Building with an AI model

Give the model `AI-RULES.md` first (tools that read `CLAUDE.md` or `AGENTS.md` find it automatically). It works from `BUILD-TODO.md`, does one step at a time, proves each step with the checks in the plan, and stops for your approval between steps. It builds the working app first, then the design.

## Decisions already made

See `AI-RULES.md` section 3 and `BUILD-TODO.md` "Decisions". Open questions are at the bottom of `BUILD-TODO.md`; the AI must ask you before guessing any of them.
