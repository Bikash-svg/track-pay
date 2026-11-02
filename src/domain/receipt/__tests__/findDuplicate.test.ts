import { findDuplicate, type PaymentLike } from '../findDuplicate';
import type { ParsedReceipt } from '../parseReceipt';

const PAID_AT = new Date(2026, 9, 15, 12, 0);

function receipt(overrides: Partial<ParsedReceipt> = {}): ParsedReceipt {
  return {
    amountPaise: 5000,
    payeeName: 'Test User',
    paidAt: PAID_AT,
    upiRef: null,
    app: 'gpay',
    ...overrides,
  };
}

function payment(overrides: Partial<PaymentLike> = {}): PaymentLike {
  return {
    id: 'payment-1',
    amountPaise: 5000,
    payeeName: 'Test User',
    paidAt: PAID_AT.getTime(),
    createdAt: PAID_AT.getTime(),
    upiRef: null,
    ...overrides,
  };
}

describe('findDuplicate', () => {
  it('returns null when there are no existing payments', () => {
    expect(findDuplicate([], receipt())).toBeNull();
  });

  it('returns an exact UPI reference match', () => {
    const existing = payment({ upiRef: 'T0000001' });

    expect(findDuplicate([existing], receipt({ upiRef: 'T0000001' }))).toBe(existing);
  });

  it('matches amount, payee, and time within two minutes without a UPI reference', () => {
    const existing = payment({ paidAt: PAID_AT.getTime() + 60_000 });

    expect(findDuplicate([existing], receipt())).toBe(existing);
  });

  it('does not match equal amount and payee five minutes apart', () => {
    const existing = payment({ paidAt: PAID_AT.getTime() + 300_000 });

    expect(findDuplicate([existing], receipt())).toBeNull();
  });

  it('does not match when the payee differs', () => {
    const existing = payment({ payeeName: 'Other Test User' });

    expect(findDuplicate([existing], receipt())).toBeNull();
  });

  it('does not match when the amount differs', () => {
    const existing = payment({ amountPaise: 5001 });

    expect(findDuplicate([existing], receipt())).toBeNull();
  });

  it('falls back to amount, payee, and time when UPI references differ', () => {
    const existing = payment({ upiRef: 'T0000001' });

    expect(findDuplicate([existing], receipt({ upiRef: 'T0000002' }))).toBe(existing);
  });

  it('treats an empty parsed UPI reference as absent', () => {
    const existing = payment();

    expect(findDuplicate([existing], receipt({ upiRef: '' }))).toBe(existing);
  });

  it('does not time-match when the receipt has no paid-at value', () => {
    const existing = payment();

    expect(findDuplicate([existing], receipt({ paidAt: null }))).toBeNull();
  });

  it('matches at the inclusive two-minute boundary', () => {
    const existing = payment({ paidAt: PAID_AT.getTime() + 120_000 });

    expect(findDuplicate([existing], receipt())).toBe(existing);
  });

  it('does not match one millisecond beyond the two-minute boundary', () => {
    const existing = payment({ paidAt: PAID_AT.getTime() + 120_001 });

    expect(findDuplicate([existing], receipt())).toBeNull();
  });
});
