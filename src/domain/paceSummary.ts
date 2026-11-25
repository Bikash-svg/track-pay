// Pace summary for Track Pay Analytics (Step 5.2). Pure TypeScript: no React,
// no react-native, no expo, no storage, no console, no Date.now(). The caller
// passes `now` in, so the tests are timezone-independent.
//
// All amounts are integer paise (D10, GUARDRAILS §1.3). This module reuses the
// month maths in `monthStats` and the month filters in `analytics`; it does not
// duplicate either.
//
// `projectedMonthEnd` is an estimate (ARCHITECTURE.md §7) and must be labelled
// "estimate" wherever it is shown.

import type { Payment } from '../data/payments';
import { daysElapsed, daysInMonth } from './monthStats';
import { monthlyTotal, sameDayComparison } from './analytics';

export interface PaceSummary {
  readonly dailyAverage: number; // paise — spent ÷ daysElapsed (floor)
  readonly projectedMonthEnd: number; // paise — dailyAverage × daysInMonth (estimate)
  readonly headroom: number | null; // paise — limit − projectedMonthEnd
  readonly versusLastMonth: {
    readonly thisMonth: number; // paise — spent days 1..N this month
    readonly lastMonth: number; // paise — spent days 1..N last month
    readonly diff: number; // paise — thisMonth − lastMonth
    readonly percentChange: number | null; // floor((diff/lastMonth)×100) or null
    readonly direction: 'up' | 'down' | 'same'; // 'same' if diff === 0
  };
}

export function paceSummary(
  payments: readonly Payment[],
  limit: number | null,
  now: Date,
): PaceSummary {
  const year = now.getFullYear();
  const month = now.getMonth();

  const spent = monthlyTotal(payments, year, month);
  const elapsed = Math.max(daysElapsed(now), 1);
  const dailyAverage = Math.floor(spent / elapsed);
  const projectedMonthEnd = dailyAverage * daysInMonth(now);

  const hasLimit = limit !== null && limit > 0;
  const headroom = hasLimit ? (limit as number) - projectedMonthEnd : null;

  const comparison = sameDayComparison(payments, year, month, now.getDate());
  const direction: 'up' | 'down' | 'same' =
    comparison.diff > 0 ? 'up' : comparison.diff < 0 ? 'down' : 'same';

  return {
    dailyAverage,
    projectedMonthEnd,
    headroom,
    versusLastMonth: {
      thisMonth: comparison.thisMonth,
      lastMonth: comparison.lastMonth,
      diff: comparison.diff,
      percentChange: comparison.percentChange,
      direction,
    },
  };
}
