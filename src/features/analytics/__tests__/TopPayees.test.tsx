import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { TopPayees } from '../TopPayees';
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

describe('TopPayees', () => {
  it('renders the top five payees ranked by total', () => {
    const payments = [
      makePayment({ payeeName: 'Dan', amountPaise: 300 }),
      makePayment({ payeeName: 'Bob', amountPaise: 200 }),
      makePayment({ payeeName: 'Eve', amountPaise: 150 }),
      makePayment({ payeeName: 'Carol', amountPaise: 50 }),
      makePayment({ payeeName: 'Alice', amountPaise: 100 }),
      makePayment({ payeeName: 'Frank', amountPaise: 25 }),
    ];
    const root = render(<TopPayees payments={payments} year={2026} month={9} />);
    expect(countByPrefix(root, 'top-payee-')).toBe(5);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('1. Dan');
    expect(json).toContain('2. Bob');
    expect(json).toContain('3. Eve');
    expect(json).toContain('4. Alice');
    expect(json).toContain('5. Carol');
    expect(json).not.toContain('Frank');
    expect(json).toContain('₹3 (1)');
  });

  it('breaks ties by payee name ascending', () => {
    const payments = [
      makePayment({ payeeName: 'Zoe', amountPaise: 100 }),
      makePayment({ payeeName: 'Alice', amountPaise: 100 }),
      makePayment({ payeeName: 'Bob', amountPaise: 200 }),
    ];
    const root = render(<TopPayees payments={payments} year={2026} month={9} />);
    const json = JSON.stringify(root.toJSON());
    expect(json.indexOf('1. Bob')).toBeLessThan(json.indexOf('2. Alice'));
    expect(json.indexOf('2. Alice')).toBeLessThan(json.indexOf('3. Zoe'));
  });

  it('shows an empty state when there are no payments', () => {
    const root = render(<TopPayees payments={[]} year={2026} month={9} />);
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('No payments this month');
    expect(countByPrefix(root, 'top-payee-')).toBe(0);
  });

  it('renders a long payee name without truncating it', () => {
    const longName = 'A'.repeat(40);
    const payments = [makePayment({ payeeName: longName, amountPaise: 500 })];
    const root = render(<TopPayees payments={payments} year={2026} month={9} />);
    expect(JSON.stringify(root.toJSON())).toContain(longName);
  });
});
