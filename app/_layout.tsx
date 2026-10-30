import { useEffect } from 'react';
import { Stack, usePathname, useRouter } from 'expo-router';
import { useShareIntent, ShareIntentProvider } from 'expo-share-intent';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DialogProvider } from '../src/ui/DialogProvider';
import { ThemeProvider } from '../src/ui/useTheme';
import { SplashGate } from '../src/ui/SplashGate';
import { PaymentsProvider } from '../src/data/payments';
import '../src/notifications/spike';

SplashScreen.preventAutoHideAsync().catch(() => {});

function ShareIntentWatcher() {
  const { hasShareIntent, shareIntent } = useShareIntent();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      hasShareIntent &&
      shareIntent?.files &&
      shareIntent.files.length > 0 &&
      pathname !== '/share-receipt'
    ) {
      const t = setTimeout(() => router.replace('/share-receipt'), 50);
      return () => clearTimeout(t);
    }
  }, [hasShareIntent, shareIntent, pathname, router]);

  return null;
}

export default function RootLayout() {
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