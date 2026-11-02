export const copy = {
  appName: 'Track Pay',
  profile: 'Profile',
  spendOn: (month: string) => `Spend on ${month}`,
  limit: (amount: string) => `Limit ${amount}`,
  leftPerDay: (left: string, perDay: string, days: number) =>
    `${left} left · about ${perDay} a day for ${days} days`,
  overBy: (amount: string) => `Over by ${amount}`,
  xLeft: (amount: string) => `${amount} left`,
  dailyAverage: (amount: string) => `${amount} a day on average`,
  // 4-B.7 batch result: "Review" button for the saved payments.
  review: 'Review',
  history: 'History',
  addFromScreenshot: 'Add from screenshot',
  addManually: 'Add manually',
  shareHint: 'Pay in any UPI app, then share the success screenshot here.',
  basedOnPayments: 'Based on payments recorded in Track Pay',
  // NOTE (4-B.0): stale string — mentions "Scan a QR" which is retired.
  // Home is rebuilt in 4-B.4 and the new empty state per COPY.md is
  // "No payments yet. Share a payment screenshot or add one by hand."
  // Kept as-is for 4-B.0 (item 9 does not name it). Fix in 4-B.4.
  noPayments: 'No payments yet. Share a payment screenshot or add one by hand.',
  recentPayments: 'Recent Payments',
  today: 'Today',
  done: 'Done',
  edit: 'Edit',
  cancel: 'Cancel',
  save: 'Save',
  saveChanges: 'Save changes',
  deletePayment: 'Delete payment',
  undo: 'Undo',
  close: 'Close',
  paymentAdded: 'Payment added',
  looksRight: 'Looks right',
  alreadyAdded: 'This payment is already in Track Pay.',
  couldntRead: "Couldn't read this screenshot. Nothing was saved.",
  notSuccessful:
    'This screenshot shows a payment that did not go through. Nothing was saved.',
  enterManually: 'Enter manually',
  to: 'To',
  checkThese:
    'Check these against your payment. They were read from your screenshot.',
  enterAmountGreaterThanZero: 'Enter an amount greater than ₹0',
  useAtMostTwoDecimals: 'Use at most 2 decimal places',
  thatAmountIsTooLarge: 'That amount is too large',
  amount: 'Amount',
  // 4-B.3 payment form (already in COPY.md dialogs).
  toWhom: 'To whom',
  whatWasThisFor: 'What was this for?',
  date: 'Date',
  category: 'Category',
  exportData: 'Export data',
  skipForNow: 'Skip for now',
  firstName: 'First name',
  surname: 'Surname',
  continueLabel: 'Continue',
  // Notification permission (Phase 8), per COPY.md §2.
  notNow: 'Not now',
  allow: 'Allow',
} as const;
