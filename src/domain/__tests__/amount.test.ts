import { parseAmount, formatPaise } from '../amount';

describe('parseAmount', () => {
  it("'120' -> 12000 paise", () => {
    expect(parseAmount('120')).toEqual({ paise: 12000 });
  });

  it("'120.5' -> 12050 paise", () => {
    expect(parseAmount('120.5')).toEqual({ paise: 12050 });
  });

  it("'120.00' -> 12000 paise (trailing zeros are fine)", () => {
    expect(parseAmount('120.00')).toEqual({ paise: 12000 });
  });

  it("'0' -> enterAmountGreaterThanZero", () => {
    expect(parseAmount('0')).toEqual({
      errorKey: 'enterAmountGreaterThanZero',
    });
  });

  it("'' -> enterAmountGreaterThanZero", () => {
    expect(parseAmount('')).toEqual({ errorKey: 'enterAmountGreaterThanZero' });
  });

  it("'-5' -> enterAmountGreaterThanZero", () => {
    expect(parseAmount('-5')).toEqual({
      errorKey: 'enterAmountGreaterThanZero',
    });
  });

  it("'abc' -> enterAmountGreaterThanZero", () => {
    expect(parseAmount('abc')).toEqual({
      errorKey: 'enterAmountGreaterThanZero',
    });
  });

  it("'10.999' -> useAtMostTwoDecimals", () => {
    expect(parseAmount('10.999')).toEqual({
      errorKey: 'useAtMostTwoDecimals',
    });
  });

  it("'9999999.99' (₹99,99,999.99) is exactly at cap, accepted", () => {
      expect(parseAmount('9999999.99')).toEqual({ paise: 999999999 });
  });

  it("'10000000.00' (₹1,00,00,000) is above cap, rejected", () => {
      expect(parseAmount('10000000.00')).toEqual({
        errorKey: 'thatAmountIsTooLarge',
      });
  });
});

describe('formatPaise', () => {
  it('10000 -> "100.00" (plain decimal, no currency symbol)', () => {
    expect(formatPaise(10000)).toBe('100.00');
  });

  it('0 -> "0.00"', () => {
    expect(formatPaise(0)).toBe('0.00');
  });

  it('12050 -> "120.50"', () => {
    expect(formatPaise(12050)).toBe('120.50');
  });
});

