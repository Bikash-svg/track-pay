import { Screen } from '../../src/ui/Screen';
import { Text } from '../../src/ui/Text';
import { ProfileSection } from '../../src/features/settings/ProfileSection';
import { ThemeSection } from '../../src/features/settings/ThemeSection';
import { LimitSection } from '../../src/features/settings/LimitSection';
import { RemindersSection } from '../../src/features/settings/RemindersSection';

export default function SettingsScreen() {
  return (
    <Screen padTop={false}>
      <Text>Settings</Text>
      <ProfileSection />
      <ThemeSection />
      <LimitSection />
      <RemindersSection />
    </Screen>
  );
}
