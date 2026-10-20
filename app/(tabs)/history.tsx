import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';

export default function HistoryScreen() {
  return (
    <Screen padTop={false}>
      <Text>History</Text>
      <Text variant="muted">Built in Phase 6.</Text>
    </Screen>
  );
}