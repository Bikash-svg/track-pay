# Evals

How we decide the app works. Each case has an ID so bugs and tests can point to it. "Unit" cases run automatically; "Device" cases are run by hand on real phones.

## 1. Test devices

Minimum: one Android 13+ phone and one Android 14+ phone, ideally including one aggressive-battery brand (Xiaomi, Oppo, Vivo or similar). Each must have at least two UPI apps installed, and a set of real success screenshots made by the tester from their own test payments (never committed to the repo).

## 2. Receipt parsing (Unit)

All samples are synthetic: they copy a layout, never a real payment. The old UPI link cases U1 to U9 are retired (2026-10-25); the link parser is deleted in Step 4-B.0.

| ID | Input | Expected |
|---|---|---|
| U1 | Synthetic GPay success text with amount, payee, date, UPI reference | amount in paise, payee, date and reference all correct, app gpay |
| U2 | Same layout for PhonePe, Paytm and Navi | fields correct for each app |
| U3 | Amount with OCR slips (letter O for zero, ₹ read as 7, space after the decimal) | corrected to the right amount |
| U4 | Two different possible amounts on one screen | refused, reason no_amount (never guess) |
| U5 | No amount found | refused, reason no_amount |
| U6 | Text containing Failed, Declined or Payment unsuccessful | refused, reason failed |
| U7 | Text containing Pending or Processing | refused, reason pending |
| U8 | Empty text, or an unrelated screen | refused, reason unreadable |
| U9 | Very long payee name | truncated safely to 40 characters for the payee field |
| U10 | Same screenshot twice (same reference, or same amount, payee and time) | second one detected as a duplicate |

## 3. Money and analytics (Unit)

| ID | Check |
|---|---|
| M1 | 0.1 + 0.2 rupees sums to exactly 30 paise |
| M2 | Formatting: 363000 paise shows as ₹3,630 |
| A1 | Monthly total includes every payment and excludes old test rows marked Failed or Pending |
| A2 | Category totals add up to the monthly total |
| A3 | A payment at 23:59 on the last day of a month appears in that month, not the next |
| A4 | Calendar marks the highest and lowest non-zero days; ties are broken by the earlier date |
| A5 | Limit math: left = limit minus total; percent used rounds down; daily pace = left divided by days remaining, minimum 1 day |
| A6 | Over the limit: left shows "over by"; at 80% the level is warn, above 100% it is over (colour is a design-plan matter) |
| A7 | Limit off: no limit element appears on Home or Analytics |
| A8 | Empty month shows empty states, no crashes, no divide-by-zero |

## 4. Payment lifecycle (Unit)

| ID | Check |
|---|---|
| S1 | A payment read from a screenshot is saved with `reviewed = false`; a manual payment is saved with `reviewed = true` |
| S2 | New payments are always Done; no flow creates Pending or Failed payments |
| S3 | Looks right sets `reviewed = true`; Edit saves with `reviewed = true`; Delete asks first and names the payment |
| S4 | OCR output never changes an existing payment |
| S5 | Editing amount or payee never creates a duplicate row |
| S6 | Undo removes exactly the payment just added |

## 5. Notifications (Unit and Device)

| ID | Check |
|---|---|
| R1 | Default settings plan four daily reminders at 10:00, 14:00, 18:00 and 21:00 |
| R2 | The user can set 1 to 6 reminder times; the plan follows the setting |
| R3 | A reminder that falls inside quiet hours is skipped, not moved |
| R4 | Quiet hours that cross midnight (23:00 to 07:00) work correctly |
| R5 | A reminder is skipped when a payment was logged, or No payments was tapped, since the previous reminder |
| R6 | Device: tapping Looks right on the receipt notification marks the payment verified without opening the app |
| R7 | Device: tapping Undo removes exactly that payment without opening the app |
| R8 | Device: reminders still fire after the phone restarts (allow a few minutes of drift, they are inexact) |
| R9 | Device: reminders still fire with battery saver on (allow drift) |
| R10 | Device: R6 and R7 also pass when the app has been fully closed (swiped away) before the button is tapped, **and again after the INTERNET permission is stripped** |
| R11 | Device: the notification for a screenshot that could not be read offers Enter manually and saves nothing; an already added screenshot shows Already added and saves nothing |
| R12 | Device: sharing several screenshots at once posts one grouped notification, not one per screenshot |
| R13 | Limit alerts fire at 80% and at 100%, once per month each, only when a limit is set; editing or deleting a payment never re-fires or un-fires one; a new month starts clean |
| R14 | Backup reminder arrives on the 1st at 10:00; Export now opens the export choices; Remind me tomorrow posts it once more; skipped when already exported that month or when switched off |
| R15 | No payments dismisses the reminder and cancels the rest of that day's reminders; Snooze 1 hour posts it once more unless that falls in quiet hours |
| R16 | Lock screen shows only generic text unless "Show details on lock screen" is on |

## 6. Screenshot flows (Device)

The old P1 to P10 and P12 cases (QR, Pay to a friend, retry) are retired (2026-10-25): Track Pay no longer starts payments.

| ID | Scenario | Pass when |
|---|---|---|
| P11 | Notification permission denied | Clear message; app still works; payments are still saved from screenshots, with no notification |
| D10 | Share a GPay success screenshot to Track Pay | The result page opens with amount, payee, date and category correct, saved as Not verified, with Looks right, Edit and Undo |
| D11 | Share a PhonePe, Paytm and Navi success screenshot | Same as D10 for each app; the share sheet offers Track Pay for images; Home is not opened instead |
| D12 | Pick five images from the gallery: three good, one duplicate, one failed | Three saved, one already added, one refused; one summary page and one grouped notification |
| D13 | Share a screenshot of a failed or pending payment | Nothing is saved; the message says so |
| D14 | Share the same screenshot twice | The second time nothing is saved and the existing payment is shown |
| D15 | Share a blurry or unrelated screenshot | Nothing is saved; Enter manually is offered |
| D16 | OCR accuracy: 20 real success screenshots (5 per app) | At least 9 in 10 read with the right amount and payee; any wrong amount fails the step (open question 21) |
| D17 | Airplane mode, then share a screenshot | Reading works; the image is not kept (no copy remains in the app cache) |
| D18 | Add manually | Saved as verified; appears on Home at once |

## 7. Data safety (Unit and Device)

| ID | Check |
|---|---|
| D1 | Export then import into a fresh install restores every payment and setting |
| D2 | Importing a file with a newer schema version is refused with a clear message |
| D3 | Importing a corrupt or partly invalid file changes nothing |
| D4 | Importing the same file twice with merge does not create duplicates |
| D5 | PDF statement total matches the Analytics total for the same month |
| D6 | Migrations from every earlier schema version succeed with data intact |
| D7 | Airplane mode: every feature works. **Path B (2026-10-22):** after `npx expo prebuild --clean`, `grep -i INTERNET android/app/src/main/AndroidManifest.xml` returns nothing; ML Kit OCR on a shared receipt still works in airplane mode (proves fully on-device, no network) |

## 8. UI and accessibility (Device)

| ID | Check |
|---|---|
| UI1 | Every tappable item is at least 44 px |
| UI2 | Text has at least 4.5:1 contrast in **both** themes (measured values in `DESIGN-TOKENS.md`; checked in design step D7.2) |
| UI3 | Works with system font size at 130% without clipping |
| UI4 | Dark, light and auto themes all render correctly |
| UI5 | Screen reader announces buttons, switches and the confirm sheet sensibly |
| UI6 | Back button and gestures behave on every sheet |

## 9. Performance

- Cold start to Home under 2 seconds on the test phone.
- History and Analytics stay smooth with 5,000 payments.
- Reading one screenshot and showing the result page takes under 3 seconds on the test phone.

## 10. Splash, onboarding, profile (plan 2.x)

| ID | Check |
|---|---|
| O1 | Splash ends only after data has loaded, with no network (airplane mode) |
| O2 | First launch opens onboarding; relaunch opens Home |
| O3 | Greeting: 04:59 evening, 05:00 morning, 11:59 morning, 12:00 afternoon, 16:59 afternoon, 17:00 evening; with no name it shows the greeting alone |
| O4 | Skip for now leaves the name empty and opens Home; the greeting has no name |
| O5 | The preview updates as the name is typed; very long names do not break the layout |
| O6 | Clearing app data returns to onboarding |

## 11. Theme (plan 1.5, 7.2)

| ID | Check |
|---|---|
| T1 | Dark, Light and Auto each apply at once without a restart |
| T2 | Auto follows the phone setting, including when it changes while the app is open |
| T3 | The choice survives closing the app |

## 12. History search and filters (plan 6.x)

| ID | Check |
|---|---|
| H1 | Search matches payee, note and category, ignoring case |
| H2 | No match shows a message, not a blank screen |
| H3 | The Not verified filter and the date range combine with search |
| H4 | Month totals ignore the filters (they always include every payment) |

## 13. Analytics formulas (plan 3.1, 5.x)

| ID | Check |
|---|---|
| A9 | Example: spent ₹3,630 on 11 Oct, limit ₹15,000: daily average ₹330, projected ₹10,230, headroom ₹4,770, left ₹11,370, 24% used, allowance ₹568 a day for 20 days |
| A10 | Day 1, the last day of the month, no limit, zero spend and over the limit all give sensible output with no divide-by-zero |
| A11 | "vs last month" compares the same days only (1 to 11 Sep against 1 to 11 Oct) |
| A12 | The trajectory chart ends at the month total and the ceiling line ends at the limit |
| A13 | The same month shows the same numbers on Home, Analytics, History, the statement and notifications |

## 14. Visual checks (design plan, Track B)

| ID | Check |
|---|---|
| V1 | No hex colour, font name or magic size appears in a screen file (search `src/app` and `src/features`) |
| V2 | Every figure (amounts, percentages) renders in the mono font with tabular numerals |
| V3 | Each screen and dialog matches `DESIGN-BUILD-PLAN.md` Part A in **both** themes, reviewed by screenshot |
| V4 | Checked on three phone sizes or densities |
| V5 | Nothing animates when "reduce motion" is on |
| V6 | Touch targets are at least 44 x 44 px everywhere (chips use a larger touch area) |
| V7 | 130% font scale breaks no screen |

## 15. Build and naming

| ID | Check |
|---|---|
| B1 | `npx expo install --check` reports nothing; `npm ci --dry-run --include=dev` passes |
| B2 | `eas build -p android --profile preview` produces an APK that installs over the previous build and keeps data |
| N1 | No user-visible "VaultX" remains |

## 16. Release gate

Milestone M1 (working app): all unit cases and every R, D, A, H, S, T and O case (and P11) pass on at least two phones. Milestone M2 (design): every V case also passes. No guardrail in `GUARDRAILS.md` is violated at either milestone.