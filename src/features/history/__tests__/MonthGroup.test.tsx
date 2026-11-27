import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../../ui/useTheme';
import { PayRow } from '../../../ui/PayRow';
import {
  PaymentsProvider,
  setPaymentsSeed,
  type Payment,
} from '../../../data/payments';
import { setStorage } from '../../../data/settings';
import { DialogProvider } from '../../../ui/DialogProvider';
import { MonthGroup } from '../MonthGroup';
import HistoryScreen from '../../../../app/(tabs)/history';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

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

function renderScreen(node: React.ReactNode) {
  let root: any;
  act(() => {
    root = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 392, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ThemeProvider>
          <PaymentsProvider>
            <DialogProvider>{node}</DialogProvider>
          </PaymentsProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return root;
}

function pressHeader(root: any) {
  const headers = root.root.findAll(
    (node: any) =>
      node.props?.testID === 'month-group-header' &&
      typeof node.props?.onPress === 'function',
    { deep: true },
  );
  expect(headers.length).toBeGreaterThan(0);
  act(() => {
    headers[0].props.onPress();
  });
}

function rowCount(root: any): number {
  return root.root.findAllByType(PayRow).length;
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

beforeEach(() => {
  jest.clearAllMocks();
  setPaymentsSeed([]);
  setStorage({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  });
});

describe('MonthGroup', () => {
  it('renders the month name and the month spend', () => {
    const payments = [
      makePayment({ id: 'a', amountPaise: 10000 }),
      makePayment({ id: 'b', amountPaise: 20000 }),
    ];
    const root = render(
      <MonthGroup
        year={2026}
        month={9}
        payments={payments}
        now={new Date(2026, 9, 20)}
        defaultOpen={false}
        onRowPress={() => {}}
      />,
    );

    const text = allText(root);
    expect(text).toContain('October 2026');
    expect(text).toContain('Spent ₹300');
    expect(rowCount(root)).toBe(0);
  });

  it('expands and collapses when the header is tapped', () => {
    const root = render(
      <MonthGroup
        year={2026}
        month={9}
        payments={[makePayment()]}
        now={new Date(2026, 9, 20)}
        defaultOpen={false}
        onRowPress={() => {}}
      />,
    );

    expect(rowCount(root)).toBe(0);
    pressHeader(root);
    expect(rowCount(root)).toBe(1);
    pressHeader(root);
    expect(rowCount(root)).toBe(0);
  });

  it('opens the current month without a tap', () => {
    const now = new Date();
    const current = new Date(now.getFullYear(), now.getMonth(), 10);
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 10);
    setPaymentsSeed([
      makePayment({
        id: 'current',
        payeeName: 'Current Payee',
        createdAt: current.getTime(),
      }),
      makePayment({
        id: 'previous',
        payeeName: 'Previous Payee',
        createdAt: previous.getTime(),
      }),
    ]);

    const root = renderScreen(<HistoryScreen />);

    const text = allText(root);
    expect(text).toContain('Current Payee');
    expect(text).not.toContain('Previous Payee');
    expect(rowCount(root)).toBe(1);
  });
});
