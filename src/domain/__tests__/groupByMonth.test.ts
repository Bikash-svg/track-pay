import type { Payment } from '../../data/payments';
import { groupByMonth } from '../../features/history/groupByMonth';

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: '1',
    amountPaise: 10000,
    payeeName: 'Alice',
    payeeVpa: null,
    label: null,
    category: 'Food',
    status: 'success',
    source: 'manual',
    reviewed: true,
    createdAt: new Date(2026, 9, 5, 10, 0).getTime(),
    paidAt: null,
    upiRef: null,
    ...overrides,
  };
}

describe('groupByMonth', () => {
  it('groups payments by calendar month', () => {
    const payments = [
      makePayment({ id: 'a', createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ id: 'b', createdAt: new Date(2026, 9, 20).getTime() }),
      makePayment({ id: 'c', createdAt: new Date(2026, 8, 30).getTime() }),
    ];

    const groups = groupByMonth(payments);

    expect(groups).toHaveLength(2);
    const october = groups.find((g) => g.year === 2026 && g.month === 9);
    const september = groups.find((g) => g.year === 2026 && g.month === 8);
    expect(october?.payments.map((p) => p.id)).toEqual(['a', 'b']);
    expect(september?.payments.map((p) => p.id)).toEqual(['c']);
  });

  it('sorts groups newest month first', () => {
    const payments = [
      makePayment({ id: 'sep', createdAt: new Date(2026, 8, 1).getTime() }),
      makePayment({ id: 'oct', createdAt: new Date(2026, 9, 1).getTime() }),
      makePayment({ id: 'nov', createdAt: new Date(2026, 10, 1).getTime() }),
    ];

    const groups = groupByMonth(payments);

    expect(groups.map((g) => `${g.year}-${g.month}`)).toEqual([
      '2026-10',
      '2026-9',
      '2026-8',
    ]);
  });

  it('returns an empty array for no payments', () => {
    expect(groupByMonth([])).toEqual([]);
  });

  it('returns one group for a single month', () => {
    const payments = [
      makePayment({ id: 'a', createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ id: 'b', createdAt: new Date(2026, 9, 6).getTime() }),
    ];

    const groups = groupByMonth(payments);

    expect(groups).toHaveLength(1);
    expect(groups[0].year).toBe(2026);
    expect(groups[0].month).toBe(9);
    expect(groups[0].payments).toHaveLength(2);
  });

  it('sorts across a year boundary', () => {
    const payments = [
      makePayment({ id: 'dec', createdAt: new Date(2025, 11, 31).getTime() }),
      makePayment({ id: 'jan', createdAt: new Date(2026, 0, 1).getTime() }),
    ];

    const groups = groupByMonth(payments);

    expect(groups.map((g) => `${g.year}-${g.month}`)).toEqual([
      '2026-0',
      '2025-11',
    ]);
  });
});
