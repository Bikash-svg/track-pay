// Share intake. Copy the shared image into app storage, append a pending
// row, and exit. No OCR, no parse, no result screen — that all happens
// later, from the Verify Pending screen (4-D.3 / 4-D.4).
//
// Reads the URI from either the ShareIntentWatcher's `fp` query param (the
// working path since 4-B.1's cache-polling fix) or, as a fallback, from
// expo-share-intent's `useShareIntent` context. Intake must run before
// BackHandler.exitApp() — the content:// grant on a shared file is only
// valid while this Activity is alive.

import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useShareIntent } from 'expo-share-intent';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ingest } from '../src/data/pendingItems';

const LAST_MTIME_KEY = 'trackpay:shareIntent:lastProcessedMtime';

function ensureFileScheme(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
  return 'file://' + uri;
}

export default function ShareReceiptScreen() {
  const params = useLocalSearchParams<{ fp?: string; mtime?: string }>();
  const { shareIntent } = useShareIntent();
  const processed = useRef<string | null>(null);

  const filePathFromParam =
    typeof params.fp === 'string' ? decodeURIComponent(params.fp) : undefined;
  const filePath = filePathFromParam ?? shareIntent?.files?.[0]?.path;
  const fileKey = filePath ? `${filePath}@${params.mtime ?? '0'}` : null;

  useEffect(() => {
    if (!filePath || !fileKey) return;
    if (processed.current === fileKey) return;
    processed.current = fileKey;
    let cancelled = false;
    (async () => {
      const mtime = Number(params.mtime ?? NaN);
      try {
        // The watcher can route the same file again within its freshness
        // window. Never ingest an mtime we have already handled (4-D.2a).
        const stored = await AsyncStorage.getItem(LAST_MTIME_KEY);
        if (
          Number.isFinite(mtime) &&
          stored !== null &&
          mtime <= Number(stored)
        ) {
          return;
        }
        await ingest(ensureFileScheme(filePath));
        if (Number.isFinite(mtime)) {
          await AsyncStorage.setItem(LAST_MTIME_KEY, String(mtime));
        }
        // Delete the cache copy so a later cold open cannot ingest it again.
        // Same scheme handling as the read path above.
        try {
          await FileSystem.deleteAsync(ensureFileScheme(filePath), {
            idempotent: true,
          });
        } catch {}
      } catch (e) {
        console.warn('[share-receipt] ingest failed', e);
      } finally {
        if (!cancelled) BackHandler.exitApp();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filePath, fileKey]);

  return null;
}