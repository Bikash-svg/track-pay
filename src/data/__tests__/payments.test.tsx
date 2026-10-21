import React from 'react';
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

// The store is in-memory and session-scoped (Step 4.1). setPaymentsSeed is the
// test seam, mirroring setStorage() in settings.ts: the default is the empty
// in-memory store, tests seed it directly.

function renderWithSeed(seed: FriendPayment[]) {
  setPaymentsSeed(seed);
  let observed: FriendPayment[] = [];
  let captured: { add: (i: { amountPaise: number; payeeName: string; preferredUpiPackage: string | null }) => FriendPayment } = {
    add: () => ({} as FriendPayment),
  };
  function Probe() {
    const ctx = usePayments();
    observed = ctx.payments as FriendPayment[];
    captured = { add: ctx.addFriendPayment };
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
  return { root, get observed() { return observed; }, get add() { return captured.add; } };
}

describe('payments store (interim, Step 4.1)', () => {
  beforeEach(() => {
    setPaymentsSeed([]);
  });

  it('addFriendPayment with an empty payeeName saves payeeName "Friend" (DESIGN.md §4)', () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    act(() => {
      result = probe.add({
        amountPaise: 12000,
        payeeName: '   ',
        preferredUpiPackage: null,
      });
    });
    expect(result!.payeeName).toBe('Friend');
    expect(probe.observed[0].payeeName).toBe('Friend');
  });

  it('addFriendPayment sets status "pending" and source "friend" (S1)', () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    act(() => {
      result = probe.add({
        amountPaise: 5000,
        payeeName: 'Bikash',
        preferredUpiPackage: 'com.phonepe.app',
      });
    });
    expect(result!.status).toBe('pending');
    expect(result!.source).toBe('friend');
    expect(probe.observed[0].status).toBe('pending');
    expect(probe.observed[0].source).toBe('friend');
  });

  it('addFriendPayment sets createdAt > 0', () => {
    const probe = renderWithSeed([]);
    let result: FriendPayment;
    act(() => {
      result = probe.add({
        amountPaise: 100,
        payeeName: 'X',
        preferredUpiPackage: null,
      });
    });
    expect(result!.createdAt).toBeGreaterThan(0);
    expect(probe.observed[0].createdAt).toBeGreaterThan(0);
  });

  it('newest payment is prepended: a second add appears first (3.5 newest-first)', () => {
    const probe = renderWithSeed([]);
    act(() => {
      probe.add({ amountPaise: 100, payeeName: 'First', preferredUpiPackage: null });
    });
    expect(probe.observed[0].payeeName).toBe('First');
    act(() => {
      probe.add({ amountPaise: 200, payeeName: 'Second', preferredUpiPackage: null });
    });
    expect(probe.observed[0].payeeName).toBe('Second');
    expect(probe.observed[1].payeeName).toBe('First');
  });
});