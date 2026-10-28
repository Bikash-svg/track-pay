import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DialogProvider } from '../src/ui/DialogProvider';
import { ThemeProvider } from '../src/ui/useTheme';
import { SplashGate } from '../src/ui/SplashGate';
import { PaymentsProvider } from '../src/data/payments';
import '../src/notifications/spike';

// SafeAreaProvider is belt-and-braces alongside expo-router's internal provider
// (ExpoRoot.js:77). Ensures our useSafeAreaInsets calls never silently depend on
// an expo-router internal.
// Hold the OS splash until the gate resolves. Module scope, not a useEffect:
// a useEffect runs after the first paint, which is too late — the OS splash
// would already have auto-hidden and the React splash would not yet be
// themed. This is what closes the 1.5 theme-flash gap.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <PaymentsProvider>
          <DialogProvider>
            <SplashGate>
              <Stack screenOptions={{ headerShown: false }}>
                
              </Stack>
            </SplashGate>
          </DialogProvider>
        </PaymentsProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}