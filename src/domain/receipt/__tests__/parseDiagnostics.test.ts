import { countFields } from '../parseDiagnostics';

describe('countFields', () => {
  const REF_DATE = new Date(2026, 0, 1);

  it('counts all four fields in a complete receipt', () => {
    expect(countFields(`PhonePe
Paid to Test User
100.00
15 Oct 2026
UPI Ref: T0000000000000000000000`, REF_DATE)).toEqual({
      amount: true,
      payee: true,
      paidAt: true,
      upiRef: true,
      total: 4,
    });
  });

  it('counts the non-amount fields in GPay-like text', () => {
    expect(countFields(`Google Pay
Paid to Test User
15 Oct 2026
UPI Ref: T0000000000000000000000`, REF_DATE)).toEqual({
      amount: false,
      payee: true,
      paidAt: true,
      upiRef: true,
      total: 3,
    });
  });

  it('counts no fields in random text', () => {
    expect(countFields('Synthetic unrelated content', REF_DATE)).toEqual({
      amount: false,
      payee: false,
      paidAt: false,
      upiRef: false,
      total: 0,
    });
  });

  it('counts no fields in empty text', () => {
    expect(countFields('', REF_DATE)).toEqual({
      amount: false,
      payee: false,
      paidAt: false,
      upiRef: false,
      total: 0,
    });
  });
});
