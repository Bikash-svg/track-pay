// Validation for the payment form.
//
// Pure TypeScript, no React or platform imports.
// Uses the existing parseAmount from src/domain/amount.ts.

import { parseAmount } from './amount';

export type ValidationError = { field: string; message: string };

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: ValidationError[] };

export const MAX_AMOUNT_PAISE = 999999999;       // ₹99,99,999.99
export const MAX_PAYEE_LENGTH = 40;

export function validateAmount(raw: string): ValidationResult<number> {
  const parseResult = parseAmount(raw);
  
  // parseAmount returns either { paise: number } (success) or { errorKey: string } (error)
  if ('paise' in parseResult) {
    return { ok: true, value: parseResult.paise };
  }
  
  // It's an error case
  const errorKey = parseResult.errorKey;
  const errorMessages = {
    'enterAmountGreaterThanZero': 'Enter an amount greater than ₹0',
    'useAtMostTwoDecimals': 'Use at most 2 decimal places',
    'thatAmountIsTooLarge': 'That amount is too large',
  };
  return {
    ok: false,
    errors: [
      {
        field: 'amount',
        message: errorKey ? errorMessages[errorKey as keyof typeof errorMessages] : 'Validation error',
      },
    ],
  };
}

export function validatePayee(raw: string): ValidationResult<string> {
  const trimmed = raw.trim();
  const payeeName = trimmed === '' ? 'Unknown' : trimmed;
  if (payeeName.length > MAX_PAYEE_LENGTH) {
    // Truncate for display but don't error per spec
    return { ok: true, value: payeeName.slice(0, MAX_PAYEE_LENGTH) };
  }
  return { ok: true, value: payeeName };
}

export function validatePaidAt(date: Date, now: Date): ValidationResult<Date> {
  if (date > now) {
    return {
      ok: false,
      errors: [
        {
          field: 'paidAt',
          message: 'Choose today or an earlier date',
        },
      ],
    };
  }
  return { ok: true, value: date };
}

export const CATEGORIES = ['Food', 'Shopping', 'Bills', 'Transport', 'Other'] as const;
export type PaymentCategory = typeof CATEGORIES[number];