// Month statistics for Track A Home (Step 3.1). Pure TypeScript: no React, no
// react-native, no expo, no storage, no console, no Date.now(). The caller
// passes the moment in, so the tests are timezone-independent.
//
// All amounts are integer paise (D10, GUARDRAILS §1.3). Any field returning an
// amount returns integer paise.
//
// Limit-dependent fields are null when limit is null or <= 0 (GUARDRAILS §6:
// the monthly limit is optional; no limit-dependent UI must appear). The UI
// branches on null; do not substitute 0.
//
// allowancePerDay floors at RUPEES, not paise: Math.floor(left / remaining / 100)
// * 100. The spec example (left ₹11,370 over 20 days) is ₹568/day. Flooring at
// paise would give 56850 paise, which formatMoney (Math.round) renders as ₹569
// — wrong. Flooring at rupees gives 56800 paise → ₹568, matching ARCHITECTURE.md
// §7 and EVALS A9.
//
// dailyAverage and projectedMonthEnd are computed from spent and days only, so
// they stay numbers even when the limit is off. left is signed: over the limit
// it is negative, and the UI computes "over by X" from Math.abs(left) (Step 3.2).
//
// Days: today counts. On 11 Oct in a 31-day month, daysElapsed = 11 and
// daysRemaining = 20. daysRemaining is floored at 1 so the last day of the
// month divides by 1, not 0 (ARCHITECTURE.md §7 "minimum 1 day").

export type StatsLevel = 'ok' | 'warn' | 'over';

export interface MonthStats {
  readonly spent: number; // paise, always a number
  readonly dailyAverage: number; // paise, always a number
  readonly projectedMonthEnd: number; // paise, always a number
  readonly limit: number | null; // echo of input
  readonly left: number | null; // null when limit is null or <= 0
  readonly headroom: number | null; // null when limit is null or <= 0
  readonly percentUsed: number | null; // null when limit is null or <= 0
  readonly allowancePerDay: number | null; // null when limit is null or <= 0
  readonly level: StatsLevel | null; // null when limit is null or <= 0
  readonly daysElapsed: number;
  readonly daysRemaining: number;
  readonly daysInMonth: number;
}

export function daysInMonth(now: Date): number {
  // Day 0 of the next month is the last day of the current month.
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function daysElapsed(now: Date): number {
  // Today counts, so day 11 of the month has 11 elapsed.
  return now.getDate();
}

export function daysRemaining(now: Date): number {
  // Minimum 1 day: on the last day of the month this is 0 without the floor,
  // which would divide by zero when computing allowance per day.
  return Math.max(daysInMonth(now) - daysElapsed(now), 1);
}

export function computeMonthStats({
  spent,
  limit,
  now,
}: {
  spent: number;
  limit: number | null;
  now: Date;
}): MonthStats {
  const dim = daysInMonth(now);
  const elapsed = daysElapsed(now);
  const remaining = daysRemaining(now);

  const dailyAverage = Math.floor(spent / elapsed);
  const projectedMonthEnd = dailyAverage * dim;

  // Limit-dependent fields only exist when limit is a positive number.
  const hasLimit = typeof limit === 'number' && limit > 0;
  if (!hasLimit) {
    return {
      spent,
      dailyAverage,
      projectedMonthEnd,
      limit: null,
      left: null,
      headroom: null,
      percentUsed: null,
      allowancePerDay: null,
      level: null,
      daysElapsed: elapsed,
      daysRemaining: remaining,
      daysInMonth: dim,
    };
  }

  const left = limit - spent;
  const headroom = limit - projectedMonthEnd;
  const percentUsed = Math.floor((spent / limit) * 100);
// CRITICAL: floor at RUPEES not paise. floor(left/remaining/100)*100.
  // Spec example: left=1137000 paise (₹11,370), remaining=20 → ₹568/day, i.e.
  // 56800 paise. Math.floor(1137000/20)=56850 would display via formatMoney
  // (Math.round) as ₹569 — WRONG.
  const allowancePerDay = Math.floor(left / remaining / 100) * 100;

  let level: StatsLevel;
  if (percentUsed < 80) level = 'ok';
  else if (percentUsed <= 100) level = 'warn';
  else level = 'over';

  return {
    spent,
    dailyAverage,
    projectedMonthEnd,
    limit,
    left,
    headroom,
    percentUsed,
    allowancePerDay,
    level,
    daysElapsed: elapsed,
    daysRemaining: remaining,
    daysInMonth: dim,
  };
}