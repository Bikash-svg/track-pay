// Payment state machine.
//
// Per ARCHITECTURE.md §6 and EVALS S1-S4:
//   created -> pending -> success
//                       -> failed
// Only the user moves a payment to success or failed. A UPI result is a hint
// and is display-only: it never passes through isValidTransition (S4).
//
// Only src/data/payments.ts calls this. Nothing else decides a payment's
// status. If a screen needs a status it reads it from the row; it never
// writes one.
//
// S3: success or failed can be edited back to pending or to the other
// status by the user, so every non-pending state can move both ways.

export type PaymentStatus = 'pending' | 'success' | 'failed';

// A new payment starts here. The constant exists so every creator agrees on
// the same value instead of typing the string by hand.
export const INITIAL_STATUS: PaymentStatus = 'pending';

// Is the user allowed to move a payment from `from` to `to`?
// pending -> pending is not allowed: that is not a change.
export function isValidTransition(from: PaymentStatus, to: PaymentStatus): boolean {
  if (from === 'pending') return to === 'success' || to === 'failed';
  if (from === 'success') return to === 'failed' || to === 'pending';
  if (from === 'failed') return to === 'success' || to === 'pending';
  return false;
}