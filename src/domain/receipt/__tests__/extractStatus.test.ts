import { extractStatus } from '../extractStatus';
import type { OcrLine } from '../types';

const line = (text: string): OcrLine => ({ text, confidence: 0.95, box: { x: 0, y: 100, width: 100, height: 20 } });

describe('extractStatus', () => {
  it('detects a failed payment in the first three lines', () => expect(extractStatus([line('Payment failed')], 'unknown')).toBe('failed'));
  it('detects a pending payment on its own line', () => expect(extractStatus([line('Pending')], 'unknown')).toBe('pending'));
  it('treats a no-pending footer as success', () => expect(extractStatus([...Array(9).fill(line('Details')), line('No pending transactions')], 'unknown')).toBe('success'));
  it('lets a success marker override pending footer text', () => expect(extractStatus([line('Transaction Successful'), line('Pending settlement')], 'unknown')).toBe('success'));
  it('detects a declined payment in the first three lines', () => expect(extractStatus([line('Declined')], 'unknown')).toBe('failed'));
  it('returns unknown when no status is present', () => expect(extractStatus([line('Synthetic receipt')], 'unknown')).toBe('unknown'));
});
