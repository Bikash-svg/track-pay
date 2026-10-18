import { Stack } from 'expo-router';
import { ThemeProvider } from '../src/ui/useTheme';
import '../src/notifications/spike';

export default function RootLayout() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}