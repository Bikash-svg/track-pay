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
  seeAll: 'See all',
  // NOTE (4-B.0): stale string — mentions "Scan a QR" which is retired.
  // Home is rebuilt in 4-B.4 and the new empty state per COPY.md is
  // "No payments yet. Share a payment screenshot or add one by hand."
  // Kept as-is for 4-B.0 (item 9 does not name it). Fix in 4-B.4.
  noPayments: 'No payments yet. Scan a QR or add one.',
  recentPayments: 'Recent Payments',
  today: 'Today',
  done: 'Done',
  edit: 'Edit',
  cancel: 'Cancel',
  save: 'Save',
  deletePayment: 'Delete payment',
  enterAmountGreaterThanZero: 'Enter an amount greater than ₹0',
  useAtMostTwoDecimals: 'Use at most 2 decimal places',
  thatAmountIsTooLarge: 'That amount is too large',
  amount: 'Amount',
  // 4-B.3 payment form (already in COPY.md dialogs).
  toWhom: 'To whom',
  whatWasThisFor: 'What was this for?',
  exportData: 'Export data',
  skipForNow: 'Skip for now',
  firstName: 'First name',
  surname: 'Surname',
  continueLabel: 'Continue',
  // Notification permission (Phase 8), per COPY.md §2.
  notNow: 'Not now',
  allow: 'Allow',
} as const;