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
  const lastFp = useRef<string | null>(null);

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
              if (fp === lastFp.current) continue;
              const info = await FileSystem.getInfoAsync(fp);
              if (
                info.exists &&
                !info.isDirectory &&
                info.modificationTime &&
                now - info.modificationTime < 30
              ) {
                lastFp.current = fp;
                setTimeout(() => {
                  if (!cancelled) {
                    router.replace({
                      pathname: '/share-receipt',
                      params: { fp },
                    });
                  }
                }, 50);
                break;
              }
            }
          }
        } catch {
          // cache read failed — try again next tick
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
    getOcrService().catch(() => {
      // Silent — OCR will retry on first use if eager init fails
    });
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