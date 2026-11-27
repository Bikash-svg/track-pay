import type { Payment } from '../../data/payments';

export interface DateRange {
  readonly from: Date | null;
  readonly to: Date | null;
}

export function filterPayments(
  payments: readonly Payment[],
  range: DateRange,
): Payment[] {
  if (range.from === null && range.to === null) return [...payments];
  const from = range.from ? range.from.getTime() : -Infinity;
  const to = range.to ? range.to.getTime() : Infinity;
  return payments.filter((p) => p.createdAt >= from && p.createdAt <= to);
}
