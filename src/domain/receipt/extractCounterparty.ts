import type { DirectionResult } from './extractDirection';
import type { OcrLine } from './types';

const UI_EXCLUSIONS = [
  'hide details', 'show details', 'view details',
  'transaction details', 'payment details', 'transfer details',
  'banking name', 'message', 'utr', 'powered by',
  'unified payments', 'upi', 'click here', 'tap to',
  'share', 'download', 'more',
  'screenshot', 'screen shot',
  'split this', 'split', 'copy', 'repeat', 'pay again',
  'successful', 'success', 'failed', 'pending',
  'paid to', 'received from', 'debited from', 'credited to',
  'self transfer', 'transferred', 'money transferred',
  'paid with fam', 'paid in',
];

const MIN_OFFSET_Y = 20;

function isCounterparty(text: string, confidence: number): boolean {
  const candidate = text.trim();
  if (candidate.length < 2 || candidate.length > 50 || confidence < 0.5 || !/[a-z]{3,}/i.test(candidate)) return false;
  if (/^₹?\d[\d,]*(?:\.\d{1,2})?$/.test(candidate)) return false;
  return !UI_EXCLUSIONS.some((excluded) => candidate.toLowerCase().includes(excluded));
}

function truncate(name: string): string {
  return name.slice(0, 50);  // Python _is_name upper bound
}

function nameBelow(lines: readonly OcrLine[], baseY: number): string | null {
  const below = lines
    .filter((line) => line.box.y > baseY + MIN_OFFSET_Y)
    .slice()
    .sort((a, b) => a.box.y - b.box.y);
  for (const line of below) {
    const text = line.text.trim();
    if (isCounterparty(text, line.confidence)) return truncate(text);
  }
  return null;
}

function nameAfterLabel(lines: readonly OcrLine[], label: string): string | null {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const labelRe = new RegExp(label, 'i');
    if (!labelRe.test(line.text)) continue;
    const sameLine = new RegExp(`${label}\\s*[:\\-]?\\s*(.+)$`, 'i').exec(line.text);
    if (sameLine) {
      const candidate = sameLine[1].trim();
      if (isCounterparty(candidate, line.confidence)) return truncate(candidate);
    }
    const below = nameBelow(lines, line.box.y);
    if (below) return below;
    return null;
  }
  return null;
}

function nameAfterPaidLine(lines: readonly OcrLine[]): string | null {
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^.+?\s+paid\s*$/i.test(lines[index].text.trim())) continue;
    const below = nameBelow(lines, lines[index].box.y);
    if (below) return below;
  }
  return null;
}

function nameFromStandaloneToFrom(lines: readonly OcrLine[]): string | null {
  for (const line of lines) {
    const m = /^(?:to|from)[:\s]+(.+)$/i.exec(line.text.trim());
    if (!m) continue;
    const candidate = m[1].trim();
    if (isCounterparty(candidate, line.confidence)) return truncate(candidate);
  }
  return null;
}

export function extractCounterparty(
  lines: readonly OcrLine[],
  direction: DirectionResult,
): string | null {
  if (direction.direction === 'debit' || direction.direction === 'self_transfer') {
    return (
      nameAfterLabel(lines, 'paid to') ??
      nameAfterPaidLine(lines) ??
      nameAfterLabel(lines, 'to\\s+upi\\s+id') ??
      nameFromStandaloneToFrom(lines) ??
      nameAfterLabel(lines, 'banking name')
    );
  }
  if (direction.direction === 'credit') {
    return (
      nameAfterLabel(lines, 'received from') ??
      nameAfterLabel(lines, 'from\\s+upi\\s+id') ??
      nameFromStandaloneToFrom(lines) ??
      nameAfterLabel(lines, 'banking name')
    );
  }
  return nameAfterLabel(lines, 'banking name');
}
