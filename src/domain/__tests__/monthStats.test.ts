import {
  computeMonthStats,
  daysInMonth,
  daysElapsed,
  daysRemaining,
} from '../monthStats';

describe('computeMonthStats', () => {
  it('A9 example: 3630 spent, 1500000 limit, 11 Oct 2026', () => {
    const stats = computeMonthStats({
      spent: 363000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.spent).toBe(363000);
    expect(stats.dailyAverage).toBe(33000);
    expect(stats.projectedMonthEnd).toBe(1023000);
    expect(stats.limit).toBe(1500000);
    expect(stats.left).toBe(1137000);
    expect(stats.headroom).toBe(477000);
    expect(stats.percentUsed).toBe(24);
    expect(stats.allowancePerDay).toBe(56800);
    expect(stats.level).toBe('ok');
    expect(stats.daysElapsed).toBe(11);
    expect(stats.daysRemaining).toBe(20);
    expect(stats.daysInMonth).toBe(31);
  });

  it('day 1: no divide-by-zero', () => {
    const stats = computeMonthStats({
      spent: 0,
      limit: 1500000,
      now: new Date(2026, 9, 1),
    });
    expect(stats.daysElapsed).toBe(1);
    expect(stats.daysRemaining).toBe(30);
    expect(stats.dailyAverage).toBe(0);
    expect(stats.projectedMonthEnd).toBe(0);
    expect(stats.left).toBe(1500000);
    expect(stats.headroom).toBe(1500000);
    expect(stats.percentUsed).toBe(0);
    expect(stats.allowancePerDay).toBe(50000);
    expect(stats.level).toBe('ok');
  });

  it('last day: daysRemaining = 1 (max guard)', () => {
    const stats = computeMonthStats({
      spent: 363000,
      limit: 1500000,
      now: new Date(2026, 9, 31),
    });
    expect(stats.daysElapsed).toBe(31);
    expect(stats.daysRemaining).toBe(1);
    expect(stats.allowancePerDay).toBe(1137000);
  });

  it('no limit (null): limit-dependent fields are null', () => {
    const stats = computeMonthStats({
      spent: 363000,
      limit: null,
      now: new Date(2026, 9, 11),
    });
    expect(stats.limit).toBeNull();
    expect(stats.left).toBeNull();
    expect(stats.headroom).toBeNull();
    expect(stats.percentUsed).toBeNull();
    expect(stats.allowancePerDay).toBeNull();
    expect(stats.level).toBeNull();
    expect(stats.spent).toBe(363000);
    expect(stats.dailyAverage).toBe(33000);
    expect(stats.projectedMonthEnd).toBe(1023000);
  });

  it('limit = 0: treated as no limit', () => {
    const stats = computeMonthStats({
      spent: 363000,
      limit: 0,
      now: new Date(2026, 9, 11),
    });
    expect(stats.limit).toBeNull();
    expect(stats.left).toBeNull();
    expect(stats.level).toBeNull();
  });

  it('empty month (spent = 0, no limit): no crash', () => {
    const stats = computeMonthStats({
      spent: 0,
      limit: null,
      now: new Date(2026, 9, 11),
    });
    expect(stats.spent).toBe(0);
    expect(stats.dailyAverage).toBe(0);
    expect(stats.projectedMonthEnd).toBe(0);
    expect(stats.left).toBeNull();
  });

  it('over limit: negative left, level = over', () => {
    const stats = computeMonthStats({
      spent: 2000000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.left).toBe(-500000);
    expect(stats.percentUsed).toBe(133);
    expect(stats.level).toBe('over');
  });

  it('level at 79%: ok', () => {
    const stats = computeMonthStats({
      spent: 1185000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.percentUsed).toBe(79);
    expect(stats.level).toBe('ok');
  });

  it('level at exactly 80%: warn', () => {
    const stats = computeMonthStats({
      spent: 1200000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.percentUsed).toBe(80);
    expect(stats.level).toBe('warn');
  });

  it('level at exactly 100%: warn (not over)', () => {
    const stats = computeMonthStats({
      spent: 1500000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.percentUsed).toBe(100);
    expect(stats.level).toBe('warn');
  });

  it('level at 101%: over', () => {
    const stats = computeMonthStats({
      spent: 1515000,
      limit: 1500000,
      now: new Date(2026, 9, 11),
    });
    expect(stats.percentUsed).toBe(101);
    expect(stats.level).toBe('over');
  });
});

describe('helpers', () => {
  it('daysInMonth returns correct days per month', () => {
    expect(daysInMonth(new Date(2026, 0, 1))).toBe(31);
    expect(daysInMonth(new Date(2026, 1, 1))).toBe(28);
    expect(daysInMonth(new Date(2024, 1, 1))).toBe(29);
    expect(daysInMonth(new Date(2026, 3, 1))).toBe(30);
    expect(daysInMonth(new Date(2026, 9, 15))).toBe(31);
    expect(daysInMonth(new Date(2026, 11, 1))).toBe(31);
  });

  it('daysElapsed returns correct day of month', () => {
    expect(daysElapsed(new Date(2026, 9, 1))).toBe(1);
    expect(daysElapsed(new Date(2026, 9, 11))).toBe(11);
    expect(daysElapsed(new Date(2026, 9, 31))).toBe(31);
  });

  it('daysRemaining returns correct days left in month', () => {
    expect(daysRemaining(new Date(2026, 9, 1))).toBe(30);
    expect(daysRemaining(new Date(2026, 9, 11))).toBe(20);
    expect(daysRemaining(new Date(2026, 9, 31))).toBe(1);
  });
});