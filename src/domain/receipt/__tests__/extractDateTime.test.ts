import { extractDateTime } from '../extractDateTime';
import type { OcrLine } from '../types';

const referenceDate = new Date(2026, 0, 1);
const line = (text: string, y = 100): OcrLine => ({ text, confidence: 0.95, box: { x: 0, y, width: 100, height: 20 } });

describe('extractDateTime', () => {
  it.each(['15 Oct 2026', 'Oct 15, 2026', '15/10/2026', '15-10-2026'])('parses %s', (text) => {
    expect(extractDateTime([line(text)], referenceDate).paidAt).toEqual(new Date(2026, 9, 15));
  });

  it('converts noon to twelve in 24-hour time', () => {
    expect(extractDateTime([line('15 Oct 2026, 12:22 PM')], referenceDate).time).toEqual({ hour: 12, minute: 22 });
  });

  it('converts midnight to zero in 24-hour time', () => {
    expect(extractDateTime([line('15 Oct 2026, 12:22 AM')], referenceDate).time).toEqual({ hour: 0, minute: 22 });
  });

  it('finds a separated meridiem on an adjacent line', () => {
    expect(extractDateTime([line('15 Oct 2026'), line('1:22', 200), line('pm', 250)], referenceDate).time).toEqual({ hour: 13, minute: 22 });
  });

  it('returns null fields when no date or time exists', () => {
    expect(extractDateTime([line('Synthetic receipt')], referenceDate)).toEqual({ paidAt: null, time: null });
  });
});
