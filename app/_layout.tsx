import { useEffect, useRef, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { ShareIntentProvider } from 'expo-share-intent';
import * as SplashScreen from 'expo-splash-screen';
import * as FileSystem from 'expo-file-system/legacy';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import {
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { DialogProvider } from '../src/ui/DialogProvider';
import { ThemeProvider } from '../src/ui/useTheme';
import { SplashGate } from '../src/ui/SplashGate';
import { Text } from '../src/ui';
import { PaymentsProvider } from '../src/data/payments';
import '../src/notifications/spike';
import { getOcrService } from '../src/ocr/paddleOcr';
import { sweepInterrupted } from '../src/data/pendingItems';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ShareIntentWatcher() {
  const router = useRouter();
  const hasFired = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      while (!cancelled) {
        try {
          const cacheDir = FileSystem.cacheDirectory;
          if (cacheDir) {
            const files = await FileSystem.readDirectoryAsync(cacheDir);
            const now = Date.now() / 1000;
            let hasFresh = false;
            for (const f of files) {
              const lower = f.toLowerCase();
              if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) continue;
              const fp = `${cacheDir}${f}`;
              const info = await FileSystem.getInfoAsync(fp);
              if (!info.exists || info.isDirectory || !info.modificationTime) continue;
              if (now - info.modificationTime < 5) {
                hasFresh = true;
                break;
              }
            }
            if (hasFresh && !hasFired.current) {
              hasFired.current = true;
              console.log('[SHARE_WATCH] fresh files detected, routing to intake');
              router.replace('/share-receipt');
              break; // stop polling after routing
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
  const [unfinished, setUnfinished] = useState<number>(0);
  const [fontsLoaded] = useFonts({
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    // TEMP DISABLED 2026-11-08: onnx runtime crash at boot.
    // Re-enable after verifying onnx native module works.
    // getOcrService().catch(() => {
    //   // Silent — OCR will retry on first use if eager init fails
    // });
    sweepInterrupted().then((n) => setUnfinished(n));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void sweepInterrupted().then((n) => {
      if (!cancelled) setUnfinished(n);
    });
    return () => {
      cancelled = true;
    };
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
              {unfinished > 0 && (
                <Text style={{ margin: 8, fontSize: 16 }}>
                  {unfinished} unfinished{
                    unfinished > 1 ? ' receipts' : ' receipt'
                  }</Text>
              )}
            </DialogProvider>
          </PaymentsProvider>
        </ShareIntentProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}