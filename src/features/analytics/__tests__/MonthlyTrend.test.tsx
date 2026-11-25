import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { MonthlyTrend } from '../MonthlyTrend';
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

function hostByTestID(root: any, testID: string): any {
  return root.root.findAll(
    (node: any) => typeof node.type === 'string' && node.props?.testID === testID,
    { deep: true },
  )[0];
}

function allText(root: any): string {
  return root.root
    .findAll(
      (node: any) => typeof node.type === 'string' && node.type === 'Text',
      { deep: true },
    )
    .map((node: any) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : String(node.props.children ?? ''),
    )
    .join(' | ');
}

describe('MonthlyTrend', () => {
  // now = Oct 2026. Bars are May, Jun, Jul, Aug, Sep, Oct (indices 0..5).

  it('renders six monthly bars', () => {
    const root = render(<MonthlyTrend payments={[]} limit={null} now={new Date(2026, 9, 15)} />);
    expect(countByPrefix(root, 'trend-bar-')).toBe(6);
  });

  it('scales the highest month to the full bar', () => {
    const payments = [
      makePayment({ amountPaise: 500000, createdAt: new Date(2026, 8, 5).getTime() }),
      makePayment({ amountPaise: 100000, createdAt: new Date(2026, 9, 5).getTime() }),
    ];
    const root = render(<MonthlyTrend payments={payments} limit={null} now={new Date(2026, 9, 15)} />);
    expect(hostByTestID(root, 'trend-bar-4').props.style.height).toBe('100%');
    expect(hostByTestID(root, 'trend-bar-5').props.style.height).toBe('20%');
  });

  it('renders zero-height bars for an empty six months without crashing', () => {
    const root = render(<MonthlyTrend payments={[]} limit={null} now={new Date(2026, 9, 15)} />);
    for (let i = 0; i < 6; i++) {
      expect(hostByTestID(root, `trend-bar-${i}`).props.style.height).toBe('0%');
    }
  });

  it('shows the limit only when one is set', () => {
    const noLimit = render(<MonthlyTrend payments={[]} limit={null} now={new Date(2026, 9, 15)} />);
    expect(allText(noLimit)).not.toContain('Limit:');

    const withLimit = render(
      <MonthlyTrend payments={[]} limit={1500000} now={new Date(2026, 9, 15)} />,
    );
    expect(allText(withLimit)).toContain('Limit: ₹15,000');
  });
});
