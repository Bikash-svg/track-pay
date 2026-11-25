import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { ThemeProvider } from '../../../ui/useTheme';
import { MonthCalendar } from '../MonthCalendar';
import { dark } from '../../../ui/theme';
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

function dayTextColor(cell: any): string | undefined {
  const texts = cell.findAll(
    (node: any) => typeof node.type === 'string' && node.type === 'Text',
    { deep: true },
  );
  const style = texts[0]?.props?.style;
  const merged = Array.isArray(style) ? Object.assign({}, ...style.filter(Boolean)) : style;
  return merged?.color;
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

describe('MonthCalendar', () => {
  it('renders the correct number of day cells', () => {
    const oct = render(<MonthCalendar payments={[]} year={2026} month={9} />);
    expect(countByPrefix(oct, 'calendar-day-')).toBe(31);

    const feb = render(<MonthCalendar payments={[]} year={2026} month={1} />);
    expect(countByPrefix(feb, 'calendar-day-')).toBe(28);

    const leapFeb = render(<MonthCalendar payments={[]} year={2024} month={1} />);
    expect(countByPrefix(leapFeb, 'calendar-day-')).toBe(29);
  });

  it('marks the highest and lowest non-zero days', () => {
    const payments = [
      makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 10).getTime() }),
      makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 15).getTime() }),
    ];
    const root = render(<MonthCalendar payments={payments} year={2026} month={9} />);
    const text = allText(root);
    expect(text).toContain('Highest: day 10 (₹500)');
    expect(text).toContain('Lowest: day 5 (₹100)');

    expect(dayTextColor(hostByTestID(root, 'calendar-day-10'))).toBe(dark.primary);
    expect(dayTextColor(hostByTestID(root, 'calendar-day-5'))).toBe(dark.negative);
  });

  it('shows an empty state when the month has no payments', () => {
    const root = render(<MonthCalendar payments={[]} year={2026} month={9} />);
    const text = allText(root);
    expect(text).toContain('No payments this month');
    expect(text).not.toContain('Highest:');
    expect(text).not.toContain('Lowest:');
  });

  it('breaks a tie by the earlier date', () => {
    const payments = [
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 10).getTime() }),
    ];
    const root = render(<MonthCalendar payments={payments} year={2026} month={9} />);
    const text = allText(root);
    expect(text).toContain('Highest: day 5');
    expect(text).toContain('Lowest: day 5');
  });
});
