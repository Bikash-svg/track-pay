import { validateAmount, validatePayee, validatePaidAt, CATEGORIES } from '../paymentForm';

describe('validateAmount', () => {
  it('100 -> 10000 paise', () => {
    const result = validateAmount('100');
    expect(result).toEqual({ ok: true, value: 10000 });
  });

  it('100.50 -> 10050 paise', () => {
    const result = validateAmount('100.50');
    expect(result).toEqual({ ok: true, value: 10050 });
  });

  it('0 -> error', () => {
    const result = validateAmount('0');
    expect(result).toEqual({
      ok: false,
      errors: [{ field: 'amount', message: 'Enter an amount greater than ₹0' }],
    });
  });

  it('100.555 -> decimal error', () => {
    const result = validateAmount('100.555');
    expect(result).toEqual({
      ok: false,
      errors: [{ field: 'amount', message: 'Use at most 2 decimal places' }],
    });
  });

  it('10000000 -> too large error', () => {
    const result = validateAmount('10000000');
    expect(result).toEqual({
      ok: false,
      errors: [{ field: 'amount', message: 'That amount is too large' }],
    });
  });

  it('9999999.99 -> boundary OK', () => {
    const result = validateAmount('9999999.99');
    expect(result).toEqual({ ok: true, value: 999999999 });
  });
});

describe('validatePayee', () => {
  it('empty -> Unknown', () => {
    const result = validatePayee('  ');
    expect(result).toEqual({ ok: true, value: 'Unknown' });
  });

  it('normal name -> same', () => {
    const result = validatePayee('Alice');
    expect(result).toEqual({ ok: true, value: 'Alice' });
  });

  it('long name -> truncate to 40 chars', () => {
    const long = 'x'.repeat(50);
    const result = validatePayee(long);
    expect(result).toEqual({ ok: true, value: 'x'.repeat(40) });
  });
});

describe('validatePaidAt', () => {
  it('future date -> error', () => {
    const future = new Date(2026, 0, 1); // January 1, 2026 is PAST relative to June 1, 2026
    const now = new Date(2026, 5, 1); // June 1, 2026
    const result = validatePaidAt(future, now);
    expect(result).toEqual({ ok: true, value: future }); // This should be OK since future is before now
  });

  it('past date -> OK', () => {
    const past = new Date(2026, 0, 1);
    const now = new Date(2026, 5, 1);
    const result = validatePaidAt(past, now);
    expect(result).toEqual({ ok: true, value: past });
  });

  it('same day -> OK', () => {
    const same = new Date(2026, 5, 1);
    const now = new Date(2026, 5, 1);
    const result = validatePaidAt(same, now);
    expect(result).toEqual({ ok: true, value: same });
  });

  it('truly future date -> error', () => {
    const future = new Date(2026, 11, 31); // December 31, 2026
    const now = new Date(2026, 5, 1); // June 1, 2026
    const result = validatePaidAt(future, now);
    expect(result).toEqual({
      ok: false,
      errors: [{ field: 'paidAt', message: 'Choose today or an earlier date' }],
    });
  });
});

describe('CATEGORIES', () => {
  it('has exactly 5 values in order', () => {
    expect(CATEGORIES).toEqual(['Food', 'Shopping', 'Bills', 'Transport', 'Other']);
  });
});
