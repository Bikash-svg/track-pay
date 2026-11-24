// Share intake. Copy ALL shared images into app storage, append pending
// rows, then exit. No OCR, no parse, no result screen — that all happens
// later, from the Verify Pending screen (4-D.3 / 4-D.4 / 4-D.5).
//
// Handles multi-image shares: scans cacheDirectory for every fresh image
// file in one pass, ingests each, deletes each cache copy, then exits once.

import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ingest } from '../src/data/pendingItems';

const LAST_PROCESSED_KEY = 'trackpay:shareIntent:processedMtimes';
const FRESHNESS_WINDOW = 5; // seconds

function ensureFileScheme(uri: string): string {
  if (uri.startsWith('file://') || uri.startsWith('content://')) return uri;
  return 'file://' + uri;
}

async function getProcessedMtimes(): Promise<number[]> {
  const stored = await AsyncStorage.getItem(LAST_PROCESSED_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as number[];
  } catch {
    return [];
  }
}

async function markProcessed(mtimes: number[]): Promise<void> {
  const existing = await getProcessedMtimes();
  const updated = [...existing, ...mtimes].slice(-50); // keep last 50
  await AsyncStorage.setItem(LAST_PROCESSED_KEY, JSON.stringify(updated));
}

export default function ShareReceiptScreen() {
  const params = useLocalSearchParams<{ fp?: string; mtime?: string }>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cacheDir = FileSystem.cacheDirectory;
      if (!cacheDir) {
        if (!cancelled) BackHandler.exitApp();
        return;
      }

      const now = Date.now() / 1000;
      const files = await FileSystem.readDirectoryAsync(cacheDir);
      const processedMtimes = await getProcessedMtimes();

      // Collect ALL fresh image files
      const freshFiles: { path: string; mtime: number }[] = [];
      for (const f of files) {
        const lower = f.toLowerCase();
        if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) continue;
        const fp = `${cacheDir}${f}`;
        const info = await FileSystem.getInfoAsync(fp);
        if (!info.exists || info.isDirectory || !info.modificationTime) continue;
        const mtime = info.modificationTime;
        if (now - mtime >= FRESHNESS_WINDOW) continue;
        if (processedMtimes.includes(mtime)) continue; // already handled
        freshFiles.push({ path: fp, mtime });
      }

      // If watcher passed a specific fp, include it if not already found
      if (params.fp) {
        const decoded = decodeURIComponent(params.fp);
        if (!freshFiles.some((f) => f.path === decoded)) {
          const info = await FileSystem.getInfoAsync(decoded);
          if (info.exists && info.modificationTime && now - info.modificationTime < FRESHNESS_WINDOW) {
            if (!processedMtimes.includes(info.modificationTime)) {
              freshFiles.push({ path: decoded, mtime: info.modificationTime });
            }
          }
        }
      }

      if (freshFiles.length === 0) {
        if (!cancelled) BackHandler.exitApp();
        return;
      }

      // Ingest all fresh files
      const processedThisRun: number[] = [];
      for (const file of freshFiles) {
        if (cancelled) break;
        try {
          await ingest(ensureFileScheme(file.path));
          processedThisRun.push(file.mtime);
          // Delete cache copy
          try {
            await FileSystem.deleteAsync(ensureFileScheme(file.path), { idempotent: true });
          } catch {
            // best-effort
          }
        } catch (e) {
          console.warn('[share-receipt] ingest failed', e);
        }
      }

      // Record processed mtimes
      if (processedThisRun.length > 0) {
        await markProcessed(processedThisRun);
      }

      if (!cancelled) BackHandler.exitApp();
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
