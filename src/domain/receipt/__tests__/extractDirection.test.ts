import { extractDirection } from '../extractDirection';
import type { OcrLine } from '../types';

const line = (text: string, y = 100): OcrLine => ({
  text,
  confidence: 0.95,
  box: { x: 0, y, width: 100, height: 20 },
});

describe('extractDirection', () => {
  it('detects paid to as a debit', () => expect(extractDirection([line('Paid to Test User')], 1_000).direction).toBe('debit'));
  it('detects received from as a credit', () => expect(extractDirection([line('Received from Test User')], 1_000).direction).toBe('credit'));
  it('prioritizes self transfer', () => expect(extractDirection([line('Self transfer paid to Test User')], 1_000).direction).toBe('self_transfer'));
  it('detects the paid-in-seconds footer', () => expect(extractDirection([line('Paid in 3 seconds')], 1_000).direction).toBe('debit'));
  it('detects a Paid header in the top twenty percent', () => expect(extractDirection([line('Paid', 199)], 1_000).direction).toBe('debit'));
  it('does not treat a low Paid line as a header', () => expect(extractDirection([line('Paid', 201)], 1_000).direction).toBe('unknown'));
  it('returns unknown for no matching text', () => expect(extractDirection([], 1_000).direction).toBe('unknown'));
});
