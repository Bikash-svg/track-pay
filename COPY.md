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
- Notifications, {n} pending
- Profile

## Home

- Spend on {Month}
- Limit ₹15,000
- ₹11,370 left · about ₹568 a day for 20 days
- Over by ₹X
- ₹X left
- ₹330 a day on average
- Scan QR
- Pay to a friend
- Pay
- Add a payment already made
- {n} payment needs confirming
- {n} payments need confirming
- Review
- See all
- No payments yet. Scan a QR or add one.
- ₹60 · Food
- Today
- Oct 10
- Oct 10, 2025

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
- {n} pending, ₹X
- {n} failed
- No spending this month
- of ₹15,000
- 12.5k
- ● Most spent
- ● Least spent
- Based on payments recorded in Track Pay.

## History (title "History", filter "All ▾")

- History
- All ▾
- Search payee, note or category
- {Month} {Year}
- Spent ₹X
- Export data
- No payments yet
- Scan a QR or add a payment you already made.

## Settings

- Dark, Light, Auto
- Home and Analytics show what is left
- Limit per month
- +₹2,000
- +₹5,000
- −₹1,000
- Quick-add a payment without opening the app
- No reminders from 11 pm to 7 am
- Show details on lock screen
- Off: notifications only say a payment is pending
- Battery settings
- Refresh list
- Save all payments as a backup file
- Restore payments from a backup file
- Pick a month and save it as a PDF
- Track Pay keeps everything on this phone. It records payments you start or add. It does not detect payments made elsewhere.

## Needs confirming (page with Back arrow)

- All
- Unconfirmed
- Done
- Failed
- Edit
- Name it
- Nothing to confirm
- All your payments are confirmed.

## QR scanner (full screen)

- Scan a UPI QR
- Point the camera at a UPI QR code
- Enter details instead
- This is not a UPI QR code

## 2. Dialogs (centred)

- Did it go through?
- Amount
- To whom
- Pay with
- Your UPI app opens next. This payment is saved as pending.
- Enter an amount greater than ₹0
- No UPI app was found on this phone. Install a UPI app such as GPay or PhonePe, then try again.
- Amount (you can change it)
- What was this for?
- Cancel
- Make payment
- Couldn't open GPay
- The payment was not started and nothing was saved. Try again, or choose another UPI app.
- Try again
- Choose another app
- No UPI app found
- Install a UPI app such as GPay or PhonePe, then try again. Nothing was saved.
- Close
- ₹120 to Cafe Mocha
- Your UPI app said this payment went through. It may not be right, so please check and answer below.
- failed
- We will remind you every hour until you answer.
- Yes, it went through
- No, it failed
- Decide later
- Payment failed
- It is saved as Failed and not counted in your totals. You can try again.
- Paid to a friend
- Your UPI app also said this payment failed.
- Trying again starts a new payment. This one stays in History as Failed.
- Edit details
- Keep as failed
- Done, Failed, Pending
- Trying again starts a new payment. This one stays Failed.
- Save changes
- Delete payment
- ₹60 to Bikash Murmu will be removed from your history and totals. This cannot be undone.
- Delete
- Paid outside this app
- To whom / what for
- Date
- Done, Failed
- Save
- {n} payments, Jan to Oct 2026
- Merge with my data
- Adds {n} new payments and skips duplicates.
- Replace everything
- Erases your {n} payments on this phone first.
- Import
- Could not import
- The file could not be read. Pick a backup that was exported from Track Pay.
- Pick another file
- This file contains all your payments and is not encrypted. Anyone who gets it can read it. Keep it somewhere private.
- Export
- Choose a month
- Include failed payments
- Shown but not counted in the total
- Create PDF
- Reminders wait until quiet hours end
- Start
- End
- Pick the same time for both to turn quiet hours off.
- Done
- Get reminders for pending payments
- One reminder an hour while a payment needs confirming, never at night. You can confirm it right from the notification.
- Not now
- Allow
- Allow camera to scan QR codes
- The camera is only used to read UPI QR codes. Nothing is saved or sent.
- Camera is off
- Turn it on in Android settings to scan QR codes.
- Open settings

## Retry rules

- No, it failed
- Try again
- Couldn't open {app}

## 3. Phone notifications

- Payment to Bikash Murmu
- ₹60 · Saved as pending
- Name this payment
- 3 payments need confirming
- Bikash Murmu ₹60 · Tea stall ₹40 · 1 more
- Name it
- Payment failed
- ₹60 to Bikash Murmu
- Quick add
- Log a payment without opening the app
- Add payment
- Payment pending
- Unlock to see details
- Unlock to confirm them
- Payment confirmations
- Hourly reminders

## 4. States and rules

- Today
- Mon D
- Mon D, YYYY
- October 2026
- 1 payment needs confirming
- 3 payments need confirming
- Friend
- Payment

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
- Backup saved
- PDF ready
- This is not a UPI QR code

## 7. Open decisions (ask, do not invent)

- Primary
