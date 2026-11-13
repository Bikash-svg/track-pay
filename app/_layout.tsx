import { useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DialogProvider } from '../src/ui/DialogProvider';
import { ThemeProvider } from '../src/ui/useTheme';
import { SplashGate } from '../src/ui/SplashGate';
import { PaymentsProvider } from '../src/data/payments';
import '../src/notifications/spike';
import { getOcrService } from '../src/ocr/paddleOcr';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ShareIntentWatcher() {
  const router = useRouter();
  // Track (path, mtime), not just path. If expo-share-intent reuses the same
  // filename for a new share, mtime will differ and we still route.
  const lastSeen = useRef<{ path: string; mtime: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        try {
          const cacheDir = FileSystem.cacheDirectory;
          if (cacheDir) {
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            const now = Date.now() / 1000;
            for (const f of files) {
              const lower = f.toLowerCase();
              if (
                !lower.endsWith('.jpg') &&
                !lower.endsWith('.jpeg') &&
                !lower.endsWith('.png')
              ) {
                continue;
              }
              const fp = `${cacheDir}${f}`;
              const info = await FileSystem.getInfoAsync(fp);
              if (
                !info.exists ||
                info.isDirectory ||
                !info.modificationTime
              ) {
                continue;
              }
              const mtime = info.modificationTime;
              if (
                lastSeen.current &&
                lastSeen.current.path === fp &&
                lastSeen.current.mtime === mtime
              ) {
                continue;
              }
              if (now - mtime >= 30) continue;
              lastSeen.current = { path: fp, mtime };
              console.log('[SHARE_WATCH] route', fp, 'mtime', mtime);
              setTimeout(() => {
                if (!cancelled) {
                  router.replace({
                    pathname: '/share-receipt',
                    params: { fp, mtime: String(mtime) },
                  });
                }
              }, 50);
              break;
            }
          }
        } catch (err) {
          console.log('[SHARE_WATCH] poll error', err);
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}

export default function RootLayout() {
  useEffect(() => {
    // TEMP DISABLED 2026-11-08: onnx runtime crash at boot.
    // Re-enable after verifying onnx native module works.
    // getOcrService().catch(() => {
    //   // Silent — OCR will retry on first use if eager init fails
    // });
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <ShareIntentProvider>
          <PaymentsProvider>
            <DialogProvider>
              <SplashGate>
                <ShareIntentWatcher />
                <Stack screenOptions={{ headerShown: false }} />
              </SplashGate>
            </DialogProvider>
          </PaymentsProvider>
        </ShareIntentProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}