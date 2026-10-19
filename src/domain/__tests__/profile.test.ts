import { sanitizeName } from '../profile';

// sanitizeName is pure (no imports) and timezone-independent by construction,
// so every case uses a literal string — no Date injection needed here.

describe('sanitizeName', () => {
  it('trims surrounding whitespace', () => {
    expect(sanitizeName('  Bikash  ')).toBe('Bikash');
  });

  it('empty string becomes null', () => {
    expect(sanitizeName('')).toBeNull();
  });

  it('whitespace-only becomes null', () => {
    expect(sanitizeName('   ')).toBeNull();
  });

  it('caps at 40 characters without an ellipsis', () => {
    expect(sanitizeName('a'.repeat(50))).toBe('a'.repeat(40));
  });
});