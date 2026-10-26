# COPY (all text in the app)

Every piece of user-visible text, grouped by screen. Generated from `DESIGN.md`; if the two disagree, fix `DESIGN.md` first and regenerate this file. In code the strings may live in `src/ui/copy.ts`. Do not reword, add exclamation marks, or add jokes. `{n}`, `{app}`, `{Month}` are filled in by the app.

## Splash

- Track Pay

## Onboarding

- Skip for now
- First name
- Surname
- Good morning, {First name}
- Good morning
- Continue
- Set a monthly limit
- Continue to App

## Top bar (all tab screens)

- Track Pay
- Profile

## Home

- Good morning, {First name}
- {Month}
- Spend on {Month}
- Limit ₹15,000
- Left ₹11,370
- Allowance a day ₹568
- Over by ₹X
- ₹X left
- Based on payments recorded in Track Pay
- Add from screenshot
- Add manually
- Pay in any UPI app, then share the success screenshot here.
- This month at a glance
- Daily pace ₹330 a day
- Month-end estimate ₹10,230 (estimate)
- Versus last month
- Analytics
- Recent payments
- History
- Not verified
- No payments yet. Share a payment screenshot or add one by hand.
- ₹60 · Food
- Today
- Oct 10
- Oct 10, 2025

## Receipt result

- Payment added
- To
- Check these against your payment. They were read from your screenshot.
- Looks right
- Edit
- Undo
- This payment is already in Track Pay.
- Done
- Couldn't read this screenshot. Nothing was saved.
- Enter manually
- Close
- This screenshot shows a payment that did not go through. Nothing was saved.

## Batch result

- Screenshots read
- {n} added
- {n} already added
- {n} couldn't be read
- Review
- Done

## Analytics (title "Analytics", month picker "{Month} ▾")

- Analytics
- {Month} ▾
- Monthly limit
- ₹3,630 of ₹15,000
- 24% used
- ₹11,370 left
- ₹X over
- Daily average ₹330
- Projected month end ₹10,230 (estimate)
- Headroom ₹4,770
- vs last month, same days: {+/-}{n}% ({amount})
- No spending this month
- of ₹15,000
- 12.5k
- ● Most spent
- ● Least spent
- Based on payments recorded in Track Pay.

## History (title "History", filter "All ▾")

- History
- All ▾
- Not verified
- Search payee, note or category
- {Month} {Year}
- Spent ₹X
- Export data
- No payments yet.

## Settings

- Dark, Light, Auto
- Home and Analytics show what is left
- Limit per month
- +₹2,000
- +₹5,000
- −₹1,000
- Limit alerts at 80% and 100% are always on while a limit is set.
- Daily reminders
- Reminder times
- No reminders from 11 pm to 7 am
- Monthly backup reminder
- Show details on lock screen
- Off: notifications only say a payment was added
- Battery settings
- Save all payments as a backup file
- Restore payments from a backup file
- Pick a month and save it as a PDF
- Track Pay keeps everything on this phone. It records payments you share as screenshots or add by hand. It does not detect payments made elsewhere and it never starts a payment.

## 2. Dialogs (centred)

- Paid in another UPI app
- Amount
- To whom
- What was this for?
- Date
- Cancel
- Save
- Save changes
- Delete payment
- ₹60 to Bikash Murmu will be removed from your history and totals. This cannot be undone.
- Delete
- {n} payments, Jan to Oct 2026
- Merge with my data
- Adds {n} new payments and skips duplicates.
- Replace everything
- Erases your {n} payments on this phone first.
- Import
- Could not import
- The file could not be read. Pick a backup that was exported from Track Pay.
- Pick another file
- Close
- This file contains all your payments and is not encrypted. Anyone who gets it can read it. Keep it somewhere private.
- Export
- Backup file
- Monthly PDF statement
- Continue
- Choose a month
- Create PDF
- How many times a day
- Reminders wait until quiet hours end
- Start
- End
- Pick the same time for both to turn quiet hours off.
- Done
- Get reminders and payment receipts
- Track Pay tells you when a screenshot was read, reminds you to log payments, and warns you near your limit. Never at night.
- Not now
- Allow

## 3. Phone notifications

- Payment added
- ₹60 to Bikash Murmu · Food · Oct 10, 2:14 pm
- Looks right
- Edit
- Undo
- Couldn't read this screenshot
- Nothing was saved.
- Enter manually
- Already added
- ₹60 to Bikash Murmu is already in Track Pay.
- {n} payments added
- Tap to review them.
- Review
- Any payments to add?
- Share your payment screenshots to keep your month complete.
- Add screenshots
- No payments
- Snooze 1 hour
- 80% of your limit used
- ₹12,000 of ₹15,000 spent in October.
- Monthly limit reached
- You have spent ₹15,000 of ₹15,000 in October.
- Back up your {Month} spending
- Export last month's payments so you do not lose them.
- Export now
- Remind me tomorrow
- Payment added from screenshot
- Time to log your payments
- Limit update
- Unlock to see details
- Receipt confirmations
- Daily log reminders
- Limit alerts
- Backup reminders

## 4. States and rules

- Today
- Mon D
- Mon D, YYYY
- October 2026
- Unknown

## 5. Validation messages (under the field)

- Enter an amount greater than ₹0
- Use at most 2 decimal places
- That amount is too large
- Choose today or an earlier date
- To whom
- What was this for?

## 6. Toasts

- Couldn't save the payment. Try again.
- Backup file is not valid. Nothing was changed.
- Backup is from a newer version of the app.
- Payment deleted
- Payment added
- Marked as verified
- Backup saved
- PDF ready