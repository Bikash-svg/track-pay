// Analytics maths for Track Pay (Step 5.1). Pure TypeScript: no React, no
// react-native, no expo, no storage, no console, no Date.now(). The caller
// passes the moment in, so the tests are timezone-independent.
//
// All amounts are integer paise (D10, GUARDRAILS §1.3). A payment belongs to
// a month based on createdAt (epoch ms -> new Date(createdAt)).
//
// Month and day filters use the local-time fields of createdAt, matching
// monthStats. Old rows whose status !== 'success' are never counted.

import { daysInMonth as daysInMonthFromDate } from './monthStats';
import type { Payment, PaymentCategory } from '../data/payments';

// Re-export so callers/tests can refer to PaymentCategory from this module.
export type { PaymentCategory };

type PaymentLike = Payment;

function toYearMonthDay(ts: number): { year: number; month: number; day: number } {
  const d = new Date(ts);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

function isSuccess(p: PaymentLike): boolean {
  return (p.status as string) === 'success';
}

export function monthlyTotal(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): number {
  let sum = 0;
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m } = toYearMonthDay(p.createdAt);
    if (y === year && m === month) sum += p.amountPaise;
  }
  return sum;
}

export function sameDayComparison(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
  day: number,
): { thisMonth: number; lastMonth: number; diff: number; percentChange: number | null } {
  let thisMonth = 0;
  let lastMonth = 0;

  let prevYear = year;
  let prevMonth = month - 1;
  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear = year - 1;
  }

  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m, day: d } = toYearMonthDay(p.createdAt);
    if (d > day) continue;
    if (y === year && m === month) thisMonth += p.amountPaise;
    else if (y === prevYear && m === prevMonth) lastMonth += p.amountPaise;
  }

  const diff = thisMonth - lastMonth;
  const percentChange = lastMonth > 0 ? Math.floor((diff / lastMonth) * 100) : null;
  return { thisMonth, lastMonth, diff, percentChange };
}

export function cumulativeSpendPerDay(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): number[] {
  const dim = daysInMonth(year, month);
  const perDay = new Array<number>(dim).fill(0);
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m, day: d } = toYearMonthDay(p.createdAt);
    if (y !== year || m !== month) continue;
    if (d < 1 || d > dim) continue;
    perDay[d - 1] += p.amountPaise;
  }
  const result: number[] = [];
  let running = 0;
  for (let i = 0; i < dim; i++) {
    running += perDay[i];
    result.push(running);
  }
  return result;
}

export function straightLineCeiling(limit: number | null, daysInMonth: number): number[] {
  if (limit === null || limit <= 0) return [];
  if (!daysInMonth || daysInMonth <= 0) return [];
  const result: number[] = [];
  for (let i = 0; i < daysInMonth; i++) {
    result.push(Math.floor((limit / daysInMonth) * (i + 1)));
  }
  return result;
}

export function categoryTotals(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): Record<PaymentCategory, number> {
  const totals: Record<PaymentCategory, number> = {
    Food: 0,
    Shopping: 0,
    Bills: 0,
    Transport: 0,
    Other: 0,
  };
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m } = toYearMonthDay(p.createdAt);
    if (y !== year || m !== month) continue;
    totals[p.category] += p.amountPaise;
  }
  return totals;
}

export function weekdayTotals(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): number[] {
  const result = [0, 0, 0, 0, 0, 0, 0];
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const d = new Date(p.createdAt);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const wd = d.getDay(); // 0 = Sunday
    if (wd >= 0 && wd <= 6) result[wd] += p.amountPaise;
  }
  return result;
}

export function topFivePayees(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): { payeeName: string; totalPaise: number; count: number }[] {
  const map = new Map<string, { totalPaise: number; count: number }>();
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m } = toYearMonthDay(p.createdAt);
    if (y !== year || m !== month) continue;
    const cur = map.get(p.payeeName) ?? { totalPaise: 0, count: 0 };
    cur.totalPaise += p.amountPaise;
    cur.count += 1;
    map.set(p.payeeName, cur);
  }
  const entries = Array.from(map.entries()).map(([payeeName, v]) => ({
    payeeName,
    totalPaise: v.totalPaise,
    count: v.count,
  }));
  entries.sort((a, b) => {
    if (b.totalPaise !== a.totalPaise) return b.totalPaise - a.totalPaise;
    if (a.payeeName < b.payeeName) return -1;
    if (a.payeeName > b.payeeName) return 1;
    return 0;
  });
  return entries.slice(0, 5);
}

export function daysWithoutPayment(
  payments: readonly PaymentLike[],
  year: number,
  month: number,
): number {
  const dim = daysInMonth(year, month);
  const hasPayment = new Array<boolean>(dim).fill(false);
  for (const p of payments) {
    if (!isSuccess(p)) continue;
    const { year: y, month: m, day: d } = toYearMonthDay(p.createdAt);
    if (y !== year || m !== month) continue;
    if (d >= 1 && d <= dim) hasPayment[d - 1] = true;
  }
  return hasPayment.filter((x) => !x).length;
}

export function daysInMonth(year: number, month: number): number {
  return daysInMonthFromDate(new Date(year, month, 1));
}

export function projectedMonthEnd(dailyAverage: number, daysInMonth: number): number {
  return dailyAverage * daysInMonth;
}
