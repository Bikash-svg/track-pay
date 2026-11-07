import { extractUpiRef } from '../extractUpiRef';
import type { OcrLine } from '../types';

const line = (text: string): OcrLine => ({
  text,
  confidence: 0.95,
  box: { x: 0, y: 100, width: 100, height: 20 },
});

describe('extractUpiRef', () => {
  it('extracts a UTR value', () => {
    expect(extractUpiRef([line('UTR: 903875411763')])).toBe('903875411763');
  });

  it('extracts a UPI reference', () => {
    expect(extractUpiRef([line('UPI Ref: T0000000000000000000000')])).toBe('T0000000000000000000000');
  });

  it('extracts a PhonePe transaction ID', () => {
    expect(extractUpiRef([line('PhonePe Transaction ID: Txxxx')])).toBe('Txxxx');
  });

  it('supports the Transaction ID keyword', () => {
    expect(extractUpiRef([line('Transaction ID: T000000000001')])).toBe('T000000000001');
  });

  it('prefers the longest reference among matches', () => {
    expect(
      extractUpiRef([line('Ref: T0001'), line('Reference: T0000000000000000000000')]),
    ).toBe('T0000000000000000000000');
  });

  it('returns null when no reference keyword is present', () => {
    expect(extractUpiRef([line('Synthetic receipt')])).toBeNull();
  });
});
