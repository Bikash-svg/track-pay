import { extractCounterparty } from '../extractCounterparty';
import type { DirectionResult } from '../extractDirection';
import type { OcrLine } from '../types';

const debit: DirectionResult = { direction: 'debit', matchedRule: 'paid to', evidenceLineIndex: 0 };
const credit: DirectionResult = { direction: 'credit', matchedRule: 'received from', evidenceLineIndex: 0 };
const line = (text: string): OcrLine => ({ text, confidence: 0.95, box: { x: 0, y: 100, width: 100, height: 20 } });

describe('extractCounterparty', () => {
  it('reads a debit counterparty from the paid-to line', () => expect(extractCounterparty([line('Paid to Test User')], debit)).toBe('Test User'));
  it('reads a credit counterparty from the next line', () => expect(extractCounterparty([line('Received from'), line('Test User')], credit)).toBe('Test User'));
  it('falls back to the banking name', () => expect(extractCounterparty([line('Banking Name: Test User')], debit)).toBe('Test User'));
  it('rejects UI labels as counterparties', () => expect(extractCounterparty([line('Paid to Share')], debit)).toBeNull());
  it('truncates a long counterparty to forty characters', () => {
    expect(extractCounterparty([line('Paid to This Is A Very Long Synthetic Counterparty Name Here')], debit)).toBe('This Is A Very Long Synthetic Counterpar');
  });
});
