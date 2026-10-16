# Evals

How we decide the app works. Each case has an ID so bugs and tests can point to it. "Unit" cases run automatically; "Device" cases are run by hand on real phones.

## 1. Test devices

Minimum: one Android 13+ phone and one Android 14+ phone, ideally including one aggressive-battery brand (Xiaomi, Oppo, Vivo or similar). Each must have at least two UPI apps installed.

## 2. UPI link parsing (Unit)

| ID | Input | Expected |
|---|---|---|
| U1 | `upi://pay?pa=shop@bank&pn=Cafe%20Mocha&am=120.00&cu=INR&tn=Lunch` | payee Cafe Mocha, VPA shop@bank, 12000 paise, note Lunch |
| U2 | Same without `am` | amount empty, user must enter one |
| U3 | `am=0` or `am=-5` or `am=abc` | rejected |
| U4 | `am=10.999` | rejected (more than 2 decimals) |
| U5 | `cu=USD` | rejected |
| U6 | missing `pa` or `pa` without `@` | rejected |
| U7 | `pn` with encoded characters and emoji | decoded correctly |
| U8 | Link not starting with `upi://pay` (for example a web URL) | rejected, nothing launched |
| U9 | Very long `pn` or `tn` | truncated safely for display, stored in full only up to a set limit |

## 3. Money and analytics (Unit)

| ID | Check |
|---|---|
| M1 | 0.1 + 0.2 rupees sums to exactly 30 paise |
| M2 | Formatting: 363000 paise shows as ₹3,630 |
| A1 | Monthly total includes success and pending, excludes failed |
| A2 | Category totals add up to the monthly total |
| A3 | A payment at 23:59 on the last day of a month appears in that month, not the next |
| A4 | Calendar marks the highest and lowest non-zero days; ties are broken by the earlier date |
| A5 | Limit math: left = limit minus total; percent used rounds down; daily pace = left divided by days remaining, minimum 1 day |
| A6 | Over the limit: left shows "over by", bar turns red; at 80% it turns amber |
| A7 | Limit off: no limit element appears on Home or Analytics |
| A8 | Empty month shows empty states, no crashes, no divide-by-zero |

## 4. Payment state (Unit)

| ID | Check |
|---|---|
| S1 | New payment starts as pending |
| S2 | pending to success and pending to failed are allowed |
| S3 | success or failed can be edited back to pending or to the other status by the user |
| S4 | A UPI result never changes status without user confirmation |
| S5 | Editing amount or payee never creates a duplicate row |

## 5. Reminders (Unit and Device)

| ID | Check |
|---|---|
| R1 | One pending payment: reminder planned one hour later |
| R2 | Three pending payments: one grouped notification, not three |
| R3 | A reminder that falls inside quiet hours moves to the end of quiet hours |
| R4 | Quiet hours that cross midnight (23:00 to 07:00) work correctly |
| R5 | Resolving the last pending payment cancels every scheduled reminder |
| R6 | Device: marking Done from the notification updates the Pending list without opening the app |
| R7 | Device: typing a name in the notification reply saves it on the right payment |
| R8 | Device: reminders still fire after the phone restarts |
| R10 | Device: R6 and R7 also pass when the app has been fully closed (swiped away from recent apps) before the button is tapped |
| R9 | Device: reminders still fire with battery saver on (allow a few minutes of drift) |

## 6. Payment flows (Device)

| ID | Scenario | Pass when |
|---|---|---|
| P1 | Scan a shop QR, pay in a UPI app, return | Pending payment exists; confirm sheet appears with shop name pre-filled |
| P2 | Same, answer Yes with a name | Status success, appears in History and totals |
| P3 | Same, answer No | Status failed, not in totals |
| P4 | Same, answer Decide later | Stays pending; reminder arrives within an hour |
| P5 | Cancel inside the UPI app | Returning shows the confirm sheet; user can mark Failed |
| P6 | Kill the app while in the UPI app, then return | Pending payment still exists and can be confirmed |
| P7 | Pay to a friend, pick a UPI app | Pending saved, notification appears right away with Done, Failed, Edit |
| P8 | Edit amount from the notification | Edit sheet opens; saved change shows in History |
| P9 | Only one UPI app installed, or none | Chooser still works or shows a clear message; no crash |
| P10 | Camera permission denied | Clear message with a way to enter the amount manually |
| P11 | Notification permission denied | Clear message; app still works; pending list is the fallback |

## 7. Data safety (Unit and Device)

| ID | Check |
|---|---|
| D1 | Export then import into a fresh install restores every payment and setting |
| D2 | Importing a file with a newer schema version is refused with a clear message |
| D3 | Importing a corrupt or partly invalid file changes nothing |
| D4 | Importing the same file twice with merge does not create duplicates |
| D5 | PDF statement total matches the Analytics total for the same month |
| D6 | Migrations from every earlier schema version succeed with data intact |
| D7 | Airplane mode: every feature works |

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
- Confirm sheet opens within 300 ms of returning from the UPI app.

## 10. Retry after a failed payment (project plan 4.6)

| ID | Check |
|---|---|
| P12a | "No, it failed" opens "Payment failed" with Try again, Edit details, Keep as failed |
| P12b | Try again on a QR payment reopens Confirm payment with the same shop, amount and note; Make payment creates a **new** pending payment; the old one stays Failed and is not counted |
| P12c | Try again on a friend payment reopens Pay to a friend with the same name and amount |
| P12d | Retrying three times creates three new rows plus the original; History shows each attempt |
| P12e | Edit payment with status Failed shows Try again; with Done or Pending it does not |
| P12f | A UPI hint "failed" never marks the payment Failed by itself |
| P12g | If the UPI app does not open, "Couldn't open {app}" shows and no pending payment is left behind |
| R11 | Device: marking Failed from a notification updates it to "Payment failed" with Try again and Edit; Try again opens the retry flow |

## 11. Splash, onboarding, profile (plan 2.x)

| ID | Check |
|---|---|
| O1 | Splash ends only after data has loaded, with no network (airplane mode) |
| O2 | First launch opens onboarding; relaunch opens Home |
| O3 | Greeting: 04:59 evening, 05:00 morning, 11:59 morning, 12:00 afternoon, 16:59 afternoon, 17:00 evening; with no name it shows the greeting alone |
| O4 | Skip for now leaves the name empty and opens Home; the greeting has no name |
| O5 | The preview updates as the name is typed; very long names do not break the layout |
| O6 | Clearing app data returns to onboarding |

## 12. Theme (plan 1.5, 7.2)

| ID | Check |
|---|---|
| T1 | Dark, Light and Auto each apply at once without a restart |
| T2 | Auto follows the phone setting, including when it changes while the app is open |
| T3 | The choice survives closing the app |

## 13. History search and filters (plan 6.x)

| ID | Check |
|---|---|
| H1 | Search matches payee, note and category, ignoring case |
| H2 | No match shows a message, not a blank screen |
| H3 | Status and date filters combine with search |
| H4 | Month totals ignore the filters (they always include every Done and Pending payment) |

## 14. Analytics formulas (plan 3.1, 5.x)

| ID | Check |
|---|---|
| A9 | Example: spent ₹3,630 on 11 Oct, limit ₹15,000: daily average ₹330, projected ₹10,230, headroom ₹4,770, left ₹11,370, 24% used, allowance ₹568 a day for 20 days |
| A10 | Day 1, the last day of the month, no limit, zero spend and over the limit all give sensible output with no divide-by-zero |
| A11 | "vs last month" compares the same days only (1 to 11 Sep against 1 to 11 Oct) |
| A12 | The trajectory chart ends at the month total and the ceiling line ends at the limit |
| A13 | The same month shows the same numbers on Home, Analytics, History, the statement and notifications |

## 15. Visual checks (design plan, Track B)

| ID | Check |
|---|---|
| V1 | No hex colour, font name or magic size appears in a screen file (search `src/app` and `src/features`) |
| V2 | Every figure (amounts, percentages) renders in the mono font with tabular numerals |
| V3 | Each screen and dialog matches `DESIGN-BUILD-PLAN.md` Part A in **both** themes, reviewed by screenshot |
| V4 | Checked on three phone sizes or densities |
| V5 | Nothing animates when "reduce motion" is on |
| V6 | Touch targets are at least 44 x 44 px everywhere (chips use a larger touch area) |
| V7 | 130% font scale breaks no screen |

## 16. Build and naming

| ID | Check |
|---|---|
| B1 | `npx expo install --check` reports nothing; `npm ci --dry-run --include=dev` passes |
| B2 | `eas build -p android --profile preview` produces an APK that installs over the previous build and keeps data |
| N1 | No user-visible "VaultX" remains |

## 17. Release gate

Milestone M1 (working app): all unit cases and every P, R, D, A, H, T and O case pass on at least two phones. Milestone M2 (design): every V case also passes. No guardrail in `GUARDRAILS.md` is violated at either milestone.
