import type { OcrLine, ReceiptDirection } from './types';

export type DirectionResult = {
  readonly direction: ReceiptDirection;
  readonly matchedRule: string;
  readonly evidenceLineIndex: number;
};

const unknown = (): DirectionResult => ({ direction: 'unknown', matchedRule: 'unknown', evidenceLineIndex: -1 });

function result(direction: ReceiptDirection, matchedRule: string, evidenceLineIndex: number): DirectionResult {
  return { direction, matchedRule, evidenceLineIndex };
}

function findLine(lines: readonly OcrLine[], matcher: (text: string) => boolean): number {
  return lines.findIndex((line) => matcher(line.text.trim().toLowerCase()));
}

export function extractDirection(lines: readonly OcrLine[], imageHeight: number): DirectionResult {
  const text = lines.map((line) => line.text.toLowerCase()).join(' ');

  if (text.includes('self transfer')) return result('self_transfer', 'self transfer', findLine(lines, (line) => line.includes('self transfer')));
  for (const phrase of ['paid to', 'payment to']) {
    if (text.includes(phrase)) return result('debit', phrase, findLine(lines, (line) => line.includes(phrase)));
  }
  if (/paid in\s+[\d.]+\s+seconds?/.test(text)) return result('debit', 'paid_in_seconds', findLine(lines, (line) => /paid in\s+[\d.]+\s+seconds?/.test(line)));

  const headerIndex = lines.findIndex((line) => {
    const normalized = line.text.trim().toLowerCase();
    return line.box.y < imageHeight * 0.2 && /\bpaid\b/.test(normalized) && normalized.length <= 8 && !normalized.includes('received');
  });
  if (headerIndex >= 0) return result('debit', 'paid_header', headerIndex);

  const paidNameIndex = lines.findIndex((line) => {
    const match = /^(.+?)\s+paid\s*$/i.exec(line.text.trim());
    return match !== null && match[1].trim().length >= 3 && /[a-z]{3,}/i.test(match[1]);
  });
  if (paidNameIndex >= 0) return result('debit', 'paid', paidNameIndex);

  for (const phrase of ['sent to', 'send to', 'money sent']) {
    if (text.includes(phrase)) return result('debit', phrase, findLine(lines, (line) => line.includes(phrase)));
  }
  for (const phrase of ['received from', 'money received', 'payment received']) {
    if (text.includes(phrase)) return result('credit', phrase, findLine(lines, (line) => line.includes(phrase)));
  }
  if (text.includes('debited from')) return result('debit', 'debited from', findLine(lines, (line) => line.includes('debited from')));
  if (text.includes('credited to')) return result('credit', 'credited to', findLine(lines, (line) => line.includes('credited to')));

  const toUpiIndex = findLine(lines, (line) => /^to\s+upi\s+id/.test(line));
  if (toUpiIndex >= 0) return result('debit', 'to_upi_id', toUpiIndex);
  const fromUpiIndex = findLine(lines, (line) => /^from\s+upi\s+id/.test(line));
  if (fromUpiIndex >= 0) return result('credit', 'from_upi_id', fromUpiIndex);

  const toIndex = findLine(lines, (line) => /^to[:\s]/.test(line) || line.replace(/:$/, '').trim() === 'to');
  if (toIndex >= 0) return result('debit', 'to', toIndex);
  const fromIndex = findLine(lines, (line) => /^from[:\s]/.test(line) || line.replace(/:$/, '').trim() === 'from');
  if (fromIndex >= 0) return result('credit', 'from', fromIndex);

  return unknown();
}
