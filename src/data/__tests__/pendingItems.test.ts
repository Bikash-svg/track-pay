import {
  ingest,
  loadAll,
  updateOne,
  removeOne,
  markVerified,
  sweepInterrupted,
  setStorage,
  setFileSystem,
  type PendingItem,
} from '../pendingItems';

// In-memory AsyncStorage stand-in — same shape as settings.test.ts's makeStore.
function makeStore() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => Promise.resolve(store.get(key) ?? null),
    setItem: (key: string, value: string) =>
      Promise.resolve(void store.set(key, value)),
    store,
  };
}

// In-memory FileSystem stand-in. `files` maps path → "content" (string, never
// read by the store). `copies` records (source → dest) pairs for assertions.
function makeFs() {
  const files = new Map<string, string>();
  const copies: Array<{ from: string; to: string }> = [];
  const dirs = new Set<string>();
  const docDir = 'file:///test/doc/';
  return {
    getDocumentDirectory: () => docDir,
    getInfo: (p: string) => Promise.resolve({ exists: dirs.has(p) || files.has(p) }),
    makeDirectory: (p: string) => Promise.resolve(void dirs.add(p)),
    copyTo: (from: string, to: string) => {
      copies.push({ from, to });
      files.set(to, `copied-from:${from}`);
      return Promise.resolve();
    },
    deleteFile: (p: string) => Promise.resolve(void files.delete(p)),
    files,
    copies,
    dirs,
    docDir,
  };
}

function fixture(index: { items?: PendingItem[] } = {}) {
  const store = makeStore();
  const fs = makeFs();
  setStorage(store);
  setFileSystem(fs);
  if (index.items) {
    store.store.set('trackpay.pendingItems.v1', JSON.stringify(index.items));
  }
  return { store, fs };
}

const PENDING_DIR = 'file:///test/doc/pending/';

describe('pendingItems', () => {
  beforeEach(() => {
    fixture();
  });

  describe('ingest', () => {
    it('copies the file into pending/ and appends a row', async () => {
      const { fs } = fixture();
      const row = await ingest('content://media/images/42', 'receipt.png');

      expect(fs.copies).toHaveLength(1);
      expect(fs.copies[0].from).toBe('content://media/images/42');
      expect(fs.copies[0].to.startsWith(PENDING_DIR)).toBe(true);
      expect(fs.copies[0].to.endsWith('.png')).toBe(true);

      expect(row.status).toBe('unscanned');
      expect(row.originalName).toBe('receipt.png');
      expect(row.imagePath).toBe(fs.copies[0].to);
      expect(row.paymentId).toBeNull();
      expect(row.scanResult).toBeNull();
      expect(row.error).toBeNull();

      const all = await loadAll();
      expect(all).toHaveLength(1);
      expect(all[0].id).toBe(row.id);
    });

    it('creates the pending/ directory on first ingest', async () => {
      const { fs } = fixture();
      await ingest('content://media/images/42');
      expect(fs.dirs.has(PENDING_DIR)).toBe(true);
    });

    it('defaults to jpg extension when neither name nor URI has one', async () => {
      const { fs } = fixture();
      await ingest('content://media/images/42');
      expect(fs.copies[0].to.endsWith('.jpg')).toBe(true);
    });

    it('produces distinct ids for two ingests', async () => {
      fixture();
      const a = await ingest('content://a');
      const b = await ingest('content://b');
      expect(a.id).not.toBe(b.id);
    });

    it('cleans up the copied file if the index write fails', async () => {
      const { store, fs } = fixture();
      const originalSetItem = store.setItem;
      let calls = 0;
      store.setItem = (k: string, v: string) => {
        calls += 1;
        if (calls === 1) return Promise.reject(new Error('boom'));
        return originalSetItem(k, v);
      };

      await expect(ingest('content://a')).rejects.toThrow('boom');
      expect(fs.files.size).toBe(0);
      expect(await loadAll()).toHaveLength(0);
    });
  });

  describe('loadAll', () => {
    it('returns [] when nothing is stored', async () => {
      fixture();
      expect(await loadAll()).toEqual([]);
    });

    it('returns [] when the stored JSON is corrupt', async () => {
      const { store } = fixture();
      store.store.set('trackpay.pendingItems.v1', '{not valid json');
      expect(await loadAll()).toEqual([]);
    });

    it('returns [] when the stored JSON is not an array', async () => {
      const { store } = fixture();
      store.store.set('trackpay.pendingItems.v1', JSON.stringify({ nope: true }));
      expect(await loadAll()).toEqual([]);
    });

    it('round-trips a full row including scanResult', async () => {
      const item: PendingItem = {
        id: 'x',
        imagePath: 'file:///x.jpg',
        originalName: 'x.jpg',
        capturedAt: 1234,
        status: 'scanned',
        scanResult: {
          amountPaise: 100,
          payeeName: 'Test',
          paidAt: 1234000,
          rawLines: ['a', 'b'],
        },
        error: null,
        paymentId: null,
      };
      const { store } = fixture({ items: [item] });
      expect(await loadAll()).toEqual([item]);
      expect(store.store.get('trackpay.pendingItems.v1')).toBeTruthy();
    });
  });

  describe('updateOne', () => {
    it('persists the patch and returns the updated row', async () => {
      fixture();
      const row = await ingest('content://a');
      const updated = await updateOne(row.id, {
        status: 'scanned',
        scanResult: { amountPaise: 500, payeeName: 'Shop', paidAt: null, rawLines: [] },
      });
      expect(updated?.status).toBe('scanned');
      expect(updated?.scanResult?.amountPaise).toBe(500);

      const reloaded = await loadAll();
      expect(reloaded[0].status).toBe('scanned');
      expect(reloaded[0].scanResult?.payeeName).toBe('Shop');
    });

    it('returns null when the id does not exist', async () => {
      fixture();
      expect(await updateOne('missing', { status: 'error' })).toBeNull();
    });
  });

  describe('removeOne', () => {
    it('deletes the row and the image file', async () => {
      const { fs } = fixture();
      const row = await ingest('content://a');
      expect(fs.files.size).toBe(1);

      await removeOne(row.id);

      expect(await loadAll()).toHaveLength(0);
      expect(fs.files.size).toBe(0);
    });

    it('is a no-op for an unknown id (idempotent)', async () => {
      const { fs } = fixture();
      await removeOne('missing');
      expect(await loadAll()).toHaveLength(0);
      expect(fs.files.size).toBe(0);
    });
  });

  describe('markVerified', () => {
    it('sets status=verified and paymentId, and deletes the image', async () => {
      const { fs } = fixture();
      const row = await ingest('content://a');
      const updated = await markVerified(row.id, 'pay-123');

      expect(updated?.status).toBe('verified');
      expect(updated?.paymentId).toBe('pay-123');
      expect(fs.files.size).toBe(0);

      const reloaded = await loadAll();
      expect(reloaded[0].status).toBe('verified');
      expect(reloaded[0].paymentId).toBe('pay-123');
      expect(reloaded[0].imagePath).toBe(row.imagePath);
    });

    it('returns null for an unknown id', async () => {
      fixture();
      expect(await markVerified('missing', 'pay-x')).toBeNull();
    });
  });

  describe('sweepInterrupted', () => {
    it('demotes stale scanning rows to unscanned and returns the count', async () => {
      const items: PendingItem[] = [
        { id: 'a', imagePath: 'file:///a', originalName: null, capturedAt: 1, status: 'scanning', scanResult: null, error: null, paymentId: null },
        { id: 'b', imagePath: 'file:///b', originalName: null, capturedAt: 2, status: 'scanned', scanResult: null, error: null, paymentId: null },
        { id: 'c', imagePath: 'file:///c', originalName: null, capturedAt: 3, status: 'scanning', scanResult: null, error: null, paymentId: null },
      ];
      fixture({ items });

      const recovered = await sweepInterrupted();
      expect(recovered).toBe(2);

      const reloaded = await loadAll();
      expect(reloaded.map((x) => x.status)).toEqual(['unscanned', 'scanned', 'unscanned']);
    });

    it('returns 0 and does not rewrite when nothing is stale', async () => {
      const items: PendingItem[] = [
        { id: 'a', imagePath: 'file:///a', originalName: null, capturedAt: 1, status: 'scanned', scanResult: null, error: null, paymentId: null },
      ];
      const { store } = fixture({ items });
      const before = store.store.get('trackpay.pendingItems.v1');

      expect(await sweepInterrupted()).toBe(0);
      expect(store.store.get('trackpay.pendingItems.v1')).toBe(before);
    });
  });
});
