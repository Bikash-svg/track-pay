// @ts-nocheck
// src/features/pending/scanEngine.ts
import { loadAll, updateOne, type PendingItem } from '../../data/pendingItems';
import { recognizeImageWithMeta } from '../../ocr/paddleOcr';
import { extractFromLines } from '../../domain/receipt/extractFromLines';
import notifee, {
  AndroidImportance,
  EventType,
  Notification,
} from 'react-native-notify-kit';

// --- Config ---
const CHANNEL_ID = 'tp-spike-channel';

// --- Permission ---
import { PermissionsAndroid, Platform } from 'react-native';

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  if (Platform.Version < 33) return true; // Android < 13 doesn't need this
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    {
      title: 'Notification permission',
      message: 'Track Pay needs notification permission to show scan progress.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    }
  );
  return granted === PermissionsAndroid.RESULTS.GRANTED;
}

// --- Notification helpers ---
async function ensureChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Track Pay Spike',
    importance: AndroidImportance.HIGH,
  });
}

async function notifyBegin(count: number): Promise<void> {
  try {
    await ensureChannel();
    await notifee.displayNotification({
      id: 'scan-begin',
      title: 'Scanning receipts…',
      body: `${count} receipts pending`,
      android: { channelId: CHANNEL_ID },
    });
  } catch (e) {
    // Notification permission not granted – continue silently.
    console.log('[scanEngine] notifyBegin suppressed', e);
  }
}

async function notifyComplete(scanned: number, total: number): Promise<void> {
  try {
    await ensureChannel();
    await notifee.displayNotification({
      id: 'scan-complete',
      title: 'Scan complete',
      body: `${scanned} of ${total} scanned`,
      android: { channelId: CHANNEL_ID },
    });
  } catch (e) {
    // Notification permission not granted – continue silently.
    console.log('[scanEngine] notifyComplete suppressed', e);
  }
}

// --- Helpers ---
async function processItem(item: PendingItem): Promise<void> {
  await updateOne(item.id, { status: 'scanning' });

  try {
    const { lines, imageWidth, imageHeight } = await recognizeImageWithMeta(
      item.imagePath,
    );
    // NEVER log rawLines (GUARDRAILS §2.8)
    const result = extractFromLines(lines, imageWidth, imageHeight);

    if ('refusal' in result) {
      // ReceiptRefusal
      await updateOne(item.id, {
        status: 'error',
        error: String(result.refusal),
      });
    } else {
      // ParsedReceipt
      await updateOne(item.id, {
        status: 'scanned',
        scanResult: {
          amountPaise: (result as any).amountPaise,
          payeeName: (result as any).payeeName,
          paidAt: (result as any).paidAt,
          rawLines: lines.map((l) => l.text),
          duplicateOfPaymentId: (result as any).duplicateOfPaymentId,
        },
      });
    }
  } catch (e) {
    await updateOne(item.id, {
      status: 'error',
      error: e instanceof Error ? e.message : 'Unknown error',
    });
  }
}

// --- Public API ---
export async function startBatch(
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const items = await loadAll();
  const unscanned = items.filter((i) => i.status === 'unscanned');
  if (unscanned.length === 0) return;

  await notifyBegin(unscanned.length);

  let scanned = 0;
  for (let i = 0; i < unscanned.length; i++) {
    onProgress?.(i, unscanned.length);
    await processItem(unscanned[i]);
    const updated = (await loadAll()).find((x) => x.id === unscanned[i].id);
    if (updated?.status === 'scanned') scanned++;
  }
  onProgress?.(unscanned.length, unscanned.length);

  await notifyComplete(scanned, unscanned.length);
}

export async function scanOne(
  id: string,
  onProgress?: (current: number, total: number) => void,
): Promise<void> {
  const items = await loadAll();
  const item = items.find((i) => i.id === id);
  if (!item || item.status !== 'unscanned') return;

  onProgress?.(0, 1);
  await processItem(item);
  onProgress?.(1, 1);
  await notifyComplete(1, 1);
}