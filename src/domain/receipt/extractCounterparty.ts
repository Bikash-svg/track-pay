import type { DirectionResult } from './extractDirection';
import type { OcrLine } from './types';

const UI_EXCLUSIONS = ['screenshot', 'screen shot', 'split this', 'share', 'track pay', 'done'];

function isCounterparty(text: string, confidence: number): boolean {
  const candidate = text.trim();
  if (candidate.length < 2 || confidence < 0.5 || !/[a-z]{3,}/i.test(candidate)) return false;
  if (/^₹?\d[\d,]*(?:\.\d{1,2})?$/.test(candidate)) return false;
  return !UI_EXCLUSIONS.some((excluded) => candidate.toLowerCase().includes(excluded));
}

function truncate(name: string): string {
  return name.slice(0, 40);
}

function nameAfterLabel(lines: readonly OcrLine[], label: string): string | null {
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = new RegExp(`${label}\\s*[:\\-]?\\s*(.+)$`, 'i').exec(line.text);
    if (!match && !new RegExp(label, 'i').test(line.text)) continue;
    if (match) {
      const sameLine = match[1].trim();
      if (isCounterparty(sameLine, line.confidence)) return truncate(sameLine);
    }
    for (const nextLine of lines.slice(index + 1)) {
      const next = nextLine.text.trim();
      if (next.length === 0) continue;
      return isCounterparty(next, nextLine.confidence) ? truncate(next) : null;
    }
    return null;
  }
  return null;
}

function nameAfterPaidLine(lines: readonly OcrLine[]): string | null {
  for (let index = 0; index < lines.length; index += 1) {
    if (!/^.+?\s+paid\s*$/i.test(lines[index].text.trim())) continue;
    for (const nextLine of lines.slice(index + 1)) {
      const next = nextLine.text.trim();
      if (next.length === 0) continue;
      return isCounterparty(next, nextLine.confidence) ? truncate(next) : null;
    }
  }
  return null;
}

export function extractCounterparty(lines: readonly OcrLine[], direction: DirectionResult): string | null {
  if (direction.direction === 'debit' || direction.direction === 'self_transfer') {
    return nameAfterLabel(lines, 'paid to') ?? nameAfterPaidLine(lines) ?? nameAfterLabel(lines, 'to\\s+upi\\s+id') ?? nameAfterLabel(lines, 'banking name');
  }
  if (direction.direction === 'credit') {
    return nameAfterLabel(lines, 'received from') ?? nameAfterLabel(lines, 'from\\s+upi\\s+id') ?? nameAfterLabel(lines, 'banking name');
  }
  return nameAfterLabel(lines, 'banking name');
}
