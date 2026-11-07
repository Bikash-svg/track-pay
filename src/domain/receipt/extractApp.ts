import type { ReceiptApp, OcrLine } from './types';

export function extractApp(lines: readonly OcrLine[]): ReceiptApp {
  const text = lines.map((line) => line.text).join(' ').toLowerCase();
  if (text.includes('google pay') || text.includes('gpay')) return 'gpay';
  if (text.includes('phonepe') || text.includes('phone pe')) return 'phonepe';
  if (text.includes('paytm')) return 'paytm';
  if (text.includes('navi')) return 'navi';
  return 'unknown';
}
