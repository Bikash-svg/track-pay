import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

// 3.6: pending count lifted from Home-local state into the tabs layout. Home's
// dev presets write; TopBar's badge reads. Mirrors the OnboardedContext
// pattern from SplashGate (throw-if-null hook, settable value). Phase 4 will
// replace the dev presets with real pending data from src/data/payments.

interface PendingCountValue {
  readonly pendingCount: number;
  readonly setPendingCount: (n: number) => void;
}

const PendingCountContext = createContext<PendingCountValue | undefined>(
  undefined,
);

export function PendingCountProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [pendingCount, setPendingCountState] = useState(0);
  const setPendingCount = useCallback(
    (n: number) => setPendingCountState(n),
    [],
  );
  const value = useMemo<PendingCountValue>(
    () => ({ pendingCount, setPendingCount }),
    [pendingCount, setPendingCount],
  );
  return (
    <PendingCountContext.Provider value={value}>
      {children}
    </PendingCountContext.Provider>
  );
}

export function usePendingCount(): PendingCountValue {
  const ctx = useContext(PendingCountContext);
  if (ctx === undefined) {
    throw new Error('usePendingCount must be used within a PendingCountProvider');
  }
  return ctx;
}