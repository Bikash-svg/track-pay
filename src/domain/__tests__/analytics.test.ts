import { Payment, PaymentCategory } from '../../data/payments';
import {
  monthlyTotal,
  sameDayComparison,
  cumulativeSpendPerDay,
  straightLineCeiling,
  categoryTotals,
  weekdayTotals,
  topFivePayees,
  daysWithoutPayment,
  daysInMonth,
  projectedMonthEnd,
} from '../analytics';

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
    createdAt: new Date(2026, 9, 11, 10, 0).getTime(),
    paidAt: null,
    upiRef: null,
    ...overrides,
  };
}

describe('analytics', () => {
  describe('monthlyTotal', () => {
    it('sums amountPaise for payments in the given month', () => {
      const payments = [
        makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 5).getTime() }),
        makePayment({ amountPaise: 20000, createdAt: new Date(2026, 9, 20).getTime() }),
      ];
      expect(monthlyTotal(payments, 2026, 9)).toBe(30000);
    });

    it('excludes payments with status !== success', () => {
      const payments = [
        makePayment({ amountPaise: 10000, status: 'success' as any }),
        makePayment({ amountPaise: 99999, status: 'failed' as any }),
      ];
      expect(monthlyTotal(payments, 2026, 9)).toBe(10000);
    });

    it('empty month returns 0', () => {
      expect(monthlyTotal([], 2026, 9)).toBe(0);
    });

    it('payment at 23:59 on last day belongs to that month', () => {
      const payments = [
        makePayment({ amountPaise: 5000, createdAt: new Date(2026, 9, 31, 23, 59).getTime() }),
      ];
      expect(monthlyTotal(payments, 2026, 9)).toBe(5000);
      expect(monthlyTotal(payments, 2026, 10)).toBe(0);
    });
  });

  describe('sameDayComparison', () => {
    it('compares same days only', () => {
      const payments = [
        // Sep: days 1..11 sum 1000 (day 5: 1000)
        makePayment({ amountPaise: 1000, createdAt: new Date(2026, 8, 5).getTime() }),
        // Oct: days 1..11 sum 1500
        makePayment({ amountPaise: 1500, createdAt: new Date(2026, 9, 5).getTime() }),
        // Oct day 20 (excluded by day=11)
        makePayment({ amountPaise: 9999, createdAt: new Date(2026, 9, 20).getTime() }),
      ];
      const r = sameDayComparison(payments, 2026, 9, 11);
      expect(r.thisMonth).toBe(1500);
      expect(r.lastMonth).toBe(1000);
      expect(r.diff).toBe(500);
      expect(r.percentChange).toBe(Math.floor((500 / 1000) * 100));
    });

    it('percentChange null when lastMonth is 0', () => {
      const payments = [makePayment({ amountPaise: 1000, createdAt: new Date(2026, 9, 5).getTime() })];
      const r = sameDayComparison(payments, 2026, 9, 11);
      expect(r.lastMonth).toBe(0);
      expect(r.percentChange).toBeNull();
    });

    it('handles month boundary (January -> December previous year)', () => {
      const payments = [
        makePayment({ amountPaise: 700, createdAt: new Date(2025, 11, 3).getTime() }),
        makePayment({ amountPaise: 900, createdAt: new Date(2026, 0, 3).getTime() }),
      ];
      const r = sameDayComparison(payments, 2026, 0, 5);
      expect(r.thisMonth).toBe(900);
      expect(r.lastMonth).toBe(700);
    });
  });

  describe('cumulativeSpendPerDay', () => {
    it('returns array of length daysInMonth with cumulative totals', () => {
      const payments = [
        makePayment({ amountPaise: 100, createdAt: new Date(2026, 9, 1).getTime() }),
        makePayment({ amountPaise: 200, createdAt: new Date(2026, 9, 3).getTime() }),
      ];
      const r = cumulativeSpendPerDay(payments, 2026, 9);
      expect(r.length).toBe(31);
      expect(r[0]).toBe(100);
      expect(r[1]).toBe(100);
      expect(r[2]).toBe(300);
      expect(r[30]).toBe(300);
    });

    it('empty month all zeros', () => {
      const r = cumulativeSpendPerDay([], 2026, 1); // Feb 2026 = 28 days
      expect(r.length).toBe(28);
      expect(r.every((x) => x === 0)).toBe(true);
    });

    it('Feb leap year 29 days', () => {
      const r = cumulativeSpendPerDay([], 2024, 1);
      expect(r.length).toBe(29);
    });
  });

  describe('straightLineCeiling', () => {
    it('computes straight line', () => {
      const r = straightLineCeiling(1000, 4);
      expect(r).toEqual([250, 500, 750, 1000]);
    });

    it('empty when limit null or <=0', () => {
      expect(straightLineCeiling(null, 5)).toEqual([]);
      expect(straightLineCeiling(0, 5)).toEqual([]);
      expect(straightLineCeiling(-10, 5)).toEqual([]);
    });

    it('uses Math.floor', () => {
      const r = straightLineCeiling(100, 3);
      expect(r).toEqual([33, 66, 100]);
    });
  });

  describe('categoryTotals', () => {
    it('totals per category, all 5 present', () => {
      const payments = [
        makePayment({ amountPaise: 100, category: 'Food' }),
        makePayment({ amountPaise: 200, category: 'Food' }),
        makePayment({ amountPaise: 50, category: 'Bills' }),
      ];
      const r = categoryTotals(payments, 2026, 9);
      expect(r.Food).toBe(300);
      expect(r.Bills).toBe(50);
      expect(r.Shopping).toBe(0);
      expect(r.Transport).toBe(0);
      expect(r.Other).toBe(0);
    });

    it('category totals add up to monthly total', () => {
      const payments = [
        makePayment({ amountPaise: 100, category: 'Food' }),
        makePayment({ amountPaise: 200, category: 'Shopping' }),
      ];
      const cats = categoryTotals(payments, 2026, 9);
      const sum = Object.values(cats).reduce((a, b) => a + b, 0);
      expect(sum).toBe(monthlyTotal(payments, 2026, 9));
    });
  });

  describe('weekdayTotals', () => {
    it('length 7, index 0 Sunday', () => {
      // 2026-10-11 is a Sunday
      const payments = [makePayment({ amountPaise: 500, createdAt: new Date(2026, 9, 11).getTime() })];
      const r = weekdayTotals(payments, 2026, 9);
      expect(r.length).toBe(7);
      expect(r[0]).toBe(500);
    });
  });

  describe('topFivePayees', () => {
    it('ranked by totalPaise desc, ties by name asc, max 5', () => {
      const payments = [
        makePayment({ payeeName: 'Zoe', amountPaise: 100 }),
        makePayment({ payeeName: 'Alice', amountPaise: 100 }),
        makePayment({ payeeName: 'Bob', amountPaise: 200 }),
        makePayment({ payeeName: 'Carol', amountPaise: 50 }),
        makePayment({ payeeName: 'Dan', amountPaise: 300 }),
        makePayment({ payeeName: 'Eve', amountPaise: 150 }),
        makePayment({ payeeName: 'Frank', amountPaise: 250 }),
      ];
      const r = topFivePayees(payments, 2026, 9);
      expect(r.length).toBe(5);
      expect(r[0].payeeName).toBe('Dan');
      expect(r[0].totalPaise).toBe(300);
      // tie 100: Alice before Zoe
      const names = r.map((x) => x.payeeName);
      expect(names).not.toContain('Zoe');
      // count check
      const alice = r.find((x) => x.payeeName === 'Alice');
      expect(alice?.count).toBe(1);
    });

    it('aggregates count per payee', () => {
      const payments = [
        makePayment({ payeeName: 'Alice', amountPaise: 100 }),
        makePayment({ payeeName: 'Alice', amountPaise: 200 }),
      ];
      const r = topFivePayees(payments, 2026, 9);
      expect(r[0].totalPaise).toBe(300);
      expect(r[0].count).toBe(2);
    });
  });

  describe('daysWithoutPayment', () => {
    it('counts days with zero payments', () => {
      const payments = [
        makePayment({ createdAt: new Date(2026, 9, 1).getTime() }),
        makePayment({ createdAt: new Date(2026, 9, 3).getTime() }),
      ];
      // 31 days in Oct, 2 payment days
      expect(daysWithoutPayment(payments, 2026, 9)).toBe(29);
    });

    it('empty month: all days without payment', () => {
      expect(daysWithoutPayment([], 2026, 9)).toBe(31);
    });
  });

  describe('daysInMonth', () => {
    it('returns days for given year/month', () => {
      expect(daysInMonth(2026, 1)).toBe(28);
      expect(daysInMonth(2024, 1)).toBe(29);
      expect(daysInMonth(2026, 3)).toBe(30);
      expect(daysInMonth(2026, 0)).toBe(31);
    });
  });

  describe('projectedMonthEnd', () => {
    it('multiplies dailyAverage by daysInMonth', () => {
      expect(projectedMonthEnd(33000, 31)).toBe(1023000);
    });
  });
});
