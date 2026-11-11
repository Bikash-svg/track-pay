import type { OcrLine, ReceiptDirection, ReceiptStatus } from './types';

export function extractStatus(
  lines: readonly OcrLine[],
  direction: ReceiptDirection,
): ReceiptStatus {
  const text = lines.map((line) => line.text).join(' ').toLowerCase();
  for (const kw of ['failed', 'failure', 'declined', 'unsuccessful', 'cancelled', 'canceled']) {
    if (text.includes(kw)) return 'failed';
  }
  for (const kw of ['pending', 'processing', 'in progress']) {
    if (text.includes(kw)) return 'pending';
  }
  for (const kw of ['successful', 'success', 'completed', 'payment done']) {
    if (text.includes(kw)) return 'success';
  }
  if (text.includes('paid with fam')) return 'success';
  if (direction === 'debit' || direction === 'credit' || direction === 'self_transfer') {
    return 'success';
  }
  return 'unknown';
}
