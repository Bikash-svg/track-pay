import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Redirect, Tabs } from 'expo-router';
import { TabBar } from '../../src/ui/TabBar';
import { useOnboarded } from '../../src/ui/SplashGate';

export default function TabLayout() {
  // Onboarded branch (2.4). The Stack is mounted above this layout, so
  // <Redirect> navigates reliably here. Tabs never mount when unonboarded --
  // no flash of Home or the tab bar.
  const onboarded = useOnboarded();
  if (!onboarded) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props: BottomTabBarProps) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{ tabBarLabel: 'Home', tabBarAccessibilityLabel: 'Home' }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          tabBarLabel: 'Analytics',
          tabBarAccessibilityLabel: 'Analytics',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          tabBarLabel: 'History',
          tabBarAccessibilityLabel: 'History',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarAccessibilityLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}