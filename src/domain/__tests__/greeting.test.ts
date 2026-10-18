import { greeting } from '../greeting';

// Every case uses an injected Date(y, m, d, h, min) so the test does not
// depend on the machine clock or timezone. Times are minute-of-day integers:
// morning 05:00-11:59, afternoon 12:00-16:59, evening 17:00-04:59
// (DESIGN.md 13, EVALS O3).

describe('greeting', () => {
  it('04:59 is evening', () => {
    expect(greeting(new Date(2026, 9, 18, 4, 59), null)).toBe('Good evening');
  });

  it('05:00 is morning', () => {
    expect(greeting(new Date(2026, 9, 18, 5, 0), null)).toBe('Good morning');
  });

  it('11:59 is morning', () => {
    expect(greeting(new Date(2026, 9, 18, 11, 59), null)).toBe('Good morning');
  });

  it('12:00 is afternoon', () => {
    expect(greeting(new Date(2026, 9, 18, 12, 0), null)).toBe('Good afternoon');
  });

  it('16:59 is afternoon', () => {
    expect(greeting(new Date(2026, 9, 18, 16, 59), null)).toBe('Good afternoon');
  });

  it('17:00 is evening', () => {
    expect(greeting(new Date(2026, 9, 18, 17, 0), null)).toBe('Good evening');
  });

  it('21:00 is evening (union case from the plan Done-when, not a boundary)', () => {
    expect(greeting(new Date(2026, 9, 18, 21, 0), null)).toBe('Good evening');
  });

  it('00:00 midnight is evening', () => {
    expect(greeting(new Date(2026, 9, 18, 0, 0), null)).toBe('Good evening');
  });

  it('renders the name in the morning', () => {
    expect(greeting(new Date(2026, 9, 18, 10, 30), 'Bikash')).toBe(
      'Good morning, Bikash',
    );
  });

  it('null name renders the nameless form', () => {
    expect(greeting(new Date(2026, 9, 18, 14, 0), null)).toBe('Good afternoon');
  });

  it('empty string renders the nameless form', () => {
    expect(greeting(new Date(2026, 9, 18, 20, 0), '')).toBe('Good evening');
  });
});