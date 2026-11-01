import React from 'react';
const rtr = require('react-test-renderer');
const { act, create } = rtr;
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PaymentsProvider,
  usePayments,
  setPaymentsSeed,
  type Payment,
  type PaymentInput,
} from '../payments';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

function renderWithSeed(seed: Payment[]) {
  setPaymentsSeed(seed);
  let observed: Payment[] = [];
  let captured: {
    addFriend: (i: PaymentInput) => Promise<Payment>;
    addQr: (i: PaymentInput) => Promise<Payment>;
    updatePayment: (id: string, updates: Partial<PaymentInput>) => Promise<void>;
  } = {
    addFriend: async () => ({} as Payment),
    addQr: async () => ({} as Payment),
    updatePayment: async () => {},
  };
  function Probe() {
    const ctx = usePayments();
    observed = ctx.payments as Payment[];
    captured = { addFriend: ctx.addPayment, addQr: ctx.addPayment, updatePayment: ctx.updatePayment };
    return null;
  }
  let root: any;
  act(() => {
    root = create(
      <PaymentsProvider>
        <Probe />
      </PaymentsProvider>
    );
  });
  return { root, get observed() { return observed; }, get addFriend() { return captured.addFriend; }, get addQr() { return captured.addQr; }, get updatePayment() { return captured.updatePayment; } };
}

describe('payments store (AsyncStorage-backed, Step 4.3)', () => {
  beforeEach(async () => {
    setPaymentsSeed([]);
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('addPayment creates a payment with correct properties', async () => {
    const probe = renderWithSeed([]);
    let result: Payment;
    await act(async () => {
      result = await probe.addFriend({
        amountPaise: 12000,
        payeeName: 'Test',
        label: null,
        category: 'Food',
        createdAt: new Date(),
        source: 'manual',
        reviewed: true,
      });
    });
    expect(result!.payeeName).toBe('Test');
    expect(result!.source).toBe('manual');
    expect(result!.reviewed).toBe(true);
    expect(result!.status).toBe('success');
    expect(result!.createdAt).toBeGreaterThan(0);
  });

  it('addPayment with source receipt creates payment with reviewed false', async () => {
    const probe = renderWithSeed([]);
    let result: Payment;
    await act(async () => {
      result = await probe.addFriend({
        amountPaise: 12000,
        payeeName: 'Test',
        label: null,
        category: 'Food',
        createdAt: new Date(),
        source: 'receipt',
        reviewed: false,
      });
    });
    expect(result!.source).toBe('receipt');
    expect(result!.reviewed).toBe(false);
  });

  it('updatePayment changes specified fields only', async () => {
    const initialPayment: Payment = {
      id: 'test-id',
      amountPaise: 10000,
      payeeName: 'Test',
      payeeVpa: null,
      label: null,
      category: 'Food',
      status: 'success',
      source: 'manual',
      reviewed: true,
      createdAt: 1234567890,
      paidAt: null,
      upiRef: null,
    };
    const probe = renderWithSeed([initialPayment]);
    let updateResult: any;
    await act(async () => {
      updateResult = await probe.updatePayment('test-id', {
        amountPaise: 15000,
        payeeName: 'Updated',
      });
    });
    expect(probe.observed.length).toBe(1);
    expect(probe.observed[0].payeeName).toBe('Updated');
    expect(probe.observed[0].amountPaise).toBe(15000);
  });

  it('updatePayment on non-existent id -> no-op', async () => {
    const probe = renderWithSeed([]);
    let updateResult: any;
    await act(async () => {
      updateResult = await probe.updatePayment('non-existent-id', { payeeName: 'New' });
    });
    expect(probe.observed.length).toBe(0);
  });

  it('addPayment writes to AsyncStorage', async () => {
    const probe = renderWithSeed([]);
    await act(async () => {
      await probe.addFriend({
        amountPaise: 12000,
        payeeName: 'Test',
        label: null,
        category: 'Food',
        createdAt: new Date(),
        source: 'manual',
        reviewed: true,
      });
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const stored = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const parsed = JSON.parse(stored) as Payment[];
    expect(parsed.length).toBe(1);
    expect(parsed[0].payeeName).toBe('Test');
  });
});
