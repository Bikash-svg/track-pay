import type { ReceiptStatus, OcrLine } from './types';

const FAILED = /failed|declined|payment unsuccessful|payment failed/i;
const PENDING = /pending|processing/i;
const SUCCESS = /transaction successful|successful|success/i;

function isScopedMatch(lines: readonly OcrLine[], pattern: RegExp): boolean {
  return lines.some((line, index) => index < 3 ? pattern.test(line.text) : new RegExp(`^\\s*(?:${pattern.source})\\s*$`, pattern.flags).test(line.text));
}

export function extractStatus(lines: readonly OcrLine[]): ReceiptStatus {
  const text = lines.map((line) => line.text).join('\n');
  if (/no\s+pending\s+transactions/i.test(text)) return 'success';
  if (isScopedMatch(lines, FAILED)) return 'failed';
  if (isScopedMatch(lines, PENDING)) return SUCCESS.test(text) ? 'success' : 'pending';
  return 'unknown';
}
