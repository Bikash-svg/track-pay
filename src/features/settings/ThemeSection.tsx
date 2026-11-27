import { View } from 'react-native';
import { Text, Button, copy } from '../../ui';
import { useTheme } from '../../ui/useTheme';
import type { ThemeName } from '../../data/settings';

const OPTIONS: { value: ThemeName; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'auto', label: 'Auto' },
];

export function ThemeSection() {
  const { theme, setTheme } = useTheme();
  return (
    <View>
      <Text style={{ fontSize: 16, marginBottom: 8 }}>Theme</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant={theme === opt.value ? 'primary' : 'secondary'}
            onPress={() => setTheme(opt.value)}
          >
            {opt.label}
          </Button>
        ))}
      </View>
    </View>
  );
}
