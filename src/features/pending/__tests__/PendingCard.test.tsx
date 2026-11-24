import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../../ui/useTheme';
import { PendingCard } from '../PendingCard';

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn(), canGoBack: () => true, replace: jest.fn() },
  useFocusEffect: (cb: any) => { if (typeof cb === 'function') cb(); },
  useLocalSearchParams: () => ({ id: 'test-id' }),
}));

jest.mock('../../../data/pendingItems', () => ({
  loadAll: jest.fn().mockResolvedValue([
    { id: 'test-id', imagePath: 'file:///x.jpg', originalName: null, capturedAt: 1, status: 'unscanned', scanResult: null, error: null, paymentId: null },
  ]),
  removeOne: jest.fn().mockResolvedValue(undefined),
  markVerified: jest.fn().mockResolvedValue(null),
}));

jest.mock('../../../data/payments', () => ({
  usePayments: () => ({
    addPayment: jest.fn().mockResolvedValue({ id: 'p1' }),
    updatePayment: jest.fn().mockResolvedValue(undefined),
    deletePayment: jest.fn().mockResolvedValue(undefined),
    payments: [],
  }),
}));

jest.mock('../scanEngine', () => ({
  scanOne: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../ui/DialogProvider', () => ({
  useDialog: () => ({
    open: jest.fn(),
    close: jest.fn(),
    visible: false,
  }),
}));

function wrap(node: React.ReactNode) {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 392, height: 844 },
        insets: { top: 24, right: 0, bottom: 0, left: 0 },
      }}
    >
      <ThemeProvider>{node}</ThemeProvider>
    </SafeAreaProvider>
  );
}

describe('PendingCard', () => {
  it('renders without crashing', () => {
    let root: any;
    act(() => {
      root = create(wrap(<PendingCard />));
    });
    const json = JSON.stringify(root.toJSON());
    expect(json).toBeTruthy();
  });
});
