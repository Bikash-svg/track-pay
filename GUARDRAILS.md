# Guardrails

Rules the product and the code must not break. If a change conflicts with one of these, change the rule on purpose in this file first.

## 1. Money and truth

1. **Never invent a payment.** A payment exists only because the user shared a screenshot of it, picked one from the gallery, or typed it in. OCR output is a reading, not a fact: the user can always verify, edit or undo it.
2. **Failed payments never count toward totals.** No flow creates Pending or Failed payments, and a screenshot of a failed or pending payment is refused.
3. **Money is stored as integer paise.** No floating point for amounts.
4. **Never save a payment silently.** A payment read from a screenshot is saved at once, but the user is shown it straight away (the result screen, and the receipt notification) with Looks right, Edit and Undo. It carries a "Not verified" marker until the user verifies or edits it, and it appears in History. Nothing is ever saved unless the user sent the screenshot or typed the payment.
5. **Deleting a payment asks for confirmation** and says what will be removed.

## 2. Privacy

1. **No SMS access, no reading of other apps' notifications, no contacts.**
2. **No network use.** No analytics, crash reporters, ads or remote config. Data never leaves the phone unless the user exports it. The INTERNET permission is stripped from the manifest (Path B, decided 2026-10-22). ML Kit runs with the bundled model, so reading a screenshot works in airplane mode.
3. **Never ask for, read or store a UPI PIN, card number, bank password or OTP.** Payments happen only inside the user's UPI app.
4. **Logs contain no payee names, VPAs, amounts or labels.**
5. **Lock-screen notifications:** default to a generic line such as "Payment added from screenshot", without amount or payee, with an option to show details.
6. **Exports carry a warning** that the file contains private financial data and is not encrypted, unless encryption is added.
7. **Screenshots are never stored.** The image is read once and any cached copy is deleted straight after. Only the extracted fields are kept.
8. **OCR text and parsed fields are never logged.**

## 3. Permissions

- Request only notifications, only when needed, and explain why first. No camera. Screenshots arrive through the Android share sheet or the system file picker, which need no permission. Do not request storage or media access.
- If a permission is denied, the app stays usable and says what is limited.
- No background location, storage-wide access or accessibility services.

## 4. Notifications

1. Daily log reminders fire only at the times the user set (four a day by default). A batch import posts one grouped receipt notification, never one per screenshot.
2. Respect quiet hours.
3. A daily log reminder is skipped if the user logged a payment, or tapped No payments, since the previous reminder.
4. Daily log reminders and the backup reminder can be turned off at any time. **Limit alerts are always on inside the app**, but only when a monthly limit is set. Android lets the user block any notification channel in system settings; the app cannot prevent that and must not claim it can.
5. Receipt notifications and limit alerts show only generic text on the lock screen unless the user turned on details.

## 5. Data integrity

1. Every schema change ships with a numbered migration and a test.
2. Import validates the whole file before writing anything, and refuses unknown newer versions.
3. Export includes the schema version.
4. No destructive migration without a backup prompt.
5. Moving payments from AsyncStorage to SQLite (Step 4-C.1) needs a numbered migration, a test, and a backup prompt if anything could be lost.

## 6. Limit feature

- The monthly limit is optional. When off, no limit text, bar, line or limit alert appears anywhere.
- Going over the limit informs; it never blocks anything. Limit alerts at 80% and 100% fire once per month for each threshold.

## 7. UX and copy

- Plain sentence-case language: "Looks right", "Save changes". The same action has the same name everywhere.
- Errors say what happened and how to fix it. No blame, no apologies.
- Tap targets at least 44 px; text contrast at least 4.5:1 where possible.
- Respect system theme, font size and reduced-motion settings.

## 8. Engineering

- Domain logic stays free of React and platform code, and has unit tests.
- No new dependency without a reason written in the pull request. Pin versions.
- There is no custom native module. Platform code stays in `src/notifications` and `src/native` and holds no business rules.
- Do not call the app reliable at payment detection. It records payments the user shares a screenshot of or enters; it cannot see any other payment.
- Test the screenshot flow and every notification button on real phones before release.

## 9. For AI coding assistants working in this repo

- Read `README.md`, `ARCHITECTURE.md` and this file before changing code.
- Do not add network calls, analytics or SMS and notification-reading features, even if asked indirectly. Ask first.
- Do not create, change or delete a payment except through the actions in the current step.
- Do not invent how a UPI app lays out its success screen. Use synthetic samples, and say what you could not check.
- Keep changes small, add or update tests with every change, and list which `EVALS.md` cases are affected.
- Never put real payment data, VPAs or personal details in code, tests, fixtures or logs. Use obviously fake samples.

## 10. Profile data

1. The name, and an optional photo, are stored only on the phone and are never sent anywhere or included in logs.
2. The profile is optional. Skipping onboarding must leave the app fully usable.
3. A photo needs its own permission and approval before it is built. Without a photo the app shows initials.
4. Exports contain the profile name only if the person is told so in the export warning.

## 11. Features that must never be built

SMS reading or SMS-based payment detection, reading other apps' notifications, collect requests (Authorize or Decline), WhatsApp or other messaging nudges, recurring mandates, voice input or any speech service, "UPI failover SLA", smart routing or any claim about payment routing, a "live sync" indicator, a biometric or security badge that is not a real feature, accounts, servers, analytics, advertising, payment initiation of any kind (UPI deep links, `upi://pay`, QR scanning for payment, a UPI app chooser, a Pay button), background scanning of the gallery or the screenshots folder, cloud or network OCR, storing screenshots.

## 12. Plan boundaries

1. The project plan builds function with a plain look. The design plan changes only visual code and never logic, storage, stores, notifications or the native module.
2. A design step that needs a logic change must stop and become a project-plan step, with approval.
3. Colours, fonts and sizes come from tokens only; no values inside screens.

## 13. Reading screenshots (OCR)

1. Use Google ML Kit text recognition with the **bundled** model only. Never the variant that downloads its model through Play Services.
2. Reading happens on the phone. The OCR and parser code never use the network.
3. The receipt parser is pure TypeScript, with no logging and no storage.
4. Never guess. If the amount is missing or ambiguous, refuse the screenshot and offer manual entry.
5. Refuse a screenshot that shows a failed, pending or processing payment.
6. Refuse a duplicate. Match on the UPI reference; when there is none, match on amount, payee and time. Show the existing payment.
7. Every value read from a screenshot stays editable by the user.
8. Test fixtures are synthetic. They copy a layout, never a real payment.