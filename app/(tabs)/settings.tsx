import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';

export default function SettingsScreen() {
  return (
    <Screen padTop={false}>
      <Text>Settings</Text>
      <Text variant="muted">Built in Phase 7.</Text>
    </Screen>
  );
}