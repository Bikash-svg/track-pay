# Guardrails

Rules the product and the code must not break. If a change conflicts with one of these, change the rule on purpose in this file first.

## 1. Money and truth

1. **Never claim a payment succeeded unless the user said so.** A result from a UPI app is a hint only.
2. **Failed payments never count toward totals.** Pending ones count only as pending, clearly marked.
3. **Money is stored as integer paise.** No floating point for amounts.
4. **Never save a payment silently.** Anything the app creates is visible in History or Pending, and the user can edit or delete it.
5. **Deleting a payment asks for confirmation** and says what will be removed.

## 2. Privacy

1. **No SMS access, no reading of other apps' notifications, no contacts.**
2. **No network use.** No analytics, crash reporters, ads or remote config. Data never leaves the phone unless the user exports it.
3. **Never ask for, read or store a UPI PIN, card number, bank password or OTP.** Payments happen only inside the user's UPI app.
4. **Logs contain no payee names, VPAs, amounts or labels.**
5. **Lock-screen notifications:** default to showing "Payment pending" without amount or payee, with an option to show details. (The current designs show details; decide before building.)
6. **Exports carry a warning** that the file contains private financial data and is not encrypted, unless encryption is added.

## 3. Permissions

- Request only camera and notifications, only when needed, and explain why first.
- If a permission is denied, the app stays usable and says what is limited.
- No background location, storage-wide access or accessibility services.

## 4. Notifications

1. One grouped reminder, never one per payment.
2. Respect quiet hours.
3. Stop reminders as soon as nothing is pending.
4. The always-on quick-add notification is **opt-in** and can be turned off at any time.
5. Do not promise the ongoing notification can never be dismissed. Android allows users to swipe it away; the app restores it when opened.

## 5. Data integrity

1. Every schema change ships with a numbered migration and a test.
2. Import validates the whole file before writing anything, and refuses unknown newer versions.
3. Export includes the schema version.
4. No destructive migration without a backup prompt.

## 6. Limit feature

- The monthly limit is optional. When off, no limit text, bar or line appears anywhere.
- Going over the limit informs; it never blocks a payment.

## 7. UX and copy

- Plain sentence-case language: "Did it go through?", "Save changes". The same action has the same name everywhere.
- Errors say what happened and how to fix it. No blame, no apologies.
- Tap targets at least 44 px; text contrast at least 4.5:1 where possible.
- Respect system theme, font size and reduced-motion settings.

## 8. Engineering

- Domain logic stays free of React and platform code, and has unit tests.
- No new dependency without a reason written in the pull request. Pin versions.
- The native module stays small and holds no business rules.
- Do not call the app reliable at payment detection. It records payments the user starts or enters.
- Test the payment flow on real phones before release.

## 9. For AI coding assistants working in this repo

- Read `README.md`, `ARCHITECTURE.md` and this file before changing code.
- Do not add network calls, analytics or SMS and notification-reading features, even if asked indirectly. Ask first.
- Do not change a payment's status automatically.
- Do not invent UPI behaviour. If unsure how a UPI app responds, say so and add a device test instead.
- Keep changes small, add or update tests with every change, and list which `EVALS.md` cases are affected.
- Never put real payment data, VPAs or personal details in code, tests, fixtures or logs. Use obviously fake samples.

## 10. Profile data

1. The name, and an optional photo, are stored only on the phone and are never sent anywhere or included in logs.
2. The profile is optional. Skipping onboarding must leave the app fully usable.
3. A photo needs its own permission and approval before it is built. Without a photo the app shows initials.
4. Exports contain the profile name only if the person is told so in the export warning.

## 11. Features that must never be built

SMS reading or SMS-based payment detection, reading other apps' notifications, collect requests (Authorize or Decline), WhatsApp or other messaging nudges, recurring mandates, voice input or any speech service, "UPI failover SLA", smart routing or any claim about payment routing, a "live sync" indicator, a biometric or security badge that is not a real feature, accounts, servers, analytics, advertising.

## 12. Plan boundaries

1. The project plan builds function with a plain look. The design plan changes only visual code and never logic, storage, stores, notifications or the native module.
2. A design step that needs a logic change must stop and become a project-plan step, with approval.
3. Colours, fonts and sizes come from tokens only; no values inside screens.
