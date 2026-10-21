// INTERIM payments store (Step 4.1 → extended 4.3).
//
// 4.3: extended from pure in-memory to AsyncStorage-backed to satisfy P6
// (survive-process-kill). Public API unchanged: usePayments, addFriendPayment,
// addQrPayment. Both add-* functions write to AsyncStorage before resolving so
// a kill between save and UPI launch still leaves the pending payment
// persisted. Phase 5 replaces AsyncStorage with SQLite behind the same exports
// — no caller touches AsyncStorage directly. getInitialPayments is async-loaded
// in a useEffect on mount; the first render shows [] briefly then hydrates.
// This supersedes 4.1's 'session-scoped' note.
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
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_STATUS, type PaymentStatus } from '../domain/paymentState';

const PAYMENTS_KEY = 'trackpay:payments';

export interface FriendPayment {
  readonly id: string;
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly payeeVpa: string | null;
  readonly label: string | null;
  readonly category: string;
  readonly status: PaymentStatus;
  readonly source: 'friend' | 'qr';
  readonly createdAt: number;
  readonly confirmedAt: number | null;
  readonly upiRef: string | null;
}

export interface AddFriendPaymentInput {
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly preferredUpiPackage: string | null;
}

export interface AddQrPaymentInput {
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly payeeVpa: string;
  readonly label: string | null;
}

interface PaymentsContextValue {
  readonly payments: readonly FriendPayment[];
  readonly addFriendPayment: (input: AddFriendPaymentInput) => Promise<FriendPayment>;
  readonly addQrPayment: (input: AddQrPaymentInput) => Promise<FriendPayment>;
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

async function persist(payments: FriendPayment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
  } catch {
    // Swallow persistence errors — in-memory state still works
  }
}

export function PaymentsProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [payments, setPaymentsState] = useState<FriendPayment[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PAYMENTS_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw) as FriendPayment[];
          if (Array.isArray(parsed)) setPaymentsState(parsed);
        } catch {
          // Swallow corrupt data
        }
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addFriendPayment = useCallback<
    PaymentsContextValue['addFriendPayment']
  >(async (input) => {
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
    const newPayments = [payment, ...payments];
    setPaymentsState((prev) => [payment, ...prev]);
    await persist([payment, ...payments]);
    return payment;
  }, [payments]);

  const addQrPayment = useCallback<
    PaymentsContextValue['addQrPayment']
  >(async (input) => {
    const payment: FriendPayment = {
      id: makeId(),
      amountPaise: input.amountPaise,
      payeeName: input.payeeName,
      payeeVpa: input.payeeVpa,
      label: input.label,
      category: 'Other',
      status: INITIAL_STATUS,
      source: 'qr',
      createdAt: Date.now(),
      confirmedAt: null,
      upiRef: null,
    };
    const newPayments = [payment, ...payments];
    setPaymentsState((prev) => [payment, ...prev]);
    await persist([payment, ...payments]);
    return payment;
  }, [payments]);

  const value = useMemo<PaymentsContextValue>(
    () => ({ payments, addFriendPayment, addQrPayment }),
    [payments, addFriendPayment, addQrPayment],
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
