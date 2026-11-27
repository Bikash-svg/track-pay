import type { Payment } from '../../data/payments';

export interface MonthGroup {
  year: number;
  month: number;
  payments: Payment[];
}

export function groupByMonth(payments: readonly Payment[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>();
  for (const p of payments) {
    const d = new Date(p.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const existing = groups.get(key);
    if (existing) {
      existing.payments.push(p);
    } else {
      groups.set(key, {
        year: d.getFullYear(),
        month: d.getMonth(),
        payments: [p],
      });
    }
  }
  // Newest month first.
  return Array.from(groups.values()).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}
