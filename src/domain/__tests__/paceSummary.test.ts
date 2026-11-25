import { Payment } from '../../data/payments';
import { paceSummary } from '../paceSummary';

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: '1',
    amountPaise: 10000,
    payeeName: 'Alice',
    payeeVpa: null,
    label: null,
    category: 'Food',
    status: 'success',
    source: 'manual',
    reviewed: true,
    createdAt: new Date(2026, 9, 5, 10, 0).getTime(),
    paidAt: null,
    upiRef: null,
    ...overrides,
  };
}

describe('paceSummary', () => {
  it('A9 example: 3630 spent on 11 Oct with a 15000 limit', () => {
    const payments = [makePayment({ amountPaise: 363000, createdAt: new Date(2026, 9, 5).getTime() })];
    const r = paceSummary(payments, 1500000, new Date(2026, 9, 11));
    expect(r.dailyAverage).toBe(33000);
    expect(r.projectedMonthEnd).toBe(1023000);
    expect(r.headroom).toBe(477000);
  });

  it('empty month: zeros, headroom equals the limit', () => {
    const r = paceSummary([], 1500000, new Date(2026, 9, 11));
    expect(r.dailyAverage).toBe(0);
    expect(r.projectedMonthEnd).toBe(0);
    expect(r.headroom).toBe(1500000);
    expect(r.versusLastMonth.thisMonth).toBe(0);
    expect(r.versusLastMonth.lastMonth).toBe(0);
    expect(r.versusLastMonth.diff).toBe(0);
    expect(r.versusLastMonth.percentChange).toBeNull();
    expect(r.versusLastMonth.direction).toBe('same');
  });

  it('no limit: headroom is null', () => {
    const payments = [makePayment({ amountPaise: 363000 })];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.headroom).toBeNull();
    expect(r.dailyAverage).toBe(33000);
  });

  it('zero limit is treated as no limit', () => {
    const r = paceSummary([], 0, new Date(2026, 9, 11));
    expect(r.headroom).toBeNull();
  });

  it('versus last month: up', () => {
    const payments = [
      makePayment({ amountPaise: 1000, createdAt: new Date(2026, 8, 5).getTime() }),
      makePayment({ amountPaise: 1500, createdAt: new Date(2026, 9, 5).getTime() }),
    ];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.versusLastMonth.thisMonth).toBe(1500);
    expect(r.versusLastMonth.lastMonth).toBe(1000);
    expect(r.versusLastMonth.diff).toBe(500);
    expect(r.versusLastMonth.percentChange).toBe(50);
    expect(r.versusLastMonth.direction).toBe('up');
  });

  it('versus last month: down with negative percentChange', () => {
    const payments = [
      makePayment({ amountPaise: 2000, createdAt: new Date(2026, 8, 5).getTime() }),
      makePayment({ amountPaise: 1000, createdAt: new Date(2026, 9, 5).getTime() }),
    ];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.versusLastMonth.diff).toBe(-1000);
    expect(r.versusLastMonth.percentChange).toBe(-50);
    expect(r.versusLastMonth.direction).toBe('down');
  });

  it('versus last month: same when diff is 0', () => {
    const payments = [
      makePayment({ amountPaise: 1000, createdAt: new Date(2026, 8, 5).getTime() }),
      makePayment({ amountPaise: 1000, createdAt: new Date(2026, 9, 5).getTime() }),
    ];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.versusLastMonth.diff).toBe(0);
    expect(r.versusLastMonth.percentChange).toBe(0);
    expect(r.versusLastMonth.direction).toBe('same');
  });

  it('versus last month: null percentChange when last month is zero', () => {
    const payments = [makePayment({ amountPaise: 1000, createdAt: new Date(2026, 9, 5).getTime() })];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.versusLastMonth.lastMonth).toBe(0);
    expect(r.versusLastMonth.percentChange).toBeNull();
    expect(r.versusLastMonth.direction).toBe('up');
  });

  it('excludes failed rows from spent and from the comparison', () => {
    const payments = [
      makePayment({ amountPaise: 1000, createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ amountPaise: 99999, status: 'failed' as any, createdAt: new Date(2026, 9, 5).getTime() }),
    ];
    const r = paceSummary(payments, null, new Date(2026, 9, 11));
    expect(r.versusLastMonth.thisMonth).toBe(1000);
    expect(r.dailyAverage).toBe(Math.floor(1000 / 11));
  });

  it('28-day month (Feb 2026)', () => {
    const payments = [makePayment({ amountPaise: 100000, createdAt: new Date(2026, 1, 5).getTime() })];
    const r = paceSummary(payments, null, new Date(2026, 1, 10));
    expect(r.dailyAverage).toBe(10000);
    expect(r.projectedMonthEnd).toBe(280000);
  });

  it('29-day month (Feb 2024, leap year)', () => {
    const payments = [makePayment({ amountPaise: 100000, createdAt: new Date(2024, 1, 5).getTime() })];
    const r = paceSummary(payments, null, new Date(2024, 1, 10));
    expect(r.projectedMonthEnd).toBe(290000);
  });

  it('30-day month (April 2026)', () => {
    const payments = [makePayment({ amountPaise: 100000, createdAt: new Date(2026, 3, 5).getTime() })];
    const r = paceSummary(payments, null, new Date(2026, 3, 10));
    expect(r.projectedMonthEnd).toBe(300000);
  });

  it('31-day month (October 2026)', () => {
    const payments = [makePayment({ amountPaise: 100000, createdAt: new Date(2026, 9, 5).getTime() })];
    const r = paceSummary(payments, null, new Date(2026, 9, 10));
    expect(r.projectedMonthEnd).toBe(310000);
  });
});
