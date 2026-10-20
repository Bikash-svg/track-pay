import { dateLabel } from '../dateLabel';

// Every case uses an injected Date(y, m, d) constructor (0-indexed months) so
// the tests are timezone-independent — no dependence on the local clock.

describe('dateLabel', () => {
  const ref = new Date(2026, 9, 19); // 19 Oct 2026

  it('same calendar day, different time -> Today', () => {
    expect(dateLabel(new Date(2026, 9, 19, 8, 30), ref)).toBe('Today');
  });

  it('past day, same year -> Mon D', () => {
    expect(dateLabel(new Date(2026, 9, 10), ref)).toBe('Oct 10');
  });

  it('past day, previous year -> Mon D, YYYY', () => {
    expect(dateLabel(new Date(2025, 9, 10), ref)).toBe('Oct 10, 2025');
  });

  it('edge: Jan 1 in the same year as a Dec 31 reference -> Jan 1', () => {
    expect(dateLabel(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe('Jan 1');
  });

  it('edge: Dec 31 previous year against a Jan 1 reference -> Dec 31, YYYY', () => {
    expect(dateLabel(new Date(2024, 11, 31), new Date(2025, 0, 1))).toBe('Dec 31, 2024');
  });
});