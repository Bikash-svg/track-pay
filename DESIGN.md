# Screens, Copy and Behaviour (DESIGN.md)

What each screen contains, in what order, with the exact text and rules. **This file has no colours, fonts, sizes or radii.** Those live in `DESIGN-BUILD-PLAN.md` (Part A) and `DESIGN-TOKENS.md`. All text is also listed in `COPY.md`. Layout is a single column on a phone; a "card" is a Level 1 surface and a "dialog" is a Level 2 surface.

Sample data used in the examples: month October 2026, today 11 Oct, limit ₹15,000, spent ₹3,630.

## 1. Screens

### Splash
Brand mark, "Track Pay", a progress bar. Ends when data has loaded. Nothing else.

### Onboarding
### Onboarding
- Link "Skip for now", an avatar circle with the initial, fields "First name" and "Surname", a preview card "Good morning, {First name}" (greeting follows the time: morning 05:00 to 11:59, afternoon 12:00 to 16:59, evening 17:00 to 04:59; with no name it shows "Good morning"), button "Continue".

### Top bar (all tab screens)
"Track Pay" (left); avatar (initial), label "Profile", opens Settings. There is no bell and no pending badge.

### Home (LOCKED 2026-10-25)
Structure is final. Values come from the tokens; mockup colours are never used.
1. **Greeting header:** "Good morning, {First name}" (time based) and a month pill "{Month}".
2. **Month card:** "Spend on {Month}", the amount; with a limit: a radial gauge with "24%" and "used" in its centre, "Limit ₹15,000", two tiles "Left ₹11,370" and "Allowance a day ₹568" (over the limit: "Over by ₹X"; last day: "₹X left"). Without a limit: only the label and the spent amount, no gauge. Footnote: "Based on payments recorded in Track Pay".
3. **Quick access:** primary button "Add from screenshot", secondary button "Add manually", hint "Pay in any UPI app, then share the success screenshot here."
4. **This month at a glance:** three columns with the small headings DAILY PACE ("₹330", "a day"), MONTH-END ESTIMATE ("₹10,230", "estimate") and VERSUS LAST MONTH ("↓ 12%", "₹495 less" or "more"); link "Analytics". Built in Step 5.9 and hidden until then.
5. **Recent payments:** title, link "History", up to five newest payments. Each row: a monogram tile with the first letter, name, amount ("₹40"), category, date, and the marker "Not verified" under the name while `reviewed` is false. Empty: "No payments yet. Share a payment screenshot or add one by hand."
6. **Tab bar:** Home, Analytics, History, Settings.

A payment row: first letter avatar, name (the note if set, otherwise the payee), "₹60 · Food", the marker "Not verified" when it applies, and the date ("Today", "Oct 10", "Oct 10, 2025").

### Receipt result (page, opens after a shared screenshot is read)
Icon tile with a tick, title "Payment added", the amount large, rows "To", "Date and time", "Category"; text "Check these against your payment. They were read from your screenshot." Buttons "Looks right" (primary), "Edit", "Undo". Each variant has its own icon tile (info, warning, cross). Variants: **Already added** ("This payment is already in Track Pay." plus the existing row, button "Done"); **Could not read** ("Couldn't read this screenshot. Nothing was saved." buttons "Enter manually", "Close"); **Not a successful payment** ("This screenshot shows a payment that did not go through. Nothing was saved." button "Close").

### Batch result (page, after several screenshots)
Title "Screenshots read". Counts: "{n} added", "{n} already added", "{n} couldn't be read". Button "Review" opens History filtered to Not verified. Button "Done".

### Analytics (title "Analytics", month picker "{Month} ▾")
1. If a limit is on: a limit card with "Monthly limit", "₹3,630 of ₹15,000", a bar, "24% used" and "₹11,370 left" (over: "₹X over"). No "Safe zone" badge.
2. **Pace:** "Daily average ₹330", "Projected month end ₹10,230 (estimate)", "Headroom ₹4,770", "vs last month, same days: {+/-}{n}% ({amount})".
3. *(retired 2026-10-25: there is no unconfirmed box)*
4. **Spending trajectory:** cumulative spend against a straight line to the limit, today marked.
5. **Monthly spending:** six months, current highlighted, limit line when a limit is on.
6. **By category:** name, bar relative to the largest, amount. Empty: "No spending this month".
7. **By weekday:** seven bars, Sunday first.
8. **Top payees:** five names with total and count.
9. **Calendar:** month name and total (with " of ₹15,000" when a limit is on); weekdays S M T W T F S; each day shows its number and total in whole rupees ("12.5k" from 10,000); highest day and lowest day (only if there are two active days) are marked, with the legend "● Most spent" and "● Least spent"; days after today are dimmed.
Footer: "Based on payments recorded in Track Pay."

### History (title "History", filter "All ▾")
Search field "Search payee, note or category". Filter chips: "All", "Not verified ({n})" (the count of unverified payments) and a month or date range "{Month} ▾". Month groups: heading "{Month} {Year}" with a badge "Spent ₹X", expandable, rows as on Home including "Not verified", the date and time. With Not verified selected only unverified rows show. Button "Export data" opens the export choices. Empty: "No payments yet."

### Settings
Cards in order: Profile (name, edit); Theme "Dark, Light, Auto"; Monthly spending limit (switch, "Home and Analytics show what is left", field "Limit per month", quick steps "+₹2,000", "+₹5,000", "−₹1,000", note "Limit alerts at 80% and 100% are always on while a limit is set."); Reminders (switch "Daily reminders" with the set times shown as pills and an "Edit" link, default 10:00 AM, 2:00 PM, 6:00 PM, 9:00 PM, 1 to 6 times; Quiet hours "No reminders from 11 pm to 7 am"; switch "Monthly backup reminder"; "Show details on lock screen" "Off: notifications only say a payment was added"; "Battery settings"); Your data (Export data "Save all payments as a backup file", Import data "Restore payments from a backup file", PDF statement "Pick a month and save it as a PDF"). Footer: "Track Pay keeps everything on this phone. It records payments you share as screenshots or add by hand. It does not detect payments made elsewhere and it never starts a payment."

## 2. Dialogs (centred)

Common: scrim, dialog with an optional title, optional subtitle and a close button (no close button on permission and icon-led dialogs). Tapping outside or Back closes without saving.

| Dialog | Content, in order | Buttons |
|---|---|---|
| Add manually | Subtitle "Paid in another UPI app"; "Amount", "To whom", "What was this for?" (optional), category choices, "Date" (stepper, never past today) | "Cancel", "Save" |
| Edit payment | Same fields, filled in; the marker "Not verified" until saved | "Save changes", "Delete payment" |
| Delete this payment? | "₹60 to Bikash Murmu will be removed from your history and totals. This cannot be undone." | "Cancel", "Delete" |
| Import backup? | Subtitle "{n} payments, Jan to Oct 2026"; options "Merge with my data" ("Adds {n} new payments and skips duplicates.") and "Replace everything" ("Erases your {n} payments on this phone first.") | "Cancel", "Import" |
| Could not import | Icon, "Could not import", "The file could not be read. Pick a backup that was exported from Track Pay." | "Close", "Pick another file" |
| Export your data | Warning box: "This file contains all your payments and is not encrypted. Anyone who gets it can read it. Keep it somewhere private."; file summary "trackpay_export_{year}_{month}.json · {n} records" | "Cancel", "Export" |
| Export choices | Two option cards: "Backup file" ("Save all payments as a backup file") and "Monthly PDF statement" ("Pick a month and save it as a PDF") | "Cancel", "Continue" |
| PDF statement | Subtitle "Choose a month"; month choices | "Cancel", "Create PDF" |
| Reminder times | Subtitle "How many times a day"; the set times as rows, each with a delete icon (not below 1); "Add reminder time" (not above 6) | "Done" |
| Quiet hours | Subtitle "Reminders wait until quiet hours end"; pickers "From" and "To"; note "Pick the same time for both to turn quiet hours off." | "Done" |
| Choose a month | Month choices | none |
| Allow notifications | Icon, "Get reminders and payment receipts", "Track Pay tells you when a screenshot was read, reminds you to log payments, and warns you near your limit. Never at night." | "Not now", "Allow" |

## 3. Phone notifications

| Notification | Title | Body | Actions |
|---|---|---|---|
| Payment received | "Payment added" | "₹60 to Bikash Murmu · Food · Oct 10, 2:14 pm" | Looks right, Edit, Undo |
| Could not read | "Couldn't read this screenshot" | "Nothing was saved." | Enter manually |
| Already added | "Already added" | "₹60 to Bikash Murmu is already in Track Pay." | none (tap opens the payment) |
| Batch received | "{n} payments added" | "Tap to review them." | Review |
| Daily log reminder | "Any payments to add?" | "Share your payment screenshots to keep your month complete." | Add screenshots, No payments, Snooze 1 hour |
| Limit alert 80% | "80% of your limit used" | "₹12,000 of ₹15,000 spent in October." | none (tap opens Analytics) |
| Limit alert 100% | "Monthly limit reached" | "You have spent ₹15,000 of ₹15,000 in October." | none (tap opens Analytics) |
| Backup reminder | "Back up your {Month} spending" | "Export last month's payments so you do not lose them." | Export now, Remind me tomorrow |
| Lock screen (details off) | "Payment added from screenshot" / "Time to log your payments" / "Limit update" | "Unlock to see details" | none |

Daily reminders: 4 a day by default, customisable from 1 to 6, inexact timing, none in quiet hours (default 11 pm to 7 am), skipped when the user logged a payment or tapped No payments since the previous reminder. Limit alerts: once per month for each of 80% and 100%, only when a limit is set. Backup reminder: the 1st of the month at 10:00, skipped if already exported that month. Channels: "Receipt confirmations" (high), "Daily log reminders" (default), "Limit alerts" (high), "Backup reminders" (default).

## 4. States and rules

- Totals include every payment. Old test rows with status Failed or Pending are never counted.
- Formulas: `ARCHITECTURE.md` section 7.
- A row shows the note if set, otherwise the payee. The avatar letter is its first letter, uppercase.
- Dates: "Today", "Mon D", "Mon D, YYYY" when the year differs. Month headings "October 2026".
- Empty names: "Unknown".
- Disabled: primary actions are disabled while a required value is invalid.
- A payment read from a screenshot shows "Not verified" until the user taps Looks right or edits it.
- Pressed, focused and disabled states are defined visually in `DESIGN-BUILD-PLAN.md`.

## 5. Validation messages (under the field)
- Empty or zero amount: "Enter an amount greater than ₹0".
- More than 2 decimals: "Use at most 2 decimal places".
- Over ₹99,99,999.99: "That amount is too large".
- Future date: "Choose today or an earlier date".
- "To whom" up to 40 characters, "What was this for?" up to 60; the field stops accepting input.

## 6. Toasts
"Couldn't save the payment. Try again." (Retry); "Backup file is not valid. Nothing was changed."; "Backup is from a newer version of the app."; "Payment deleted" (Undo); "Payment added"; "Marked as verified"; "Backup saved"; "PDF ready" (Open).

## 7. Not in the design (do not build)

These appeared in the Stitch screens and were rejected on 2026-10-27: a "Local" pill, a "Welcome back" line, status bar icons, a "Safe zone" badge, "Budgeted ₹/d", a Filter button on Analytics, an "I understand" checkbox on Export, "Set up later" on onboarding, shield or lock security badges, the words "zero-knowledge", "Secure Enclave", "wealth" and "ledger suite", a camera on the avatar, an "Include failed payments" switch, and "View analytics" or "Dismiss" buttons on limit alerts.

## 8. Open decisions (ask, do not invent)
1. Onboarding step 2 content (proposed: optional monthly limit).
2. Profile picture (needs a dependency and a permission).
3. Whether the top bar stays on Home (it does, plain; revisit in the design plan).
4. Light and dark colour questions are in `DESIGN-BUILD-PLAN.md` B1.
5. Tablet and landscape: not designed; lock to portrait.
6. Open questions 17 to 25 in `BUILD-TODO.md` (no-spend days, reminder count, share flow return, OCR accuracy bar, light Home).