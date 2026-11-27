import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { ProfileSection } from '../../src/features/settings/ProfileSection';
import { ThemeSection } from '../../src/features/settings/ThemeSection';

export default function SettingsScreen() {
  return (
    <Screen padTop={false}>
      <Text>Settings</Text>
      <ProfileSection />
      <ThemeSection />
    </Screen>
  );
}
