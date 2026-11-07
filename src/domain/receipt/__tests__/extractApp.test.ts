import { extractApp } from '../extractApp';
import type { OcrLine } from '../types';

const line = (text: string): OcrLine => ({ text, confidence: 0.95, box: { x: 0, y: 100, width: 100, height: 20 } });

describe('extractApp', () => {
  it.each([['Google Pay', 'gpay'], ['PhonePe', 'phonepe'], ['Paytm', 'paytm'], ['Navi', 'navi'], ['Other Text', 'unknown']] as const)(
    'maps %s to %s',
    (text, app) => expect(extractApp([line(text)])).toBe(app),
  );
});
