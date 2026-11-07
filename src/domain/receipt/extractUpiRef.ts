import type { OcrLine } from './types';

const UPI_REFERENCE_PATTERN = /(?:UPI\s*(?:Ref(?:erence)?|Transaction ID)|PhonePe\s+Transaction ID|Transaction ID|UTR|Reference|Ref)\s*[:#-]?\s*([A-Za-z0-9]{4,})/gi;

export function extractUpiRef(lines: readonly OcrLine[]): string | null {
  const references: string[] = [];

  for (const line of lines) {
    for (const match of line.text.matchAll(UPI_REFERENCE_PATTERN)) {
      references.push(match[1]);
    }
  }

  return references.reduce<string | null>(
    (longest, reference) => (longest === null || reference.length > longest.length ? reference : longest),
    null,
  );
}
