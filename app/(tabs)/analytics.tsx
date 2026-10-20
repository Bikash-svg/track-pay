import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';

export default function AnalyticsScreen() {
  return (
    <Screen padTop={false}>
      <Text>Analytics</Text>
      <Text variant="muted">Built in Phase 5.</Text>
    </Screen>
  );
}