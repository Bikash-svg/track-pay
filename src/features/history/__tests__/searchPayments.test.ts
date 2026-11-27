import type { Payment } from '../../../data/payments';
import { searchPayments } from '../searchPayments';

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

describe('searchPayments', () => {
  it('matches payee names case-insensitively', () => {
    const payments = [
      makePayment({ id: 'a', payeeName: 'Alice' }),
      makePayment({ id: 'b', payeeName: 'Bob' }),
    ];

    const result = searchPayments(payments, 'ALI');

    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('matches the note/label', () => {
    const payments = [
      makePayment({ id: 'a', payeeName: 'Bob', label: 'Coffee with team' }),
      makePayment({ id: 'b', payeeName: 'Carol', label: 'Groceries' }),
    ];

    const result = searchPayments(payments, 'coffee');

    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('matches the category', () => {
    const payments = [
      makePayment({ id: 'a', category: 'Transport' }),
      makePayment({ id: 'b', category: 'Food' }),
    ];

    const result = searchPayments(payments, 'trans');

    expect(result.map((p) => p.id)).toEqual(['a']);
  });

  it('returns an empty array when nothing matches', () => {
    const payments = [makePayment({ payeeName: 'Alice' })];

    expect(searchPayments(payments, 'zzz')).toEqual([]);
  });

  it('returns all payments for an empty query', () => {
    const payments = [
      makePayment({ id: 'a' }),
      makePayment({ id: 'b', payeeName: 'Bob' }),
    ];

    expect(searchPayments(payments, '')).toEqual(payments);
  });
});
