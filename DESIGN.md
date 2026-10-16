# Screens, Copy and Behaviour (DESIGN.md)

What each screen contains, in what order, with the exact text and rules. **This file has no colours, fonts, sizes or radii.** Those live in `DESIGN-BUILD-PLAN.md` (Part A) and `DESIGN-TOKENS.md`. All text is also listed in `COPY.md`. Layout is a single column on a phone; a "card" is a Level 1 surface and a "dialog" is a Level 2 surface.

Sample data used in the examples: month October 2026, today 11 Oct, limit ₹15,000, spent ₹3,630.

## 1. Screens

### Splash
Brand mark, "Track Pay", a progress bar. Ends when data has loaded. Nothing else.

### Onboarding
- Step 1 of 2: label "Step 1 of 2", link "Skip for now", an avatar circle with the initial, fields "First name" and "Surname", a preview card "Good morning, {First name}" (greeting follows the time: morning 05:00 to 11:59, afternoon 12:00 to 16:59, evening 17:00 to 04:59; with no name it shows "Good morning"), button "Continue".
- Step 2 of 2 (proposed, confirm): "Set a monthly limit" (optional amount), "Skip for now", "Continue to App".

### Top bar (all tab screens)
"Track Pay" (left); bell with a count badge of pending payments (hidden at zero; label "Notifications, {n} pending"), opens Needs confirming; avatar (initial), label "Profile", opens Settings.

### Home
1. **Spend card:** "Spend on {Month}", the amount, then with a limit: "Limit ₹15,000", a progress bar, and "₹11,370 left · about ₹568 a day for 20 days" (over the limit: "Over by ₹X"; last day: "₹X left"). Also the daily average line "₹330 a day on average". Without a limit only the label and amount show.
2. **Quick actions:** tiles "Scan QR" and "Pay to a friend" (these choose how to pay), then the button "Pay".
3. Button "Add a payment already made".
4. **Banner** (only when something is pending): "{n} payment needs confirming" or "{n} payments need confirming" with "Review".
5. **Recent Payments:** title, link "See all", up to four newest payments (the first two as rows, the rest peeking underneath). Empty: "No payments yet. Scan a QR or add one."

A payment row: first letter avatar, name (the note if set, otherwise the payee), "₹60 · Food", a status tag (Done, Failed, Pending), and the date ("Today", "Oct 10", "Oct 10, 2025").

### Analytics (title "Analytics", month picker "{Month} ▾")
1. If a limit is on: "Monthly limit", "₹3,630 of ₹15,000", a bar, "24% used", "₹11,370 left" (over: "₹X over").
2. **Pace:** "Daily average ₹330", "Projected month end ₹10,230 (estimate)", "Headroom ₹4,770", "vs last month, same days: {+/-}{n}% ({amount})".
3. **Unconfirmed:** "{n} pending, ₹X" and "{n} failed", with a link to Needs confirming.
4. **Spending trajectory:** cumulative spend against a straight line to the limit, today marked.
5. **Monthly spending:** six months, current highlighted, limit line when a limit is on.
6. **By category:** name, bar relative to the largest, amount. Empty: "No spending this month".
7. **By weekday:** seven bars, Sunday first.
8. **Top payees:** five names with total and count.
9. **Calendar:** month name and total (with " of ₹15,000" when a limit is on); weekdays S M T W T F S; each day shows its number and total in whole rupees ("12.5k" from 10,000); highest day and lowest day (only if there are two active days) are marked, with the legend "● Most spent" and "● Least spent"; days after today are dimmed.
Footer: "Based on payments recorded in Track Pay."

### History (title "History", filter "All ▾")
Search field "Search payee, note or category". Filter choices: All, Done, Failed, Pending, plus a date range. Month groups: heading "{Month} {Year}" with "Spent ₹X", expandable, rows as on Home. Button "Export data" opens PDF statement. Empty: "No payments yet" with "Scan a QR or add a payment you already made."

### Settings
Cards in order: Profile (name, edit); Theme "Dark, Light, Auto"; Monthly spending limit (switch, "Home and Analytics show what is left", field "Limit per month", quick steps "+₹2,000", "+₹5,000", "−₹1,000"); Persistent notification ("Quick-add a payment without opening the app"); Reminders (Quiet hours "No reminders from 11 pm to 7 am", "Show details on lock screen" "Off: notifications only say a payment is pending", "Battery settings"); UPI apps (installed apps, "Refresh list"); Your data (Export data "Save all payments as a backup file", Import data "Restore payments from a backup file", PDF statement "Pick a month and save it as a PDF"). Footer: "Track Pay keeps everything on this phone. It records payments you start or add. It does not detect payments made elsewhere."

### Needs confirming (page with Back arrow)
Tabs "All" and "Unconfirmed". Each pending payment: its row, buttons "Done", "Failed", "Edit", and a field "Name it" with a send button. Empty: "Nothing to confirm" and "All your payments are confirmed."

### QR scanner (full screen)
Close, title "Scan a UPI QR", torch; a square frame; hint "Point the camera at a UPI QR code"; link "Enter details instead". A bad code shows "This is not a UPI QR code" and keeps scanning.

## 2. Dialogs (centred)

Common: scrim, dialog with an optional title, optional subtitle and a close button (no close button on permission and icon-led dialogs). Tapping outside or Back closes without saving, except "Did it go through?" (counts as Decide later).

| Dialog | Content, in order | Buttons |
|---|---|---|
| Pay to a friend | Field "Amount" (₹), "To whom", label "Pay with", UPI app tiles (the first is selected), note "Your UPI app opens next. This payment is saved as pending." Errors: "Enter an amount greater than ₹0". No app: "No UPI app was found on this phone. Install a UPI app such as GPay or PhonePe, then try again." | Tapping a tile starts the payment |
| Confirm payment | Merchant box (name, UPI ID), field "Amount (you can change it)", field "What was this for?" | "Cancel", "Make payment" (disabled until the amount is valid) |
| Couldn't open {app} | Icon, "Couldn't open GPay", "The payment was not started and nothing was saved. Try again, or choose another UPI app." | "Try again", "Choose another app", "Cancel" |
| No UPI app found | Icon, "No UPI app found", "Install a UPI app such as GPay or PhonePe, then try again. Nothing was saved." | "Close", "Try again" |
| Did it go through? | Subtitle "₹120 to Cafe Mocha"; with a hint, a box "Your UPI app said this payment went through. It may not be right, so please check and answer below." (or "failed"); field "What was this for?"; category choices Food, Shopping, Bills, Transport, Other; note "We will remind you every hour until you answer." | "Yes, it went through", "No, it failed", "Decide later" |
| Payment failed | Icon, "Payment failed", "It is saved as Failed and not counted in your totals. You can try again.", summary (name, UPI ID or "Paid to a friend", amount), with a hint "Your UPI app also said this payment failed.", note "Trying again starts a new payment. This one stays in History as Failed." | "Try again", "Edit details", "Keep as failed" |
| Edit payment | Fields "Amount", "To whom", "What was this for?"; category choices; status "Done, Failed, Pending"; when Failed, note "Trying again starts a new payment. This one stays Failed." | "Save changes", "Try again" (only when Failed), "Delete payment" |
| Delete this payment? | "₹60 to Bikash Murmu will be removed from your history and totals. This cannot be undone." | "Cancel", "Delete" |
| Add a payment | Subtitle "Paid outside this app"; "Amount", "To whom / what for", category choices, "Date" (stepper, never past today), status "Done, Failed" | "Cancel", "Save" |
| Import backup? | Subtitle "{n} payments, Jan to Oct 2026"; options "Merge with my data" ("Adds {n} new payments and skips duplicates.") and "Replace everything" ("Erases your {n} payments on this phone first.") | "Cancel", "Import" |
| Could not import | Icon, "Could not import", "The file could not be read. Pick a backup that was exported from Track Pay." | "Close", "Pick another file" |
| Export your data | "This file contains all your payments and is not encrypted. Anyone who gets it can read it. Keep it somewhere private." | "Cancel", "Export" |
| PDF statement | Subtitle "Choose a month"; month choices; switch "Include failed payments" ("Shown but not counted in the total") | "Cancel", "Create PDF" |
| Quiet hours | Subtitle "Reminders wait until quiet hours end"; steppers "Start", "End"; note "Pick the same time for both to turn quiet hours off." | "Done" |
| Show payments | Choices All, Done, Failed, Pending | none |
| Choose a month | Month choices | none |
| Allow notifications | Icon, "Get reminders for pending payments", "One reminder an hour while a payment needs confirming, never at night. You can confirm it right from the notification." | "Not now", "Allow" |
| Allow camera | Icon, "Allow camera to scan QR codes", "The camera is only used to read UPI QR codes. Nothing is saved or sent." | "Not now", "Allow" |
| Camera is off | Icon, "Camera is off", "Turn it on in Android settings to scan QR codes." | "Not now", "Open settings" |

### Retry rules
- Appears after "No, it failed", in Edit payment when the status is Failed, and as the "Try again" action on a failed notification.
- Try again always creates a **new** pending payment; the failed one stays as history and is never counted.
- QR payments reopen Confirm payment with the same shop, amount and note. Friend payments reopen Pay to a friend with the same name and amount.
- A hint from the UPI app never changes a status by itself. No limit on attempts.
- If the UPI app does not open: "Couldn't open {app}" appears and nothing is saved.

## 3. Phone notifications

| Notification | Title | Body | Actions | Reply box |
|---|---|---|---|---|
| Payment started | "Payment to Bikash Murmu" | "₹60 · Saved as pending" | Done, Failed, Edit | "Name this payment" |
| Hourly reminder | "3 payments need confirming" | "Bikash Murmu ₹60 · Tea stall ₹40 · 1 more" | Done, Failed, Open | "Name it" |
| Payment failed | "Payment failed" | "₹60 to Bikash Murmu" | Try again, Edit | none |
| Quick add (ongoing) | "Quick add" | "Log a payment without opening the app" | "Add payment" | none |
| Lock screen (details off) | "Payment pending" / "3 payments need confirming" | "Unlock to see details" / "Unlock to confirm them" | none | none |

Reminders: every hour while anything is pending, none during quiet hours (default 11 pm to 7 am), cancelled when nothing is pending. Channels: "Payment confirmations" (high), "Hourly reminders" (default), "Quick add" (low, ongoing).

## 4. States and rules

- Totals include Done and Pending and exclude Failed. Failed rows still appear in History and Recent payments.
- Formulas: `ARCHITECTURE.md` section 7.
- A row shows the note if set, otherwise the payee. The avatar letter is its first letter, uppercase.
- Dates: "Today", "Mon D", "Mon D, YYYY" when the year differs. Month headings "October 2026".
- Pluralise: "1 payment needs confirming", "3 payments need confirming".
- Empty names: "Friend" (Pay to a friend), "Payment" (Add a payment).
- Disabled: primary actions are disabled while a required value is invalid.
- Pressed, focused and disabled states are defined visually in `DESIGN-BUILD-PLAN.md`.

## 5. Validation messages (under the field)
- Empty or zero amount: "Enter an amount greater than ₹0".
- More than 2 decimals: "Use at most 2 decimal places".
- Over ₹99,99,999.99: "That amount is too large".
- Future date: "Choose today or an earlier date".
- "To whom" up to 40 characters, "What was this for?" up to 60; the field stops accepting input.

## 6. Toasts
"Couldn't save the payment. Try again." (Retry); "Backup file is not valid. Nothing was changed."; "Backup is from a newer version of the app."; "Payment deleted" (Undo); "Backup saved"; "PDF ready" (Open); "This is not a UPI QR code".

## 7. Open decisions (ask, do not invent)
1. Onboarding step 2 content (proposed: optional monthly limit).
2. Profile picture (needs a dependency and a permission).
3. Preferred UPI app ("Primary").
4. Whether the top bar stays on Home, because the original Home design has no header.
5. Light and dark colour questions are in `DESIGN-BUILD-PLAN.md` B1.
6. Tablet and landscape: not designed; lock to portrait.
