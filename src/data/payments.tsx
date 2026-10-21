// INTERIM payments store (Step 4.1).
//
// In-memory only. expo-sqlite and persistence ship in Phase 5, which swaps
// the implementation behind the SAME public exports (usePayments,
// addFriendPayment, FriendPayment) without touching any caller. Do NOT
// claim D1/D7/T3 (survive-restart) for this step: payments are
// session-scoped until Phase 5 lands.
//
// The shape below is the ARCHITECTURE.md §5 schema, narrowed to what a friend
// payment needs. payeeVpa, label, confirmedAt and upiRef are always null at
// creation; they are filled by 4.3 (upiRef) and 4.5 (label, category,
// confirmedAt). Declaring them here keeps one row type for the whole app.
//
// Only this file creates payments. addFriendPayment is the single entry
// point, so every payment starts as pending (INITIAL_STATUS) by construction
// (EVALS S1) — there is no second path that could start one as Done or
// Failed; the manual-add path (4.9) gets its own function when it arrives.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { INITIAL_STATUS, type PaymentStatus } from '../domain/paymentState';

export interface FriendPayment {
  readonly id: string;
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly payeeVpa: string | null;
  readonly label: string | null;
  readonly category: string;
  readonly status: PaymentStatus;
  readonly source: 'friend';
  readonly createdAt: number;
  readonly confirmedAt: number | null;
  readonly upiRef: string | null;
}

export interface AddFriendPaymentInput {
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly preferredUpiPackage: string | null;
}

interface PaymentsContextValue {
  readonly payments: readonly FriendPayment[];
  readonly addFriendPayment: (input: AddFriendPaymentInput) => FriendPayment;
}

const PaymentsContext = createContext<PaymentsContextValue | undefined>(
  undefined,
);

// Test seam. Lets the payments tests seed the store with an initial list
// without depending on addFriendPayment's id/timestamp generation. Mirrors
// setStorage() in settings.ts: the default is the in-memory store, tests
// inject their own.
export function setPaymentsSeed(next: FriendPayment[]): void {
  seed = next;
}

let seed: FriendPayment[] = [];

function makeId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8);
}

export function PaymentsProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [payments, setPaymentsState] = useState<FriendPayment[]>(seed);

  const addFriendPayment = useCallback<
    PaymentsContextValue['addFriendPayment']
  >((input) => {
    const payment: FriendPayment = {
      id: makeId(),
      amountPaise: input.amountPaise,
      payeeName: input.payeeName.trim() || 'Friend',
      payeeVpa: null,
      label: null,
      category: 'Other',
      status: INITIAL_STATUS,
      source: 'friend',
      createdAt: Date.now(),
      confirmedAt: null,
      upiRef: null,
    };
    setPaymentsState((prev) => [payment, ...prev]);
    return payment;
  }, []);

  const value = useMemo<PaymentsContextValue>(
    () => ({ payments, addFriendPayment }),
    [payments, addFriendPayment],
  );

  return (
    <PaymentsContext.Provider value={value}>{children}</PaymentsContext.Provider>
  );
}

export function usePayments(): PaymentsContextValue {
  const ctx = useContext(PaymentsContext);
  if (ctx === undefined) {
    throw new Error('usePayments must be used within a PaymentsProvider');
  }
  return ctx;
}
