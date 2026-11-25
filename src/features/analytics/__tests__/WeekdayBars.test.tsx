import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { WeekdayBars } from '../WeekdayBars';
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

describe('WeekdayBars', () => {
  it('renders seven weekday bars with labels', () => {
    const root = render(<WeekdayBars payments={[]} year={2026} month={9} />);
    expect(countByPrefix(root, 'weekday-bar-')).toBe(7);
    const json = JSON.stringify(root.toJSON());
    for (const name of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']) {
      expect(json).toContain(name);
    }
  });

  it('shows an empty state when the month has no payments', () => {
    const root = render(<WeekdayBars payments={[]} year={2026} month={9} />);
    expect(JSON.stringify(root.toJSON())).toContain('No payments this month');
  });

  it('does not show the empty state when there are payments', () => {
    // 2026-10-11 is a Sunday.
    const payments = [makePayment({ amountPaise: 5000, createdAt: new Date(2026, 9, 11).getTime() })];
    const root = render(<WeekdayBars payments={payments} year={2026} month={9} />);
    expect(JSON.stringify(root.toJSON())).not.toContain('No payments this month');
  });
});
