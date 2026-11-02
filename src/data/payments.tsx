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

// The new Payment type that matches ARCHITECTURE.md §5 fully
export interface Payment {
  readonly id: string;
  readonly amountPaise: number;
  readonly payeeName: string;
  readonly payeeVpa: string | null;
  readonly label: string | null;
  readonly category: 'Food' | 'Shopping' | 'Bills' | 'Transport' | 'Other';
  readonly status: 'success'; // all manual payments are Done
  readonly source: 'manual' | 'receipt';
  readonly reviewed: boolean;
  readonly createdAt: number;
  readonly paidAt: number | null; // present but null for manual entries per D3
  readonly upiRef: string | null;
}

export type PaymentCategory = 'Food' | 'Shopping' | 'Bills' | 'Transport' | 'Other';
export const CATEGORIES = ['Food', 'Shopping', 'Bills', 'Transport', 'Other'] as const;

// New PaymentInput type per D2
export type PaymentInput = {
  amountPaise: number;
  payeeName: string;         // caller pre-validates; 'Unknown' if user left empty
  label: string | null;      // note
  category: PaymentCategory; // 'Food'|'Shopping'|'Bills'|'Transport'|'Other'
  createdAt: Date;           // user-chosen date/time; NOT the wall-clock moment
  readonly paidAt?: Date | null;
  readonly upiRef?: string | null;
  source: 'manual' | 'receipt';
  reviewed: boolean;
};

interface PaymentsContextValue {
  readonly payments: readonly Payment[];
  readonly addPayment: (input: PaymentInput) => Promise<Payment>;
  readonly updatePayment: (id: string, updates: Partial<PaymentInput>) => Promise<void>;
  readonly deletePayment: (id: string) => Promise<void>;
}

const PaymentsContext = createContext<PaymentsContextValue | undefined>(
  undefined,
);

// Test seam. Lets the payments tests seed the store with an initial list
// without depending on addPayment's id/timestamp generation. Mirrors
// setStorage() in settings.ts: the default is the in-memory store, tests
// inject their own.
export function setPaymentsSeed(next: Payment[]): void {
  seed = next;
}

let seed: Payment[] = [];

function makeId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8);
}

async function persist(payments: Payment[]): Promise<void> {
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
  const [payments, setPaymentsState] = useState<Payment[]>(seed);
  const [hydrated, setHydrated] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(PAYMENTS_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        try {
          const parsed = JSON.parse(raw) as Payment[];
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

  const addPayment = useCallback<
    PaymentsContextValue['addPayment']
  >(async (input) => {
    const payment: Payment = {
      id: makeId(),
      amountPaise: input.amountPaise,
      payeeName: input.payeeName.trim() || 'Unknown',
      payeeVpa: null,
      label: input.label,
      category: input.category,
      status: 'success',
      source: input.source,
      reviewed: input.reviewed,
      createdAt: input.createdAt.getTime(),
      paidAt: input.paidAt ? input.paidAt.getTime() : null,
      upiRef: input.upiRef ?? null,
    };
    const newPayments = [payment, ...payments];
    setPaymentsState((prev) => [payment, ...prev]);
    await persist([payment, ...payments]);
    return payment;
  }, [payments]);

  const updatePayment = useCallback<
    PaymentsContextValue['updatePayment']
  >(async (id, updates) => {
    // Create a new array with the updated payment
    // We need to ensure the updates are compatible with the Payment type
    const updatedPayments = payments.map((p) => {
      if (p.id === id) {
        // Create updated payment by merging existing payment with updates
        // Only include properties that exist on Payment interface
        const updatedPayment: Payment = {
          ...p,
          // Only update fields that are present in updates
          ...(updates.amountPaise !== undefined && { amountPaise: updates.amountPaise }),
          ...(updates.payeeName !== undefined && { payeeName: updates.payeeName }),
          ...(updates.label !== undefined && { label: updates.label }),
          ...(updates.category !== undefined && { category: updates.category }),
          ...(updates.createdAt !== undefined && { 
            createdAt: updates.createdAt instanceof Date ? updates.createdAt.getTime() : updates.createdAt
          }),
          ...(updates.source !== undefined && { source: updates.source }),
          ...(updates.reviewed !== undefined && { reviewed: updates.reviewed }),
        };
        return updatedPayment;
      }
      return p;
    });
    setPaymentsState(updatedPayments);
    await persist(updatedPayments);
  }, [payments]);

  const deletePayment = useCallback<
    PaymentsContextValue['deletePayment']
  >(async (id) => {
    const updated = payments.filter((p) => p.id !== id);
    setPaymentsState(updated);
    await persist(updated);
  }, [payments]);

  const value = useMemo<PaymentsContextValue>(
    () => ({ payments, addPayment, updatePayment, deletePayment }),
    [payments, addPayment, updatePayment, deletePayment],
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

