import { Screen } from '../src/ui/Screen';
import { Text } from '../src/ui/Text';

export default function ScannerScreen() {
  return (
    <Screen>
      <Text>Scan a UPI QR</Text>
      <Text variant="muted">Built in Phase 4.</Text>
    </Screen>
  );
}