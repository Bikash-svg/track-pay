import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { DialogProvider } from '../src/ui/DialogProvider';
import { ThemeProvider } from '../src/ui/useTheme';
import { SplashGate } from '../src/ui/SplashGate';
import '../src/notifications/spike';

// Hold the OS splash until the gate resolves. Module scope, not a useEffect:
// a useEffect runs after the first paint, which is too late — the OS splash
// would already have auto-hidden and the React splash would not yet be
// themed. This is what closes the 1.5 theme-flash gap.
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <DialogProvider>
        <SplashGate>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="pending"
              options={{ headerShown: true, title: 'Needs confirming' }}
            />
            <Stack.Screen
              name="scanner"
              options={{ headerShown: true, title: 'Scan a UPI QR' }}
            />
          </Stack>
        </SplashGate>
      </DialogProvider>
    </ThemeProvider>
  );
}