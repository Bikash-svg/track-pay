import { extractAmount } from '../extractAmount';
import type { OcrLine } from '../types';

const line = (
  text: string,
  confidence: number,
  y: number,
): OcrLine => ({ text, confidence, box: { x: 0, y, width: 100, height: 20 } });

describe('extractAmount', () => {
  it('extracts a rupee-prefixed amount', () => {
    expect(extractAmount([line('₹100.00', 0.95, 100)], 1_000)).toEqual({
      rawText: '₹100.00',
      displayText: '₹100.00',
      confidence: 0.95,
      accepted: true,
      lineIndex: 0,
    });
  });

  it('rejects a low-confidence candidate', () => {
    expect(extractAmount([line('₹100.00', 0.3, 100)], 1_000)).toBeNull();
  });

  it('prefers a rupee-and-comma amount over lower tiers', () => {
    const result = extractAmount(
      [line('₹100.00', 0.95, 100), line('₹1,000.00', 0.95, 200)],
      1_000,
    );

    expect(result?.displayText).toBe('₹1,000.00');
    expect(result?.lineIndex).toBe(1);
  });

  it('picks the topmost candidate when multiple share a winning tier (Python parity)', () => {
    // Python extract_amount: `top = min(pool, key=lambda x: x['box'][1])`.
    // Tier ambiguity does NOT return null — the topmost hero amount wins,
    // which matches real receipt layouts (transaction amount sits above any
    // secondary rupee values).
    const result = extractAmount(
      [line('₹100.00', 0.95, 100), line('₹200.00', 0.95, 200)],
      1_000,
    );
    expect(result?.displayText).toBe('₹100.00');
    expect(result?.lineIndex).toBe(0);
  });

  it('skips a header-zone candidate when another candidate exists', () => {
    const result = extractAmount([line('₹10.00', 0.95, 50), line('₹100.00', 0.95, 100)], 1_000);

    expect(result?.displayText).toBe('₹100.00');
  });

  it('uses the topmost candidate in a winning tier', () => {
    const result = extractAmount([line('₹1,000.00', 0.95, 100)], 1_000);

    expect(result?.lineIndex).toBe(0);
  });

  it('adds a rupee symbol to a high-confidence plain amount', () => {
    expect(extractAmount([line('100.00', 0.9, 100)], 1_000)).toMatchObject({
      rawText: '100.00',
      displayText: '₹100.00',
      accepted: true,
    });
  });

  it('does not accept a lower-confidence plain amount without a rupee symbol', () => {
    expect(extractAmount([line('100.00', 0.89, 100)], 1_000)).toMatchObject({
      displayText: '100.00',
      accepted: false,
    });
  });

  it('returns null when no line is an amount candidate', () => {
    expect(extractAmount([line('Synthetic receipt', 0.95, 100)], 1_000)).toBeNull();
  });
});
