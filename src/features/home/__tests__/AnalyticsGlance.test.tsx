import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../../ui/useTheme';
import { PaymentsProvider, setPaymentsSeed, type Payment } from '../../../data/payments';
import { DialogProvider } from '../../../ui/DialogProvider';
import { PendingCountProvider } from '../../../ui/PendingCountProvider';
import { paceSummary } from '../../../domain/paceSummary';
import { formatMoney } from '../../../ui/Money';
import { setStorage } from '../../../data/settings';
import { router } from 'expo-router';
import HomeScreen from '../../../../app/(tabs)/index';

// PendingPod pulls in heavy native modules (scanEngine -> notifee / paddleOcr)
// that are not part of this step; stub it out so HomeScreen renders cleanly.
jest.mock('../../../features/pending/PendingPod', () => ({
  PendingPod: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

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
    root = create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 392, height: 844 },
          insets: { top: 24, right: 0, bottom: 0, left: 0 },
        }}
      >
        <ThemeProvider>
          <PaymentsProvider>
            <DialogProvider>
              <PendingCountProvider>{node}</PendingCountProvider>
            </DialogProvider>
          </PaymentsProvider>
        </ThemeProvider>
      </SafeAreaProvider>,
    );
  });
  return root;
}

function pressByAccessibilityLabel(root: any, label: string) {
  const candidates = root.root.findAll(
    (node: any) =>
      node.props?.accessibilityLabel === label &&
      typeof node.props?.onPress === 'function',
    { deep: true },
  );
  expect(candidates.length).toBeGreaterThan(0);
  act(() => {
    candidates[0].props.onPress();
  });
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
    removeItem: jest.fn().mockResolvedValue(undefined),
  });
});

describe('AnalyticsGlance', () => {
  it('shows daily pace, month-end estimate and versus last month matching paceSummary', () => {
    const now = new Date();
    const payments = [
      makePayment({
        amountPaise: 30000,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 5).getTime(),
      }),
      makePayment({
        amountPaise: 20000,
        createdAt: new Date(now.getFullYear(), now.getMonth(), 10).getTime(),
      }),
    ];
    setPaymentsSeed(payments);
    const expected = paceSummary(payments, null, now);
    const root = render(<HomeScreen />);
    const text = allText(root);
    expect(text).toContain(`Daily pace ${formatMoney(expected.dailyAverage)}`);
    expect(text).toContain(
      `Month-end estimate ${formatMoney(expected.projectedMonthEnd)} (estimate)`,
    );
    expect(text).toContain(formatMoney(Math.abs(expected.versusLastMonth.diff)));
  });

  it('shows zeros for an empty month without crashing', () => {
    const root = render(<HomeScreen />);
    const text = allText(root);
    expect(text).toContain('Daily pace ₹0');
    expect(text).toContain('Month-end estimate ₹0 (estimate)');
    expect(text).toContain('vs last month, same days: — (₹0)');
  });

  it('navigates to /analytics when the Analytics link is pressed', () => {
    const root = render(<HomeScreen />);
    pressByAccessibilityLabel(root, 'Analytics');
    expect(router.push).toHaveBeenCalledWith('/analytics');
  });
});
