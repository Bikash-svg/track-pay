import { extractAmount } from './extractAmount';
import { extractApp } from './extractApp';
import { extractCounterparty } from './extractCounterparty';
import { extractDateTime } from './extractDateTime';
import { extractDirection } from './extractDirection';
import { extractStatus } from './extractStatus';
import { extractUpiRef } from './extractUpiRef';
import type { OcrLine, ParsedReceipt, ReceiptRefusal } from './types';

function parseAmountToPaise(display: string): number {
  const clean = display.replace('₹', '').replace(/,/g, '').trim();
  const [whole, fractional = ''] = clean.split('.');
  const paise = `${fractional}00`.slice(0, 2);
  return Number(whole) * 100 + Number(paise);
}

function hasReceiptMarkers(lines: readonly OcrLine[]): boolean {
  const text = lines.map((line) => line.text).join('\n').toLowerCase();
  let count = 0;
  if (/₹|rs\.|inr/.test(text)) count += 1;
  if (/gpay|google pay|phonepe|paytm|navi/.test(text)) count += 1;
  if (/upi ref|utr|transaction id|ref:/.test(text)) count += 1;
  if (/paid to|received from|to:|from:/.test(text)) count += 1;
  if (/\d{1,2}\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(text)) count += 1;
  return count >= 2;
}

export function extractFromLines(
  lines: readonly OcrLine[],
  imageHeight: number,
  referenceDate: Date,
): ParsedReceipt | ReceiptRefusal {
  if (lines.length === 0) return { reason: 'unreadable' };
  if (!hasReceiptMarkers(lines)) return { reason: 'unreadable' };

  const status = extractStatus(lines);
  if (status === 'failed') return { reason: 'failed' };
  if (status === 'pending') return { reason: 'pending' };

  const amount = extractAmount(lines, imageHeight);
  if (!amount || !amount.accepted) return { reason: 'no_amount' };

  const direction = extractDirection(lines, imageHeight);
  const counterparty = extractCounterparty(lines, direction);
  const { paidAt, time } = extractDateTime(lines, referenceDate);
  const app = extractApp(lines);
  const upiRef = extractUpiRef(lines);

  return {
    amountPaise: parseAmountToPaise(amount.displayText),
    amountDisplay: amount.displayText,
    direction: direction.direction,
    counterparty,
    paidAt,
    time,
    app,
    status,
    upiRef,
  };
}
