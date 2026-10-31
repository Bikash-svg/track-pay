import { parseReceipt } from '../parseReceipt';

// EVALS U1-U9 coverage with synthetic fixtures per GUARDRAILS §13.8
// Every sample is synthetic - no real payment data
// Receipt readability rule:
// A text is readable if it contains ≥2 of:
// - a ₹/Rs./INR-prefixed number
// - a known app name (GPay / PhonePe / Paytm / Navi / Google Pay)
// - a UPI/Transaction/UTR/Ref keyword
// - a payee pattern (Paid to / Received from / To:)
// - a date-shaped token
// Otherwise → refuse unreadable.

describe('parseReceipt', () => {
  const REF_DATE = new Date(2026, 0, 1); // 1 Jan 2026

  // EVALS U1 - Synthetic GPay success text
  it('U1: GPay success parses to amount, payee, date, ref, app', () => {
    const text = `Google Pay
Paid to Test User
₹100.00
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 10000,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15), // Oct 15, 2026
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  // EVALS U2a - Synthetic PhonePe (fix Bug 1: only one ₹-prefixed amount)
  it('U2a: PhonePe success parses fields correct, app phonepe (single amount)', () => {
    const text = `PhonePe
Received from Test User
₹250.50
15 Oct 2026
UPI transaction ID: T1234567890123456
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 25050,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T1234567890123456',
      app: 'phonepe',
    });
  });

  // Additional test: comma stripping (missing)
  it('U2a-extra: Comma stripping ₹1,000.00 → 100000 paise', () => {
    const text = `Google Pay
Paid to Test User
₹1,000.00
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 100000,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  // EVALS U2b - Synthetic Paytm
  it('U2b: Paytm success parses fields correct, app paytm', () => {
    const text = `Paytm
Paid to Test Merchant
₹500.00
To: Test Merchant
15 Oct 2026
Transaction ID: UTR: 0000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 50000,
      payeeName: 'Test Merchant',
      paidAt: new Date(2026, 9, 15),
      upiRef: '0000000000000000',
      app: 'paytm',
    });
  });

  // EVALS U2c - Synthetic Navi
  it('U2c: Navi success parses fields correct, app navi', () => {
    const text = `Navi
To: Demo Payee
₹75.00
15 Oct 2026, 12:22 PM
Ref: NAVI123456789
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 7500,
      payeeName: 'Demo Payee',
      paidAt: new Date(2026, 9, 15, 12, 22),
      upiRef: 'NAVI123456789',
      app: 'navi',
    });
  });

  // EVALS U3 - Amount with OCR slips (O→0) (fix Bug 2: correct amount)
  it('U3: OCR slip O→0 corrected to 1050 paise', () => {
    const text = `Google Pay
Paid to Test User
₹1O.5O
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 1050,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  // Additional test: l→1 (missing)
  it('U3-extra: OCR slip l→1 ₹1l.50 → 1150 paise', () => {
    const text = `Google Pay
Paid to Test User
₹1l.50
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 1150,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  // EVALS U4 - Two different amounts on one screen
  it('U4: Two distinct amounts → refuse no_amount', () => {
    const text = `₹100.00
₹500.00
Paid to Test User
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'no_amount' });
  });

  // EVALS U5 - No amount found
  it('U5: No amount found → refuse no_amount', () => {
    const text = `Google Pay
Paid to Test User
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'no_amount' });
  });

  // EVALS U6 - Failed receipt
  it('U6: Failed receipt → refuse failed', () => {
    const text = `Google Pay
Payment failed
Transaction failed
Payment unsuccessful
₹100.00
15 Oct 2026
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'failed' });
  });

  // EVALS U7 - Pending receipt
  it('U7: Pending receipt → refuse pending', () => {
    const text = `Google Pay
Payment pending
Processing payment
₹100.00
15 Oct 2026
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'pending' });
  });

  // EVALS U8 - Empty or unrelated screen
  it('U8: Empty text → refuse unreadable', () => {
    const result = parseReceipt('', REF_DATE);
    expect(result).toEqual({ reason: 'unreadable' });
  });

  it('U8: Unrelated screen → refuse unreadable', () => {
    const text = `Some random text
Nothing to see here
Just noise
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'unreadable' });
  });

  // EVALS U9 - Very long payee name (fix Bug 3: exactly 40 chars)
  it('U9: Very long payee name truncated to 40 chars', () => {
    const text = `Google Pay
Paid to This is an extremely long payee name that exceeds forty characters
₹100.00
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 10000,
      payeeName: 'This is an extremely long payee name tha', // exactly 40 chars
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
    expect((result as any).payeeName).toHaveLength(40);
  });

  // Additional test: space after decimal (missing)
  it('U3-extra2: Space after decimal ₹10. 50 → 1050 paise', () => {
    const text = `Google Pay
Paid to Test User
₹10. 50
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 1050,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  // Gap 1: ₹→7 ambiguity refusal test
  it('₹7-ambiguity: ₹7100 could be misread ₹100 → refuse no_amount', () => {
    const text = `Google Pay
Paid to Test User
₹7100
15 Oct 2026
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({ reason: 'no_amount' });
  });

  // Additional tests not in EVALS (but required by spec)
  it('paidAt is null when no date present but amount is', () => {
    const text = `Google Pay
Paid to Test User
₹100.00
UPI Ref: T0000000000000000000000
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 10000,
      payeeName: 'Test User',
      paidAt: null,
      upiRef: 'T0000000000000000000000',
      app: 'gpay',
    });
  });

  it('upiRef is null when no reference present', () => {
    const text = `Google Pay
Paid to Test User
₹100.00
15 Oct 2026
`;
    const result = parseReceipt(text, REF_DATE);
    expect(result).toEqual({
      amountPaise: 10000,
      payeeName: 'Test User',
      paidAt: new Date(2026, 9, 15),
      upiRef: null,
      app: 'gpay',
    });
  });
});