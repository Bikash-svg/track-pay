// Pending receipt queue. The only file in src/data that manages the
// pending-receipt index and its image files.
//
// A share or gallery pick is copied here and the app exits. OCR runs later,
// on demand, from the Verify Pending screen. Verify creates the payment
// (reviewed = true) and the row is marked verified. Nothing here touches
// React or the UI — that's the Pod / grid / card's job.
//
// See ARCHITECTURE.md §5 (data model) and §6 (lifecycle), and 4-D.1 in
// ARCHITECTURE-BUILD-PLAN.md.

const PENDING_INDEX_KEY = 'trackpay.pendingItems.v1';
const PENDING_DIR_NAME = 'pending/';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PendingStatus = 'unscanned' | 'scanning' | 'scanned' | 'verified' | 'error';

export interface ScanResult {
  amountPaise: number;
  payeeName: string;
  paidAt: number | null;   // epoch ms; null if the receipt had no parseable date
  rawLines: string[];      // OCR output — kept for retry inspection, not UI
  duplicateOfPaymentId?: string;
}

export interface PendingItem {
  id: string;
  imagePath: string;       // file:// URI, directly usable in <Image source={{ uri }} />
  originalName: string | null;
  capturedAt: number;      // epoch ms
  status: PendingStatus;
  scanResult: ScanResult | null;
  error: string | null;    // set when status === 'error'
  paymentId: string | null;// set when status === 'verified'
}

// Minimal shape of AsyncStorage the store needs. Real client is the default;
// tests inject a fake through setStorage().
export interface PendingStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}

// Minimal shape of expo-file-system the store needs. Tests inject a fake
// through setFileSystem().
export interface PendingFileSystem {
  getDocumentDirectory(): string | null;
  getInfo(path: string): Promise<{ exists: boolean }>;
  makeDirectory(path: string): Promise<void>;
  copyTo(sourceUri: string, destPath: string): Promise<void>;
  deleteFile(path: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// Test seams — same lazy-require pattern as src/data/settings.ts
// ---------------------------------------------------------------------------

let storageClient: PendingStorage | null = null;
let fsClient: PendingFileSystem | null = null;

export function setStorage(next: PendingStorage): void {
  storageClient = next;
}

export function setFileSystem(next: PendingFileSystem): void {
  fsClient = next;
}

function storage(): PendingStorage {
  if (storageClient) return storageClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-async-storage/async-storage') as {
    default: PendingStorage;
  };
  storageClient = mod.default;
  return storageClient;
}

function fs(): PendingFileSystem {
  if (fsClient) return fsClient;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const legacy = require('expo-file-system/legacy') as {
    documentDirectory: string | null;
    getInfoAsync: (uri: string) => Promise<{ exists: boolean }>;
    makeDirectoryAsync: (uri: string, opts?: { intermediates?: boolean }) => Promise<void>;
    copyAsync: (opts: { from: string; to: string }) => Promise<void>;
    deleteAsync: (uri: string, opts?: { idempotent?: boolean }) => Promise<void>;
  };
  fsClient = {
    getDocumentDirectory: () => legacy.documentDirectory,
    getInfo: (p) => legacy.getInfoAsync(p),
    makeDirectory: (p) => legacy.makeDirectoryAsync(p, { intermediates: true }),
    copyTo: (from, to) => legacy.copyAsync({ from, to }),
    deleteFile: (p) => legacy.deleteAsync(p, { idempotent: true }),
  };
  return fsClient;
}

// ---------------------------------------------------------------------------
// Path helpers
// ---------------------------------------------------------------------------

function pendingDir(): string {
  const docDir = fs().getDocumentDirectory();
  if (!docDir) throw new Error('documentDirectory unavailable');
  return docDir + PENDING_DIR_NAME;
}

async function ensureDir(): Promise<void> {
  const dir = pendingDir();
  const info = await fs().getInfo(dir);
  if (!info.exists) await fs().makeDirectory(dir);
}

function newId(): string {
  return String(Date.now()) + Math.random().toString(36).slice(2, 8);
}

function guessExt(sourceUri: string, originalName?: string | null): string {
  const src = originalName ?? sourceUri;
  const m = /\.([a-zA-Z0-9]{2,5})(?:\?|$)/.exec(src);
  return (m?.[1] ?? 'jpg').toLowerCase();
}

// ---------------------------------------------------------------------------
// Index read/write
// ---------------------------------------------------------------------------

export async function loadAll(): Promise<PendingItem[]> {
  const raw = await storage().getItem(PENDING_INDEX_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as PendingItem[]) : [];
  } catch {
    return [];
  }
}

async function saveAll(items: PendingItem[]): Promise<void> {
  await storage().setItem(PENDING_INDEX_KEY, JSON.stringify(items));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Copy a shared content:// (or file://) URI into app storage and append a
 * pending row. Call this BEFORE BackHandler.exitApp() — the content:// grant
 * is only valid while the activity that received the share is alive.
 *
 * If the file copy succeeds but the index write fails, the copied file is
 * deleted (best-effort) so no orphan is left behind.
 */
export async function ingest(
  sourceUri: string,
  originalName?: string | null,
): Promise<PendingItem> {
  await ensureDir();
  const id = newId();
  const dest = pendingDir() + id + '.' + guessExt(sourceUri, originalName);
  await fs().copyTo(sourceUri, dest);
  try {
    const all = await loadAll();
    const item: PendingItem = {
      id,
      imagePath: dest,
      originalName: originalName ?? null,
      capturedAt: Date.now(),
      status: 'unscanned',
      scanResult: null,
      error: null,
      paymentId: null,
    };
    all.push(item);
    await saveAll(all);
    return item;
  } catch (e) {
    try {
      await fs().deleteFile(dest);
    } catch {
      // best-effort cleanup; caller sees the original error
    }
    throw e;
  }
}

/**
 * Patch a single row. Returns the updated item, or null if id not found.
 * Persists synchronously — a mid-scan kill leaves a recoverable trail.
 */
export async function updateOne(
  id: string,
  patch: Partial<Omit<PendingItem, 'id'>>,
): Promise<PendingItem | null> {
  const all = await loadAll();
  const idx = all.findIndex((x) => x.id === id);
  if (idx < 0) return null;
  const next = { ...all[idx], ...patch };
  all[idx] = next;
  await saveAll(all);
  return next;
}

/**
 * Remove a row and delete its image file (idempotent — the file may already
 * be gone).
 */
export async function removeOne(id: string): Promise<void> {
  const all = await loadAll();
  const target = all.find((x) => x.id === id);
  if (!target) return;
  await saveAll(all.filter((x) => x.id !== id));
  try {
    await fs().deleteFile(target.imagePath);
  } catch {
    // best-effort — row is already gone; orphan file is harmless
  }
}

/**
 * Mark a row verified after the payment has been created. Updates the row
 * and deletes the image (best-effort). Returns the updated row, or null if
 * id not found.
 */
export async function markVerified(
  id: string,
  paymentId: string,
): Promise<PendingItem | null> {
  const updated = await updateOne(id, { status: 'verified', paymentId });
  if (!updated) return null;
  try {
    await fs().deleteFile(updated.imagePath);
  } catch {
    // best-effort — orphan file is harmless
  }
  return updated;
}

/**
 * If the app was killed mid-scan, any row left as 'scanning' is stale.
 * Demote it back to 'unscanned' so the next batch pass picks it up.
 * Called once on app boot (from app/_layout.tsx, per 4-D.4).
 * Returns the number of rows recovered.
 */
export async function sweepInterrupted(): Promise<number> {
  const all = await loadAll();
  let recovered = 0;
  const next = all.map((x) => {
    if (x.status === 'scanning') {
      recovered += 1;
      return { ...x, status: 'unscanned' as const };
    }
    return x;
  });
  if (recovered > 0) await saveAll(next);
  return recovered;
}
