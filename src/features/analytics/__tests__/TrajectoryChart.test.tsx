import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { TrajectoryChart } from '../TrajectoryChart';
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

describe('TrajectoryChart', () => {
  it('renders one bar per day of the month (31-day month)', () => {
    const root = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 9, 1)} />,
    );
    expect(countByPrefix(root, 'trajectory-day-')).toBe(31);
  });

  it('renders 28 bars in February 2026, 29 in February 2024, 30 in April', () => {
    const feb2026 = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 1, 1)} />,
    );
    expect(countByPrefix(feb2026, 'trajectory-day-')).toBe(28);

    const feb2024 = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2024, 1, 1)} />,
    );
    expect(countByPrefix(feb2024, 'trajectory-day-')).toBe(29);

    const apr2026 = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 3, 1)} />,
    );
    expect(countByPrefix(apr2026, 'trajectory-day-')).toBe(30);
  });

  it('marks exactly one day as today, on day 1, mid month and the last day', () => {
    for (const day of [1, 11, 31]) {
      const root = render(
        <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 9, day)} />,
      );
      expect(countByPrefix(root, 'trajectory-today')).toBe(1);
    }
  });

  it('renders with zero spend without crashing', () => {
    const root = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 9, 11)} />,
    );
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('₹0 spent');
  });

  it('renders over the limit without crashing', () => {
    const payments = [makePayment({ amountPaise: 500000 })];
    const root = render(
      <TrajectoryChart payments={payments} limit={100000} now={new Date(2026, 9, 11)} />,
    );
    const json = JSON.stringify(root.toJSON());
    expect(json).toContain('₹5,000 spent');
  });

  it('only draws the ceiling when a positive limit is set', () => {
    const noLimit = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 9, 11)} />,
    );
    expect(countByPrefix(noLimit, 'trajectory-ceiling-')).toBe(0);

    const zeroLimit = render(
      <TrajectoryChart payments={[]} limit={0} now={new Date(2026, 9, 11)} />,
    );
    expect(countByPrefix(zeroLimit, 'trajectory-ceiling-')).toBe(0);

    const withLimit = render(
      <TrajectoryChart payments={[]} limit={1500000} now={new Date(2026, 9, 11)} />,
    );
    expect(countByPrefix(withLimit, 'trajectory-ceiling-')).toBe(31);
  });

  it('shows a text summary with the ceiling only when a limit is set', () => {
    const noLimit = render(
      <TrajectoryChart payments={[]} limit={null} now={new Date(2026, 9, 11)} />,
    );
    const noLimitJson = JSON.stringify(noLimit.toJSON());
    expect(noLimitJson).toContain('spent');
    expect(noLimitJson).not.toContain('ceiling');

    const withLimit = render(
      <TrajectoryChart payments={[]} limit={1500000} now={new Date(2026, 9, 11)} />,
    );
    const withLimitJson = JSON.stringify(withLimit.toJSON());
    expect(withLimitJson).toContain('spent');
    expect(withLimitJson).toContain('ceiling');
    expect(withLimitJson).toContain('₹15,000 ceiling');
  });

  it('exposes the summary as an accessibility label', () => {
    const root = render(
      <TrajectoryChart payments={[]} limit={1500000} now={new Date(2026, 9, 11)} />,
    );
    const chart = root.root.findAll(
      (node: any) => typeof node.type === 'string' && node.props?.testID === 'trajectory-chart',
      { deep: true },
    )[0];
    expect(chart.props.accessibilityLabel).toContain('₹15,000 ceiling');
  });
});
