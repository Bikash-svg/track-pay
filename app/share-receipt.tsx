import { useEffect, useRef, useState } from 'react';
import { Platform, ToastAndroid, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import { recognizeText, type OcrResult } from 'rn-mlkit-ocr';
import * as FileSystem from 'expo-file-system/legacy';
import { usePayments, type Payment } from '../src/data/payments';
import { useDialog } from '../src/ui/DialogProvider';
import { PaymentFormDialog } from '../src/ui/PaymentFormDialog';
import { Button, Card, Money, PayRow, Screen, Text } from '../src/ui';
import { copy } from '../src/ui/copy';
import { dateLabel } from '../src/domain/dateLabel';
import {
  parseReceipt,
  type ReceiptRefusal,
} from '../src/domain/receipt/parseReceipt';
import { findDuplicate } from '../src/domain/receipt/findDuplicate';

type ResultState =
  | { kind: 'pending' }
  | { kind: 'saved'; payment: Payment }
  | { kind: 'already_added'; existing: Payment }
  | { kind: 'refused'; reason: ReceiptRefusal['reason'] }
  | { kind: 'ocr_error' };

const FILE_WAIT_TIMEOUT_MS = 5000;
const OCR_TIMEOUT_MS = 15000;

async function waitForFile(uri: string, timeoutMs: number): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const info = await FileSystem.getInfoAsync(uri).catch(() => ({ exists: false }));
    if (info.exists) return true;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return false;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

function toast(message: string) {
  if (Platform.OS === 'android') {
    try {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } catch {
      // A toast is only a non-essential acknowledgement.
    }
  }
}

export default function ShareReceiptScreen() {
  const { shareIntent, resetShareIntent } = useShareIntent();
  const { payments, addPayment, updatePayment, deletePayment } = usePayments();
  const { open, close } = useDialog();
  const router = useRouter();
  const params = useLocalSearchParams<{ fp?: string }>();
  const [state, setState] = useState<ResultState>({ kind: 'pending' });
  const processedPath = useRef<string | null>(null);
  const filePathFromParam =
    typeof params.fp === 'string' ? decodeURIComponent(params.fp) : undefined;
  const filePath = filePathFromParam ?? shareIntent?.files?.[0]?.path;

  useEffect(() => {
    if (!filePath) return;
    if (processedPath.current === filePath) return;

    processedPath.current = filePath;
    let cancelled = false;

    void (async () => {
      try {
        const exists = await waitForFile(filePath, FILE_WAIT_TIMEOUT_MS);
        console.log('[SHARE_PIPE]', 'file-exists:', exists);
        if (cancelled) return;
        if (!exists) {
          setState({ kind: 'ocr_error' });
          return;
        }

        const ocr = await withTimeout<OcrResult>(
          recognizeText(filePath, 'latin'),
          OCR_TIMEOUT_MS,
          { text: '', blocks: [] },
        );
        console.log('[SHARE_PIPE]', 'ocr-len:', ocr?.text?.length ?? 'null');
        if (cancelled) return;
        if (!ocr.text) {
          setState({ kind: 'ocr_error' });
          return;
        }

        const parsed = parseReceipt(ocr.text, new Date());
        console.log('[SHARE_PIPE]', 'parse:', 'reason' in parsed ? parsed.reason : 'ok');
        if ('reason' in parsed) {
          setState({ kind: 'refused', reason: parsed.reason });
          return;
        }

        const duplicate = findDuplicate(payments, parsed);
        console.log('[SHARE_PIPE]', 'dup:', !!duplicate);
        if (duplicate) {
          setState({ kind: 'already_added', existing: duplicate });
          return;
        }

        const payment = await addPayment({
          amountPaise: parsed.amountPaise,
          payeeName: parsed.payeeName,
          label: null,
          category: 'Other',
          createdAt: parsed.paidAt ?? new Date(),
          paidAt: parsed.paidAt,
          upiRef: parsed.upiRef,
          source: 'receipt',
          reviewed: false,
        });
        console.log('[SHARE_PIPE]', 'saved:', !!payment);
        if (!cancelled) setState({ kind: 'saved', payment });
      } catch (e) {
        if (!cancelled) {
          console.log('[SHARE_PIPE]', 'error:', e instanceof Error ? e.message : 'unknown');
          setState({ kind: 'ocr_error' });
        }
      } finally {
        FileSystem.deleteAsync(filePath, { idempotent: true }).catch(() => {});
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [filePath, payments, addPayment]);

  const handleLooksRight = async (payment: Payment) => {
    await updatePayment(payment.id, { reviewed: true });
    resetShareIntent();
    router.replace('/');
  };

  const handleEdit = (payment: Payment) => {
    open({
      children: (
        <PaymentFormDialog
          mode="edit"
          initial={payment}
          onSaved={async (input) => {
            await updatePayment(payment.id, { ...input, reviewed: true });
            close();
            resetShareIntent();
            router.replace('/');
          }}
          onCancel={close}
        />
      ),
    });
  };

  const handleUndo = async (payment: Payment) => {
    await deletePayment(payment.id);
    resetShareIntent();
    toast('Payment deleted');
    router.replace('/');
  };

  const handleClose = () => {
    resetShareIntent();
    router.replace('/');
  };

  const renderPaymentDetails = (payment: Payment) => (
    <Card style={{ gap: 12 }}>
      <Money paise={payment.amountPaise} style={{ fontSize: 28 }} />
      <Text>{`${copy.to}: ${payment.payeeName}`}</Text>
      <Text>{`${copy.date}: ${dateLabel(new Date(payment.paidAt ?? payment.createdAt), new Date())}`}</Text>
      <Text>{`${copy.category}: ${payment.category}`}</Text>
    </Card>
  );

  const renderCouldNotRead = () => (
    <>
      <Text style={{ fontSize: 20 }}>Couldn&apos;t read</Text>
      <Text variant="muted">{copy.couldntRead}</Text>
      <Button variant="secondary" onPress={handleClose}>
        {copy.enterManually}
      </Button>
      <Button variant="text" onPress={handleClose}>
        {copy.close}
      </Button>
    </>
  );

  if (state.kind === 'pending') {
    return (
      <Screen>
        <Text>Reading screenshot…</Text>
      </Screen>
    );
  }

  if (state.kind === 'saved') {
    return (
      <Screen>
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 20 }}>{copy.paymentAdded}</Text>
          {renderPaymentDetails(state.payment)}
          <Text variant="muted">{copy.checkThese}</Text>
          <Button onPress={() => void handleLooksRight(state.payment)}>
            {copy.looksRight}
          </Button>
          <Button variant="secondary" onPress={() => handleEdit(state.payment)}>
            {copy.edit}
          </Button>
          <Button variant="text" onPress={() => void handleUndo(state.payment)}>
            {copy.undo}
          </Button>
        </View>
      </Screen>
    );
  }

  if (state.kind === 'already_added') {
    const { existing } = state;
    return (
      <Screen>
        <View style={{ gap: 16 }}>
          <Text style={{ fontSize: 20 }}>{copy.paymentAdded}</Text>
          <Text variant="muted">{copy.alreadyAdded}</Text>
          <PayRow
            avatarLetter={(existing.payeeName || 'U')[0].toUpperCase()}
            name={existing.label ?? existing.payeeName}
            amountPaise={existing.amountPaise}
            status="Done"
            category={existing.category}
            date={dateLabel(new Date(existing.paidAt ?? existing.createdAt), new Date())}
            notVerified={!existing.reviewed}
          />
          <Button onPress={handleClose}>{copy.done}</Button>
        </View>
      </Screen>
    );
  }

  if (
    state.kind === 'ocr_error' ||
    (state.kind === 'refused' &&
      (state.reason === 'unreadable' || state.reason === 'no_amount'))
  ) {
    return <Screen><View style={{ gap: 16 }}>{renderCouldNotRead()}</View></Screen>;
  }

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 20 }}>Not a successful payment</Text>
        <Text variant="muted">{copy.notSuccessful}</Text>
        <Button onPress={handleClose}>{copy.close}</Button>
      </View>
    </Screen>
  );
}
