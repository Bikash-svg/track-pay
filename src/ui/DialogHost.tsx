import { type ReactNode } from 'react';
import { Dialog, type DialogProps } from './Dialog';

export interface DialogHostProps {
  readonly visible: boolean;
  readonly options: {
    readonly title?: string;
    readonly subtitle?: string;
    readonly children?: ReactNode;
    readonly primaryAction?: ReactNode;
    readonly secondaryAction?: ReactNode;
    readonly onClose?: () => void;
    readonly closeOnBackdrop?: boolean;
    readonly closeOnBack?: boolean;
    readonly closeButtonLabel?: string;
    readonly testID?: string;
  } | null;
  readonly onClose: () => void;
}

/**
 * Mounted once, above the Stack, in the root layout. It owns no content: it
 * renders the reusable `Dialog` shell and hands every option straight through.
 *
 * Dialog *content* (Pay to a friend, Did it go through?, and the rest) is
 * built in Phases 4-7 and styled in Track B (DESIGN-BUILD-PLAN.md D5). This
 * file is only the state holder, so content owners drop their JSX into the
 * `children`/`primaryAction`/`secondaryAction` slots and call `useDialog().open`.
 */
export function DialogHost({ visible, options, onClose }: DialogHostProps) {
  const props: Omit<DialogProps, 'onClose'> = {
    visible,
    title: options?.title,
    subtitle: options?.subtitle,
    children: options?.children,
    primaryAction: options?.primaryAction,
    secondaryAction: options?.secondaryAction,
    closeOnBackdrop: options?.closeOnBackdrop ?? true,
    closeOnBack: options?.closeOnBack ?? true,
    closeButtonLabel: options?.closeButtonLabel ?? 'Close',
    testID: options?.testID ?? 'dialog',
  };

  return <Dialog {...props} onClose={onClose} />;
}

export default DialogHost;