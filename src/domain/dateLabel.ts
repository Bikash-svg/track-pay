// Date label for payment rows per COPY.md §4 (Home, states): 'Today' for the
// same calendar day, 'Mon D' for another day in the same year, 'Mon D, YYYY'
// otherwise. NO 'Yesterday' case — COPY.md does not specify one. Both arguments
// are injected so the function is pure (no Date.now).
//
// Pure TypeScript: no React, no react-native, no expo, no storage, no console.
// The caller (Home) passes the payment moment and the screen's reference now.

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function dateLabel(date: Date, referenceNow: Date): string {
  const sameDay =
    date.getFullYear() === referenceNow.getFullYear() &&
    date.getMonth() === referenceNow.getMonth() &&
    date.getDate() === referenceNow.getDate();
  if (sameDay) return 'Today';

  const label = `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  return date.getFullYear() === referenceNow.getFullYear()
    ? label
    : `${label}, ${date.getFullYear()}`;
}