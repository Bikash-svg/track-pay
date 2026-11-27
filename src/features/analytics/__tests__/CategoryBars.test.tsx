import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { CategoryBars } from '../CategoryBars';
import { categoryTotals, monthlyTotal } from '../../../domain/analytics';
import type { Payment } from '../../../data/payments';

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

function render(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(<ThemeProvider>{node}</ThemeProvider>);
  });
  return root;
}

function countByPrefix(root: any, prefix: string): number {
  return root.root.findAll(
    (node: any) =>
      typeof node.type === 'string' &&
      typeof node.props?.testID === 'string' &&
      node.props.testID.startsWith(prefix),
    { deep: true },
  ).length;
}

describe('CategoryBars', () => {
  it('shows all five categories even when some are empty', () => {
    const root = render(<CategoryBars payments={[]} year={2026} month={9} />);
    expect(countByPrefix(root, 'category-row-')).toBe(5);
    const json = JSON.stringify(root.toJSON());
    for (const name of ['Food', 'Shopping', 'Bills', 'Transport', 'Other']) {
      expect(json).toContain(name);
    }
  });

  it('renders the category amounts', () => {
    const payments = [
      makePayment({ amountPaise: 10000, category: 'Food' }),
      makePayment({ amountPaise: 20000, category: 'Food' }),
      makePayment({ amountPaise: 5000, category: 'Bills' }),
    ];
    const root = render(<CategoryBars payments={payments} year={2026} month={9} />);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('₹300');
    expect(json).toContain('₹50');
    expect(json).toContain('₹0');
  });

  it('category totals add up to the monthly total (EVALS A2)', () => {
    const payments = [
      makePayment({ amountPaise: 10000, category: 'Food' }),
      makePayment({ amountPaise: 20000, category: 'Shopping' }),
      makePayment({ amountPaise: 5000, category: 'Bills' }),
      makePayment({ amountPaise: 7000, category: 'Transport' }),
      makePayment({ amountPaise: 3000, category: 'Other' }),
    ];
    const totals = categoryTotals(payments, 2026, 9);
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    expect(sum).toBe(monthlyTotal(payments, 2026, 9));
  });

  it('shows an empty state when the month has no payments', () => {
    const root = render(<CategoryBars payments={[]} year={2026} month={9} />);
    expect(JSON.stringify(root.toJSON())).toContain('No spending this month');
  });

  it('does not show the empty state when there are payments', () => {
    const payments = [makePayment({ amountPaise: 10000, category: 'Food' })];
    const root = render(<CategoryBars payments={payments} year={2026} month={9} />);
    expect(JSON.stringify(root.toJSON())).not.toContain('No spending this month');
  });
});
