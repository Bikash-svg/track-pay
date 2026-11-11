import type { ExtractedAmount, OcrLine } from './types';

const AMOUNT_PATTERN = /^₹?\d[\d,]*(?:\.\d{1,2})?$/;
const MIN_CONFIDENCE = 0.4;
const RUPEE_FIX_CONFIDENCE = 0.9;

type Candidate = {
  readonly line: OcrLine;
  readonly lineIndex: number;
};

export function fixAmount(text: string, confidence: number): string {
  const clean = text.trim();
  if (!AMOUNT_PATTERN.test(clean)) return text;
  if (clean.startsWith('₹')) return text;
  return confidence >= RUPEE_FIX_CONFIDENCE ? `₹${clean}` : text;
}

export function extractAmount(lines: readonly OcrLine[], imageHeight: number): ExtractedAmount | null {
  let candidates = lines
    .map((line, lineIndex): Candidate => ({ line, lineIndex }))
    .filter(({ line }) => {
      const text = line.text.trim();
      return AMOUNT_PATTERN.test(text) && line.text.length <= 15 && line.confidence >= MIN_CONFIDENCE;
    });

  if (candidates.length === 0) return null;

  const outsideHeader = candidates.filter(({ line }) => line.box.y >= imageHeight * 0.08);
  if (outsideHeader.length > 0) candidates = outsideHeader;

  const rupeeAndComma = candidates.filter(({ line }) => {
    const text = line.text.trim();
    return text.startsWith('₹') && text.includes(',');
  });
  const rupee = candidates.filter(({ line }) => {
    const text = line.text.trim();
    return text.startsWith('₹') && !text.includes(',');
  });
  const comma = candidates.filter(({ line }) => {
    const text = line.text.trim();
    return !text.startsWith('₹') && text.includes(',');
  });
  const pool = rupeeAndComma.length > 0 ? rupeeAndComma : rupee.length > 0 ? rupee : comma.length > 0 ? comma : candidates;

  const { line, lineIndex } = pool.reduce((best, cur) => (cur.line.box.y < best.line.box.y ? cur : best));
  const displayText = fixAmount(line.text, line.confidence);
  return {
    rawText: line.text,
    displayText,
    confidence: line.confidence,
    accepted: displayText.startsWith('₹') && line.confidence >= MIN_CONFIDENCE,
    lineIndex,
  };
}
