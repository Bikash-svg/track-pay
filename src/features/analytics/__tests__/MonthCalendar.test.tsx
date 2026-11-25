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

function pressByTestID(root: any, testID: string) {
  const candidates = root.root.findAll(
    (node: any) => node.props?.testID === testID,
    { deep: true },
  );
  const target = candidates.find(
    (node: any) => typeof node.props?.onPress === 'function',
  );
  act(() => {
    target.props.onPress();
  });
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

const noop = () => {};

describe('MonthCalendar', () => {
  it('renders the correct number of day cells', () => {
    const oct = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 15)}
        onChangeMonth={noop}
      />,
    );
    expect(countByPrefix(oct, 'calendar-day-')).toBe(31);

    const feb = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 1, 1)}
        today={new Date(2026, 1, 10)}
        onChangeMonth={noop}
      />,
    );
    expect(countByPrefix(feb, 'calendar-day-')).toBe(28);

    const leapFeb = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2024, 1, 1)}
        today={new Date(2024, 1, 10)}
        onChangeMonth={noop}
      />,
    );
    expect(countByPrefix(leapFeb, 'calendar-day-')).toBe(29);
  });

  it('marks the highest and lowest non-zero days', () => {
    const payments = [
      makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 10).getTime() }),
      makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 15).getTime() }),
    ];
    const root = render(
      <MonthCalendar
        payments={payments}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 20)}
        onChangeMonth={noop}
      />,
    );
    const text = allText(root);
    expect(text).toContain('Highest: day 10 (₹500)');
    expect(text).toContain('Lowest: day 5 (₹100)');

    expect(dayTextColor(hostByTestID(root, 'calendar-day-10'))).toBe(dark.primary);
    expect(dayTextColor(hostByTestID(root, 'calendar-day-5'))).toBe(dark.negative);
  });

  it('breaks a tie by the earlier date', () => {
    const payments = [
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 5).getTime() }),
      makePayment({ amountPaise: 50000, createdAt: new Date(2026, 9, 10).getTime() }),
    ];
    const root = render(
      <MonthCalendar
        payments={payments}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 20)}
        onChangeMonth={noop}
      />,
    );
    const text = allText(root);
    expect(text).toContain('Highest: day 5');
    expect(text).toContain('Lowest: day 5');
  });

  it('marks today when it is in the displayed month', () => {
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 15)}
        onChangeMonth={noop}
      />,
    );
    expect(countByPrefix(root, 'calendar-today')).toBe(1);
  });

  it('does not mark today when viewing a different month', () => {
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 8, 1)}
        today={new Date(2026, 9, 15)}
        onChangeMonth={noop}
      />,
    );
    expect(countByPrefix(root, 'calendar-today')).toBe(0);
  });

  it('opens a modal with that day\'s payments when a day is tapped', () => {
    const payments = [
      makePayment({
        id: 'a',
        payeeName: 'Alice',
        amountPaise: 10000,
        createdAt: new Date(2026, 9, 10, 12, 0).getTime(),
      }),
      makePayment({
        id: 'b',
        payeeName: 'Bob',
        amountPaise: 25000,
        createdAt: new Date(2026, 9, 10, 18, 0).getTime(),
      }),
      makePayment({
        id: 'c',
        payeeName: 'Carol',
        amountPaise: 5000,
        createdAt: new Date(2026, 9, 11, 9, 0).getTime(),
      }),
    ];
    const root = render(
      <MonthCalendar
        payments={payments}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    expect(hostByTestID(root, 'calendar-day-modal')).toBeUndefined();
    pressByTestID(root, 'calendar-day-10');
    expect(hostByTestID(root, 'calendar-day-modal')).toBeTruthy();
    const text = allText(root);
    expect(text).toContain('Day 10');
    expect(text).toContain('Alice');
    expect(text).toContain('₹100');
    expect(text).toContain('Bob');
    expect(text).toContain('₹250');
    expect(text).not.toContain('Carol');
  });

  it('shows "(No payments on this day)" in the modal for an empty day', () => {
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    pressByTestID(root, 'calendar-day-20');
    expect(hostByTestID(root, 'calendar-day-modal')).toBeTruthy();
    expect(allText(root)).toContain('No payments on this day');
  });

  it('closes the modal and clears the selection', () => {
    const payments = [
      makePayment({
        id: 'a',
        payeeName: 'Alice',
        amountPaise: 10000,
        createdAt: new Date(2026, 9, 10, 12, 0).getTime(),
      }),
    ];
    const root = render(
      <MonthCalendar
        payments={payments}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    pressByTestID(root, 'calendar-day-10');
    expect(hostByTestID(root, 'calendar-day-modal')).toBeTruthy();

    pressByTestID(root, 'calendar-modal-close');
    expect(hostByTestID(root, 'calendar-day-modal')).toBeUndefined();
    expect(allText(root)).not.toContain('Alice');
  });

  it('shows the monthly summary line', () => {
    const one = render(
      <MonthCalendar
        payments={[makePayment({ amountPaise: 10000, createdAt: new Date(2026, 9, 5).getTime() })]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    expect(allText(one)).toContain('1 payment · ₹100 spent');

    const two = render(
      <MonthCalendar
        payments={[
          makePayment({ id: 'a', amountPaise: 10000, createdAt: new Date(2026, 9, 5).getTime() }),
          makePayment({ id: 'b', amountPaise: 20000, createdAt: new Date(2026, 9, 6).getTime() }),
        ]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    expect(allText(two)).toContain('2 payments · ₹300 spent');
  });

  it('shows an empty state when the month has no payments', () => {
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 9, 1)}
        today={new Date(2026, 9, 1)}
        onChangeMonth={noop}
      />,
    );
    const text = allText(root);
    expect(text).toContain('0 payments · ₹0 spent');
    expect(text).toContain('No payments this month');
  });

  it('moves to the previous month, including January to December', () => {
    const calls: Date[] = [];
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 0, 1)}
        today={new Date(2026, 0, 15)}
        onChangeMonth={(next) => calls.push(next)}
      />,
    );
    pressByTestID(root, 'calendar-prev');
    expect(calls).toHaveLength(1);
    expect(calls[0].getFullYear()).toBe(2025);
    expect(calls[0].getMonth()).toBe(11);
  });

  it('moves to the next month, including December to January', () => {
    const calls: Date[] = [];
    const root = render(
      <MonthCalendar
        payments={[]}
        displayDate={new Date(2026, 11, 1)}
        today={new Date(2026, 11, 15)}
        onChangeMonth={(next) => calls.push(next)}
      />,
    );
    pressByTestID(root, 'calendar-next');
    expect(calls).toHaveLength(1);
    expect(calls[0].getFullYear()).toBe(2027);
    expect(calls[0].getMonth()).toBe(0);
  });
});
