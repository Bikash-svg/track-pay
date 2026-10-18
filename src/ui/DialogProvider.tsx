import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { DialogHost } from './DialogHost';

export interface DialogOptions {
  readonly title?: string;
  readonly subtitle?: string;
  readonly children?: React.ReactNode;
  readonly primaryAction?: React.ReactNode;
  readonly secondaryAction?: React.ReactNode;
  readonly onClose?: () => void;
  readonly closeOnBackdrop?: boolean;
  readonly closeOnBack?: boolean;
}

interface DialogState {
  readonly visible: boolean;
  readonly options: DialogOptions | null;
}

interface DialogContextValue {
  readonly open: (options: DialogOptions) => void;
  readonly close: () => void;
  readonly visible: boolean;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export function DialogProvider({ children }: { readonly children: ReactNode }) {
  const [state, setState] = useState<DialogState>({
    visible: false,
    options: null,
  });

  const close = useCallback(() => {
    setState((prev) => {
      if (!prev.visible) return prev;
      prev.options?.onClose?.();
      return { visible: false, options: null };
    });
  }, []);

  const open = useCallback((options: DialogOptions) => {
    setState({ visible: true, options });
  }, []);

  const value = useMemo<DialogContextValue>(
    () => ({ open, close, visible: state.visible }),
    [open, close, state.visible],
  );

  return (
    <DialogContext.Provider value={value}>
      {children}
      <DialogHost
        visible={state.visible}
        options={state.options}
        onClose={close}
      />
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (ctx === undefined) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return ctx;
}