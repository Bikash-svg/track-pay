import { extractCounterparty } from '../extractCounterparty';
import type { DirectionResult } from '../extractDirection';
import type { OcrLine } from '../types';

const debit: DirectionResult = { direction: 'debit', matchedRule: 'paid to', evidenceLineIndex: 0 };
const credit: DirectionResult = { direction: 'credit', matchedRule: 'received from', evidenceLineIndex: 0 };
const line = (text: string, y = 100): OcrLine => ({ text, confidence: 0.95, box: { x: 0, y, width: 100, height: 20 } });

describe('extractCounterparty', () => {
  it('reads a debit counterparty from the paid-to line', () => expect(extractCounterparty([line('Paid to Test User')], debit)).toBe('Test User'));
  it('reads a credit counterparty from the next line', () => expect(extractCounterparty([line('Received from', 100), line('Test User', 140)], credit)).toBe('Test User'));
  it('falls back to the banking name', () => expect(extractCounterparty([line('Banking Name: Test User')], debit)).toBe('Test User'));
  it('rejects UI labels as counterparties', () => expect(extractCounterparty([line('Paid to Share')], debit)).toBeNull());
  it('rejects a counterparty longer than fifty characters (Python _is_name parity)', () => {
    // "This Is A Very Long Synthetic Counterparty Name Here" is 52 chars.
    // Python _is_name: `if not (2 <= len(t) <= 50): return False` → returns None.
    // TS isCounterparty now mirrors that upper bound.
    expect(extractCounterparty([line('Paid to This Is A Very Long Synthetic Counterparty Name Here')], debit)).toBeNull();
  });
});
