import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const rtr = require('react-test-renderer');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { act, create } = rtr;
import {
  PaymentsProvider,
  usePayments,
  setPaymentsSeed,
  type FriendPayment,
} from '../payments';

// Mock AsyncStorage for tests
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// The store is AsyncStorage-backed (Step 4.3). setPaymentsSeed is the
// test seam, mirroring setStorage() in settings.ts: the default is the empty
// in-memory store, tests seed it directly. Tests mock AsyncStorage via jest
// auto-mock from @react-native-async-storage/async-storage/jest/async-storage-mock.

function renderWithSeed(seed: FriendPayment[]) {
  setPaymentsSeed(seed);
  let observed: FriendPayment[] = [];
  let captured: {
    addFriend: (i: { amountPaise: number; payeeName: string; preferredUpiPackage: string | null }) => Promise<FriendPayment>;
    addQr: (i: { amountPaise: number; payeeName: string; payeeVpa: string; label: string | null }) => Promise<FriendPayment>;
  } = {
    addFriend: async () => ({} as FriendPayment),
    addQr: async () => ({} as FriendPayment),
  };
  function Probe() {
    const ctx = usePayments();
    observed = ctx.payments as FriendPayment[];
    captured = { addFriend: ctx.addFriendPayment, addQr: ctx.addQrPayment };
    return null;
  }
  let root: any;
  act(() => {
    root = create(
      <PaymentsProvider>
        <Probe />
      </PaymentsProvider>,
    );
  });
  return { root, get observed() { return observed; }, get addFriend() { return captured.addFriend; }, get addQr() { return captured.addQr; } };
}

describe('payments store (AsyncStorage-backed, Step 4.3)', () => {
  beforeEach(() => {
    setPaymentsSeed([]);
    jest.clearAllMocks();
  });

  it('addFriendPayment with an empty payeeName saves payeeName "Friend" (DESIGN.md §4)', async () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    await act(async () => {
      result = await probe.addFriend({
        amountPaise: 12000,
        payeeName: '   ',
        preferredUpiPackage: null,
      });
    });
    expect(result!.payeeName).toBe('Friend');
    expect(result!.source).toBe('friend');
  });

  it('addFriendPayment sets status "pending" and source "friend" (S1)', async () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    await act(async () => {
      result = await probe.addFriend({
        amountPaise: 5000,
        payeeName: 'Bikash',
        preferredUpiPackage: 'com.phonepe.app',
      });
    });
    expect(result!.status).toBe('pending');
    expect(result!.source).toBe('friend');
  });

  it('addFriendPayment sets createdAt > 0', async () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    await act(async () => {
      result = await probe.addFriend({
        amountPaise: 100,
        payeeName: 'X',
        preferredUpiPackage: null,
      });
    });
    expect(result!.createdAt).toBeGreaterThan(0);
  });

  it('newest payment is prepended: a second add appears first (3.5 newest-first)', async () => {
    const probe = renderWithSeed([]);
    let result1: FriendPayment;
    await act(async () => {
      result1 = await probe.addFriend({ amountPaise: 100, payeeName: 'First', preferredUpiPackage: null });
    });
    expect(result1!.payeeName).toBe('First');
    let result2: FriendPayment;
    await act(async () => {
      result2 = await probe.addFriend({ amountPaise: 200, payeeName: 'Second', preferredUpiPackage: null });
    });
    expect(result2!.payeeName).toBe('Second');
  });

  it('addFriendPayment writes to AsyncStorage', async () => {
    const probe = renderWithSeed([]);
    await act(async () => {
      await probe.addFriend({ amountPaise: 12000, payeeName: 'Test', preferredUpiPackage: null });
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const stored = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const parsed = JSON.parse(stored) as FriendPayment[];
    expect(parsed.length).toBe(1);
    expect(parsed[0].payeeName).toBe('Test');
    expect(parsed[0].source).toBe('friend');
  });

  it('addQrPayment creates payment with source "qr", payeeVpa, and label', async () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    await act(async () => {
      result = await probe.addQr({
        amountPaise: 12000,
        payeeName: 'Cafe Mocha',
        payeeVpa: 'shop@bank',
        label: 'Lunch',
      });
    });
    expect(result!.status).toBe('pending');
    expect(result!.source).toBe('qr');
    expect(result!.payeeVpa).toBe('shop@bank');
    expect(result!.label).toBe('Lunch');
  });

  it('addQrPayment writes to AsyncStorage', async () => {
    const probe = renderWithSeed([]);
    await act(async () => {
      await probe.addQr({ amountPaise: 5000, payeeName: 'Shop', payeeVpa: 'shop@bank', label: 'Tea' });
    });
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    const stored = (AsyncStorage.setItem as jest.Mock).mock.calls[0][1];
    const parsed = JSON.parse(stored) as FriendPayment[];
    expect(parsed.length).toBe(1);
    expect(parsed[0].source).toBe('qr');
    expect(parsed[0].payeeVpa).toBe('shop@bank');
  });
});