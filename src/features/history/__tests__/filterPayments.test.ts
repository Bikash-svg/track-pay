import type { Payment } from '../../../data/payments';
import { filterPayments } from '../filterPayments';

function makePayment(createdAt: Date, id = '1'): Payment {
  return {
    id,
    amountPaise: 10000,
    payeeName: 'Alice',
    payeeVpa: null,
    label: null,
    category: 'Food',
    status: 'success',
    source: 'manual',
    reviewed: true,
    createdAt: createdAt.getTime(),
    paidAt: null,
    upiRef: null,
  };
}

describe('filterPayments', () => {
  it('returns every payment when there is no range', () => {
    const payments = [
      makePayment(new Date(2026, 9, 1), 'a'),
      makePayment(new Date(2026, 9, 20), 'b'),
    ];

    const result = filterPayments(payments, { from: null, to: null });

    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('filters from a start date only', () => {
    const payments = [
      makePayment(new Date(2026, 9, 9, 12), 'before'),
      makePayment(new Date(2026, 9, 10, 12), 'on'),
      makePayment(new Date(2026, 9, 11, 12), 'after'),
    ];

    const result = filterPayments(payments, {
      from: new Date(2026, 9, 10),
      to: null,
    });

    expect(result.map((p) => p.id)).toEqual(['on', 'after']);
  });

  it('filters to an end date only', () => {
    const payments = [
      makePayment(new Date(2026, 9, 9, 12), 'before'),
      makePayment(new Date(2026, 9, 10, 12), 'on'),
      makePayment(new Date(2026, 9, 11, 12), 'after'),
    ];

    const result = filterPayments(payments, {
      from: null,
      to: new Date(2026, 9, 10, 23, 59, 59, 999),
    });

    expect(result.map((p) => p.id)).toEqual(['before', 'on']);
  });

  it('includes both ends of a bounded range', () => {
    const from = new Date(2026, 9, 10);
    const to = new Date(2026, 9, 12, 23, 59, 59, 999);
    const payments = [
      makePayment(new Date(2026, 9, 9, 12), 'before'),
      makePayment(from, 'first'),
      makePayment(new Date(2026, 9, 11, 12), 'middle'),
      makePayment(to, 'last'),
      makePayment(new Date(2026, 9, 13, 0), 'after'),
    ];

    const result = filterPayments(payments, { from, to });

    expect(result.map((p) => p.id)).toEqual(['first', 'middle', 'last']);
  });

  it('returns an empty array when nothing is in range', () => {
    const payments = [makePayment(new Date(2026, 8, 1), 'old')];

    expect(
      filterPayments(payments, {
        from: new Date(2026, 9, 1),
        to: new Date(2026, 9, 31),
      }),
    ).toEqual([]);
  });
});
