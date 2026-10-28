// Amount parsing and validation.
//
// DESIGN.md §5 (the plan's "13.5" is a dead reference; §5 is the real rule):
//   - Empty, zero or a negative amount  -> "Enter an amount greater than ₹0"
//   - More than two decimal places      -> "Use at most 2 decimal places"
//   - Over ₹99,99,999.99                -> "That amount is too large"
//
// The error is returned as a KEY into `copy`, never as an English string, so
// the same rule feeds the dialog, the unit tests and any future surface
// without anyone rewording it. Money is integer paise (AI-RULES §10.3, D10);
// the float is rounded, never truncated.
//
// Pure: no React, no RN, no platform imports. `copy` is a plain object.

import { copy } from '../ui/copy';

export type AmountError = 'enterAmountGreaterThanZero' | 'useAtMostTwoDecimals' | 'thatAmountIsTooLarge';

export interface ParseOk {
  readonly paise: number;
}

export interface ParseErr {
  readonly errorKey: AmountError;
}

export type AmountParseResult = ParseOk | ParseErr;

// ₹99,99,999.99 in paise, inclusive. Anything above is too large.
const MAX_PAISE = 999999999;

// How many digits follow the decimal point, or 0 if there is none.
function decimalPlaces(input: string): number {
  const dot = input.indexOf('.');
  return dot === -1 ? 0 : input.length - dot - 1;
}

// Exact paise from a decimal string, with no float multiplication.
//
// parseFloat(x) * 100 is not exact: '99999999.99' * 100 comes out as
// 9999999998.999... and rounds wrong. Split the string on the dot instead:
// integer part x 100 plus the first two fractional digits. Every intermediate
// is a whole number well inside the safe-integer range, so the result is exact.
function toPaise(trimmed: string): number {
  const dot = trimmed.indexOf('.');
  const intPart = dot === -1 ? trimmed : trimmed.slice(0, dot);
  const fracPart = dot === -1 ? '' : trimmed.slice(dot + 1);
  const fracTwo = (fracPart + '00').slice(0, 2);
  return Number(intPart) * 100 + Number(fracTwo);
}

export function parseAmount(input: string): AmountParseResult {
  const trimmed = input.trim();
  if (trimmed === '') return { errorKey: 'enterAmountGreaterThanZero' };

  // A non-numeric value (letters, symbols) is treated as "no amount", not as
  // a decimal-formatting error.
  if (Number.isNaN(Number(trimmed)) || Number.isNaN(parseFloat(trimmed))) {
    return { errorKey: 'enterAmountGreaterThanZero' };
  }

  const value = parseFloat(trimmed);
  if (value <= 0) return { errorKey: 'enterAmountGreaterThanZero' };

  if (decimalPlaces(trimmed) > 2) {
    return { errorKey: 'useAtMostTwoDecimals' };
  }

  const paise = toPaise(trimmed);
  if (paise > MAX_PAISE) return { errorKey: 'thatAmountIsTooLarge' };

  return { paise };
}

// Input helper: paise -> "3630.00" (plain decimal for pre-filling text fields).
// NOT a display formatter — Money.tsx owns the ₹ currency formatting. Lives
// here so the payment form can pre-fill the amount field with a value
// that parseAmount can re-parse on the round-trip.
export function formatPaise(paise: number): string {
  const rupees = (paise / 100).toFixed(2);
  return rupees;
}

export function amountErrorString(errorKey: AmountError): string {
  return copy[errorKey];
}
